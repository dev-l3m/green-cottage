import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { generateInvoicePDF, generateInvoiceNumber } from '@/lib/invoice';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;

    try {
      const booking = await prisma.booking.findUnique({
        where: { stripeSessionId: session.id },
        include: { invoice: true },
      });

      if (!booking) {
        console.error('Booking not found for session:', session.id);
        return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
      }

      if (booking.status === 'PAID') {
        // Already processed
        return NextResponse.json({ received: true });
      }

      // Mark booking as paid
      await prisma.booking.update({
        where: { id: booking.id },
        data: {
          status: 'PAID',
          stripePaymentIntentId: session.payment_intent as string,
        },
      });

      // Remove temporary lock if exists
      if (event.data.object.metadata?.lockId) {
        try {
          await prisma.availabilityBlock.deleteMany({
            where: {
              id: event.data.object.metadata.lockId,
              source: 'INTERNAL',
            },
          });
        } catch (error) {
          // Lock may have expired already
        }
      }

      // Generate invoice
      const invoiceNumber = await generateInvoiceNumber();
      const pdfBuffer = await generateInvoicePDF({
        ...booking,
        status: 'PAID',
        invoice: null,
      });

      // Store invoice
      await prisma.invoice.create({
        data: {
          bookingId: booking.id,
          invoiceNumber,
          pdfData: Buffer.from(pdfBuffer),
          pdfUrl: `/api/invoices/${booking.id}/download`, // Will be generated on-demand
        },
      });

      // TODO: Send confirmation email
      console.log('Booking confirmed and invoice generated:', booking.id);

      return NextResponse.json({ received: true });
    } catch (error) {
      console.error('Error processing webhook:', error);
      return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
