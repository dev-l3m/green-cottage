import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import {
  TreePine,
  Waves,
  Leaf,
  LayoutGrid,
} from 'lucide-react';
import { LocationMap } from '@/components/cottages/LocationMap';
import { siteImages } from '@/lib/assets/images';
import activitiesData from '@/content/activities.json';

type ActivitiesData = typeof activitiesData;

const onSiteIcons = [TreePine, Waves, Leaf, LayoutGrid];

export const metadata = {
  title: 'Activités & Restos | Green Cottage',
  description: activitiesData.hero.description,
};

export default function ActivitiesPage() {
  const data = activitiesData as ActivitiesData;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section
          className="relative min-h-[380px] md:min-h-[440px] flex flex-col justify-end overflow-hidden"
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
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/25 to-black/65" />
          </div>
          <div className="relative z-10 container px-4 pb-12 pt-20">
            <h1
              id="activities-heading"
              className="font-heading text-4xl md:text-5xl font-bold text-white drop-shadow-lg"
            >
              {data.hero.title}
            </h1>
            <p className="text-xl md:text-2xl text-white/95 font-medium mt-2 drop-shadow">
              {data.hero.subtitle}
            </p>
            <p className="text-white/90 mt-4 max-w-2xl">
              {data.hero.description}
            </p>
          </div>
        </section>

        <div className="container px-4 max-w-6xl mx-auto">
          {/* Introduction */}
          <section className="py-12 md:py-16" aria-labelledby="intro-heading">
            <h2 id="intro-heading" className="sr-only">
              Introduction
            </h2>
            <div className="max-w-2xl mx-auto text-center space-y-4 text-muted-foreground leading-relaxed">
              {data.introduction.content.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </section>

          {/* Sur place - 4 cards */}
          <section
            className="py-12 md:py-16"
            aria-labelledby="on-site-heading"
          >
            <h2
              id="on-site-heading"
              className="font-heading text-2xl md:text-3xl font-semibold mb-8 text-center"
            >
              {data.onSite.title}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {data.onSite.items.map((item, i) => {
                const Icon = onSiteIcons[i] ?? Leaf;
                return (
                  <Card
                    key={i}
                    className="rounded-xl border-green-800/20 bg-white shadow-sm overflow-hidden"
                  >
                    <CardContent className="p-6 text-center sm:text-left">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4 mx-auto sm:mx-0">
                        <Icon className="h-5 w-5" aria-hidden />
                      </div>
                      <h3 className="font-heading font-semibold text-lg mb-2 text-foreground">
                        {item.title}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {item.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>

          {/* Aux alentours - categories in columns */}
          <section
            className="py-12 md:py-16 bg-muted/30 rounded-2xl px-6 md:px-8 -mx-4 md:mx-0"
            aria-labelledby="around-heading"
          >
            <h2
              id="around-heading"
              className="font-heading text-2xl md:text-3xl font-semibold mb-2"
            >
              {data.around.title}
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl">
              {data.around.description}
            </p>
          </section>

          {/* Map - même composant que les gîtes */}
          <section
            className="py-12 md:py-16"
            aria-labelledby="map-heading"
          >
            <h2
              id="map-heading"
              className="font-heading text-2xl md:text-3xl font-semibold mb-4"
            >
              {data.map.title}
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl">
              {data.map.description}
            </p>
            <LocationMap />
          </section>

          {/* Call to action */}
          <section
            className="py-12 md:py-16 rounded-2xl px-6 md:px-10 bg-primary/10 border border-primary/20"
            aria-labelledby="cta-heading"
          >
            <h2
              id="cta-heading"
              className="font-heading text-2xl md:text-3xl font-semibold mb-4 text-center"
            >
              {data.callToAction.title}
            </h2>
            <p className="text-muted-foreground text-center max-w-xl mx-auto mb-8">
              {data.callToAction.description}
            </p>
            <div className="flex justify-center">
              <Link href="/cottages">
                <Button size="lg" className="rounded-xl">
                  Découvrir nos gîtes
                </Button>
              </Link>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
