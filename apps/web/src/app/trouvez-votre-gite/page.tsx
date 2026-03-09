import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import Image from 'next/image';
import { siteImages } from '@/lib/assets/images';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Trouver votre gite a Sonnay | Green Cottage',
  description:
    'Decouvrez nos gites a Sonnay, proches de Vienne en Isere. Comparez les logements, visualisez le plan du domaine et choisissez le gite adapte a votre sejour.',
  keywords: ['gites a Sonnay', 'gites pres de Vienne en Isere', 'location gite Isere'],
};

export default function TrouvezVotreGitePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Cover Image */}
        <section className="relative h-[400px] overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src={siteImages.about.cover}
              alt="Trouvez votre gîte"
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
          </div>
          <div className="relative z-10 h-full flex items-end">
            <div className="container pb-12">
              <h1 className="font-heading text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
                Gites a Sonnay : trouvez votre hebergement ideal
              </h1>
            </div>
          </div>
        </section>

        <section className="container py-12 space-y-12">
          <div className="max-w-4xl space-y-6">
            <p className="text-lg text-muted-foreground leading-relaxed">
              Vous cherchez des <strong>gites a Sonnay</strong> pour un week-end nature ou des
              vacances en famille ? Green Cottage vous accueille dans un cadre calme, a la campagne,
              a proximite des grands axes et des villages de caractere.
            </p>
            <p>
              Situes entre plaine et collines, nos hebergements sont aussi ideaux si vous recherchez
              des <strong>gites pres de Vienne en Isere</strong>, avec un acces rapide aux activites
              locales, aux marches et aux sites culturels.
            </p>
          </div>

          <section aria-labelledby="plan-gites-heading" className="space-y-4">
            <h2 id="plan-gites-heading" className="font-heading text-2xl md:text-3xl font-semibold">
              Plan du domaine a Sonnay
            </h2>
            <p className="text-muted-foreground max-w-3xl">
              Retrouvez sur ce plan la localisation des gites, de la piscine, des jeux exterieurs et
              des espaces communs pour organiser votre sejour en toute serenite.
            </p>
            <div className="overflow-hidden rounded-xl border">
              <Image
                src="/images/plan-gites-sonnay.png"
                alt="Plan des gites Green Cottage a Sonnay"
                width={1600}
                height={900}
                className="h-auto w-full"
                sizes="(max-width: 1024px) 100vw, 1024px"
              />
            </div>
          </section>

          <section aria-labelledby="description-gites-heading" className="space-y-5">
            <h2
              id="description-gites-heading"
              className="font-heading text-2xl md:text-3xl font-semibold"
            >
              Description de nos gites
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <article className="rounded-lg border p-4">
                <h3 className="font-semibold">Gite Le Telegraphe</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Un gite confortable et lumineux, proche des espaces de vie exterieurs et des acces
                  principaux du domaine.
                </p>
              </article>
              <article className="rounded-lg border p-4">
                <h3 className="font-semibold">Gite Bruyeres</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Une ambiance paisible au bord de la nature, parfaite pour se ressourcer en couple ou
                  en famille.
                </p>
              </article>
              <article className="rounded-lg border p-4">
                <h3 className="font-semibold">Gite Puma</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Une solution pratique pour des sejours conviviaux, avec une implantation ideale pour
                  profiter du site.
                </p>
              </article>
              <article className="rounded-lg border p-4">
                <h3 className="font-semibold">Gite Petit-Pierre</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Un hebergement chaleureux, bien situe sur le domaine, adapte aux sejours detente et
                  decouverte.
                </p>
              </article>
            </div>
          </section>

          <div className="pt-2">
            <p className="text-muted-foreground mb-5">
              Comparez les capacities, les equipements et les disponibilites pour choisir le gite qui
              correspond le mieux a votre projet de sejour.
            </p>
            <div>
              <Link href="/cottages">
                <Button size="lg">Voir tous les gîtes</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
