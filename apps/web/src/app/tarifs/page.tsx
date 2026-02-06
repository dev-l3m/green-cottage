import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import Image from 'next/image';
import { siteImages } from '@/lib/assets/images';

export default function TarifsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Cover Image */}
        <section className="relative h-[400px] overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src={siteImages.about.cover}
              alt="Tarifs"
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
                Tarifs
              </h1>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="container py-12">
          <div className="max-w-3xl space-y-6">
            <p className="text-lg text-muted-foreground">
              Découvrez nos tarifs pour une expérience inoubliable dans nos gîtes.
            </p>
            <p>
              Les tarifs varient selon la saison, la durée du séjour et le gîte choisi. Contactez-nous
              pour obtenir un devis personnalisé.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
