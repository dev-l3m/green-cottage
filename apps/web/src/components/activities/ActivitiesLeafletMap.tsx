'use client';

import Link from 'next/link';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L, { DivIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Clock3 } from 'lucide-react';

type ActivityItem = {
  name: string;
  theme: string;
  themeDetail: string;
  distanceKm: number;
  durationMin: number;
  googleMapsUrl: string;
  routeUrl: string | null;
  lat: number | null;
  lng: number | null;
};

const THEME_COLORS: Record<string, { emoji: string; color: string }> = {
  'Nature & plein air': { emoji: '🌳', color: '#5A9E6F' },
  'Aventure & loisirs': { emoji: '🚴', color: '#F39A32' },
  'Escape Games': { emoji: '🔐', color: '#7C5CFA' },
  'Patrimoine & culture': { emoji: '🏛️', color: '#EC6DB0' },
  'Terroir & gastronomie': { emoji: '🍷', color: '#9E1F1F' },
  Restaurants: { emoji: '🍽️', color: '#214E9C' },
};

function formatDistance(value: number) {
  return Number.isInteger(value) ? `${value}` : value.toFixed(1);
}

function formatDuration(value: number) {
  return `${value} min`;
}

function createMarkerIcon(theme: string): DivIcon {
  const meta = THEME_COLORS[theme] ?? { emoji: '📍', color: '#2F855A' };

  return L.divIcon({
    className: '',
    html: `
      <div style="
        width: 34px;
        height: 34px;
        border-radius: 9999px 9999px 9999px 0;
        transform: rotate(-45deg);
        background: ${meta.color};
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 6px 18px rgba(0,0,0,0.22);
        border: 2px solid white;
      ">
        <span style="
          transform: rotate(45deg);
          font-size: 16px;
          line-height: 1;
        ">${meta.emoji}</span>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -30],
  });
}

export function ActivitiesLeafletMap({ items }: { items: ActivityItem[] }) {
  const center: [number, number] = [45.366833, 4.901511];
  const mappableItems = items.filter(
    (item): item is ActivityItem & { lat: number; lng: number } =>
      item != null && typeof item.lat === 'number' && typeof item.lng === 'number'
  );

  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
      <div className="h-[620px] w-full">
        <MapContainer center={center} zoom={9} scrollWheelZoom={false} className="h-full w-full z-0">
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {mappableItems.map((item) => (
            <Marker
              key={`${item.name}-${item.lat}-${item.lng}`}
              position={[item.lat, item.lng]}
              icon={createMarkerIcon(item.theme)}
            >
              <Popup>
                <div className="min-w-[220px] space-y-2">
                  <div className="font-semibold text-sm">{item.name}</div>
                  <div className="text-xs text-muted-foreground">{item.themeDetail}</div>
                  <div className="flex items-center gap-2 text-xs">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{formatDistance(item.distanceKm)} km</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Clock3 className="h-3.5 w-3.5" />
                    <span>{formatDuration(item.durationMin)}</span>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Link
                      href={item.googleMapsUrl}
                      target="_blank"
                      className="inline-flex rounded-lg bg-foreground px-3 py-2 text-xs font-medium text-background"
                    >
                      Voir sur Maps
                    </Link>
                    {item.routeUrl ? (
                      <Link
                        href={item.routeUrl}
                        target="_blank"
                        className="inline-flex rounded-lg border px-3 py-2 text-xs font-medium"
                      >
                        Itineraire
                      </Link>
                    ) : (
                      <span className="inline-flex rounded-lg border px-3 py-2 text-xs font-medium text-muted-foreground">
                        Itineraire indisponible
                      </span>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
