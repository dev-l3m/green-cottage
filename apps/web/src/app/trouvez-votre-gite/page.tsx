import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import Image from 'next/image';
import { siteImages } from '@/lib/assets/images';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

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
                Trouvez votre gîte
              </h1>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="container py-12">
          <div className="max-w-3xl space-y-6">
            <p className="text-lg text-muted-foreground">
              Choisissez le gîte qui correspond le mieux à vos besoins et à vos envies.
            </p>
            <p>
              Nous proposons plusieurs gîtes, chacun avec son propre caractère et ses équipements. Explorez
              nos différentes options pour trouver celui qui vous convient.
            </p>
            <div className="pt-6">
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
