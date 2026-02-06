import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateICalExport } from '@/lib/ical';

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const feed = await prisma.icalFeed.findUnique({
      where: { exportToken: params.token },
      include: {
        cottage: {
          include: {
            bookings: {
              where: {
                status: 'PAID',
              },
            },
            availabilityBlocks: {
              where: {
                source: 'INTERNAL',
              },
            },
          },
        },
      },
    });

    if (!feed) {
      return NextResponse.json({ error: 'Feed not found' }, { status: 404 });
    }

    // Combine bookings and blocks for export
    const blocks = [
      ...feed.cottage.bookings.map((booking) => ({
        id: booking.id,
        startDate: booking.startDate,
        endDate: booking.endDate,
        source: 'INTERNAL' as const,
        cottageId: feed.cottageId,
        createdAt: booking.createdAt,
        sourceRef: null,
      })),
      ...feed.cottage.availabilityBlocks,
    ];

    const icalContent = generateICalExport(blocks);

    return new NextResponse(icalContent, {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="green-cottage-${feed.cottage.slug}.ics"`,
      },
    });
  } catch (error) {
    console.error('Error generating iCal export:', error);
    return NextResponse.json({ error: 'Failed to generate iCal export' }, { status: 500 });
  }
}
