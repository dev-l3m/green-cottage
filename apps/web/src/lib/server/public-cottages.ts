import { prisma } from '@/lib/prisma';
import type { PublicCottageDto } from '@/lib/cottages-shared';

export type PublicCottagesFilters = {
  isActive?: boolean;
  capacity?: number;
  minPrice?: number;
  maxPrice?: number;
  amenities?: string[];
};

export async function getPublicCottages(
  filters: PublicCottagesFilters = {}
): Promise<PublicCottageDto[]> {
  const where: {
    isActive?: boolean;
    capacity?: { gte: number };
    basePrice?: { gte?: number; lte?: number };
    amenities?: { hasEvery: string[] };
  } = {};

  if (filters.isActive !== undefined) {
    where.isActive = filters.isActive;
  }
  if (filters.capacity !== undefined) {
    where.capacity = { gte: filters.capacity };
  }
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    where.basePrice = {};
    if (filters.minPrice !== undefined) where.basePrice.gte = filters.minPrice;
    if (filters.maxPrice !== undefined) where.basePrice.lte = filters.maxPrice;
  }
  if (filters.amenities && filters.amenities.length > 0) {
    where.amenities = { hasEvery: filters.amenities };
  }

  const rows = await prisma.cottage.findMany({
    where,
    select: {
      id: true,
      slug: true,
      title: true,
      summary: true,
      description: true,
      basePrice: true,
      capacity: true,
      images: true,
      isActive: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const presentationKeys = rows.map((row) => `cottage_presentation:${row.id}`);
  const presentationRows = presentationKeys.length
    ? await prisma.siteContent.findMany({
        where: { key: { in: presentationKeys } },
        select: { key: true, value: true },
      })
    : [];
  const byKey = new Map(
    presentationRows.map((row) => [
      row.key,
      row.value as { ratingScore?: number; comfortStars?: number; heroImage?: string },
    ])
  );

  return rows.map((row) => {
    const presentation = byKey.get(`cottage_presentation:${row.id}`);
    return {
      ...row,
      ratingScore: presentation?.ratingScore ?? null,
      comfortStars: presentation?.comfortStars ?? null,
      heroImage: presentation?.heroImage ?? null,
    };
  });
}
