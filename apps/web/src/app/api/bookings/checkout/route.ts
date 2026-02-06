import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getStripe } from '@/lib/stripe';
import { checkAvailability, createTemporaryLock } from '@/lib/availability';
import { z } from 'zod';

const checkoutSchema = z.object({
  cottageId: z.string(),
  startDate: z.string().transform((str) => new Date(str)),
  endDate: z.string().transform((str) => new Date(str)),
  guests: z.number().int().min(1),
  options: z.record(z.any()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = checkoutSchema.parse(body);

    // Verify availability
    const available = await checkAvailability(data.cottageId, data.startDate, data.endDate);

    if (!available) {
      return NextResponse.json({ error: 'Dates not available' }, { status: 400 });
    }

    // Get cottage
    const cottage = await prisma.cottage.findUnique({
      where: { id: data.cottageId },
    });

    if (!cottage || !cottage.isActive) {
      return NextResponse.json({ error: 'Cottage not found or inactive' }, { status: 404 });
    }

    // Calculate pricing
    const nights = Math.ceil(
      (data.endDate.getTime() - data.startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const baseAmount = cottage.basePrice * nights;
    const cleaningFee = data.options?.cleaning && cottage.cleaningFee ? cottage.cleaningFee : 0;
    const touristTaxRate = parseFloat(process.env.TOURIST_TAX_DEFAULT || '2.5');
    const touristTax = (baseAmount + cleaningFee) * (touristTaxRate / 100);
    const total = baseAmount + cleaningFee + touristTax;

    // Create temporary lock
    const lockId = await createTemporaryLock(data.cottageId, data.startDate, data.endDate, 15);

    // Create booking record
    const booking = await prisma.booking.create({
      data: {
        cottageId: data.cottageId,
        userId: (session.user as any).id,
        startDate: data.startDate,
        endDate: data.endDate,
        guests: data.guests,
        options: data.options || {},
        subtotal: baseAmount + cleaningFee,
        touristTax,
        total,
        status: 'PENDING',
      },
    });

    // Create Stripe checkout session (TEST MODE: requires STRIPE_SECRET_KEY at runtime).
    let stripe;
    try {
      stripe = getStripe();
    } catch (e) {
      console.error('Checkout: Stripe not configured:', (e as Error).message);
      return NextResponse.json(
        { error: 'Payment is not configured. Set STRIPE_SECRET_KEY (TEST key) for checkout.' },
        { status: 503 }
      );
    }

    const sessionUrl = `${process.env.APP_BASE_URL || process.env.NEXTAUTH_URL}/checkout/success`;
    const cancelUrl = `${process.env.APP_BASE_URL || process.env.NEXTAUTH_URL}/cottages/${cottage.slug}`;

    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: cottage.title,
              description: `${nights} nuit${nights > 1 ? 's' : ''} - ${data.guests} invité${data.guests > 1 ? 's' : ''}`,
            },
            unit_amount: Math.round(total * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${sessionUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      metadata: {
        bookingId: booking.id,
        lockId,
      },
      customer_email: session.user.email || undefined,
    });

    // Update booking with Stripe session ID
    await prisma.booking.update({
      where: { id: booking.id },
      data: { stripeSessionId: stripeSession.id },
    });

    return NextResponse.json({
      sessionId: stripeSession.id,
      url: stripeSession.url,
    });
  } catch (error) {
    console.error('Error creating checkout:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 });
  }
}
