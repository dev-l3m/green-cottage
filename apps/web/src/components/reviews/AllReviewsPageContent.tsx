'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { StarRating } from './StarRating';
import Link from 'next/link';
import type { ReviewWithSlug } from '@/lib/reviews';

interface AllReviewsPageContentProps {
  reviews: ReviewWithSlug[];
  slugToName: Record<string, string>;
  filterOptions: { slug: string; name: string }[];
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

export function AllReviewsPageContent({
  reviews,
  slugToName,
  filterOptions,
}: AllReviewsPageContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentGite = searchParams.get('gite') ?? '';

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === '') {
      router.push('/reviews');
    } else {
      router.push(`/reviews?gite=${encodeURIComponent(value)}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <label htmlFor="gite-filter" className="text-sm font-medium">
          Filtrer par gîte
        </label>
        <select
          id="gite-filter"
          value={currentGite}
          onChange={handleFilterChange}
          className="w-full sm:w-64 rounded-lg border border-input bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          aria-label="Rechercher par gîte"
        >
          <option value="">Tous les gîtes</option>
          {filterOptions.map((opt) => (
            <option key={opt.slug} value={opt.slug}>
              {opt.name}
            </option>
          ))}
        </select>
      </div>

      {reviews.length === 0 ? (
        <p className="text-muted-foreground py-12 text-center rounded-2xl bg-muted/30">
          Aucun avis pour le moment
          {currentGite ? ' pour ce gîte.' : '.'}
        </p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card
              key={review.id}
              className="rounded-2xl shadow-sm border bg-card overflow-hidden"
            >
              <CardContent className="p-6">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div>
                    <Link
                      href={`/cottages/${review.slug}`}
                      className="font-semibold text-lg hover:text-primary hover:underline"
                    >
                      {slugToName[review.slug] ?? review.slug}
                    </Link>
                    <p className="text-sm text-muted-foreground mt-1">
                      {review.author} • {formatDate(review.createdAt)}
                    </p>
                  </div>
                  <StarRating
                    rating={review.rating}
                    ariaLabel={`${review.rating} sur 5`}
                  />
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {review.comment.fr}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
