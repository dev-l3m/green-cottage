import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  _context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Le telechargement PDF est temporairement desactive.' },
      { status: 503 }
    );
  } catch (error) {
    console.error('Error downloading invoice:', error);
    return NextResponse.json({ error: 'Failed to download invoice' }, { status: 500 });
  }
}
