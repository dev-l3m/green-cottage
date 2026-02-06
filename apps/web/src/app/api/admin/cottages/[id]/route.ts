import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const cottageUpdateSchema = z.object({
  slug: z.string().min(1).optional(),
  title: z.string().min(1).optional(),
  summary: z.string().optional(),
  description: z.string().min(1).optional(),
  address: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  capacity: z.number().int().min(1).optional(),
  basePrice: z.number().min(0).optional(),
  cleaningFee: z.number().min(0).optional(),
  images: z.array(z.string()).optional(),
  amenities: z.array(z.string()).optional(),
  rules: z.string().optional(),
  checkInTime: z.string().optional(),
  checkOutTime: z.string().optional(),
  isActive: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const cottage = await prisma.cottage.findUnique({
      where: { id: params.id },
    });

    if (!cottage) {
      return NextResponse.json({ error: 'Cottage not found' }, { status: 404 });
    }

    return NextResponse.json(cottage);
  } catch (error) {
    console.error('Error fetching cottage:', error);
    return NextResponse.json({ error: 'Failed to fetch cottage' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const data = cottageUpdateSchema.parse(body);

    const cottage = await prisma.cottage.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json(cottage);
  } catch (error) {
    console.error('Error updating cottage:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update cottage' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    await prisma.cottage.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting cottage:', error);
    return NextResponse.json({ error: 'Failed to delete cottage' }, { status: 500 });
  }
}
