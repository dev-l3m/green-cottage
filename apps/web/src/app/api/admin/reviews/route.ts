import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');

    const where: any = {};
    if (status) {
      where.status = status;
    }

    const reviews = await prisma.review.findMany({
      where,
      include: {
        booking: {
          include: {
            cottage: {
              select: {
                title: true,
                slug: true,
              },
            },
          },
        },
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
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}
