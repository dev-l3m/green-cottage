import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/middleware';
import { prisma } from '@/lib/prisma';

const TEAM_KEY = 'admin_team_members';

const memberSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(320),
  role: z.enum(['ADMIN', 'MANAGER', 'RECEPTION']),
  permissions: z.object({
    bookings: z.boolean(),
    invoices: z.boolean(),
    stats: z.boolean(),
  }),
});

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
  createdAt: string;
  updatedAt: string;
};

async function getMembers(): Promise<TeamMember[]> {
  const row = await prisma.siteContent.findUnique({
    where: { key: TEAM_KEY },
    select: { value: true },
  });
  const value = row?.value;
  if (!Array.isArray(value)) return [];
  return value.filter((v) => v && typeof v === 'object') as TeamMember[];
}

async function saveMembers(members: TeamMember[]) {
  await prisma.siteContent.upsert({
    where: { key: TEAM_KEY },
    update: { value: members },
    create: { key: TEAM_KEY, value: members },
  });
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const members = await getMembers();
    return NextResponse.json(members);
  } catch (error) {
    console.error('Error fetching team members:', error);
    return NextResponse.json({ error: 'Impossible de charger l’équipe' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const data = memberSchema.parse(body);
    const members = await getMembers();
    const normalizedEmail = data.email.toLowerCase();

    if (members.some((m) => m.email.toLowerCase() === normalizedEmail)) {
      return NextResponse.json({ error: 'Email déjà présent dans l’équipe' }, { status: 409 });
    }

    const now = new Date().toISOString();
    const member: TeamMember = {
      id: crypto.randomUUID(),
      name: data.name,
      email: normalizedEmail,
      role: data.role,
      permissions: data.permissions,
      createdAt: now,
      updatedAt: now,
    };

    const next = [member, ...members];
    await saveMembers(next);
    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    console.error('Error creating team member:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Données invalides', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Impossible de créer l’utilisateur équipe' }, { status: 500 });
  }
}
