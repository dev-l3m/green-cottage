import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/middleware';
import { prisma } from '@/lib/prisma';

const TEAM_KEY = 'admin_team_members';

const updateSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  email: z.string().trim().email().max(320).optional(),
  role: z.enum(['ADMIN', 'MANAGER', 'RECEPTION']).optional(),
  permissions: z
    .object({
      bookings: z.boolean(),
      invoices: z.boolean(),
      stats: z.boolean(),
    })
    .optional(),
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const data = updateSchema.parse(body);
    const members = await getMembers();
    const target = members.find((m) => m.id === params.id);

    if (!target) {
      return NextResponse.json({ error: 'Membre équipe introuvable' }, { status: 404 });
    }

    const nextEmail = data.email?.toLowerCase();
    if (
      nextEmail &&
      members.some((m) => m.id !== params.id && m.email.toLowerCase() === nextEmail)
    ) {
      return NextResponse.json({ error: 'Email déjà présent dans l’équipe' }, { status: 409 });
    }

    const updated: TeamMember = {
      ...target,
      name: data.name ?? target.name,
      email: nextEmail ?? target.email,
      role: data.role ?? target.role,
      permissions: data.permissions ?? target.permissions,
      updatedAt: new Date().toISOString(),
    };

    const next = members.map((m) => (m.id === params.id ? updated : m));
    await saveMembers(next);
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating team member:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Données invalides', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Impossible de mettre à jour le membre' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const members = await getMembers();
    const next = members.filter((m) => m.id !== params.id);

    if (next.length === members.length) {
      return NextResponse.json({ error: 'Membre équipe introuvable' }, { status: 404 });
    }

    await saveMembers(next);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error deleting team member:', error);
    return NextResponse.json({ error: 'Impossible de supprimer le membre' }, { status: 500 });
  }
}
