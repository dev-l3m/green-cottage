import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { siteImages } from '@/lib/assets/images';
import aboutData from '@/content/about.json';

type AboutData = typeof aboutData;

export const metadata = {
  title: 'Qui sommes-nous ? | Green Cottage',
  description: aboutData.hero.description,
};

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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {about.values.items.map((item, i) => (
                <Card
                  key={i}
                  className="rounded-2xl shadow-sm border bg-card overflow-hidden"
                >
                  <CardContent className="p-6">
                    <h3 className="font-heading text-lg font-semibold mb-3">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
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
