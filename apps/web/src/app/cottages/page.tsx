import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { CottageCard } from '@/components/cottages/CottageCard';
import cottagesData from '@/content/cottages.json';

// Type for cottage from JSON
type CottageFromJSON = {
  id: number;
  slug: string;
  name: string;
  summary: string;
  description: string;
  facts: {
    capacity?: number;
    rooms?: number;
    beds?: number;
    bathrooms?: number;
  };
  amenities: string[];
  images: {
    hero: string;
    gallery: string[];
  };
  sourceUrl: string;
};

export default function CottagesPage() {
  const cottages = cottagesData as CottageFromJSON[];

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container py-8">
          <h1 className="font-heading text-4xl font-bold mb-8">Nos Cottages</h1>

          {cottages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Aucun cottage disponible pour le moment.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Exécutez <code className="bg-muted px-2 py-1 rounded">pnpm content:scrape</code> pour
                charger les données.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cottages.map((cottage, index) => (
                <CottageCard
                  key={cottage.id}
                  id={cottage.id.toString()}
                  slug={cottage.slug}
                  title={cottage.name}
                  summary={cottage.summary}
                  price={100}
                  image={cottage.images.hero}
                  imageIndex={index}
                  capacity={cottage.facts.capacity}
                />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
