import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Suspense } from 'react';
import {
  getAllPublicReviewsWithSlug,
  getReviewFilterOptions,
} from '@/lib/server/public-reviews';
import { AllReviewsPageContent } from '@/components/reviews/AllReviewsPageContent';

export const dynamic = 'force-dynamic';

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: { gite?: string };
}) {
  const giteSlug = searchParams?.gite;
  const allReviews = await getAllPublicReviewsWithSlug();
  const filterOptions = await getReviewFilterOptions();
  const slugToName = filterOptions.reduce(
    (acc, c) => ({ ...acc, [c.slug]: c.name }),
    {} as Record<string, string>
  );

  const filteredReviews = giteSlug
    ? allReviews.filter((r) => r.slug === giteSlug)
    : allReviews;

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
