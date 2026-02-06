import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const cottageSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().optional(),
  description: z.string().min(1),
  address: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  capacity: z.number().int().min(1),
  basePrice: z.number().min(0),
  cleaningFee: z.number().min(0).optional(),
  images: z.array(z.string()),
  amenities: z.array(z.string()),
  rules: z.string().optional(),
  checkInTime: z.string().optional(),
  checkOutTime: z.string().optional(),
  isActive: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const cottages = await prisma.cottage.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(cottages);
  } catch (error) {
    console.error('Error fetching cottages:', error);
    return NextResponse.json({ error: 'Failed to fetch cottages' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const data = cottageSchema.parse(body);

    const cottage = await prisma.cottage.create({
      data,
    });

    return NextResponse.json(cottage, { status: 201 });
  } catch (error) {
    console.error('Error creating cottage:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create cottage' }, { status: 500 });
  }
}
