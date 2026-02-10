import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { siteImages } from '@/lib/assets/images';
import { Calendar, Check, CreditCard, Info, Shield, Sparkles } from 'lucide-react';

export const metadata = {
  title: 'Tarifs | L3M Green Cottage',
  description:
    'Découvrez nos tarifs par nuit, saison et gîte. Taxe de séjour et options incluses. Réservation transparente à Sonnay, Isère.',
};

// Données statiques en attendant la maquette (style Airbnb)
const SEASONS = [
  {
    id: 'low',
    name: 'Basse saison',
    period: 'Novembre à mars',
    pricePerNight: 95,
    description: 'Idéal pour un séjour au calme en pleine nature.',
  },
  {
    id: 'mid',
    name: 'Moyenne saison',
    period: 'Avril à juin, septembre à octobre',
    pricePerNight: 115,
    description: 'Printemps et automne : douceur et couleurs.',
  },
  {
    id: 'high',
    name: 'Haute saison',
    period: 'Juillet et août',
    pricePerNight: 135,
    description: 'Été en Isère : activités et soleil.',
  },
];

const INCLUDED = [
  'Taxe de séjour incluse dans le prix affiché',
  'Ménage de fin de séjour (option ménage intermédiaire en supplément)',
  'Draps et linge de maison fournis',
  'Chauffage inclus',
  'Connexion Wi‑Fi',
  'Parking sur place',
];

// Jours avant arrivée pour annulation gratuite (remboursement intégral)
const CANCELLATION_FREE_DAYS = 30;

const CANCELLATION_SUMMARY = [
  { before: `${CANCELLATION_FREE_DAYS} jours avant`, refund: 'Remboursement intégral' },
  { before: '14 à 30 jours', refund: '50 % du montant' },
  { before: 'Moins de 14 jours', refund: 'Aucun remboursement' },
];

// Les 4 points demandés : réservation directe, tarifs, paiement, annulation
const HIGHLIGHTS = [
  {
    title: 'Réservez directement et profitez du meilleur prix garanti.',
    icon: Sparkles,
  },
  {
    title: 'Tarifs : affichés selon la saison et la durée.',
    icon: Calendar,
  },
  {
    title: 'Réservation : simple, rapide et sécurisée via carte bancaire, PayPal ou virement.',
    icon: CreditCard,
  },
  {
    title: `Annulation : gratuite jusqu'à ${CANCELLATION_FREE_DAYS} jours avant l'arrivée.`,
    icon: Shield,
  },
];

export default function TarifsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative h-[320px] md:h-[400px] overflow-hidden" aria-labelledby="tarifs-heading">
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
          <div className="relative z-10 h-full flex flex-col justify-end container pb-10">
            <h1 id="tarifs-heading" className="font-heading text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
              Tarifs
            </h1>
            <p className="text-lg md:text-xl text-white/95 mt-2 drop-shadow">
              Des prix transparents pour votre séjour en gîte
            </p>
          </div>
        </section>

        {/* Les 4 points : réserver direct, tarifs, paiement, annulation */}
        <section
          className="border-b border-border bg-card py-8 md:py-10"
          aria-labelledby="highlights-heading"
        >
          <div className="container">
            <h2 id="highlights-heading" className="sr-only">
              Avantages de la réservation
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 list-none p-0 m-0">
              {HIGHLIGHTS.map((item, i) => {
                const Icon = item.icon;
                return (
                  <li key={i} className="flex gap-4 items-start">
                    <span className="flex-shrink-0 rounded-full bg-gc-green/15 p-2 text-gc-green" aria-hidden>
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="text-sm font-medium text-foreground pt-0.5">{item.title}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        {/* Intro */}
        <section className="container py-10 md:py-14">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-lg text-muted-foreground">
              Nos tarifs sont indiqués <strong className="text-foreground">par nuit</strong> et varient selon la
              saison et le gîte. Le montant total (taxe de séjour incluse) s&apos;affiche avant paiement.
            </p>
          </div>
        </section>

        {/* Tarifs par saison — style Airbnb cards */}
        <section className="container py-8 md:py-12" aria-labelledby="tarifs-saison-heading">
          <h2 id="tarifs-saison-heading" className="font-heading text-2xl md:text-3xl font-bold mb-8 text-center">
            Tarifs par saison
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SEASONS.map((season) => (
              <Card
                key={season.id}
                className="overflow-hidden border-gc-forest/20 hover:border-primary/40 transition-colors hover:shadow-md"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 text-gc-green">
                    <Calendar className="h-5 w-5" aria-hidden />
                    <span className="text-sm font-medium uppercase tracking-wide">{season.period}</span>
                  </div>
                  <CardTitle className="text-xl font-heading font-semibold mt-2">{season.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-3xl font-bold text-foreground">
                    {season.pricePerNight}&nbsp;€
                    <span className="text-base font-normal text-muted-foreground"> / nuit</span>
                  </p>
                  <p className="text-sm text-muted-foreground">{season.description}</p>
                  <Link href="/cottages">
                    <Button variant="outline" className="w-full rounded-lg">
                      Voir les gîtes
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground mt-6">
            Tarifs indicatifs pour un gîte type. Consultez chaque cottage pour le prix exact de vos dates.
          </p>
        </section>

        {/* Ce qui est inclus */}
        <section className="py-12 md:py-16 bg-muted/50" aria-labelledby="inclus-heading">
          <div className="container">
            <h2 id="inclus-heading" className="font-heading text-2xl md:text-3xl font-bold mb-8 text-center">
              Ce qui est inclus
            </h2>
            <div className="max-w-2xl mx-auto">
              <ul className="space-y-4 list-none p-0 m-0">
                {INCLUDED.map((item, i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <span className="flex-shrink-0 mt-0.5 text-gc-green" aria-hidden>
                      <Check className="h-5 w-5" />
                    </span>
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Comment ça marche — transparence style Airbnb */}
        <section className="container py-12 md:py-16" aria-labelledby="comment-heading">
          <h2 id="comment-heading" className="font-heading text-2xl md:text-3xl font-bold mb-8 text-center">
            Comment fonctionne le prix ?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="border-gc-forest/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Sparkles className="h-5 w-5 text-gc-green" />
                  Prix affiché = prix payé
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Le montant total (nuitées + taxe de séjour + options éventuelles) s&apos;affiche clairement
                  avant validation. Pas de frais cachés.
                </p>
              </CardContent>
            </Card>
            <Card className="border-gc-forest/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Info className="h-5 w-5 text-gc-green" />
                  Annulation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground font-medium mb-3">
                  Annulation gratuite jusqu&apos;à {CANCELLATION_FREE_DAYS} jours avant l&apos;arrivée.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground list-none p-0 m-0">
                  {CANCELLATION_SUMMARY.map((item, i) => (
                    <li key={i} className="flex justify-between gap-4">
                      <span>{item.before}</span>
                      <span className="font-medium text-foreground">{item.refund}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-muted-foreground mt-4">
                  Détails complets dans les conditions de chaque réservation.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 md:py-16 bg-muted/50">
          <div className="container text-center">
            <h2 className="font-heading text-2xl font-bold mb-4">Prêt à réserver ?</h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Choisissez votre gîte et vos dates pour voir le prix exact en temps réel.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/cottages">
                <Button size="lg" className="rounded-lg">
                  Explorer les gîtes
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="rounded-lg">
                  Nous contacter
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
