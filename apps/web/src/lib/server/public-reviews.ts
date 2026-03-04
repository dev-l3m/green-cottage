import { prisma } from '@/lib/prisma';
import { getPublicCottages } from '@/lib/server/public-cottages';

export type PublicReviewListItem = {
  id: string;
  rating: number;
  author: string;
  comment: string;
  createdAt: string;
};

export type HomeBestReview = {
  id: string;
  rating: number;
  comment: { fr: string; en: string };
  author: string;
  tags?: string[];
  createdAt: string;
  slug: string;
};

export type PublicReviewWithSlug = {
  id: string;
  rating: number;
  comment: { fr: string; en: string };
  author: string;
  tags?: string[];
  createdAt: string;
  slug: string;
};

export async function getPublicReviewsForSlug(
  slug: string
): Promise<PublicReviewListItem[]> {
  const cottage = await prisma.cottage.findUnique({
    where: { slug },
    select: { id: true },
  });
  if (!cottage) return [];

  const reviews = await prisma.publicReview.findMany({
    where: { cottageId: cottage.id, status: 'PUBLISHED' },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      rating: true,
      author: true,
      comment: true,
      createdAt: true,
    },
  });

  return reviews.map((r) => ({
    id: r.id,
    rating: r.rating,
    author: r.author ?? 'Anonyme',
    comment: r.comment,
    createdAt: r.createdAt.toISOString(),
  }));
}

export async function getAllPublicReviewsWithSlug(): Promise<PublicReviewWithSlug[]> {
  const rows = await prisma.publicReview.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      slug: true,
      rating: true,
      author: true,
      comment: true,
      createdAt: true,
    },
  });

  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    rating: r.rating,
    author: r.author ?? 'Anonyme',
    comment: { fr: r.comment, en: r.comment },
    createdAt: r.createdAt.toISOString(),
  }));
}

export async function getBestPublicReviews(
  limit = 6
): Promise<HomeBestReview[]> {
  const all = await getAllPublicReviewsWithSlug();
  return all
    .sort((a, b) => {
      if (b.rating !== a.rating) return b.rating - a.rating;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    })
    .slice(0, limit);
}

export async function getReviewFilterOptions(): Promise<Array<{ slug: string; name: string }>> {
  const [reviews, cottages] = await Promise.all([
    prisma.publicReview.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true },
      distinct: ['slug'],
    }),
    getPublicCottages({ isActive: true }),
  ]);

  const slugToName = new Map(cottages.map((c) => [c.slug, c.title]));
  return reviews.map((r) => ({
    slug: r.slug,
    name: slugToName.get(r.slug) ?? r.slug,
  }));
}
