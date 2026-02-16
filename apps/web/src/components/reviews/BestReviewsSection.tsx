import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StarRating } from '@/components/reviews/StarRating';
import type { ReviewWithSlug } from '@/lib/reviews';

interface BestReviewsSectionProps {
  reviews: ReviewWithSlug[];
  slugToName: Record<string, string>;
  id?: string;
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

export function BestReviewsSection({
  reviews,
  slugToName,
  id,
}: BestReviewsSectionProps) {
  if (reviews.length === 0) return null;

  return (
    <section id={id} className="py-16 bg-[#f9f9f7]" aria-labelledby="best-reviews-heading">
      <div className="container">
        <header className="text-center mb-12">
          <h2
            id="best-reviews-heading"
            className="font-heading text-3xl md:text-4xl font-bold text-gc-forest leading-tight mb-6 max-w-3xl mx-auto"
          >
            L&apos;expérience Green Cottage
            <br />
            racontée par nos clients
          </h2>
          <div className="w-full h-1 bg-gc-green/40 my-6" />
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
            Découvrez les avis authentiques de nos clients qui ont vécu l&apos;expérience Green Cottage
          </p>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review) => (
            <Card
              key={review.id}
              className="rounded-2xl shadow-sm border bg-card overflow-hidden h-full flex flex-col"
            >
              <CardContent className="p-6 flex flex-col flex-1">
                <StarRating
                  rating={review.rating}
                  ariaLabel={`${review.rating} sur 5`}
                  className="mb-3"
                />
                <p className="text-muted-foreground mb-4 flex-1 line-clamp-4">
                  &quot;{review.comment.fr}&quot;
                </p>
                <div className="mt-auto pt-4 border-t">
                  <p className="text-sm font-semibold">— {review.author}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatDate(review.createdAt)}
                  </p>
                  <Link
                    href={`/cottages/${review.slug}`}
                    className="text-sm font-medium text-primary hover:underline mt-2 inline-block"
                  >
                    {slugToName[review.slug] ?? review.slug}
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link href="/reviews">
            <Button variant="outline">Lire tous les avis</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
