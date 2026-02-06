import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const cottageId = searchParams.get('cottageId');

    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (cottageId) {
      where.cottageId = cottageId;
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        cottage: {
          select: {
            title: true,
            slug: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
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
