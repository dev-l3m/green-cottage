'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export type FeaturedCottage = {
  id: number;
  slug: string;
  name: string;
  summary: string;
  images: { hero: string; gallery: string[] };
  facts: { capacite_max?: number; capacity?: number };
};

interface FeaturedCottagesCarouselProps {
  cottages: FeaturedCottage[];
  pricePerNight?: number;
}

export function FeaturedCottagesCarousel({
  cottages,
  pricePerNight = 100,
}: FeaturedCottagesCarouselProps) {
  if (!cottages.length) return null;

  const capacity = (c: FeaturedCottage) =>
    c.facts?.capacite_max ?? c.facts?.capacity ?? 4;

  return (
    <div className="w-full overflow-hidden">
      <div className="flex animate-scroll-horizontal gap-6 py-2">
        {/* Duplicate list for infinite loop */}
        {[...cottages, ...cottages].map((cottage, index) => (
          <Link
            key={`${cottage.id}-${index}`}
            href={`/cottages/${cottage.slug}`}
            className="flex-shrink-0 w-[min(320px,85vw)] sm:w-80"
          >
            <Card className="overflow-hidden h-full hover:shadow-xl transition-all duration-300 group">
              <div className="relative aspect-[3/2] overflow-hidden bg-muted">
                <Image
                  src={cottage.images.hero}
                  alt={cottage.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="320px"
                />
              </div>
              <CardContent className="p-4">
                <h3 className="font-heading font-semibold text-lg mb-2 line-clamp-1">
                  {cottage.name}
                </h3>
                {cottage.summary && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {cottage.summary}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-primary">
                      {pricePerNight}€
                      <span className="text-sm font-normal">/nuit</span>
                    </p>
                    {(capacity(cottage)) > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Jusqu&apos;à {capacity(cottage)} personnes
                      </p>
                    )}
                  </div>
                  <Button variant="outline" size="sm">
                    Voir
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
