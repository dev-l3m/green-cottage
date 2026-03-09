import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { requireAdmin } from '@/lib/middleware';
import { prisma } from '@/lib/prisma';

const paymentUpdateSchema = z.object({
  mode: z
    .enum(['CARTE_BANCAIRE', 'STRIPE', 'PAYPAL', 'VIREMENT', 'ESPECES'])
    .optional(),
  action: z
    .enum(['SET_PENDING', 'REFUND', 'SET_DEPOSIT', 'SETTLE_REMAINING'])
    .optional(),
  depositAmount: z.number().min(0).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const data = paymentUpdateSchema.parse(body);

    const updated = await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { id: params.id },
        select: {
          id: true,
          total: true,
          status: true,
          options: true,
        },
      });

      if (!booking) {
        throw new Error('BOOKING_NOT_FOUND');
      }

      const optionsObj =
        booking.options && typeof booking.options === 'object' && !Array.isArray(booking.options)
          ? ({ ...(booking.options as Prisma.JsonObject) } as Prisma.JsonObject)
          : ({} as Prisma.JsonObject);

      const existingPayment =
        optionsObj._payment &&
        typeof optionsObj._payment === 'object' &&
        !Array.isArray(optionsObj._payment)
          ? ({ ...(optionsObj._payment as Prisma.JsonObject) } as Prisma.JsonObject)
          : ({} as Prisma.JsonObject);

      const nextPayment: Prisma.JsonObject = {
        ...existingPayment,
      };
      let nextStatus = booking.status;
      let note: string | null = null;

      if (data.mode) {
        nextPayment.method = data.mode;
      }

      if (data.action === 'SET_PENDING') {
        nextStatus = 'PENDING';
        note = 'Paiement marqué en attente par un administrateur.';
      }

      if (data.action === 'REFUND') {
        nextStatus = 'REFUNDED';
        nextPayment.paidAmount = 0;
        nextPayment.remainingAmount = booking.total;
        note = 'Paiement remboursé par un administrateur.';
      }

      if (data.action === 'SET_DEPOSIT') {
        const rawAmount = data.depositAmount ?? Number((booking.total * 0.3).toFixed(2));
        const amount = Math.max(0, Math.min(rawAmount, booking.total));
        nextPayment.depositAmount = amount;
        nextPayment.paidAmount = amount;
        nextPayment.remainingAmount = Number((booking.total - amount).toFixed(2));
        nextStatus = amount >= booking.total ? 'PAID' : 'PENDING';
        note = `Acompte défini à ${amount.toFixed(2)}€ par un administrateur.`;
      }

      if (data.action === 'SETTLE_REMAINING') {
        nextStatus = 'PAID';
        nextPayment.paidAmount = booking.total;
        nextPayment.remainingAmount = 0;
        note = 'Solde restant réglé, paiement confirmé.';
      }

      nextPayment.updatedAt = new Date().toISOString();
      optionsObj._payment = nextPayment;

      const bookingUpdated = await tx.booking.update({
        where: { id: booking.id },
        data: {
          status: nextStatus,
          options: optionsObj as Prisma.InputJsonValue,
        },
        select: {
          id: true,
          status: true,
          total: true,
          options: true,
        },
      });

      if (booking.status !== nextStatus || note) {
        await tx.bookingHistory.create({
          data: {
            bookingId: booking.id,
            previousStatus: booking.status,
            newStatus: nextStatus,
            note,
            changedByUserId: (auth.user as { id: string }).id,
          },
        });
      }

      return bookingUpdated;
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating payment:', error);
    if (error instanceof Error && error.message === 'BOOKING_NOT_FOUND') {
      return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Données invalides', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Impossible de mettre à jour le paiement' }, { status: 500 });
  }
}
