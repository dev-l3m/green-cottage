'use client';

import { StarRating } from './StarRating';
import { cn } from '@/lib/utils';

interface ReviewSummaryProps {
  avg: number;
  count: number;
  lang: 'fr' | 'en';
  onLangChange: (lang: 'fr' | 'en') => void;
}

export function ReviewSummary({
  avg,
  count,
  lang,
  onLangChange,
}: ReviewSummaryProps) {
  const hasReviews = count > 0;
  const avgLabel = hasReviews ? `${avg % 1 === 0 ? avg : avg.toFixed(1)}/5` : '—';
  const countLabel =
    count === 0
      ? '(0 avis)'
      : count === 1
        ? '(1 avis)'
        : `(${count} avis)`;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex items-center gap-3">
        <StarRating
          rating={hasReviews ? avg : 0}
          showValue
          ariaLabel={
            hasReviews
              ? `Note moyenne : ${avg} sur 5`
              : 'Aucune note'
          }
        />
        <div className="flex flex-col">
          <span className="font-semibold tabular-nums">{avgLabel}</span>
          <span className="text-sm text-muted-foreground">{countLabel}</span>
        </div>
      </div>
      <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/50 w-fit">
        <button
          type="button"
          onClick={() => onLangChange('fr')}
          className={cn(
            'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
            lang === 'fr'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
          aria-pressed={lang === 'fr'}
          aria-label="Afficher les avis en français"
        >
          FR
        </button>
        <button
          type="button"
          onClick={() => onLangChange('en')}
          className={cn(
            'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
            lang === 'en'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
          aria-pressed={lang === 'en'}
          aria-label="Show reviews in English"
        >
          EN
        </button>
      </div>
    </div>
  );
}
