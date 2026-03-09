import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const userId = (auth.user as { id: string }).id;
    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        userId: true,
        status: true,
        startDate: true,
      },
    });

    if (!booking || booking.userId !== userId) {
      return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 });
    }

    if (booking.status === 'CANCELLED' || booking.status === 'REFUNDED') {
      return NextResponse.json({ error: 'Cette réservation est déjà annulée.' }, { status: 400 });
    }

    if (new Date(booking.startDate).getTime() <= Date.now()) {
      return NextResponse.json(
        { error: 'Impossible d’annuler une réservation déjà commencée.' },
        { status: 400 }
      );
    }

    const updated = await prisma.$transaction(async (tx) => {
      const changed = await tx.booking.update({
        where: { id: booking.id },
        data: {
          status: 'CANCELLED',
        },
        select: {
          id: true,
          status: true,
        },
      });

      await tx.bookingHistory.create({
        data: {
          bookingId: booking.id,
          previousStatus: booking.status,
          newStatus: 'CANCELLED',
          note: 'Annulation demandée par le client depuis son compte.',
          changedByUserId: userId,
        },
      });

      return changed;
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return NextResponse.json({ error: 'Impossible d’annuler la réservation' }, { status: 500 });
  }
}
