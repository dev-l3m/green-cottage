import type { CottageListItem } from '@/lib/cottages';
import {
  resolveCottageHeroImage,
  validateCottageImageMapping,
} from '@/lib/cottage-offers';

export type PublicCottageDto = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  description: string;
  basePrice: number;
  capacity: number;
  images: string[];
  isActive: boolean;
};

export type HomeFeaturedCottage = {
  id: string;
  slug: string;
  name: string;
  summary?: string;
  description?: string;
  facts?: { capacite_max?: number; capacity?: number };
  images: { hero: string; gallery?: string[] };
  badges?: string[];
};

export type CottageOption = { slug: string; name: string };

export function mapPublicCottagesToListItems(
  cottages: PublicCottageDto[]
): CottageListItem[] {
  validateCottageImageMapping(
    cottages.map((cottage) => ({
      slug: cottage.slug,
      images: cottage.images ?? [],
    }))
  );

  return cottages.map((cottage) => ({
    id: cottage.id,
    slug: cottage.slug,
    title: cottage.title,
    summary: cottage.summary,
    basePrice: cottage.basePrice,
    image: resolveCottageHeroImage(cottage.slug, cottage.images ?? []),
    capacity: cottage.capacity,
  }));
}

export function mapPublicCottagesToHomeFeatured(
  cottages: PublicCottageDto[]
): HomeFeaturedCottage[] {
  validateCottageImageMapping(
    cottages.map((cottage) => ({
      slug: cottage.slug,
      images: cottage.images ?? [],
    }))
  );

  return cottages.map((cottage) => ({
    id: cottage.id,
    slug: cottage.slug,
    name: cottage.title,
    summary: cottage.summary ?? undefined,
    description: cottage.description ?? undefined,
    facts: { capacite_max: cottage.capacity },
    images: {
      hero: resolveCottageHeroImage(cottage.slug, cottage.images ?? []),
      gallery: cottage.images.slice(1),
    },
    badges: [],
  }));
}

export function mapPublicCottagesToOptions(
  cottages: Array<{ slug: string; title: string }>
): CottageOption[] {
  return cottages
    .filter((c) => Boolean(c.slug) && Boolean(c.title))
    .map((c) => ({ slug: c.slug, name: c.title }));
}
