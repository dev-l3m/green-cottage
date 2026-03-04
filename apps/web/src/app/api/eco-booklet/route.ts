import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const ecoBookletSchema = z.object({
  email: z.string().trim().email('Email invalide').max(320, 'Email trop long'),
  consent: z.literal(true),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = ecoBookletSchema.parse(body);
    const email = data.email.toLowerCase();
    const key = `eco_booklet_lead:${email}`;
    const now = new Date().toISOString();

    await prisma.siteContent.upsert({
      where: { key },
      update: {
        value: {
          email,
          consent: true,
          updatedAt: now,
          source: 'eco-booklet-popup',
        },
      },
      create: {
        key,
        value: {
          email,
          consent: true,
          createdAt: now,
          source: 'eco-booklet-popup',
        },
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error saving eco booklet lead:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Données invalides' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Impossible d’enregistrer votre demande' }, { status: 500 });
  }
}
