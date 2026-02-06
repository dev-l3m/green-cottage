import reviewsData from '@/content/reviews.json';

export type Review = {
  id: string;
  rating: number;
  comment: { fr: string; en: string };
  author: string;
  tags?: string[];
  createdAt: string;
};

type ReviewsBySlug = Record<string, Review[]>;

const data = reviewsData as ReviewsBySlug;

/**
 * Returns all reviews for a given cottage slug.
 * Works for all slugs; returns [] if slug has no reviews.
 */
export function getReviewsBySlug(slug: string): Review[] {
  const reviews = data[slug];
  return Array.isArray(reviews) ? reviews : [];
}

/**
 * Computes average rating (1 decimal) and count from a list of reviews.
 */
export function computeAverageRating(
  reviews: Review[]
): { avg: number; count: number } {
  const count = reviews.length;
  if (count === 0) return { avg: 0, count: 0 };
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  const avg = Math.round((sum / count) * 10) / 10;
  return { avg, count };
}

export type ReviewWithSlug = Review & { slug: string };

/**
 * Returns all reviews from all gîtes with slug attached (for listing + filter).
 */
export function getAllReviewsWithSlug(): ReviewWithSlug[] {
  const list: ReviewWithSlug[] = [];
  Object.keys(data).forEach((slug) => {
    const reviews = data[slug];
    if (Array.isArray(reviews)) {
      reviews.forEach((r) => list.push({ ...r, slug }));
    }
  });
  return list.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Returns the best-rated reviews (rating desc, then date desc), for homepage.
 */
export function getBestRatedReviews(limit: number = 6): ReviewWithSlug[] {
  const list: ReviewWithSlug[] = [];
  Object.keys(data).forEach((slug) => {
    const reviews = data[slug];
    if (Array.isArray(reviews)) {
      reviews.forEach((r) => list.push({ ...r, slug }));
    }
  });
  return list
    .sort((a, b) => {
      if (b.rating !== a.rating) return b.rating - a.rating;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    })
    .slice(0, limit);
}

/** Slugs that have at least one review (for filter dropdown). */
export function getSlugsWithReviews(): string[] {
  return Object.keys(data).filter(
    (slug) => Array.isArray(data[slug]) && data[slug].length > 0
  );
}
