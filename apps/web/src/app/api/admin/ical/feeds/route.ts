import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const feedSchema = z.object({
  cottageId: z.string(),
  importUrl: z.string().url().optional(),
});

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const feeds = await prisma.icalFeed.findMany({
      include: {
        cottage: {
          select: {
            title: true,
            slug: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(feeds);
  } catch (error) {
    console.error('Error fetching iCal feeds:', error);
    return NextResponse.json({ error: 'Failed to fetch iCal feeds' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const data = feedSchema.parse(body);

    const feed = await prisma.icalFeed.create({
      data,
    });

    return NextResponse.json(feed, { status: 201 });
  } catch (error) {
    console.error('Error creating iCal feed:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create iCal feed' }, { status: 500 });
  }
}
