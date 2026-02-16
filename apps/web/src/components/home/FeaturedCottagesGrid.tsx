'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Users } from 'lucide-react';

export type FeaturedCottage = {
  id: number;
  slug: string;
  name: string;
  summary?: string;
  description?: string;
  facts?: { capacite_max?: number; capacity?: number };
  images: { hero: string; gallery?: string[] };
  badges?: string[];
};

interface FeaturedCottagesGridProps {
  cottages: FeaturedCottage[];
  pricePerNight: number;
}

export function FeaturedCottagesGrid({
  cottages,
  pricePerNight,
}: FeaturedCottagesGridProps) {
  const featured = cottages.slice(0, 4);

  if (featured.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12">
      {featured.map((cottage) => (
        <FeaturedCottageCard
          key={cottage.id}
          cottage={cottage}
          pricePerNight={pricePerNight}
        />
      ))}
    </div>
  );
}

function FeaturedCottageCard({
  cottage,
  pricePerNight,
}: {
  cottage: FeaturedCottage;
  pricePerNight: number;
}) {
  const capacity =
    cottage.facts?.capacite_max ?? cottage.facts?.capacity ?? null;
  const tags = (cottage.badges ?? []).slice(0, 3);
  const description =
    cottage.summary ?? cottage.description ?? '';
  const imageSrc =
    cottage.images?.hero ??
    cottage.images?.gallery?.[0] ??
    'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800';

  return (
    <article
      className="group flex flex-col rounded-2xl border border-border bg-white shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-gc-green focus-within:ring-offset-2"
      aria-labelledby={`cottage-title-${cottage.slug}`}
    >
      <Link
        href={`/cottages/${cottage.slug}`}
        className="flex flex-col flex-1 focus:outline-none focus-visible:ring-0"
      >
        <div className="relative aspect-video overflow-hidden rounded-t-2xl bg-muted">
          <Image
            src={imageSrc}
            alt={cottage.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <span
            className="absolute top-3 right-3 rounded-lg bg-amber-500/95 px-3 py-1.5 text-sm font-semibold text-amber-950 shadow-sm"
            aria-label={`Prix: ${pricePerNight} euros par nuit`}
          >
            {pricePerNight}€/nuit
          </span>
        </div>

        <div className="flex flex-1 flex-col p-5 md:p-6">
          <h3
            id={`cottage-title-${cottage.slug}`}
            className="font-heading text-xl font-bold mb-2"
          >
            {cottage.name}
          </h3>

          {description && (
            <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
              {description}
            </p>
          )}

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full bg-gc-green/15 px-3 py-0.5 text-xs font-medium text-gc-green"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="mt-auto flex items-center justify-between gap-4 pt-2">
            {capacity != null ? (
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Users
                  className="h-4 w-4 shrink-0 text-muted-foreground"
                  aria-hidden
                />
                Jusqu&apos;à {capacity} personnes
              </span>
            ) : (
              <span aria-hidden />
            )}
            <span className="ml-auto shrink-0 inline-flex h-9 items-center justify-center rounded-lg border border-amber-500/50 bg-amber-50 px-4 text-sm font-medium text-amber-800 ring-offset-background transition-colors hover:bg-amber-100 hover:text-amber-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2">
              Voir
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
