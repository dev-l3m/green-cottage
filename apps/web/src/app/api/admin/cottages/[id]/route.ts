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

const cottageUpdateSchema = z.object({
  slug: z.string().min(1).optional(),
  title: z.string().min(1).optional(),
  summary: z.string().optional(),
  description: z.string().min(1).optional(),
  address: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  capacity: z.number().int().min(1).optional(),
  basePrice: z.number().min(0).optional(),
  cleaningFee: z.number().min(0).optional(),
  images: z.array(z.string()).optional(),
  amenities: z.array(z.string()).optional(),
  rules: z.string().optional(),
  checkInTime: z.string().optional(),
  checkOutTime: z.string().optional(),
  isActive: z.boolean().optional(),
  ratingScore: z.number().min(0).max(10).optional(),
  comfortStars: z.number().int().min(1).max(5).optional(),
  heroImage: imageUrlSchema.optional(),
  promotionEnabled: z.boolean().optional(),
  promotionTitle: z.string().max(120).optional(),
  promotionPercent: z.number().min(0).max(100).optional(),
  promotionStartDate: z.string().optional(),
  promotionEndDate: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const cottage = await prisma.cottage.findUnique({
      where: { id: params.id },
    });

    if (!cottage) {
      return NextResponse.json({ error: 'Cottage not found' }, { status: 404 });
    }

    const presentation = await prisma.siteContent.findUnique({
      where: { key: `cottage_presentation:${params.id}` },
      select: { value: true },
    });
    const presentationValue = (presentation?.value ?? {}) as {
      ratingScore?: number;
      comfortStars?: number;
      heroImage?: string;
    };

    return NextResponse.json({
      ...cottage,
      ratingScore: presentationValue.ratingScore ?? null,
      comfortStars: presentationValue.comfortStars ?? null,
      heroImage: presentationValue.heroImage ?? null,
    });
  } catch (error) {
    console.error('Error fetching cottage:', error);
    return NextResponse.json({ error: 'Failed to fetch cottage' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const data = cottageUpdateSchema.parse(body);
    const {
      ratingScore,
      comfortStars,
      heroImage,
      promotionEnabled,
      promotionTitle,
      promotionPercent,
      promotionStartDate,
      promotionEndDate,
      ...cottageData
    } = data;

    const cottage = await prisma.cottage.update({
      where: { id: params.id },
      data: cottageData,
    });

    if (
      ratingScore !== undefined ||
      comfortStars !== undefined ||
      heroImage !== undefined
    ) {
      const existing = await prisma.siteContent.findUnique({
        where: { key: `cottage_presentation:${params.id}` },
        select: { value: true },
      });
      const previous = (existing?.value ?? {}) as {
        ratingScore?: number;
        comfortStars?: number;
        heroImage?: string;
      };

      await prisma.siteContent.upsert({
        where: { key: `cottage_presentation:${params.id}` },
        update: {
          value: {
            ratingScore: ratingScore ?? previous.ratingScore ?? null,
            comfortStars: comfortStars ?? previous.comfortStars ?? null,
            heroImage: heroImage ?? previous.heroImage ?? null,
          },
        },
        create: {
          key: `cottage_presentation:${params.id}`,
          value: {
            ratingScore: ratingScore ?? null,
            comfortStars: comfortStars ?? null,
            heroImage: heroImage ?? null,
          },
        },
      });
    }

    if (
      promotionEnabled !== undefined ||
      promotionTitle !== undefined ||
      promotionPercent !== undefined ||
      promotionStartDate !== undefined ||
      promotionEndDate !== undefined
    ) {
      const existingPromotion = await prisma.siteContent.findUnique({
        where: { key: `cottage_promotion:${params.id}` },
        select: { value: true },
      });
      const previous = (existingPromotion?.value ?? {}) as {
        enabled?: boolean;
        title?: string | null;
        percent?: number | null;
        startDate?: string | null;
        endDate?: string | null;
      };

      await prisma.siteContent.upsert({
        where: { key: `cottage_promotion:${params.id}` },
        update: {
          value: {
            enabled: promotionEnabled ?? previous.enabled ?? false,
            title: promotionTitle ?? previous.title ?? null,
            percent: promotionPercent ?? previous.percent ?? null,
            startDate: promotionStartDate ?? previous.startDate ?? null,
            endDate: promotionEndDate ?? previous.endDate ?? null,
          },
        },
        create: {
          key: `cottage_promotion:${params.id}`,
          value: {
            enabled: promotionEnabled ?? false,
            title: promotionTitle ?? null,
            percent: promotionPercent ?? null,
            startDate: promotionStartDate ?? null,
            endDate: promotionEndDate ?? null,
          },
        },
      });
    }

    return NextResponse.json(cottage);
  } catch (error) {
    console.error('Error updating cottage:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update cottage' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    await prisma.cottage.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting cottage:', error);
    return NextResponse.json({ error: 'Failed to delete cottage' }, { status: 500 });
  }
}
