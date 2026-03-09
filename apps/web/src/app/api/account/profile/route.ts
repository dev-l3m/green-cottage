import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/middleware';
import { prisma } from '@/lib/prisma';

const profileSchema = z.object({
  name: z.string().trim().min(1, 'Le nom est requis').max(120, 'Nom trop long'),
  email: z.string().trim().email('Email invalide').max(320, 'Email trop long'),
  phone: z.string().trim().max(40).optional().default(''),
  addressLine1: z.string().trim().max(160).optional().default(''),
  city: z.string().trim().max(100).optional().default(''),
  postalCode: z.string().trim().max(20).optional().default(''),
  country: z.string().trim().max(100).optional().default(''),
  isProfessional: z.boolean().optional().default(false),
  companyName: z.string().trim().max(160).optional().default(''),
  vatNumber: z.string().trim().max(60).optional().default(''),
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
        phone: true,
        addressLine1: true,
        city: true,
        postalCode: true,
        country: true,
        isProfessional: true,
        companyName: true,
        vatNumber: true,
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
        phone: data.phone || null,
        addressLine1: data.addressLine1 || null,
        city: data.city || null,
        postalCode: data.postalCode || null,
        country: data.country || null,
        isProfessional: data.isProfessional,
        companyName: data.isProfessional ? data.companyName || null : null,
        vatNumber: data.isProfessional ? data.vatNumber || null : null,
      },
      select: {
        name: true,
        email: true,
        phone: true,
        addressLine1: true,
        city: true,
        postalCode: true,
        country: true,
        isProfessional: true,
        companyName: true,
        vatNumber: true,
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
