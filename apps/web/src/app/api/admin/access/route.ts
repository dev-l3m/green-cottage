import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware';
import { prisma } from '@/lib/prisma';

type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'RECEPTION';
  permissions: {
    bookings: boolean;
    invoices: boolean;
    stats: boolean;
  };
};

const TEAM_KEY = 'admin_team_members';

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const user = auth.user as { role?: string; email?: string | null };
    const email = String(user.email ?? '').toLowerCase();

    if (user.role === 'ADMIN') {
      return NextResponse.json({
        allowed: true,
        role: 'ADMIN',
        permissions: { bookings: true, invoices: true, stats: true },
        superAdmin: true,
      });
    }

    const row = await prisma.siteContent.findUnique({
      where: { key: TEAM_KEY },
      select: { value: true },
    });
    const raw = row?.value;
    const members = Array.isArray(raw) ? (raw as TeamMember[]) : [];
    const member = members.find((m) => String(m.email).toLowerCase() === email);

    if (!member) {
      return NextResponse.json({ allowed: false }, { status: 403 });
    }

    return NextResponse.json({
      allowed: true,
      role: member.role,
      permissions: member.permissions,
      superAdmin: false,
    });
  } catch (error) {
    console.error('Error resolving admin access:', error);
    return NextResponse.json({ error: 'Impossible de vérifier les accès' }, { status: 500 });
  }
}
