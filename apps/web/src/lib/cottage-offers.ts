type CottageImageInput = {
  slug: string;
  images: string[];
};

export type CottageOfferMeta = {
  score: number;
  comfortStars: 1 | 2 | 3 | 4 | 5;
};

const DEFAULT_OFFER_META: CottageOfferMeta = {
  score: 8.5,
  comfortStars: 4,
};

const OFFER_META_BY_SLUG: Record<string, CottageOfferMeta> = {
  'petit-pierre': { score: 8.8, comfortStars: 5 },
  bruyere: { score: 8.6, comfortStars: 4 },
  puma: { score: 8.7, comfortStars: 4 },
  telegaphe: { score: 8.4, comfortStars: 4 },
};

const HERO_IMAGE_BY_SLUG: Record<string, string> = {
  puma:
    'https://green-cottage.moryjinabovictorbrillant.com/assets/img/uploads/gites/gite-puma4-69736b66e4cb7.jpg',
  bruyere:
    'https://green-cottage.moryjinabovictorbrillant.com/assets/img/uploads/gites/gite3-69736e929e87b.jpg',
  'petit-pierre':
    'https://green-cottage.moryjinabovictorbrillant.com/assets/img/banner/banner-bg-4%201.png',
  telegaphe:
    'https://green-cottage.moryjinabovictorbrillant.com/assets/img/uploads/gites/1-69736c39efab2.png',
};

export function resolveCottageOfferMeta(
  slug: string,
  ratingScore?: number | null,
  comfortStars?: number | null
): CottageOfferMeta {
  const fallback = OFFER_META_BY_SLUG[slug] ?? DEFAULT_OFFER_META;
  const normalizedScore =
    typeof ratingScore === 'number' && Number.isFinite(ratingScore)
      ? Math.min(10, Math.max(0, ratingScore))
      : fallback.score;
  const normalizedStars =
    typeof comfortStars === 'number' && Number.isFinite(comfortStars)
      ? (Math.min(5, Math.max(1, Math.round(comfortStars))) as CottageOfferMeta['comfortStars'])
      : fallback.comfortStars;

  return {
    score: normalizedScore,
    comfortStars: normalizedStars,
  };
}

export function resolveCottageHeroImage(
  slug: string,
  images: string[],
  preferredImage?: string | null
): string {
  const fallbackImage =
    'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800';
  if (preferredImage?.trim()) return preferredImage.trim();
  const forcedImage = HERO_IMAGE_BY_SLUG[slug];
  if (forcedImage) return forcedImage;
  return images.find(Boolean) ?? fallbackImage;
}

export function validateCottageImageMapping(cottages: CottageImageInput[]): void {
  const protectedSlugs = Object.keys(HERO_IMAGE_BY_SLUG);
  const resolvedPairs = protectedSlugs
    .map((slug) => {
      const cottage = cottages.find((c) => c.slug === slug);
      return {
        slug,
        image: resolveCottageHeroImage(slug, cottage?.images ?? []),
      };
    })
    .filter((item) => item.image);

  const missing = protectedSlugs.filter(
    (slug) => !resolvedPairs.some((item) => item.slug === slug)
  );
  if (missing.length > 0) {
    console.warn('[cottage-offers] Missing protected image mapping for slugs:', missing);
  }

  const imageToSlugs = new Map<string, string[]>();
  for (const pair of resolvedPairs) {
    const list = imageToSlugs.get(pair.image) ?? [];
    list.push(pair.slug);
    imageToSlugs.set(pair.image, list);
  }
  const duplicates = Array.from(imageToSlugs.entries()).filter(([, slugs]) => slugs.length > 1);
  if (duplicates.length > 0) {
    console.warn(
      '[cottage-offers] Duplicate hero images detected for protected slugs:',
      duplicates.map(([, slugs]) => slugs)
    );
  }
}
