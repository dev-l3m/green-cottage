import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/middleware';
import { prisma } from '@/lib/prisma';

const bookingUpdateSchema = z.object({
  status: z.enum(['PENDING', 'PAID', 'CANCELLED', 'REFUNDED']),
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

    const booking = await prisma.booking.update({
      where: { id: params.id },
      data: { status: data.status },
      select: {
        id: true,
        status: true,
      },
    });

    return NextResponse.json(booking);
  } catch (error) {
    console.error('Error updating booking:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
  }
}
