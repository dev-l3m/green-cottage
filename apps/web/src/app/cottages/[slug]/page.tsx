import { notFound } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent } from '@/components/ui/card';
import { LocationMap } from '@/components/cottages/LocationMap';
import { BookingCard } from '@/components/cottages/BookingCard';
import { ReviewsSection } from '@/components/reviews/ReviewsSection';
import { getCottageBySlug } from '@/lib/cottages';
import { getReviewsBySlug } from '@/lib/reviews';
import { prisma } from '@/lib/prisma';
import Image from 'next/image';
import { Users, Home } from 'lucide-react';
import type { DisplayReview } from '@/components/reviews/ReviewList';

export const revalidate = 60;

export default async function CottageDetailPage({ params }: { params: { slug: string } }) {
  const cottage = await getCottageBySlug(params.slug);

  if (!cottage) {
    notFound();
  }

  // Avis: source = reviews.json (toujours affichés) + BDD si dispo (PublicReview)
  const jsonReviews: DisplayReview[] = getReviewsBySlug(params.slug).map((r) => ({
    id: r.id,
    rating: r.rating,
    author: r.author,
    comment: r.comment,
    createdAt: r.createdAt,
  }));

  let dbReviews: DisplayReview[] = [];
  try {
    const rows = await prisma.publicReview.findMany({
      where: { slug: params.slug, status: 'PUBLISHED' },
      orderBy: { createdAt: 'desc' },
    });
    dbReviews = rows.map((r) => ({
      id: r.id,
      rating: r.rating,
      author: r.author ?? 'Anonyme',
      comment: r.comment,
      createdAt: r.createdAt.toISOString(),
    }));
  } catch {
    // Table absente ou BDD injoignable : on affiche uniquement le JSON
    dbReviews = [];
  }

  const allReviews: DisplayReview[] = [...jsonReviews, ...dbReviews].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const count = allReviews.length;
  const avg =
    count === 0 ? 0 : Math.round((allReviews.reduce((s, r) => s + r.rating, 0) / count) * 10) / 10;

  const heroImage = cottage.images[0];
  const galleryImages = cottage.images.slice(1, 5);
  const hasGallery = galleryImages.length > 0;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container py-8">
          <div className="mb-6">
            <h1 className="font-heading text-4xl font-bold mb-3">{cottage.title}</h1>
            {cottage.summary && cottage.summary !== 'À compléter' && (
              <p className="text-lg text-muted-foreground leading-relaxed">{cottage.summary}</p>
            )}
          </div>

          {heroImage && (
            <div className="mb-8">
              {hasGallery ? (
                <div className="grid grid-cols-2 md:grid-cols-4 md:grid-rows-2 gap-2 rounded-lg overflow-hidden">
                  <div className="relative aspect-[4/3] md:col-span-2 md:row-span-2">
                    <Image
                      src={heroImage}
                      alt={cottage.title}
                      fill
                      priority
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 50vw"
                    />
                  </div>
                  {galleryImages.slice(0, 4).map((img, index) => (
                    <div key={index} className="relative aspect-[4/3]">
                      <Image
                        src={img}
                        alt={`${cottage.title} - Image ${index + 2}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="relative aspect-[16/9] rounded-lg overflow-hidden">
                  <Image
                    src={heroImage}
                    alt={cottage.title}
                    fill
                    priority
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 100vw"
                  />
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="mb-8 grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-primary" />
                  <div>
                    <div className="text-sm text-muted-foreground">Capacité</div>
                    <div className="font-semibold">{cottage.capacity} personnes</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Home className="h-5 w-5 text-primary" />
                  <div>
                    <div className="text-sm text-muted-foreground">Arrivée / Départ</div>
                    <div className="font-semibold">
                      {cottage.checkInTime ?? '17:00 PM'} / {cottage.checkOutTime ?? '10:00 AM'}
                    </div>
                  </div>
                </div>
              </div>

              {cottage.description && cottage.description !== 'À compléter' && (
                <div className="mb-8">
                  <h2 className="font-heading text-2xl font-semibold mb-4">À propos</h2>
                  <div className="text-muted-foreground whitespace-pre-line leading-relaxed">
                    {cottage.description}
                  </div>
                </div>
              )}

              {cottage.amenities && cottage.amenities.length > 0 && (
                <div className="mb-8">
                  <h2 className="font-heading text-2xl font-semibold mb-4">Équipements</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {cottage.amenities.map((amenity, i) => (
                      <div key={i} className="flex items-center">
                        <span className="mr-2 text-primary">✓</span>
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-8">
                <h2 className="font-heading text-2xl font-semibold mb-4">Informations pratiques</h2>
                <Card className="bg-muted/30">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm font-medium text-muted-foreground mb-1">Arrivée</div>
                        <div className="font-semibold">Après {cottage.checkInTime ?? '17h00'}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-muted-foreground mb-1">Départ</div>
                        <div className="font-semibold">Avant {cottage.checkOutTime ?? '10h00'}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {(cottage.address || (cottage.latitude != null && cottage.longitude != null)) && (
                <div className="mb-8">
                  <LocationMap
                    address={cottage.address ?? undefined}
                    location={
                      cottage.latitude != null && cottage.longitude != null
                        ? { lat: cottage.latitude, lng: cottage.longitude }
                        : undefined
                    }
                  />
                </div>
              )}

              <ReviewsSection
                slug={cottage.slug}
                reviews={allReviews}
                avg={avg}
                count={count}
              />
            </div>

            <BookingCard
              slug={cottage.slug}
              capacity={cottage.capacity}
              arrival={cottage.checkInTime ?? '17h00'}
              departure={cottage.checkOutTime ?? '10h00'}
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
