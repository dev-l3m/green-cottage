import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/middleware';
import { prisma } from '@/lib/prisma';

const profileSchema = z.object({
  name: z.string().trim().min(1, 'Le nom est requis').max(120, 'Nom trop long'),
  email: z.string().trim().email('Email invalide').max(320, 'Email trop long'),
});

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const user = await prisma.user.findUnique({
      where: { id: (auth.user as { id: string }).id },
      select: {
        name: true,
        email: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Impossible de récupérer le profil' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const data = profileSchema.parse(body);
    const email = data.email.toLowerCase();

    const currentUserId = (auth.user as { id: string }).id;
    const existing = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existing && existing.id !== currentUserId) {
      return NextResponse.json({ error: 'Cet email est déjà utilisé' }, { status: 409 });
    }

    const updated = await prisma.user.update({
      where: { id: currentUserId },
      data: {
        name: data.name,
        email,
      },
      select: {
        name: true,
        email: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating profile:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Données invalides', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Impossible de mettre à jour le profil' }, { status: 500 });
  }
}
