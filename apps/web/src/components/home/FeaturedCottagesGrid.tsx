'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Star, Users } from 'lucide-react';
import { resolveCottageOfferMeta } from '@/lib/cottage-offers';

export type FeaturedCottage = {
  id: string | number;
  slug: string;
  name: string;
  summary?: string;
  description?: string;
  facts?: { capacite_max?: number; capacity?: number };
  images: { hero: string; gallery?: string[] };
  ratingScore?: number | null;
  comfortStars?: number | null;
  badges?: string[];
};

interface FeaturedCottagesGridProps {
  cottages: FeaturedCottage[];
}

export function FeaturedCottagesGrid({
  cottages,
}: FeaturedCottagesGridProps) {
  const featured = cottages.slice(0, 6);

  if (featured.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
      {featured.map((cottage) => (
        <FeaturedCottageCard
          key={cottage.id}
          cottage={cottage}
        />
      ))}
    </div>
  );
}

function FeaturedCottageCard({
  cottage,
}: {
  cottage: FeaturedCottage;
}) {
  const capacity =
    cottage.facts?.capacite_max ?? cottage.facts?.capacity ?? null;
  const offerMeta = resolveCottageOfferMeta(
    cottage.slug,
    cottage.ratingScore,
    cottage.comfortStars
  );
  const imageSrc =
    cottage.images?.hero ??
    cottage.images?.gallery?.[0] ??
    'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800';

  return (
    <article
      className="group flex flex-col rounded-xl border border-border bg-white shadow-sm hover:shadow-md overflow-hidden focus-within:ring-2 focus-within:ring-gc-green focus-within:ring-offset-2"
      aria-labelledby={`cottage-title-${cottage.slug}`}
    >
      <Link
        href={`/cottages/${cottage.slug}`}
        className="flex flex-col flex-1 focus:outline-none focus-visible:ring-0"
      >
        <div className="relative h-44 overflow-hidden bg-muted">
          <Image
            src={imageSrc}
            alt={cottage.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          />
          <span
            className="absolute top-3 left-3 rounded-md bg-gc-green px-2.5 py-1 text-xs font-semibold text-white shadow-sm"
            aria-label={`Note ${offerMeta.score.toFixed(1)} sur 10`}
          >
            {offerMeta.score.toFixed(1)}/10
          </span>
        </div>

        <div className="flex flex-1 flex-col p-4">
          <h3
            id={`cottage-title-${cottage.slug}`}
            className="font-heading text-lg font-bold"
          >
            {cottage.name}
          </h3>

          <div className="mt-2 flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={index}
                className={
                  index < offerMeta.comfortStars
                    ? 'h-4 w-4 fill-gc-mustard text-gc-mustard'
                    : 'h-4 w-4 text-muted-foreground/30'
                }
                aria-hidden
              />
            ))}
          </div>

          <div className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
            <Users
              className="h-4 w-4 shrink-0 text-muted-foreground"
              aria-hidden
            />
            {capacity != null ? `Jusqu'à ${capacity} voyageurs` : 'Capacité à confirmer'}
          </div>

          <div className="mt-auto pt-4">
            <span className="inline-flex items-center justify-center rounded-md bg-gc-green px-3 py-2 text-sm font-semibold text-white transition-colors group-hover:bg-gc-green/90">
              Découvrir
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
