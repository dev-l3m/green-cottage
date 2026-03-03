import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware';
import { prisma } from '@/lib/prisma';
import { generateInvoiceNumber, generateInvoicePDF } from '@/lib/invoice';

export async function POST(
  request: NextRequest,
  { params }: { params: { bookingId: string } }
) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: params.bookingId },
      include: { invoice: true },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 });
    }

    if (booking.invoice) {
      return NextResponse.json({
        invoiceId: booking.invoice.id,
        invoiceNumber: booking.invoice.invoiceNumber,
        issuedAt: booking.invoice.issuedAt.toISOString(),
      });
    }

    if (booking.status !== 'PAID') {
      return NextResponse.json(
        { error: 'La facture ne peut être générée que pour une réservation payée' },
        { status: 400 }
      );
    }

    const invoiceNumber = await generateInvoiceNumber();
    const pdfBuffer = await generateInvoicePDF({
      ...booking,
      invoice: null,
    });

    const invoice = await prisma.invoice.create({
      data: {
        bookingId: booking.id,
        invoiceNumber,
        pdfData: Buffer.from(pdfBuffer),
        pdfUrl: `/api/invoices/${booking.id}/download`,
      },
      select: {
        id: true,
        invoiceNumber: true,
        issuedAt: true,
      },
    });

    return NextResponse.json({
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      issuedAt: invoice.issuedAt.toISOString(),
    });
  } catch (error) {
    console.error('Error generating invoice from admin:', error);
    return NextResponse.json({ error: 'Échec de génération de la facture' }, { status: 500 });
  }
}
