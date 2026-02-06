import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const reviewUpdateSchema = z.object({
  status: z.enum(['PENDING', 'PUBLISHED', 'REJECTED']),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const data = reviewUpdateSchema.parse(body);

    const review = await prisma.review.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json(review);
  } catch (error) {
    console.error('Error updating review:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update review' }, { status: 500 });
  }
}
