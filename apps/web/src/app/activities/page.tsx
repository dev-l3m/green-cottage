import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { siteImages } from '@/lib/assets/images';
import activitiesList from '@/content/activites-list.json';

const ActivitiesExplorer = dynamic(
  () =>
    import('@/components/activities/ActivitiesExplorer').then(
      (mod) => mod.ActivitiesExplorer
    ),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-3xl border border-border bg-card p-6 text-sm text-muted-foreground">
        Chargement de la carte interactive...
      </div>
    ),
  }
);

export const metadata = {
  title: 'Sorties & restos | Green Cottage',
  description:
    "Découvrez les meilleures sorties, activités et restaurants autour des gîtes Green Cottage, classés par thème et par distance.",
};

export default function ActivitiesPage() {
  const total = activitiesList.length;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="flex-1">
        <section
          className="relative min-h-[360px] md:min-h-[430px] flex items-end overflow-hidden"
          aria-labelledby="activities-heading"
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
            <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/55 to-black/35" />
          </div>

          <div className="relative z-10 container px-4 pb-12 pt-24">
            <div className="max-w-3xl">
              <span className="inline-flex rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium text-white backdrop-blur">
                Autour des gîtes
              </span>

              <h1
                id="activities-heading"
                className="mt-5 font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight"
              >
                Sorties & restos
              </h1>

              <p className="mt-4 text-lg md:text-xl text-white/90 leading-relaxed">
                On a pensé à tout pour vos escapades en amoureux, entre amis ou
                en famille. Explorez notre sélection d’activités et de
                restaurants autour des gîtes, classés par thème et par distance.
              </p>

              <div className="mt-6 flex flex-wrap gap-3 text-sm text-white/90">
                <span className="rounded-full bg-white/10 px-3 py-1.5 backdrop-blur">
                  {total} adresses sélectionnées
                </span>
                <span className="rounded-full bg-white/10 px-3 py-1.5 backdrop-blur">
                  Carte interactive
                </span>
                <span className="rounded-full bg-white/10 px-3 py-1.5 backdrop-blur">
                  Tableau triable
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="container px-4 py-10 md:py-14">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-lg text-muted-foreground leading-8">
              Sélectionnez vos envies sur la carte ou parcourez le tableau
              ci-dessous pour trouver rapidement une sortie nature, un restaurant,
              une activité familiale, un escape game ou une découverte
              culturelle à proximité.
            </p>
          </div>
        </section>

        <section className="container px-4 pb-16 md:pb-20">
          <ActivitiesExplorer items={activitiesList} />
        </section>
      </main>

      <Footer />
    </div>
  );
}