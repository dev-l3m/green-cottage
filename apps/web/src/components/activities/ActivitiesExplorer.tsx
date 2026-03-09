'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  Search,
  ArrowUpDown,
  MapPin,
  Route,
} from 'lucide-react';

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

type Props = {
  items: ActivityItem[];
};

const THEME_META: Record<
  string,
  { emoji: string; color: string; badge: string }
> = {
  'Nature & plein air': {
    emoji: '🌳',
    color: '#5A9E6F',
    badge: 'bg-green-100 text-green-800 border-green-200',
  },
  'Aventure & loisirs': {
    emoji: '🚴',
    color: '#F39A32',
    badge: 'bg-orange-100 text-orange-800 border-orange-200',
  },
  'Escape Games': {
    emoji: '🔐',
    color: '#7C5CFA',
    badge: 'bg-violet-100 text-violet-800 border-violet-200',
  },
  'Patrimoine & culture': {
    emoji: '🏛️',
    color: '#EC6DB0',
    badge: 'bg-pink-100 text-pink-800 border-pink-200',
  },
  'Terroir & gastronomie': {
    emoji: '🍷',
    color: '#9E1F1F',
    badge: 'bg-red-100 text-red-800 border-red-200',
  },
  Restaurants: {
    emoji: '🍽️',
    color: '#214E9C',
    badge: 'bg-blue-100 text-blue-800 border-blue-200',
  },
};

type SortKey = 'name' | 'theme' | 'distanceKm' | 'durationMin';
type SortDirection = 'asc' | 'desc';

const ActivitiesLeafletMap = dynamic(
  () =>
    import('@/components/activities/ActivitiesLeafletMap').then(
      (mod) => mod.ActivitiesLeafletMap
    ),
  {
    ssr: false,
    loading: () => (
      <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm p-6 text-sm text-muted-foreground">
        Chargement de la carte...
      </div>
    ),
  }
);

function formatDistance(value: number) {
  return Number.isInteger(value) ? `${value}` : value.toFixed(1);
}

function formatDuration(value: number) {
  return `${value} min`;
}

export function ActivitiesExplorer({ items }: Props) {
  const safeItems = useMemo(() => items.filter((item): item is ActivityItem => Boolean(item)), [items]);

  const themes = useMemo(
    () => Array.from(new Set(safeItems.map((item) => item.theme))),
    [safeItems]
  );

  const [search, setSearch] = useState('');
  const [selectedThemes, setSelectedThemes] = useState<string[]>(themes);
  const [sortKey, setSortKey] = useState<SortKey>('distanceKm');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();

    const results = safeItems.filter((item) => {
      const matchesTheme = selectedThemes.includes(item.theme);
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.theme.toLowerCase().includes(q) ||
        item.themeDetail.toLowerCase().includes(q);

      return matchesTheme && matchesSearch;
    });

    results.sort((a, b) => {
      const dir = sortDirection === 'asc' ? 1 : -1;

      if (sortKey === 'name' || sortKey === 'theme') {
        return a[sortKey].localeCompare(b[sortKey]) * dir;
      }

      return (a[sortKey] - b[sortKey]) * dir;
    });

    return results;
  }, [safeItems, search, selectedThemes, sortKey, sortDirection]);

  const toggleTheme = (theme: string) => {
    setSelectedThemes((prev) =>
      prev.includes(theme)
        ? prev.filter((t) => t !== theme)
        : [...prev, theme]
    );
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortKey(key);
    setSortDirection('asc');
  };

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-border bg-card p-5 md:p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-heading text-2xl md:text-3xl font-semibold">
              Carte interactive & tableau
            </h2>
            <p className="mt-2 text-muted-foreground">
              Filtrez par thématique, recherchez une adresse et triez les
              résultats selon la distance ou la durée estimée.
            </p>
          </div>

          <div className="w-full lg:w-[360px]">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher une activité ou un restaurant..."
                className="h-11 w-full rounded-xl border border-input bg-background pl-10 pr-4 text-sm outline-none ring-0 transition focus:border-primary"
              />
            </label>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          {themes.map((theme) => {
            const meta = THEME_META[theme];
            const active = selectedThemes.includes(theme);

            return (
              <button
                key={theme}
                type="button"
                onClick={() => toggleTheme(theme)}
                className={[
                  'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition',
                  active
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background text-foreground hover:bg-muted',
                ].join(' ')}
              >
                <span>{meta?.emoji ?? '📍'}</span>
                <span>{theme}</span>
              </button>
            );
          })}
        </div>
      </div>

      <ActivitiesLeafletMap items={filteredItems} />

      <div className="rounded-3xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px]">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="px-5 py-4">
                  <button
                    type="button"
                    onClick={() => handleSort('name')}
                    className="inline-flex items-center gap-2 font-semibold"
                  >
                    Nom
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </th>

                <th className="px-5 py-4">
                  <button
                    type="button"
                    onClick={() => handleSort('theme')}
                    className="inline-flex items-center gap-2 font-semibold"
                  >
                    Thématique
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </th>

                <th className="px-5 py-4">
                  <button
                    type="button"
                    onClick={() => handleSort('distanceKm')}
                    className="inline-flex items-center gap-2 font-semibold"
                  >
                    Distance (km)
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </th>

                <th className="px-5 py-4">
                  <button
                    type="button"
                    onClick={() => handleSort('durationMin')}
                    className="inline-flex items-center gap-2 font-semibold"
                  >
                    Durée estimée
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </th>

                <th className="px-5 py-4 font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredItems.map((item) => {
                const meta = THEME_META[item.theme];

                return (
                  <tr
                    key={`${item.name}-${item.distanceKm}`}
                    className="border-t border-border/70 align-top"
                  >
                    <td className="px-5 py-4 font-medium">{item.name}</td>

                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-2">
                        <span
                          className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-sm ${meta?.badge ?? 'border-border bg-muted text-foreground'}`}
                        >
                          <span>{meta?.emoji ?? '📍'}</span>
                          <span>{item.theme}</span>
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {item.themeDetail}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4">{formatDistance(item.distanceKm)}</td>
                    <td className="px-5 py-4">{formatDuration(item.durationMin)}</td>

                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={item.googleMapsUrl}
                          target="_blank"
                          className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm hover:bg-muted"
                        >
                          <MapPin className="h-4 w-4" />
                          Maps
                        </Link>

                        {item.routeUrl ? (
                          <Link
                            href={item.routeUrl}
                            target="_blank"
                            className="inline-flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-sm text-primary-foreground"
                          >
                            <Route className="h-4 w-4" />
                            Itinéraire
                          </Link>
                        ) : (
                          <button
                            type="button"
                            disabled
                            className="inline-flex items-center gap-2 rounded-xl bg-muted px-3 py-2 text-sm text-muted-foreground cursor-not-allowed"
                          >
                            <Route className="h-4 w-4" />
                            Itinéraire indisponible
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-muted-foreground">
                    Aucun résultat ne correspond aux filtres sélectionnés.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}