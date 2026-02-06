import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const postSchema = z.object({
  slug: z.string().min(1, 'Slug requis'),
  rating: z.number().int().min(1).max(5),
  author: z.string().max(120).optional().nullable(),
  comment: z
    .string()
    .min(1, 'Un commentaire est requis')
    .max(800, 'Maximum 800 caractères'),
});

const COMMENT_SANITIZE_MAX_LENGTH = 800;

function sanitizeComment(text: string): string {
  return text
    .slice(0, COMMENT_SANITIZE_MAX_LENGTH)
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .trim();
}

// Simple in-memory rate limit: IP -> last request timestamp (MVP)
const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_MS = 60_000; // 1 minute between submits per IP

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

export async function GET(request: NextRequest) {
  try {
    const slug = request.nextUrl.searchParams.get('slug');
    if (!slug) {
      return NextResponse.json({ error: 'slug required' }, { status: 400 });
    }
    const cottage = await prisma.cottage.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!cottage) {
      return NextResponse.json({ error: 'Cottage not found' }, { status: 404 });
    }
    const reviews = await prisma.publicReview.findMany({
      where: { cottageId: cottage.id, status: 'PUBLISHED' },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(
      reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        author: r.author ?? 'Anonyme',
        comment: r.comment,
        createdAt: r.createdAt.toISOString(),
      }))
    );
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const now = Date.now();
    const last = rateLimitMap.get(ip);
    if (last != null && now - last < RATE_LIMIT_MS) {
      return NextResponse.json(
        { error: 'Veuillez patienter avant de soumettre un nouvel avis.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = postSchema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.flatten().fieldErrors;
      return NextResponse.json({ error: 'Validation failed', details: msg }, { status: 400 });
    }

    const { slug, rating, author, comment } = parsed.data;
    const cottage = await prisma.cottage.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!cottage) {
      return NextResponse.json({ error: 'Cottage not found' }, { status: 404 });
    }

    const sanitized = sanitizeComment(comment);
    await prisma.publicReview.create({
      data: {
        cottageId: cottage.id,
        slug,
        rating,
        author: author ?? null,
        comment: sanitized,
        status: 'PUBLISHED',
      },
    });

    rateLimitMap.set(ip, now);
    return NextResponse.json({ success: true });
  } catch (error) {
    const isTableMissing =
      typeof error === 'object' && error !== null && 'code' in error && (error as { code: string }).code === 'P2021';
    if (isTableMissing) {
      console.error('PublicReview table missing. Run: pnpm exec prisma db execute --file prisma/create-public-review-table.sql');
      return NextResponse.json(
        { error: 'La fonctionnalité avis est temporairement indisponible. Réessayez plus tard.' },
        { status: 503 }
      );
    }
    console.error('Error creating review:', error);
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
  }
}
