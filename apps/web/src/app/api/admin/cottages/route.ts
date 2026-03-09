import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const imageUrlSchema = z
  .string()
  .trim()
  .refine((value) => value.startsWith('/') || /^https?:\/\//i.test(value), {
    message: 'URL image invalide',
  });

const cottageSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().optional(),
  description: z.string().min(1),
  address: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  capacity: z.number().int().min(1),
  basePrice: z.number().min(0),
  cleaningFee: z.number().min(0).optional(),
  images: z.array(z.string()),
  amenities: z.array(z.string()),
  rules: z.string().optional(),
  checkInTime: z.string().optional(),
  checkOutTime: z.string().optional(),
  isActive: z.boolean().optional(),
  ratingScore: z.number().min(0).max(10).optional(),
  comfortStars: z.number().int().min(1).max(5).optional(),
  heroImage: imageUrlSchema.optional(),
});

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const cottages = await prisma.cottage.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const reviewStats = await prisma.publicReview.groupBy({
      by: ['cottageId'],
      where: {
        status: 'PUBLISHED',
      },
      _avg: {
        rating: true,
      },
      _count: {
        rating: true,
      },
    });

    const statsByCottageId = new Map(
      reviewStats.map((item) => [
        item.cottageId,
        {
          averageRating: item._avg.rating ?? null,
          reviewsCount: item._count.rating,
        },
      ])
    );

    const cottagesWithStats = cottages.map((cottage) => {
      const stats = statsByCottageId.get(cottage.id);
      return {
        ...cottage,
        averageRating: stats?.averageRating ?? null,
        reviewsCount: stats?.reviewsCount ?? 0,
      };
    });

    return NextResponse.json(cottagesWithStats);
  } catch (error) {
    console.error('Error fetching cottages:', error);
    return NextResponse.json({ error: 'Failed to fetch cottages' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const data = cottageSchema.parse(body);
    const { ratingScore, comfortStars, heroImage, ...cottageData } = data;

    const cottage = await prisma.cottage.create({
      data: cottageData,
    });

    if (
      ratingScore !== undefined ||
      comfortStars !== undefined ||
      heroImage !== undefined
    ) {
      await prisma.siteContent.upsert({
        where: { key: `cottage_presentation:${cottage.id}` },
        update: {
          value: {
            ratingScore,
            comfortStars,
            heroImage,
          },
        },
        create: {
          key: `cottage_presentation:${cottage.id}`,
          value: {
            ratingScore,
            comfortStars,
            heroImage,
          },
        },
      });
    }

    return NextResponse.json(cottage, { status: 201 });
  } catch (error) {
    console.error('Error creating cottage:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create cottage' }, { status: 500 });
  }
}
