import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(_request: NextRequest) {
  return NextResponse.json(
    { error: 'Le telechargement PDF est temporairement desactive.' },
    { status: 503 }
  );
}
