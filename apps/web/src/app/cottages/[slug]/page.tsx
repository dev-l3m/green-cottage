import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent } from '@/components/ui/card';
import { LocationMap } from '@/components/cottages/LocationMap';
import { BookingCard } from '@/components/cottages/BookingCard';
import { ReviewsSection } from '@/components/reviews/ReviewsSection';
import { getReviewsBySlug, computeAverageRating } from '@/lib/reviews';
import Image from 'next/image';
import { Users, Bed, Home, Bath } from 'lucide-react';
import cottagesData from '@/content/cottages.json';

// Type for cottage from JSON
type CottageFromJSON = {
  id: number;
  slug: string;
  name: string;
  summary: string;
  description: string;
  facts: {
    capacite_max?: number;
    chambres?: number;
    superficie_m2?: number;
    capacity?: number;
    rooms?: number;
    beds?: number;
    bathrooms?: number;
  };
  amenities: string[];
  images: {
    hero: string;
    gallery: string[];
  };
  sourceUrl: string;
  address?: string;
  location?: {
    lat?: number;
    lng?: number;
    city?: string;
    region?: string;
    country?: string;
  };
  nearbyPlaces?: Array<{
    name: string;
    distance: string;
    type: string;
  }>;
  badges?: string[];
  sections?: Array<{
    title: string;
    content: string[];
  }>;
  practicalInfo?: {
    arrivee?: string;
    depart?: string;
    enfants?: string;
    longue_duree?: string;
    evenements?: string;
  };
};

