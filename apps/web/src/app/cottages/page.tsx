import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { CottageCard } from '@/components/cottages/CottageCard';
import type { CottageListItem } from '@/lib/cottages';
import { mapPublicCottagesToListItems } from '@/lib/cottages-shared';
import Image from 'next/image';
import { siteImages } from '@/lib/assets/images';
import { Leaf } from 'lucide-react';
import Link from 'next/link';
import { getPublicCottages } from '@/lib/server/public-cottages';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Nos gîtes et studios | L3M Green Cottage',
  description:
    'Découvrez nos hébergements au cœur d\'un environnement préservé : Petit Pierre, Les Bruyères, Le Puma et futurs studios de jardin écologiques.',
};

// Ordre d'affichage, titres et textes d'accroche pour la liste (interface type Airbnb)
const LISTING_ORDER = ['petit-pierre', 'bruyere', 'puma', 'telegaphe'];
const LISTING_TITLES: Record<string, string> = {
  'petit-pierre': 'Petit Pierre',
  bruyere: 'Les Bruyères',
  puma: 'Le Puma',
};

function sortCottages(cottages: CottageListItem[]): CottageListItem[] {
  const bySlug = new Map(cottages.map((c) => [c.slug, c]));
  const ordered: CottageListItem[] = [];
  for (const slug of LISTING_ORDER) {
    const c = bySlug.get(slug);
    if (c) ordered.push(c);
  }
  cottages.forEach((c) => {
    if (!LISTING_ORDER.includes(c.slug)) ordered.push(c);
  });
  return ordered;
}

async function getDynamicCottagesForListing(): Promise<CottageListItem[]> {
  try {
    const cottages = await getPublicCottages({ isActive: true });
    return mapPublicCottagesToListItems(cottages);
  } catch {
    return [];
  }
}

export default async function CottagesPage() {
  const rawCottages = await getDynamicCottagesForListing();
  const cottages = sortCottages(rawCottages);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section
          className="relative h-[280px] md:h-[360px] overflow-hidden"
          aria-labelledby="cottages-heading"
        >
          <div className="absolute inset-0">
            <Image
              src={siteImages.about.cover}
              alt=""
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
          </div>
          <div className="relative z-10 h-full flex flex-col justify-end container pb-8 md:pb-10">
            <h1 id="cottages-heading" className="font-heading text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
              Nos gîtes et futurs studios de jardin écologiques
            </h1>
            <p className="text-lg md:text-xl text-white/95 mt-2 max-w-2xl drop-shadow">
              Découvrez nos hébergements au cœur d&apos;un environnement préservé.
            </p>
          </div>
        </section>

        {/* Liste des hébergements */}
        <section className="container py-10 md:py-14">
          {cottages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Aucun gîte disponible pour le moment.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                {cottages.map((cottage) => (
                  <CottageCard
                    key={cottage.id}
                    slug={cottage.slug}
                    title={LISTING_TITLES[cottage.slug] ?? cottage.title}
                    image={cottage.image}
                    capacity={cottage.capacity}
                    ratingScore={cottage.ratingScore}
                    comfortStars={cottage.comfortStars}
                  />
                ))}
                {/* Studios de jardin écologiques (à venir) */}
                <ComingSoonCard />
              </div>
            </>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}

function ComingSoonCard() {
  return (
    <div className="rounded-lg border border-dashed border-primary/40 bg-muted/30 overflow-hidden flex flex-col">
      <div className="relative aspect-[3/2] overflow-hidden bg-muted flex items-center justify-center">
        <div className="absolute inset-0 flex items-center justify-center">
          <Leaf className="h-16 w-16 text-gc-green/50" aria-hidden />
        </div>
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <span className="text-xs font-medium uppercase tracking-wide text-primary">
          À venir
        </span>
        <h3 className="font-heading font-semibold text-lg mb-2 mt-1">
          Studios de jardin écologiques
        </h3>
        <p className="text-sm text-muted-foreground mb-4 flex-1">
          Hébergements compacts, autonomes et durables.
        </p>
        <Link
          href="/contact"
          className="inline-flex items-center justify-center rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          En savoir plus
        </Link>
      </div>
    </div>
  );
}
