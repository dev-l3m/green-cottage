'use client';

import { useState, useCallback } from 'react';
import { ReviewSummary } from './ReviewSummary';
import { ReviewList } from './ReviewList';
import type { Review } from '@/lib/reviews';

interface ReviewsSectionProps {
  reviews: Review[];
  avg: number;
  count: number;
}

export function ReviewsSection({ reviews, avg, count }: ReviewsSectionProps) {
  const [lang, setLang] = useState<'fr' | 'en'>('fr');

  const handleLangChange = useCallback((newLang: 'fr' | 'en') => {
    setLang(newLang);
  }, []);

  return (
    <section className="mb-8" aria-labelledby="reviews-heading">
      <h2 id="reviews-heading" className="font-heading text-2xl font-semibold mb-4">
        Avis
      </h2>
      <div className="rounded-2xl border bg-card shadow-sm p-6">
        <ReviewSummary
          avg={avg}
          count={count}
          lang={lang}
          onLangChange={handleLangChange}
        />
        <div className="mt-6 pt-6 border-t">
          <ReviewList reviews={reviews} lang={lang} />
        </div>
      </div>
    </section>
  );
}
