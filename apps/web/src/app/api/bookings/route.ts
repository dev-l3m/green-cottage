import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware';
import { prisma } from '@/lib/prisma';
import { checkAvailability } from '@/lib/availability';
import { computeBookingPricing } from '@/lib/pricing';
import { generateInvoiceNumber, generateInvoicePDF } from '@/lib/invoice';
import { z } from 'zod';

const bookingRequestSchema = z.object({
  cottageId: z.string().min(1),
  startDate: z.string().transform((str) => new Date(str)),
  endDate: z.string().transform((str) => new Date(str)),
  guests: z.number().int().min(1).max(20),
  options: z.object({
    cleaning: z.boolean().optional(),
    breakfast: z.boolean().optional(),
  }).optional(),
});

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const bookings = await prisma.booking.findMany({
      where: {
        userId: (auth.user as any).id,
      },
      include: {
        cottage: {
          select: {
            title: true,
            slug: true,
          },
        },
        invoice: {
          select: {
            invoiceNumber: true,
          },
        },
        history: {
          where: { newStatus: 'PAID' },
          select: {
            createdAt: true,
            note: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const data = bookingRequestSchema.parse(body);

    if (Number.isNaN(data.startDate.getTime()) || Number.isNaN(data.endDate.getTime())) {
      return NextResponse.json({ error: 'Dates invalides' }, { status: 400 });
    }

    if (data.endDate <= data.startDate) {
      return NextResponse.json(
        { error: 'La date de départ doit être après la date d’arrivée' },
        { status: 400 }
      );
    }

    const cottage = await prisma.cottage.findUnique({
      where: { id: data.cottageId },
      select: {
        id: true,
        isActive: true,
        capacity: true,
        basePrice: true,
        cleaningFee: true,
      },
    });

    if (!cottage || !cottage.isActive) {
      return NextResponse.json({ error: 'Gîte introuvable' }, { status: 404 });
    }

    if (data.guests > cottage.capacity) {
      return NextResponse.json(
        { error: `Ce gîte accepte au maximum ${cottage.capacity} voyageurs.` },
        { status: 400 }
      );
    }

    const isAvailable = await checkAvailability(cottage.id, data.startDate, data.endDate);
    if (!isAvailable) {
      return NextResponse.json(
        { error: 'Ces dates ne sont plus disponibles.' },
        { status: 409 }
      );
    }

    const pricing = await computeBookingPricing({
      cottageId: cottage.id,
      basePrice: cottage.basePrice,
      defaultCleaningFee: Number(cottage.cleaningFee ?? 0),
      startDate: data.startDate,
      endDate: data.endDate,
      withCleaning: Boolean(data.options?.cleaning),
    });

    const paymentResult = await prisma.$transaction(async (tx) => {
      const userId = (auth.user as any).id as string;
      const userRows = await tx.$queryRaw<{ balance: number }[]>`
        SELECT "balance"
        FROM "User"
        WHERE "id" = ${userId}
        FOR UPDATE
      `;

      const currentBalance = userRows[0]?.balance;
      if (typeof currentBalance !== 'number') {
        throw new Error('USER_NOT_FOUND');
      }

      if (currentBalance < pricing.total) {
        throw new Error('INSUFFICIENT_BALANCE');
      }

      await tx.$executeRaw`
        UPDATE "User"
        SET "balance" = "balance" - ${pricing.total}
        WHERE "id" = ${userId}
      `;

      const created = await tx.booking.create({
        data: {
          cottageId: cottage.id,
          userId,
          startDate: data.startDate,
          endDate: data.endDate,
          guests: data.guests,
          options: data.options ?? {},
          subtotal: pricing.subtotal,
          touristTax: pricing.touristTax,
          total: pricing.total,
          status: 'PAID',
        },
      });

      await tx.bookingHistory.create({
        data: {
          bookingId: created.id,
          previousStatus: null,
          newStatus: 'PAID',
          note: 'Réservation payée via le solde interne utilisateur.',
          changedByUserId: userId,
        },
      });

      return {
        booking: created,
        remainingBalance: currentBalance - pricing.total,
      };
    });

    let invoiceNumber: string | null = null;
    try {
      invoiceNumber = await generateInvoiceNumber();
      const pdfBuffer = await generateInvoicePDF(
        {
          ...paymentResult.booking,
          invoice: null,
        },
        invoiceNumber
      );

      await prisma.invoice.create({
        data: {
          bookingId: paymentResult.booking.id,
          invoiceNumber,
          pdfData: Buffer.from(pdfBuffer),
          pdfUrl: `/api/invoices/${paymentResult.booking.id}/download`,
        },
      });
    } catch (invErr: unknown) {
      const code = (invErr as { code?: string })?.code;
      if (code !== 'P2002') {
        console.error('Error generating invoice for internal payment:', invErr);
      }
    }

    return NextResponse.json(
      {
        id: paymentResult.booking.id,
        status: paymentResult.booking.status,
        message: 'Paiement effectué avec votre solde interne. Réservation confirmée.',
        remainingBalance: paymentResult.remainingBalance,
        invoiceNumber,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating booking request:', error);
    if (error instanceof Error && error.message === 'INSUFFICIENT_BALANCE') {
      return NextResponse.json(
        { error: 'Solde insuffisant pour finaliser le paiement.' },
        { status: 402 }
      );
    }
    if (error instanceof Error && error.message === 'USER_NOT_FOUND') {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Données invalides', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Impossible de créer la réservation' }, { status: 500 });
  }
}
