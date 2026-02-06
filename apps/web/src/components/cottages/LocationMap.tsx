'use client';

import { MapPin, Navigation, ExternalLink, Map } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface LocationMapProps {
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
}

export function LocationMap({ address, location, nearbyPlaces }: LocationMapProps) {
  // Default coordinates (can be overridden)
  const defaultLat = location?.lat || 45.7640; // Example: Lyon area
  const defaultLng = location?.lng || 4.8357;
  const city = location?.city || 'Région';
  const region = location?.region || 'France';

  // Google Maps embed URL (works without API key for basic embeds)
  const simpleMapUrl = `https://maps.google.com/maps?q=${defaultLat},${defaultLng}&hl=fr&z=13&output=embed`;

  // Google Maps link for directions
  const googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${defaultLat},${defaultLng}`;

  return (
    <div className="space-y-6">
      {/* Header with attractive styling */}
      <div className="border-b pb-4">
        <h2 className="font-heading text-2xl md:text-3xl font-semibold mb-3">Où vous serez</h2>
        {address && (
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-base font-medium text-foreground">{address}</p>
              <p className="text-sm text-muted-foreground mt-1">{city}, {region}</p>
            </div>
          </div>
        )}
        {!address && (
          <div className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-primary" />
            <p className="text-base font-medium">{city}, {region}</p>
          </div>
        )}
      </div>

      {/* Map Container - Airbnb Style */}
      <Card className="overflow-hidden border-2 shadow-lg hover:shadow-xl transition-shadow">
        <div className="relative aspect-[16/9] w-full bg-gradient-to-br from-primary/5 to-primary/10">
          {/* Google Maps Embed */}
          <iframe
            src={simpleMapUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="absolute inset-0"
            title="Carte de localisation"
          />
          
          {/* Overlay gradient for better visual appeal */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/10 via-transparent to-transparent" />

          {/* Floating Action Button for Mobile */}
          <div className="absolute bottom-4 right-4 md:hidden z-10">
            <a
              href={googleMapsLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="sm" className="shadow-xl bg-white hover:bg-gray-50 text-foreground border-2">
                <Navigation className="h-4 w-4 mr-2" />
                Itinéraire
              </Button>
            </a>
          </div>
        </div>

        {/* Action Buttons - Modern Design */}
        <CardContent className="p-6 bg-gradient-to-br from-background to-muted/30">
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={googleMapsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1"
            >
              <Button variant="default" className="w-full shadow-md hover:shadow-lg transition-shadow" size="lg">
                <Navigation className="h-4 w-4 mr-2" />
                Obtenir l&apos;itinéraire
              </Button>
            </a>
            <a
              href={googleMapsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1"
            >
              <Button variant="outline" className="w-full border-2 hover:bg-accent" size="lg">
                <ExternalLink className="h-4 w-4 mr-2" />
                Voir sur Google Maps
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Nearby Places - Attractive Cards */}
      {nearbyPlaces && nearbyPlaces.length > 0 && (
        <div>
          <h3 className="font-heading text-xl font-semibold mb-4 flex items-center">
            <Map className="h-5 w-5 mr-2 text-primary" />
            À proximité
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {nearbyPlaces.map((place, index) => (
              <Card
                key={index}
                className="border-2 hover:border-primary/50 transition-all hover:shadow-md cursor-pointer group"
              >
                <CardContent className="p-5">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <MapPin className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-base mb-1 group-hover:text-primary transition-colors">
                        {place.name}
                      </p>
                      <p className="text-sm font-medium text-primary mb-1">{place.distance}</p>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">
                        {place.type}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Location Info - Enhanced Design */}
      <Card className="bg-gradient-to-br from-primary/5 via-background to-primary/5 border-2 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
              <MapPin className="h-7 w-7 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-heading text-lg font-semibold mb-3">Informations de localisation</h3>
              <div className="space-y-3 text-sm">
                <p className="text-muted-foreground leading-relaxed">
                  Le gîte est situé dans un cadre paisible, idéal pour un séjour reposant. 
                  L&apos;emplacement offre un accès facile aux principales attractions de la région.
                </p>
                <div className="pt-3 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-foreground uppercase tracking-wide">
                      Coordonnées GPS
                    </span>
                    <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                      {defaultLat.toFixed(6)}, {defaultLng.toFixed(6)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
