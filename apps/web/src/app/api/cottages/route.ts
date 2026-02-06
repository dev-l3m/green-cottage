import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const capacity = searchParams.get('capacity');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const amenities = searchParams.get('amenities')?.split(',');
    const isActive = searchParams.get('isActive') !== 'false';

    const where: any = {
      isActive,
    };

    if (capacity) {
      where.capacity = { gte: parseInt(capacity) };
    }

    if (minPrice || maxPrice) {
      where.basePrice = {};
      if (minPrice) where.basePrice.gte = parseFloat(minPrice);
      if (maxPrice) where.basePrice.lte = parseFloat(maxPrice);
    }

    if (amenities && amenities.length > 0) {
      where.amenities = {
        hasEvery: amenities,
      };
    }

    const cottages = await prisma.cottage.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(cottages);
  } catch (error) {
    console.error('Error fetching cottages:', error);
    return NextResponse.json({ error: 'Failed to fetch cottages' }, { status: 500 });
  }
}
