import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function requireAuth(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return { session, user: session.user };
}

export async function requireAdmin(request: NextRequest) {
  const auth = await requireAuth(request);

  if (auth instanceof NextResponse) {
    return auth;
  }

  if ((auth.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return auth;
}
