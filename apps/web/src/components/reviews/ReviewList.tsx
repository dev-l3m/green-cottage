import { Card, CardContent } from '@/components/ui/card';
import { StarRating } from './StarRating';

export type DisplayReview = {
  id: string;
  rating: number;
  author: string;
  /** French, or bilingual for JSON reviews */
  comment: string | { fr: string; en?: string };
  createdAt: string;
};

interface ReviewListProps {
  reviews: DisplayReview[];
  lang?: 'fr' | 'en';
}

function formatDate(iso: string, locale: string): string {
  try {
    return new Date(iso).toLocaleDateString(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

export function ReviewList({ reviews, lang = 'fr' }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <p className="text-muted-foreground py-6 text-center rounded-2xl bg-muted/30">
        Aucun avis pour le moment
      </p>
    );
  }

  const locale = lang === 'fr' ? 'fr-FR' : 'en-GB';

  return (
    <ul className="space-y-4 list-none p-0 m-0">
      {reviews.map((review) => (
        <li key={review.id}>
          <Card className="rounded-2xl shadow-sm border bg-card overflow-hidden">
            <CardContent className="p-5">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-3">
                <StarRating
                  rating={review.rating}
                  ariaLabel={`${review.rating} sur 5`}
                />
                <span className="text-sm font-medium text-foreground">
                  {review.author}
                </span>
                <span className="text-sm text-muted-foreground">
                  {formatDate(review.createdAt, locale)}
                </span>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                {typeof review.comment === 'string'
                  ? review.comment
                  : lang === 'fr'
                    ? review.comment.fr
                    : review.comment.en ?? review.comment.fr}
              </p>
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  );
}
