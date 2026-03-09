import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { requireAuth } from '@/lib/middleware';
import { prisma } from '@/lib/prisma';
import { isStrongPassword } from '@/lib/password';

const passwordSchema = z
  .object({
    currentPassword: z.string().min(6),
    newPassword: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'La confirmation du mot de passe ne correspond pas.',
    path: ['confirmPassword'],
  });

export async function PATCH(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const data = passwordSchema.parse(body);
    if (!isStrongPassword(data.newPassword)) {
      return NextResponse.json(
        {
          error:
            'Le nouveau mot de passe doit contenir minuscule, majuscule, chiffre, caractère spécial et 8 caractères minimum.',
        },
        { status: 400 }
      );
    }
    const userId = (auth.user as { id: string }).id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { passwordHash: true },
    });

    if (!user?.passwordHash) {
      return NextResponse.json({ error: 'Aucun mot de passe local configuré.' }, { status: 400 });
    }

    const valid = await bcrypt.compare(data.currentPassword, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: 'Mot de passe actuel incorrect.' }, { status: 400 });
    }

    const nextHash = await bcrypt.hash(data.newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: nextHash },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating account password:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Données invalides', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Impossible de mettre à jour le mot de passe' }, { status: 500 });
  }
}
