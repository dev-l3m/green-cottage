import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import Image from 'next/image';
import { siteImages } from '@/lib/assets/images';

export default function PreparationAuDepartPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Cover Image */}
        <section className="relative h-[400px] overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src={siteImages.about.cover}
              alt="Préparation au départ"
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
                Préparation au départ
              </h1>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="container py-12">
          <div className="max-w-3xl space-y-6">
            <p className="text-lg text-muted-foreground">
              Tout ce qu&apos;il faut savoir avant votre départ pour un séjour réussi.
            </p>
            <div className="space-y-4">
              <div>
                <h2 className="font-heading text-2xl font-semibold mb-2">Checklist avant départ</h2>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Confirmer votre heure d&apos;arrivée</li>
                  <li>Préparer vos documents d&apos;identité</li>
                  <li>Vérifier les équipements disponibles dans votre gîte</li>
                  <li>Consulter la météo locale</li>
                </ul>
              </div>
              <div>
                <h2 className="font-heading text-2xl font-semibold mb-2">À apporter</h2>
                <p>
                  Le linge de lit et les serviettes sont fournis. Vous pouvez apporter vos produits de
                  toilette personnels.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
