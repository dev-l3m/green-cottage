import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import Image from 'next/image';
import { Hero } from '@/components/home/Hero';
import { FeaturedCottagesGrid } from '@/components/home/FeaturedCottagesGrid';
import { AboutSection } from '@/components/home/AboutSection';
import { BestReviewsSection } from '@/components/reviews/BestReviewsSection';
import { getBestRatedReviews } from '@/lib/reviews';
import cottagesData from '@/content/cottages.json';

type CottageFromJSON = {
  id: number;
  slug: string;
  name: string;
  summary?: string;
  description?: string;
  facts?: { capacite_max?: number; capacity?: number };
  images: { hero: string; gallery?: string[] };
  badges?: string[];
};

export default function HomePage() {
  const cottages = cottagesData as CottageFromJSON[];
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

        {/* Featured Cottages - grille template */}
        <section id="cottages" className="py-16 md:py-20">
          <div className="container">
            <header className="text-center mb-12 md:mb-14">
              <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4 max-w-2xl mx-auto">
                Nos cottages et gîtes de charme
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Chaque hébergement Green Cottage est une invitation au ressourcement. Découvrez des lieux authentiques au cœur de la nature.
              </p>
            </header>
            <FeaturedCottagesGrid cottages={cottages} pricePerNight={100} />
            <div className="text-center mt-10">
              <Link href="/cottages">
                <Button variant="outline" className="focus-visible:ring-2 focus-visible:ring-gc-green focus-visible:ring-offset-2">
                  Voir tous les cottages
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* À propos - template image gauche / contenu droite */}
        <AboutSection />

        {/* Best-rated reviews from JSON */}
        <BestReviewsSection id="reviews" reviews={bestReviews} slugToName={slugToName} />

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

        {/* CTA - full-width image de fond + overlay vert foncé */}
        <section
          className="relative overflow-hidden"
          aria-labelledby="cta-heading"
        >
          {/* Background */}
          <div className="absolute inset-0">
            <Image
              src="/images/cta.webp"
              alt="Paysage nature zen"
              fill
              className="object-cover"
              sizes="100vw"
              priority={false}
            />

            {/* Overlay vert + blur subtil */}
            <div
              className="absolute inset-0 bg-gradient-to-br 
                 from-[#244026]/55 
                 via-[#244026]/40 
                 to-[#244026]/55 
                 backdrop-blur-sm"
              aria-hidden
            />
          </div>

          {/* Content */}
          <div className="relative z-10 py-20 md:py-28 lg:py-32">
            <div className="container text-center">
              <h2
                id="cta-heading"
                className="font-heading 
                   text-3xl sm:text-4xl md:text-5xl lg:text-[3rem] 
                   font-bold text-white leading-tight 
                   mb-6 max-w-3xl mx-auto
                   drop-shadow-[0_6px_18px_rgba(0,0,0,0.35)]"
              >
                Réservez votre séjour
                <br />
                nature d&apos;exception dès
                <br />
                aujourd&apos;hui
              </h2>

              <p
                className="text-white/90 text-lg md:text-xl 
                   max-w-2xl mx-auto mb-10
                   drop-shadow-[0_4px_14px_rgba(0,0,0,0.25)]"
              >
                Explorez notre collection de cottages de charme et gîtes authentiques.
                Trouvez l&apos;hébergement parfait pour vos prochaines vacances nature.
              </p>

              <Link href="/cottages">
                <Button
                  size="lg"
                  className="bg-gc-mustard text-gc-forest 
                     hover:bg-gc-mustard/90
                     focus-visible:ring-2 
                     focus-visible:ring-gc-mustard 
                     focus-visible:ring-offset-2 
                     focus-visible:ring-offset-white/20"
                >
                  Découvrir nos cottages
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
