import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAvailability } from '@/lib/availability';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const cottageId = searchParams.get('cottageId');
    const start = searchParams.get('start');
    const end = searchParams.get('end');

    if (!cottageId || !start || !end) {
      return NextResponse.json(
        { error: 'Missing required parameters: cottageId, start, end' },
        { status: 400 }
      );
    }

    const startDate = new Date(start);
    const endDate = new Date(end);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
    }

    const available = await checkAvailability(cottageId, startDate, endDate);

    return NextResponse.json({ available });
  } catch (error) {
    console.error('Error checking availability:', error);
    return NextResponse.json({ error: 'Failed to check availability' }, { status: 500 });
  }
}
