import { NextRequest, NextResponse } from 'next/server';
import { getPublicCottages } from '@/lib/server/public-cottages';
import { mapPublicCottagesToListItems } from '@/lib/cottages-shared';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const capacity = searchParams.get('capacity');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const amenities = searchParams.get('amenities')?.split(',');
    const isActive = searchParams.get('isActive') !== 'false';

    const cottages = await getPublicCottages({
      isActive,
      capacity: capacity ? parseInt(capacity, 10) : undefined,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      amenities: amenities && amenities.length > 0 ? amenities : undefined,
    });

    return NextResponse.json(
      cottages.map((cottage) => ({
        ...cottage,
        image: mapPublicCottagesToListItems([cottage])[0]?.image ?? '',
      }))
    );
  } catch (error) {
    console.error('Error fetching cottages:', error);
    return NextResponse.json({ error: 'Failed to fetch cottages' }, { status: 500 });
  }
}
