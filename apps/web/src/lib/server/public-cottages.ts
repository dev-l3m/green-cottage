import { prisma } from '@/lib/prisma';

export type PublicCottage = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  description: string;
  basePrice: number;
  capacity: number;
  images: string[];
  isActive: boolean;
};

export type PublicCottagesFilters = {
  isActive?: boolean;
  capacity?: number;
  minPrice?: number;
  maxPrice?: number;
  amenities?: string[];
};

export async function getPublicCottages(
  filters: PublicCottagesFilters = {}
): Promise<PublicCottage[]> {
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

  return rows;
}
