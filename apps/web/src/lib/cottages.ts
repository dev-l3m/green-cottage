import { prisma } from '@/lib/prisma';
import cottagesJson from '@/content/cottages.json';

type CottageJson = {
  slug: string;
  name: string;
  summary: string;
  description: string;
  facts?: { capacite_max?: number };
  images: { hero: string; gallery?: string[] };
  address?: string;
  location?: { lat?: number; lng?: number };
  practicalInfo?: { arrivee?: string; depart?: string };
  amenities?: string[];
};

const cottagesList = cottagesJson as CottageJson[];

function parseTime(text: string | undefined): string {
  if (!text) return '17:00';
  const match = text.match(/(\d{1,2})h(\d{2})/);
  return match ? `${match[1].padStart(2, '0')}:${match[2]}` : '17:00';
}

function cottageFromJsonToDb(json: CottageJson) {
  const images = [json.images.hero, ...(json.images.gallery || [])].filter(Boolean);
  return {
    slug: json.slug,
    title: json.name,
    summary: json.summary ?? '',
    description: json.description ?? '',
    address: json.address ?? null,
    latitude: json.location?.lat ?? null,
    longitude: json.location?.lng ?? null,
    capacity: json.facts?.capacite_max ?? 4,
    basePrice: 100,
    cleaningFee: 30,
    images: images.length ? images : ['https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800'],
    amenities:
      Array.isArray(json.amenities) && json.amenities.length > 0
        ? json.amenities
        : ['WiFi', 'Cuisine équipée', 'Parking', 'Jardin'],
    checkInTime: parseTime(json.practicalInfo?.arrivee),
    checkOutTime: parseTime(json.practicalInfo?.depart),
    isActive: true,
  };
}

/** Listing item for /cottages page (from JSON, no DB). */
export type CottageListItem = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  basePrice: number;
  image: string;
  capacity: number;
  ratingScore?: number | null;
  comfortStars?: number | null;
};

/**
 * Liste des cottages pour la page /cottages.
 * Source: cottages.json uniquement (pas de BDD).
 */
export function getCottagesForListing(): CottageListItem[] {
  return cottagesList.map((c) => ({
    id: c.slug,
    slug: c.slug,
    title: c.name,
    summary: c.summary ?? null,
    basePrice: 100,
    image: c.images.hero || c.images.gallery?.[0] || '',
    capacity: c.facts?.capacite_max ?? 4,
  }));
}

/** Shape returned to the page (DB or JSON fallback). */
export type CottageForPage = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  description: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  capacity: number;
  basePrice: number;
  cleaningFee: number | null;
  images: string[];
  amenities: string[];
  checkInTime: string | null;
  checkOutTime: string | null;
  isActive: boolean;
};

/**
 * Returns cottage by slug.
 * Priority: DB first (for fully dynamic slugs), then JSON fallback.
 */
export async function getCottageBySlug(slug: string): Promise<CottageForPage | null> {
  const fromJson = cottagesList.find((c) => c.slug === slug);

  try {
    // DB is the source of truth for dynamic content/slugs.
    const fromDb = await prisma.cottage.findFirst({
      where: { slug, isActive: true },
    });
    if (fromDb) return fromDb as CottageForPage;

    if (!fromJson) return null;

    const data = cottageFromJsonToDb(fromJson);
    await prisma.cottage.upsert({
      where: { slug },
      update: {},
      create: data,
    });
    const cottage = await prisma.cottage.findUnique({
      where: { slug },
    });

    return cottage as CottageForPage;
  } catch {
    if (!fromJson) return null;
    // DB unreachable (e.g. wrong DATABASE_URL like db.prisma.io) — serve from JSON so page doesn't 500
    const data = cottageFromJsonToDb(fromJson);
    return {
      id: slug,
      slug: data.slug,
      title: data.title,
      summary: data.summary || null,
      description: data.description,
      address: data.address,
      latitude: data.latitude,
      longitude: data.longitude,
      capacity: data.capacity,
      basePrice: data.basePrice,
      cleaningFee: data.cleaningFee,
      images: data.images,
      amenities: data.amenities,
      checkInTime: data.checkInTime,
      checkOutTime: data.checkOutTime,
      isActive: true,
    };
  }
}
