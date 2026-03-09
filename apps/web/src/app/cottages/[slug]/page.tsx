import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent } from '@/components/ui/card';
import { LocationMap } from '@/components/cottages/LocationMap';
import { BookingCard } from '@/components/cottages/BookingCard';
import { ReviewsSection } from '@/components/reviews/ReviewsSection';
import { getCottageBySlug } from '@/lib/cottages';
import { getPublicReviewsForSlug } from '@/lib/server/public-reviews';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import practicalData from '@/content/practical-access.json';
import Image from 'next/image';
import { Users, Home } from 'lucide-react';
import type { DisplayReview } from '@/components/reviews/ReviewList';
import { WifiPasswordField } from '@/components/cottages/WifiPasswordField';

export const revalidate = 60;

type PracticalData = typeof practicalData;

function getWifiDataBySlug(slug: string) {
  const data = practicalData as PracticalData;
  const practical = data.cottages.find((item) => item.slug === slug);
  if (!practical) return null;

  const network = practical.items.find((item) => item.label.toLowerCase().includes('wifi'))?.value ?? null;
  const password =
    practical.items.find((item) => item.label.toLowerCase().includes('mot de passe wifi'))?.value ?? null;

  return { network, password };
}

async function hasActiveReservation(cottageId: string, userId: string) {
  try {
    const now = new Date();
    const count = await prisma.booking.count({
      where: {
        cottageId,
        userId,
        status: { in: ['PENDING', 'PAID'] },
        endDate: { gte: now },
      },
    });
    return count > 0;
  } catch {
    return false;
  }
}

export default async function CottageDetailPage({ params }: { params: { slug: string } }) {
  const cottage = await getCottageBySlug(params.slug);

  if (!cottage) {
    notFound();
  }

  const allReviews: DisplayReview[] = (await getPublicReviewsForSlug(params.slug)).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const count = allReviews.length;
  const avg =
    count === 0 ? 0 : Math.round((allReviews.reduce((s, r) => s + r.rating, 0) / count) * 10) / 10;

  const heroImage = cottage.images[0];
  const galleryImages = cottage.images.slice(1, 5);
  const hasGallery = galleryImages.length > 0;
  const wifiData = getWifiDataBySlug(cottage.slug);

  const session = await getServerSession(authOptions);
  const sessionUser = session?.user as { id?: string } | undefined;
  const canRevealWifiPassword =
    Boolean(sessionUser?.id) && (await hasActiveReservation(cottage.id, sessionUser!.id as string));

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
                    <div className="mb-5 flex items-center gap-3">
                      <div className="relative h-14 w-14 rounded-full overflow-hidden border-2 border-white shadow-sm">
                        {heroImage ? (
                          <Image
                            src={heroImage}
                            alt={`Photo de ${cottage.title}`}
                            fill
                            className="object-cover"
                            sizes="56px"
                          />
                        ) : (
                          <div className="h-full w-full bg-primary/10 flex items-center justify-center text-sm font-semibold">
                            {cottage.title.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Gîte concerné</p>
                        <p className="font-semibold">{cottage.title}</p>
                      </div>
                    </div>

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

                    <div className="mt-6 border-t pt-5">
                      <h3 className="font-semibold mb-3">WiFi</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm font-medium text-muted-foreground mb-1">Réseau</div>
                          <div className="font-semibold">{wifiData?.network ?? 'Communique a l arrivee'}</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-muted-foreground mb-1">
                            Mot de passe WiFi
                          </div>
                          <WifiPasswordField
                            password={wifiData?.password ?? 'Communique a l arrivee'}
                            canReveal={canRevealWifiPassword}
                          />
                        </div>
                      </div>

                      <div className="mt-4 text-sm text-muted-foreground space-y-1">
                        <p>
                          En cas de coupure, verifiez d abord le routeur (alimentation, voyants et
                          redemarrage).
                        </p>
                        <p>
                          Le debit peut varier selon la meteo et la couverture reseau en zone forestiere.
                        </p>
                        <p>
                          Affichage securise: mot de passe visible uniquement pour les utilisateurs connectes
                          avec reservation active (site, Booking ou Airbnb via sync).
                        </p>
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
              pricePerNight={cottage.basePrice}
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
