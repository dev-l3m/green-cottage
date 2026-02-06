import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const cottage = await prisma.cottage.findUnique({
      where: { slug: params.slug },
      include: {
        reviews: {
          where: { status: 'PUBLISHED' },
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
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
