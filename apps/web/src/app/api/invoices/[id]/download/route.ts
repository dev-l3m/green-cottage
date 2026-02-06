import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: { invoice: true },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Check if user owns the booking or is admin
    const isOwner = booking.userId === (session.user as any).id;
    const isAdmin = (session.user as any).role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!booking.invoice?.pdfData) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    const pdfBuffer = booking.invoice.pdfData as Buffer;
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${booking.invoice.invoiceNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error downloading invoice:', error);
    return NextResponse.json({ error: 'Failed to download invoice' }, { status: 500 });
  }
}
