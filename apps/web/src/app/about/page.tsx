import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { siteImages } from '@/lib/assets/images';
import aboutData from '@/content/about.json';
import { InteractiveValueCards } from '@/components/about/InteractiveValueCards';

type AboutData = typeof aboutData;

export const metadata = {
  title: 'Qui sommes-nous ? | Green Cottage',
  description: aboutData.hero.description,
};

const EXPERIENCE_IMAGES = [
  { src: '/images/intercation/IMG_0056.JPG', alt: 'Espace interieur Green Cottage' },
  { src: '/images/intercation/IMG_0057.JPG', alt: 'Ambiance gite Green Cottage' },
  { src: '/images/intercation/IMG_0058.JPG', alt: 'Logement equipe Green Cottage' },
  { src: '/images/intercation/IMG_0062.JPG', alt: 'Vue exterieure Green Cottage' },
  { src: '/images/intercation/IMG_9972.JPG', alt: 'Environnement calme Green Cottage' },
  { src: '/images/intercation/salle-de-jeu-2.jpeg', alt: 'Salle de jeu Green Cottage' },
  { src: '/images/intercation/salle-de-jeu-3.jpeg', alt: 'Salle de jeu familiale Green Cottage' },
];

const LOCATION_IMAGES = [
  { src: '/images/location/IMG_0040.JPG', alt: 'Paysage local autour de Sonnay' },
  { src: '/images/location/IMG_0041.JPG', alt: 'Route d acces vers les gites' },
  { src: '/images/location/IMG_0042.JPG', alt: 'Nature proche des gites' },
  { src: '/images/location/IMG_0045.JPG', alt: 'Points d interet a proximite' },
  { src: '/images/location/IMG_0046.JPG', alt: 'Cadre rural proche de Vienne en Isere' },
  { src: '/images/location/IMG_0047.JPG', alt: 'Vue locale Sonnay et environs' },
  { src: '/images/location/IMG_0049.JPG', alt: 'Balades autour de Green Cottage' },
  { src: '/images/location/IMG_0055.JPG', alt: 'Activites a proximite des gites' },
  { src: '/images/location/IMG_9967.JPG', alt: 'Ambiance campagne en Isere' },
  { src: '/images/location/yoojo-6.JPG', alt: 'Loisirs proches des hebergements' },
];

export default function AboutPage() {
  const about = aboutData as AboutData;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative min-h-[420px] md:min-h-[480px] flex flex-col justify-end overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src={siteImages.about.cover}
              alt=""
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/25 to-black/70" />
          </div>
          <div className="relative z-10 max-w-6xl mx-auto w-full container px-4 pb-12 pt-24">
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white drop-shadow-lg mb-3">
              {about.hero.title}
            </h1>
            <p className="text-xl md:text-2xl text-white/95 font-medium drop-shadow-md mb-4">
              {about.hero.subtitle}
            </p>
            <p className="text-lg text-white/90 max-w-2xl drop-shadow">
              {about.hero.description}
            </p>
          </div>
        </section>

        <div className="max-w-6xl mx-auto w-full container px-4">
          {/* Introduction */}
          <section className="py-12 md:py-16">
            <h2 className="font-heading text-2xl md:text-3xl font-semibold mb-6">
              {about.introduction.title}
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed max-w-3xl">
              {about.introduction.content.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </section>

          {/* Values - 3 cards */}
          <section className="py-12 md:py-16">
            <h2 className="font-heading text-2xl md:text-3xl font-semibold mb-8">
              {about.values.title}
            </h2>
            <InteractiveValueCards
              items={about.values.items}
              frontImages={EXPERIENCE_IMAGES.slice(0, 3).map((image) => image.src)}
            />
          </section>

          {/* Experience */}
          <section className="py-12 md:py-16 bg-muted/30 rounded-2xl px-6 md:px-8 -mx-4 md:mx-0">
            <h2 className="font-heading text-2xl md:text-3xl font-semibold mb-6">
              {about.experience.title}
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed max-w-3xl">
              {about.experience.content.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
            <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {EXPERIENCE_IMAGES.map((image) => (
                <div key={image.src} className="overflow-hidden rounded-xl border bg-white">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    width={640}
                    height={420}
                    className="h-44 w-full object-cover transition-transform duration-300 hover:scale-105"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Location */}
          <section className="py-12 md:py-16">
            <h2 className="font-heading text-2xl md:text-3xl font-semibold mb-6">
              {about.location.title}
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed max-w-3xl">
              {about.location.content.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
            <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {LOCATION_IMAGES.map((image) => (
                <div key={image.src} className="overflow-hidden rounded-xl border bg-white">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    width={520}
                    height={360}
                    className="h-36 w-full object-cover transition-transform duration-300 hover:scale-105"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Commitment */}
          <section className="py-12 md:py-16 bg-muted/30 rounded-2xl px-6 md:px-8 -mx-4 md:mx-0">
            <h2 className="font-heading text-2xl md:text-3xl font-semibold mb-6">
              {about.commitment.title}
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed max-w-3xl">
              {about.commitment.content.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="py-12 md:py-16 text-center">
            <h2 className="font-heading text-2xl md:text-3xl font-semibold mb-4">
              {about.callToAction.title}
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8">
              {about.callToAction.description}
            </p>
            <Link href="/cottages">
              <Button size="lg" className="rounded-xl">
                Découvrir nos gîtes
              </Button>
            </Link>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
