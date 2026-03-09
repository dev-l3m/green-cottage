import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { EcoHeroesHub } from '@/components/eco-heroes/EcoHeroesHub';
import Image from 'next/image';
import { siteImages } from '@/lib/assets/images';

export const metadata = {
  title: 'Les Eco-Heros | L3M Green Cottage',
  description:
    'Decouvrez la Ligue des Eco-Heros et relevez le quiz de la Sentinelle Ecofire pour sensibiliser toute la famille a la protection de la nature.',
};

export default function EcoHerosPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="relative h-[300px] md:h-[380px] overflow-hidden" aria-labelledby="eco-heading">
          <div className="absolute inset-0">
            <Image src={siteImages.about.cover} alt="" fill priority className="object-cover" sizes="100vw" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/65" />
          </div>
          <div className="relative z-10 h-full flex flex-col justify-end container pb-10">
            <h1 id="eco-heading" className="font-heading text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
              La Ligue des Eco-Heros
            </h1>
            <p className="text-white/95 mt-3 max-w-2xl">
              Notre element differentiant: une experience ludique et pedagogique pour sensibiliser petits et
              grands aux gestes qui protegent la nature.
            </p>
          </div>
        </section>

        <section className="container py-10 md:py-14 space-y-6">
          <div className="max-w-3xl text-muted-foreground leading-relaxed">
            <p>
              Chez Green Cottage, nous croyons que les vacances peuvent aussi transmettre des valeurs fortes.
              La Ligue des Eco-Heros est un univers marketing et educatif qui renforce notre difference face
              a la concurrence.
            </p>
            <p>
              Retrouvez les quiz: Aventurier Ecostar, Capitaine Ecoleau, Chercheur Ecobee, Gardien Ecoshare
              et Sentinelle Ecofire.
            </p>
          </div>

          <EcoHeroesHub />
        </section>

        <section className="container pb-14 md:pb-20" aria-labelledby="eco-commandements-heading">
          <div className="rounded-2xl border bg-gradient-to-b from-amber-50/60 to-emerald-50/40 p-5 md:p-8">
            <h2
              id="eco-commandements-heading"
              className="font-heading text-2xl md:text-3xl font-semibold text-center mb-2"
            >
              Les 10 commandements de l&apos;Eco-Heros
            </h2>
            <p className="text-sm text-muted-foreground text-center mb-6">
              Notre manifeste pour sensibiliser les familles de facon ludique, positive et memorable.
            </p>

            <div className="mx-auto max-w-3xl animate-in fade-in-0 slide-in-from-bottom-6 duration-700">
              <div className="relative overflow-hidden rounded-2xl border bg-white/80 p-3 md:p-4 shadow-sm transition-transform duration-500 hover:-translate-y-1">
                <Image
                  src="/images/eco.png"
                  alt="Les 10 commandements de l Eco-Heros Green Cottage"
                  width={922}
                  height={1363}
                  className="h-auto w-full rounded-xl transition-transform duration-500 hover:scale-[1.01]"
                  sizes="(max-width: 768px) 100vw, 900px"
                />
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
