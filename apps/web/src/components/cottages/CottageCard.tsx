import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { siteImages } from '@/lib/assets/images';

interface CottageCardProps {
  id: string;
  slug: string;
  title: string;
  summary?: string;
  price: number;
  image?: string;
  imageIndex?: number;
  capacity?: number;
}

export function CottageCard({
  id,
  slug,
  title,
  summary,
  price,
  image,
  imageIndex = 0,
  capacity,
}: CottageCardProps) {
  // Use provided image or fallback to siteImages
  const imageSrc =
    image || siteImages.cottages.listingCards[imageIndex % siteImages.cottages.listingCards.length];

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group">
      <Link href={`/cottages/${slug}`}>
        <div className="relative aspect-[3/2] overflow-hidden bg-muted">
          <Image
            src={imageSrc}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        <CardContent className="p-4">
          <h3 className="font-heading font-semibold text-lg mb-2 line-clamp-1">
            {title}
          </h3>
          {summary && (
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {summary}
            </p>
          )}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-primary">
                {price.toFixed(0)}€<span className="text-sm font-normal">/nuit</span>
              </p>
              {capacity && (
                <p className="text-xs text-muted-foreground">
                  Jusqu&apos;à {capacity} personnes
                </p>
              )}
            </div>
            <Button variant="outline" size="sm">
              Voir
            </Button>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
