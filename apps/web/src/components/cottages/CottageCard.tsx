import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Users } from 'lucide-react';
import { resolveCottageHeroImage, resolveCottageOfferMeta } from '@/lib/cottage-offers';

interface CottageCardProps {
  slug: string;
  title: string;
  image?: string | null;
  capacity?: number;
  ratingScore?: number | null;
  comfortStars?: number | null;
}

export function CottageCard({
  slug,
  title,
  image,
  capacity,
  ratingScore,
  comfortStars,
}: CottageCardProps) {
  const imageSrc = resolveCottageHeroImage(slug, image ? [image] : [], image);
  const offerMeta = resolveCottageOfferMeta(slug, ratingScore, comfortStars);

  return (
    <Card className="overflow-hidden border border-border shadow-sm hover:shadow-md transition-all duration-300 group">
      <Link href={`/cottages/${slug}`}>
        <div className="relative h-44 overflow-hidden bg-muted">
          <Image
            src={imageSrc}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <span
            className="absolute top-3 left-3 rounded-md bg-gc-green px-2.5 py-1 text-xs font-semibold text-white shadow-sm"
            aria-label={`Note ${offerMeta.score.toFixed(1)} sur 10`}
          >
            {offerMeta.score.toFixed(1)}/10
          </span>
        </div>
        <CardContent className="p-4 flex flex-col min-h-[164px]">
          <h3 className="font-heading font-semibold text-lg">
            {title}
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

          <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
            <Users className="h-4 w-4 shrink-0" aria-hidden />
            {capacity ? `Jusqu'à ${capacity} voyageurs` : 'Capacité à confirmer'}
          </p>

          <div className="mt-auto pt-4">
            <span className="inline-flex items-center justify-center rounded-md bg-gc-green px-3 py-2 text-sm font-semibold text-white transition-colors group-hover:bg-gc-green/90">
              Découvrir
            </span>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
