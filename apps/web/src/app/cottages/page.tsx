import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { CottageCard } from '@/components/cottages/CottageCard';
import { getCottagesForListing } from '@/lib/cottages';

export const revalidate = 60;

export default function CottagesPage() {
  const cottages = getCottagesForListing();

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
                Ajoutez des cottages dans <code className="bg-muted px-2 py-1 rounded">src/content/cottages.json</code>.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cottages.map((cottage, index) => (
                <CottageCard
                  key={cottage.id}
                  id={cottage.id}
                  slug={cottage.slug}
                  title={cottage.title}
                  summary={cottage.summary ?? undefined}
                  price={cottage.basePrice}
                  image={cottage.image}
                  imageIndex={index}
                  capacity={cottage.capacity}
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
