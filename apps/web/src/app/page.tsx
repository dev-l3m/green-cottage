import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Hero } from '@/components/home/Hero';
import { FeaturedCottagesCarousel } from '@/components/home/FeaturedCottagesCarousel';
import { BestReviewsSection } from '@/components/reviews/BestReviewsSection';
import { getBestRatedReviews } from '@/lib/reviews';
import cottagesData from '@/content/cottages.json';

type CottageFromJSON = {
  id: number;
  slug: string;
  name: string;
  summary: string;
  facts: { capacite_max?: number; capacity?: number };
  images: { hero: string; gallery: string[] };
};

export default function HomePage() {
  const cottages = (cottagesData as CottageFromJSON[]).slice(0, 6);
  const bestReviews = getBestRatedReviews(6);
  const allCottages = cottagesData as CottageFromJSON[];
  const slugToName = allCottages.reduce(
    (acc, c) => ({ ...acc, [c.slug]: c.name }),
    {} as Record<string, string>
  );

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <Hero />

        {/* Featured Cottages - horizontal auto-scroll, button stays in place */}
        <section className="py-16">
          <div className="container">
            <h2 className="font-heading text-3xl font-bold mb-8">Cottages en vedette</h2>
            <FeaturedCottagesCarousel cottages={cottages} pricePerNight={100} />
            <div className="text-center mt-8">
              <Link href="/cottages">
                <Button variant="outline">Voir tous les cottages</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Highlights */}
        <section className="py-16 bg-muted/50">
          <div className="container">
            <h2 className="font-heading text-3xl font-bold mb-12 text-center">
              Pourquoi choisir Green Cottage ?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl mb-4">🏡</div>
                <h3 className="font-heading font-semibold text-xl mb-2">Cottages authentiques</h3>
                <p className="text-muted-foreground">
                  Des hébergements soigneusement sélectionnés pour leur charme et leur confort
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">✨</div>
                <h3 className="font-heading font-semibold text-xl mb-2">Service premium</h3>
                <p className="text-muted-foreground">
                  Un accompagnement personnalisé pour rendre votre séjour mémorable
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">🔒</div>
                <h3 className="font-heading font-semibold text-xl mb-2">Réservation sécurisée</h3>
                <p className="text-muted-foreground">
                  Paiement 100% sécurisé avec Stripe, confirmation immédiate
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Best-rated reviews from JSON */}
        <BestReviewsSection reviews={bestReviews} slugToName={slugToName} />

        {/* FAQ */}
        <section className="py-16 bg-muted/50">
          <div className="container max-w-3xl">
            <h2 className="font-heading text-3xl font-bold mb-8 text-center">
              Questions fréquentes
            </h2>
            <div className="space-y-4">
              {[
                {
                  q: 'Comment réserver ?',
                  a: 'Sélectionnez vos dates, choisissez votre cottage et procédez au paiement sécurisé.',
                },
                {
                  q: 'Quand puis-je arriver ?',
                  a: 'Les heures d\'arrivée et de départ sont indiquées sur chaque fiche cottage (généralement 15h/11h).',
                },
                {
                  q: 'Puis-je annuler ma réservation ?',
                  a: 'Les conditions d\'annulation varient selon le cottage. Consultez les détails lors de la réservation.',
                },
              ].map((faq, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <h3 className="font-heading font-semibold text-lg mb-2">{faq.q}</h3>
                    <p className="text-muted-foreground">{faq.a}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16">
          <div className="container text-center">
            <h2 className="font-heading text-3xl font-bold mb-4">
              Prêt à réserver votre séjour ?
            </h2>
            <p className="text-muted-foreground mb-8">
              Découvrez notre sélection de cottages et trouvez celui qui vous correspond
            </p>
            <Link href="/cottages">
              <Button size="lg">Explorer les cottages</Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
