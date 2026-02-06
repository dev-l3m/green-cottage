import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware';
import { prisma } from '@/lib/prisma';
import { syncICalFeed } from '@/lib/ical';

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const { cottageId, importUrl } = body;

    if (!cottageId || !importUrl) {
      return NextResponse.json(
        { error: 'Missing cottageId or importUrl' },
        { status: 400 }
      );
    }

    await syncICalFeed(cottageId, importUrl);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error syncing iCal feed:', error);
    return NextResponse.json({ error: 'Failed to sync iCal feed' }, { status: 500 });
  }
}
