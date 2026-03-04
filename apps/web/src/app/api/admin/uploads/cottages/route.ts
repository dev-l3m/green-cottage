import { randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { requireAdmin } from '@/lib/middleware';

const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024;
const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);

function sanitizeBaseName(fileName: string): string {
  const raw = fileName.replace(/\.[^/.]+$/, '');
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Fichier manquant' }, { status: 400 });
    }

    if (file.size <= 0 || file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json({ error: 'Fichier invalide (max 8MB)' }, { status: 400 });
    }

    const originalName = file.name || 'image';
    const extension = path.extname(originalName).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(extension)) {
      return NextResponse.json({ error: 'Format non supporté' }, { status: 400 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const safeBaseName = sanitizeBaseName(originalName) || 'cottage-image';
    const fileName = `${Date.now()}-${safeBaseName}-${randomUUID().slice(0, 8)}${extension}`;

    // On Vercel, filesystem is ephemeral/read-only for persistent uploads.
    // Use Vercel Blob if token is available.
    if (process.env.VERCEL === '1') {
      if (!process.env.BLOB_READ_WRITE_TOKEN) {
        return NextResponse.json(
          { error: 'BLOB_READ_WRITE_TOKEN manquant sur Vercel' },
          { status: 500 }
        );
      }

      const blob = await put(`cottages/${fileName}`, bytes, {
        access: 'public',
        token: process.env.BLOB_READ_WRITE_TOKEN,
        contentType: file.type || undefined,
      });

      return NextResponse.json({ url: blob.url });
    }

    const relativeDir = path.join('uploads', 'cottages');
    const absoluteDir = path.join(process.cwd(), 'public', relativeDir);
    await mkdir(absoluteDir, { recursive: true });

    const absoluteFilePath = path.join(absoluteDir, fileName);
    await writeFile(absoluteFilePath, bytes);

    return NextResponse.json({
      url: `/${relativeDir.replace(/\\/g, '/')}/${fileName}`,
    });
  } catch (error) {
    console.error('Error uploading cottage image:', error);
    return NextResponse.json({ error: 'Échec de l’upload image' }, { status: 500 });
  }
}
