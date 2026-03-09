import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware';
import { prisma } from '@/lib/prisma';
import { checkAvailability } from '@/lib/availability';
import { computeBookingPricing } from '@/lib/pricing';
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

    const booking = await prisma.$transaction(async (tx) => {
      const created = await tx.booking.create({
        data: {
          cottageId: cottage.id,
          userId: (auth.user as any).id,
          startDate: data.startDate,
          endDate: data.endDate,
          guests: data.guests,
          options: data.options ?? {},
          subtotal: pricing.subtotal,
          touristTax: pricing.touristTax,
          total: pricing.total,
          status: 'PENDING',
        },
      });

      await tx.bookingHistory.create({
        data: {
          bookingId: created.id,
          previousStatus: null,
          newStatus: 'PENDING',
          note: 'Demande de réservation créée depuis le formulaire public.',
          changedByUserId: (auth.user as any).id,
        },
      });

      return created;
    });

    return NextResponse.json(
      {
        id: booking.id,
        status: booking.status,
        message: 'Votre demande de réservation a bien été envoyée.',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating booking request:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Données invalides', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Impossible de créer la réservation' }, { status: 500 });
  }
}
