import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
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
        <section className="py-20 bg-[#F3F5EE]">
          <div className="container max-w-3xl">
            <h2 className="font-heading text-3xl font-bold mb-8 text-center">
            Questions fréquentes sur <br /> la location de nos gîtes
            </h2>
            <div className="space-y-4">
              {[
                {
                  q: 'Comment réserver un gîte chez Green Cottage ?',
                  a: 'La réservation est simple et rapide. Sélectionnez vos dates de séjour, choisissez le cottage qui correspond à vos besoins, et procédez au paiement sécurisé en ligne. Vous recevrez une confirmation immédiate par email avec tous les détails de votre réservation.',
                },
                {
                  q: 'Quelles sont les heures d\'arrivée et de départ ?',
                  a: 'Les heures d\'arrivée et de départ sont indiquées sur chaque fiche descriptive de cottage. Généralement, l\'arrivée se fait à partir de 15h et le départ avant 11h. Des horaires flexibles peuvent être arrangés sur demande selon les disponibilités.',
                },
                {
                  q: 'Quelle est la politique d\'annulation ?',
                  a: 'Les conditions d\'annulation varient selon le cottage et la période de réservation. Nous proposons généralement une annulation gratuite jusqu\'à 14 jours avant l\'arrivée, avec des conditions flexibles pour garantir votre tranquillité d\'esprit.',
                },
                {
                  q: 'Les gîtes sont-ils adaptés aux familles avec enfants ?',
                  a: 'Oui, nos gîtes sont conçus pour accueillir les familles. La plupart disposent de plusieurs chambres, d\'équipements bébé sur demande (lits parapluie, chaises hautes) et d\'espaces extérieurs sécurisés pour les enfants.',
                },
                {
                  q: 'Les animaux de compagnie sont-ils acceptés ?',
                  a: 'Certains de nos gîtes acceptent les animaux de compagnie. Les conditions (nombre, taille) sont précisées sur chaque fiche cottage. Merci de nous contacter ou de consulter les détails avant de réserver.',
                },
              ].map((faq, i) => (
                <details
                  key={i}
                  className="group rounded-lg bg-white shadow-sm border border-border overflow-hidden"
                >
                  <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer list-none font-heading font-semibold text-foreground hover:bg-muted/50 transition-colors [&::-webkit-details-marker]:hidden">
                    <span>{faq.q}</span>
                    <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
                  </summary>
                  <div className="px-5 pb-5 pt-0">
                    <p className="text-muted-foreground">{faq.a}</p>
                  </div>
                </details>
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

            {/* Overlay vert olive foncé - template full cover */}
            <div
              className="absolute inset-0 bg-[#2e4a3b]/80"
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
