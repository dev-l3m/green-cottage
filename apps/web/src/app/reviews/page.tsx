import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Suspense } from 'react';
import {
  getAllReviewsWithSlug,
  getSlugsWithReviews,
} from '@/lib/reviews';
import { AllReviewsPageContent } from '@/components/reviews/AllReviewsPageContent';
import cottagesData from '@/content/cottages.json';

type CottageFromJSON = { slug: string; name: string };

export default function ReviewsPage({
  searchParams,
}: {
  searchParams: { gite?: string };
}) {
  const giteSlug = searchParams?.gite;
  const allReviews = getAllReviewsWithSlug();
  const slugsWithReviews = getSlugsWithReviews();
  const allCottages = cottagesData as CottageFromJSON[];
  const slugToName = allCottages.reduce(
    (acc, c) => ({ ...acc, [c.slug]: c.name }),
    {} as Record<string, string>
  );

  const filteredReviews = giteSlug
    ? allReviews.filter((r) => r.slug === giteSlug)
    : allReviews;

  const filterOptions = slugsWithReviews
    .map((slug) => ({ slug, name: slugToName[slug] ?? slug }))
    .filter((o) => o.name);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container py-12">
        <h1 className="font-heading text-4xl font-bold mb-8">Avis clients</h1>
        <Suspense
          fallback={
            <p className="text-muted-foreground">Chargement des avis...</p>
          }
        >
          <AllReviewsPageContent
            reviews={filteredReviews}
            slugToName={slugToName}
            filterOptions={filterOptions}
          />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
