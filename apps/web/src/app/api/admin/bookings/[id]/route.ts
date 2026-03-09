import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/middleware';
import { prisma } from '@/lib/prisma';

const bookingUpdateSchema = z.object({
  status: z.enum(['PENDING', 'PAID', 'CANCELLED', 'REFUNDED']),
  note: z.string().trim().max(500).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const data = bookingUpdateSchema.parse(body);

    const booking = await prisma.$transaction(async (tx) => {
      const existing = await tx.booking.findUnique({
        where: { id: params.id },
        select: { id: true, status: true },
      });

      if (!existing) {
        throw new Error('BOOKING_NOT_FOUND');
      }

      const updated = await tx.booking.update({
        where: { id: params.id },
        data: { status: data.status },
        select: {
          id: true,
          status: true,
        },
      });

      const cleanedNote = data.note?.trim();
      if (existing.status !== data.status || cleanedNote) {
        await tx.bookingHistory.create({
          data: {
            bookingId: params.id,
            previousStatus: existing.status,
            newStatus: data.status,
            note: cleanedNote || null,
            changedByUserId: (auth.user as any).id,
          },
        });
      }

      return updated;
    });

    return NextResponse.json(booking);
  } catch (error) {
    console.error('Error updating booking:', error);
    if (error instanceof Error && error.message === 'BOOKING_NOT_FOUND') {
      return NextResponse.json({ error: 'Reservation introuvable' }, { status: 404 });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
  }
}
