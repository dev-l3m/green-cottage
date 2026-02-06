import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import Image from 'next/image';
import Link from 'next/link';
import { siteImages } from '@/lib/assets/images';
import practicalData from '@/content/practical-access.json';

type PracticalData = typeof practicalData;

export const metadata = {
  title: 'Infos pratiques | Green Cottage',
  description: practicalData.subtitle,
};

export default function InfosPratiquesPage() {
  const data = practicalData as PracticalData;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative h-[320px] md:h-[400px] overflow-hidden" aria-labelledby="infos-heading">
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
            <h1 id="infos-heading" className="font-heading text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
              {data.title}
            </h1>
            <p className="text-lg md:text-xl text-white/95 mt-2 drop-shadow">
              {data.subtitle}
            </p>
          </div>
        </section>

        {/* Cards grid */}
        <section
          className="container py-12 md:py-16"
          aria-labelledby="cottages-heading"
        >
          <h2 id="cottages-heading" className="sr-only">
            Informations par gîte
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {data.cottages.map((cottage) => (
              <article
                key={cottage.id}
                className="bg-white rounded-2xl border border-green-800/30 shadow-sm overflow-hidden p-6 md:p-8 flex flex-col"
              >
                <h3 className="font-heading text-xl md:text-2xl font-semibold text-foreground mb-6">
                  {cottage.name}
                </h3>
                <ul className="space-y-4 flex-1 list-none p-0 m-0">
                  {cottage.items.map((item, i) => (
                    <li key={i} className="flex gap-3">
                      <span
                        className="flex-shrink-0 w-2 h-2 rounded-full bg-green-700 mt-2"
                        aria-hidden
                      />
                      <div>
                        <span className="font-medium text-foreground block">
                          {item.label}
                        </span>
                        <span className="text-muted-foreground text-sm md:text-base">
                          {item.value}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 pt-6 border-t border-border">
                  <Link
                    href={`/cottages/${cottage.slug}`}
                    className="inline-flex items-center justify-center rounded-lg bg-green-900 text-white px-5 py-2.5 text-sm font-medium hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-700 focus:ring-offset-2 transition-colors"
                  >
                    Voir le gîte
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
