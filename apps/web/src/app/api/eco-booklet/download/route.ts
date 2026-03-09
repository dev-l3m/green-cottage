import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const PDF_FILE_NAME = 'jeux-a-imprimer-green-cottage.pdf';

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token');
    if (!token) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 400 });
    }

    const tokenHash = hashToken(token);
    const lead = await prisma.newsletter.findUnique({
      where: { downloadTokenHash: tokenHash },
      select: {
        id: true,
        status: true,
        downloadTokenExpiresAt: true,
      },
    });

    if (!lead || !lead.downloadTokenExpiresAt || lead.status !== 'SUBSCRIBED') {
      return NextResponse.json({ error: 'Lien invalide' }, { status: 401 });
    }

    if (lead.downloadTokenExpiresAt < new Date()) {
      return NextResponse.json({ error: 'Lien expire' }, { status: 401 });
    }

    const pdfPath = path.join(process.cwd(), 'public', PDF_FILE_NAME);
    const pdfBuffer = await readFile(pdfPath);

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${PDF_FILE_NAME}"`,
        'Cache-Control': 'private, no-store, max-age=0',
      },
    });
  } catch (error) {
    console.error('Error serving eco booklet PDF:', error);
    return NextResponse.json({ error: 'Impossible de telecharger le PDF' }, { status: 500 });
  }
}
