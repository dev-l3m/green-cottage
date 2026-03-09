import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { requireAdmin } from '@/lib/middleware';
import { prisma } from '@/lib/prisma';
import { isStrongPassword } from '@/lib/password';

const adminPasswordSchema = z.object({
  newPassword: z.string().min(8),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const data = adminPasswordSchema.parse(body);
    if (!isStrongPassword(data.newPassword)) {
      return NextResponse.json(
        {
          error:
            'Le mot de passe doit contenir minuscule, majuscule, chiffre, caractère spécial et 8 caractères minimum.',
        },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: { id: true, email: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
    }

    const hash = await bcrypt.hash(data.newPassword, 10);
    await prisma.user.update({
      where: { id: params.id },
      data: { passwordHash: hash },
    });

    return NextResponse.json({ success: true, email: user.email });
  } catch (error) {
    console.error('Error updating user password by admin:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Données invalides', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Impossible de changer le mot de passe' }, { status: 500 });
  }
}
