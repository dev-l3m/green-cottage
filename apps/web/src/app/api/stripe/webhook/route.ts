import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getStripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { generateInvoicePDF, generateInvoiceNumber } from '@/lib/invoice';
import type Stripe from 'stripe';

// TEST MODE: Webhook secret from env (Stripe CLI or Dashboard). Required at runtime for signature verification.
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

/**
 * POST /api/stripe/webhook
 * - Uses raw body for signature verification (do not parse as JSON before verify).
 * - Idempotent: safe against Stripe retries; booking is updated once, invoice created once.
 */
export async function POST(request: NextRequest) {
  // Lazy Stripe init: no keys at build time (e.g. Vercel) must not crash.
  let stripe: Stripe;
  try {
    stripe = getStripe();
  } catch (e) {
    console.error('Stripe webhook: Stripe not configured:', (e as Error).message);
    return NextResponse.json(
      { error: 'Payment provider not configured' },
      { status: 503 }
    );
  }

  if (!WEBHOOK_SECRET) {
    console.error('Stripe webhook: STRIPE_WEBHOOK_SECRET is not set');
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 503 }
    );
  }

  const rawBody = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', (err as Error).message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    try {
      // Idempotent: transaction only updates booking + removes lock. Invoice created after (once).
      const result = await prisma.$transaction(async (tx) => {
        const booking = await tx.booking.findUnique({
          where: { stripeSessionId: session.id },
          include: { invoice: true },
        });

        if (!booking) {
          console.error('Booking not found for session:', session.id);
          throw new Error('BOOKING_NOT_FOUND');
        }

        if (booking.status === 'PAID') {
          return { updated: false as const, booking: null };
        }

        await tx.booking.update({
          where: { id: booking.id },
          data: {
            status: 'PAID',
            stripePaymentIntentId:
              typeof session.payment_intent === 'string'
                ? session.payment_intent
                : session.payment_intent?.id ?? null,
          },
        });

        const lockId = session.metadata?.lockId;
        if (lockId) {
          await tx.availabilityBlock.deleteMany({
            where: { id: lockId, source: 'INTERNAL' },
          });
        }

        return { updated: true as const, booking };
      });

      // Generate invoice once, outside transaction (invoice helpers use global prisma). Idempotent: duplicate create throws P2002.
      if (result.updated && result.booking && !result.booking.invoice) {
        try {
          const invoiceNumber = await generateInvoiceNumber();
          const pdfBuffer = await generateInvoicePDF({
            ...result.booking,
            status: 'PAID',
            invoice: null,
          });
          await prisma.invoice.create({
            data: {
              bookingId: result.booking.id,
              invoiceNumber,
              pdfData: Buffer.from(pdfBuffer),
              pdfUrl: `/api/invoices/${result.booking.id}/download`,
            },
          });
        } catch (invErr: unknown) {
          const code = (invErr as { code?: string })?.code;
          if (code === 'P2002') {
            // Unique violation: invoice already created (e.g. concurrent webhook). Idempotent.
          } else {
            throw invErr;
          }
        }
      }

      return NextResponse.json({ received: true });
    } catch (error) {
      if ((error as Error).message === 'BOOKING_NOT_FOUND') {
        return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
      }
      console.error('Error processing webhook:', error);
      return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
