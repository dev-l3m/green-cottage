import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware';

export async function POST(
  request: NextRequest,
  _context: { params: { bookingId: string } }
) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  return NextResponse.json(
    { error: 'La generation de facture PDF est temporairement desactivee.' },
    { status: 503 }
  );
}
