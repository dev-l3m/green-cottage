'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ReviewSummary } from './ReviewSummary';
import { ReviewList, type DisplayReview } from './ReviewList';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { StarRating } from './StarRating';

const formSchema = z.object({
  rating: z.number().int().min(1).max(5),
  author: z.string().max(120).optional(),
  comment: z.string().min(1, 'Un commentaire est requis').max(800, 'Maximum 800 caractères'),
});

type FormValues = z.infer<typeof formSchema>;

interface ReviewsSectionProps {
  slug: string;
  reviews: DisplayReview[];
  avg: number;
  count: number;
}

export function ReviewsSection({ slug, reviews, avg, count }: ReviewsSectionProps) {
  const router = useRouter();
  const [lang, setLang] = useState<'fr' | 'en'>('fr');
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { rating: 5, author: '', comment: '' },
  });

  const rating = watch('rating');

  const handleLangChange = useCallback((newLang: 'fr' | 'en') => {
    setLang(newLang);
  }, []);

  const onSubmit = useCallback(
    async (data: FormValues) => {
      setSubmitStatus('loading');
      setSubmitError(null);
      try {
        const res = await fetch('/api/reviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            slug,
            rating: data.rating,
            author: data.author || undefined,
            comment: data.comment.trim(),
          }),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          setSubmitError(json.error || 'Erreur lors de l\'envoi');
          setSubmitStatus('error');
          return;
        }
        setSubmitStatus('success');
        reset();
        router.refresh();
      } catch {
        setSubmitError('Erreur réseau');
        setSubmitStatus('error');
      }
    },
    [slug, reset, router]
  );

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

        <div className="mt-8 pt-6 border-t">
          <h3 className="font-heading text-lg font-semibold mb-4">Laisser un avis</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label className="mb-2 block">Note</Label>
              <div className="flex gap-1" role="group" aria-label="Choisir une note de 1 à 5">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setValue('rating', value)}
                    className={`p-1 rounded focus:outline-none focus:ring-2 focus:ring-primary ${
                      rating === value ? 'ring-2 ring-primary' : ''
                    }`}
                    aria-label={`${value} sur 5`}
                    aria-pressed={rating === value}
                  >
                    <StarRating rating={value} ariaLabel="" />
                  </button>
                ))}
              </div>
              <input type="hidden" {...register('rating', { valueAsNumber: true })} />
            </div>
            <div>
              <Label htmlFor="review-author">Nom (optionnel)</Label>
              <Input
                id="review-author"
                {...register('author')}
                placeholder="Votre nom"
                className="mt-1 max-w-xs"
              />
            </div>
            <div>
              <Label htmlFor="review-comment">Commentaire *</Label>
              <Textarea
                id="review-comment"
                {...register('comment')}
                placeholder="Partagez votre expérience..."
                rows={4}
                className="mt-1 max-w-xl"
                maxLength={801}
              />
              {errors.comment && (
                <p className="text-sm text-destructive mt-1">{errors.comment.message}</p>
              )}
            </div>
            {submitStatus === 'success' && (
              <p className="text-sm text-green-600">Merci ! Votre avis a été publié.</p>
            )}
            {submitStatus === 'error' && submitError && (
              <p className="text-sm text-destructive">{submitError}</p>
            )}
            <Button type="submit" disabled={submitStatus === 'loading'}>
              {submitStatus === 'loading' ? 'Envoi...' : 'Publier l\'avis'}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