export default function CottageDetailPage({ params }: { params: { slug: string } }) {
  const cottages = cottagesData as CottageFromJSON[];
  const cottage = cottages.find((c) => c.slug === params.slug);
  const reviews = getReviewsBySlug(params.slug);
  const { avg, count } = computeAverageRating(reviews);

  if (!cottage) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 container py-12">
          <p>Cottage non trouvé</p>
        </main>
        <Footer />
      </div>
    );
  }

  // Get gallery images (up to 4 for the grid)
  const galleryImages = cottage.images.gallery.slice(0, 4);
  const hasGallery = galleryImages.length > 0;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container py-8">
          {/* Title and Summary */}
          <div className="mb-6">
            <h1 className="font-heading text-4xl font-bold mb-3">{cottage.name}</h1>
            {cottage.summary && cottage.summary !== 'À compléter' && (
              <p className="text-lg text-muted-foreground leading-relaxed">{cottage.summary}</p>
            )}
          </div>

          {/* Airbnb-style Gallery Grid */}
          {cottage.images.hero && (
            <div className="mb-8">
              {hasGallery ? (
                // Desktop: Big left + 4 small on right (2x2 grid) | Mobile: Stacked 2 columns
                <div className="grid grid-cols-2 md:grid-cols-4 md:grid-rows-2 gap-2 rounded-lg overflow-hidden">
                  {/* Hero Image - Large, spans 2 rows on desktop */}
                  <div className="relative aspect-[4/3] md:col-span-2 md:row-span-2">
                    <Image
                      src={cottage.images.hero}
                      alt={cottage.name}
                      fill
                      priority
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 50vw"
                    />
                  </div>

                  {/* Gallery Images - 4 small in 2x2 grid on right */}
                  {galleryImages.slice(0, 4).map((img, index) => (
                    <div key={index} className="relative aspect-[4/3]">
                      <Image
                        src={img}
                        alt={`${cottage.name} - Image ${index + 2}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                // Fallback: Single hero image if no gallery
                <div className="relative aspect-[16/9] rounded-lg overflow-hidden">
                  <Image
                    src={cottage.images.hero}
                    alt={cottage.name}
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
              {/* Badges */}
              {cottage.badges && cottage.badges.length > 0 && (
                <div className="mb-6 flex flex-wrap gap-2">
                  {cottage.badges.map((badge, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              )}

              {/* Facts */}
              {(cottage.facts.capacite_max ||
                cottage.facts.chambres ||
                cottage.facts.superficie_m2 ||
                cottage.facts.capacity ||
                cottage.facts.rooms ||
                cottage.facts.beds ||
                cottage.facts.bathrooms) && (
                <div className="mb-8 grid grid-cols-2 md:grid-cols-3 gap-4">
                  {(cottage.facts.capacite_max || cottage.facts.capacity) && (
                    <div className="flex items-center space-x-2">
                      <Users className="h-5 w-5 text-primary" />
                      <div>
                        <div className="text-sm text-muted-foreground">Capacité</div>
                        <div className="font-semibold">
                          {cottage.facts.capacite_max || cottage.facts.capacity} personnes
                        </div>
                      </div>
                    </div>
                  )}
                  {(cottage.facts.chambres || cottage.facts.rooms) && (
                    <div className="flex items-center space-x-2">
                      <Home className="h-5 w-5 text-primary" />
                      <div>
                        <div className="text-sm text-muted-foreground">Chambres</div>
                        <div className="font-semibold">{cottage.facts.chambres || cottage.facts.rooms}</div>
                      </div>
                    </div>
                  )}
                  {cottage.facts.superficie_m2 && (
                    <div className="flex items-center space-x-2">
                      <Home className="h-5 w-5 text-primary" />
                      <div>
                        <div className="text-sm text-muted-foreground">Superficie</div>
                        <div className="font-semibold">{cottage.facts.superficie_m2} m²</div>
                      </div>
                    </div>
                  )}
                  {cottage.facts.beds && (
                    <div className="flex items-center space-x-2">
                      <Bed className="h-5 w-5 text-primary" />
                      <div>
                        <div className="text-sm text-muted-foreground">Lits</div>
                        <div className="font-semibold">{cottage.facts.beds}</div>
                      </div>
                    </div>
                  )}
                  {cottage.facts.bathrooms && (
                    <div className="flex items-center space-x-2">
                      <Bath className="h-5 w-5 text-primary" />
                      <div>
                        <div className="text-sm text-muted-foreground">Salles de bain</div>
                        <div className="font-semibold">{cottage.facts.bathrooms}</div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Description */}
              {cottage.description && cottage.description !== 'À compléter' && (
                <div className="mb-8">
                  <h2 className="font-heading text-2xl font-semibold mb-4">À propos</h2>
                  <div className="text-muted-foreground whitespace-pre-line leading-relaxed">
                    {cottage.description}
                  </div>
                </div>
              )}

              {/* Sections */}
              {cottage.sections && cottage.sections.length > 0 && (
                <div className="mb-8 space-y-8">
                  {cottage.sections.map((section, sectionIndex) => (
                    <div key={sectionIndex}>
                      <h2 className="font-heading text-2xl font-semibold mb-4">{section.title}</h2>
                      <ul className="space-y-3">
                        {section.content.map((item, itemIndex) => (
                          <li key={itemIndex} className="flex items-start space-x-3">
                            <span className="text-primary mt-1 flex-shrink-0">✓</span>
                            <span className="text-muted-foreground leading-relaxed">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {/* Practical Info */}
              {cottage.practicalInfo && (
                <div className="mb-8">
                  <h2 className="font-heading text-2xl font-semibold mb-4">Informations pratiques</h2>
                  <Card className="bg-muted/30">
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {cottage.practicalInfo.arrivee && (
                          <div>
                            <div className="text-sm font-medium text-muted-foreground mb-1">Arrivée</div>
                            <div className="font-semibold">{cottage.practicalInfo.arrivee}</div>
                          </div>
                        )}
                        {cottage.practicalInfo.depart && (
                          <div>
                            <div className="text-sm font-medium text-muted-foreground mb-1">Départ</div>
                            <div className="font-semibold">{cottage.practicalInfo.depart}</div>
                          </div>
                        )}
                        {cottage.practicalInfo.enfants && (
                          <div>
                            <div className="text-sm font-medium text-muted-foreground mb-1">Enfants</div>
                            <div className="font-semibold">{cottage.practicalInfo.enfants}</div>
                          </div>
                        )}
                        {cottage.practicalInfo.longue_duree && (
                          <div>
                            <div className="text-sm font-medium text-muted-foreground mb-1">Séjours</div>
                            <div className="font-semibold">{cottage.practicalInfo.longue_duree}</div>
                          </div>
                        )}
                        {cottage.practicalInfo.evenements && (
                          <div className="md:col-span-2">
                            <div className="text-sm font-medium text-muted-foreground mb-1">Événements</div>
                            <div className="font-semibold">{cottage.practicalInfo.evenements}</div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Amenities (fallback if sections not available) */}
              {(!cottage.sections || cottage.sections.length === 0) &&
                cottage.amenities &&
                cottage.amenities.length > 0 && (
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

              {/* Location Map - Airbnb Style */}
              <div className="mb-8">
                <LocationMap
                  address={cottage.address}
                  location={cottage.location}
                  nearbyPlaces={cottage.nearbyPlaces}
                />
              </div>

              {/* Reviews */}
              <ReviewsSection reviews={reviews} avg={avg} count={count} />
            </div>

            {/* Booking Card with Configuration du séjour modal */}
            <BookingCard
              slug={cottage.slug}
              capacity={cottage.facts.capacite_max ?? cottage.facts.capacity ?? 4}
              arrival={
                cottage.practicalInfo?.arrivee?.replace(/^Arrivée:\s*/i, '') || '17h00'
              }
              departure={
                cottage.practicalInfo?.depart?.replace(/^Départ:\s*/i, '') || '10h00'
              }
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
