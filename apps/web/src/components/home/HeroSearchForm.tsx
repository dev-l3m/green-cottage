'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Search, Calendar, Users, MapPin, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/lib/use-media-query';
import 'react-day-picker/dist/style.css';

type CottageOption = { slug: string; name: string };

const WEEKDAYS = ['LU', 'MA', 'ME', 'JE', 'VE', 'SA', 'DI'];

interface HeroSearchFormProps {
  cottages: CottageOption[];
}

export function HeroSearchForm({ cottages }: HeroSearchFormProps) {
  const router = useRouter();
  const isMobile = useMediaQuery(767);
  const [destination, setDestination] = useState<CottageOption | null>(null);
  const [range, setRange] = useState<{ from?: Date; to?: Date }>({});
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [dateOpen, setDateOpen] = useState(false);
  const [travelersOpen, setTravelersOpen] = useState(false);
  const [destOpen, setDestOpen] = useState(false);

  const totalGuests = adults + children;
  const fromLabel = range.from
    ? format(range.from, 'dd MMM', { locale: fr })
    : 'Arrivée';
  const toLabel = range.to
    ? format(range.to, 'dd MMM', { locale: fr })
    : 'Départ';
  const dateText =
    range.from && range.to
      ? `${fromLabel} → ${toLabel}`
      : range.from
        ? fromLabel + ' → …'
        : 'Dates du séjour';

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (range.from) params.set('start', range.from.toISOString().split('T')[0]);
    if (range.to) params.set('end', range.to.toISOString().split('T')[0]);
    if (totalGuests > 0) params.set('adults', String(adults));
    if (children > 0) params.set('children', String(children));
    const query = params.toString();
    const path = destination?.slug
      ? `/cottages/${destination.slug}${query ? `?${query}` : ''}`
      : `/cottages${query ? `?${query}` : ''}`;
    router.push(path);
  };

  return (
    <>
      {/* Backdrop overlay when date calendar is open (behind calendar, above hero) */}
      {dateOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <button
            type="button"
            aria-label="Fermer le calendrier"
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]"
            onClick={() => setDateOpen(false)}
          />,
          document.body
        )}

      <Card className="p-4 md:p-6 shadow-2xl bg-white/95 backdrop-blur-sm border-primary/20">
        <CardContent className="p-0">
          <div className="flex flex-col lg:flex-row gap-3 lg:gap-2 lg:items-end">
            {/* Destination */}
          <Popover open={destOpen} onOpenChange={setDestOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className={cn(
                  'flex flex-1 min-w-0 items-center gap-3 rounded-lg border bg-background px-4 py-3 text-left transition-colors',
                  'hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20',
                  'border-input'
                )}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <MapPin className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <Label className="text-xs text-muted-foreground font-normal block">
                    Destination
                  </Label>
                  <span className="block truncate font-medium">
                    {destination?.name ?? 'Tous nos gîtes'}
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
              <div className="max-h-[280px] overflow-y-auto">
                <button
                  type="button"
                  onClick={() => {
                    setDestination(null);
                    setDestOpen(false);
                  }}
                  className={cn(
                    'w-full px-4 py-3 text-left text-sm font-medium transition-colors hover:bg-muted/50',
                    !destination && 'bg-primary/10 text-primary'
                  )}
                >
                  Tous nos gîtes
                </button>
                {cottages.map((c) => (
                  <button
                    key={c.slug}
                    type="button"
                    onClick={() => {
                      setDestination(c);
                      setDestOpen(false);
                    }}
                    className={cn(
                      'w-full px-4 py-3 text-left text-sm transition-colors hover:bg-muted/50 flex items-center gap-2',
                      destination?.slug === c.slug && 'bg-primary/10 text-primary font-medium'
                    )}
                  >
                    <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
                    {c.name}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Dates */}
          <Popover open={dateOpen} onOpenChange={setDateOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className={cn(
                  'flex flex-1 min-w-0 lg:min-w-[200px] items-center gap-3 rounded-lg border bg-background px-4 py-3 text-left transition-colors',
                  'hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20',
                  'border-input'
                )}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Calendar className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <Label className="text-xs text-muted-foreground font-normal block">
                    Arrivée · Départ
                  </Label>
                  <span className="block truncate font-medium">{dateText}</span>
                </div>
                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              className="z-50 p-4 sm:p-5 py-4 w-[calc(100vw-2rem)] max-w-[320px] sm:max-w-none sm:w-auto flex flex-col items-center rounded-2xl shadow-2xl border bg-white/95"
              align="center"
            >
              <DayPicker
                mode="range"
                locale={fr}
                numberOfMonths={isMobile ? 1 : 2}
                selected={{ from: range.from, to: range.to }}
                onSelect={(r) => setRange(r ?? {})}
                disabled={{ before: new Date() }}
                classNames={{
                  months: 'flex flex-col sm:flex-row gap-3 justify-center',
                  month: 'space-y-3',
                  caption_label: 'flex justify-center font-medium text-sm',
                  head_row: 'flex flex-row',
                  head_cell:
                    'text-muted-foreground text-[10px] sm:text-xs w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center',
                  row: 'flex flex-row gap-0.5 sm:gap-1',
                  cell: 'flex items-center justify-center gap-0.5 sm:gap-1',
                  day: 'h-9 w-9 sm:h-8 sm:w-8 rounded-md text-center text-sm p-0 flex items-center justify-center transition-all duration-150 ease-out hover:bg-primary/10 active:bg-primary/20 touch-manipulation',
                  day_selected:
                    '!bg-primary !text-primary-foreground transition-all duration-150 ease-out',
                  day_today: 'font-semibold',
                  day_disabled: 'text-muted-foreground opacity-50',
                  day_outside: 'text-muted-foreground opacity-40',
                  day_range_start:
                    '!rounded-l-md !bg-primary !text-primary-foreground transition-all duration-150 ease-out',
                  day_range_end:
                    '!rounded-r-md !bg-primary !text-primary-foreground transition-all duration-150 ease-out',
                  day_range_middle:
                    '!bg-primary/20 rounded-none transition-all duration-150 ease-out',
                }}
                formatters={{
                  formatWeekdayName: (date) =>
                    WEEKDAYS[date.getDay() === 0 ? 6 : date.getDay() - 1],
                }}
              />
            </PopoverContent>
          </Popover>

          {/* Voyageurs */}
          <Popover open={travelersOpen} onOpenChange={setTravelersOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className={cn(
                  'flex flex-1 min-w-0 lg:min-w-[160px] items-center gap-3 rounded-lg border bg-background px-4 py-3 text-left transition-colors',
                  'hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20',
                  'border-input'
                )}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Users className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <Label className="text-xs text-muted-foreground font-normal block">
                    Voyageurs
                  </Label>
                  <span className="block truncate font-medium">
                    {totalGuests === 0
                      ? 'Ajouter des voyageurs'
                      : adults > 0 && children === 0
                        ? `${adults} adulte${adults > 1 ? 's' : ''}`
                        : children > 0 && adults === 0
                          ? `${children} enfant${children > 1 ? 's' : ''}`
                          : `${totalGuests} voyageur${totalGuests > 1 ? 's' : ''}`}
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-4" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Adultes</p>
                    <p className="text-xs text-muted-foreground">13 ans et plus</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setAdults((a) => Math.max(1, a - 1))}
                      disabled={adults <= 1}
                    >
                      −
                    </Button>
                    <span className="w-6 text-center tabular-nums font-medium">
                      {adults}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setAdults((a) => a + 1)}
                    >
                      +
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Enfants</p>
                    <p className="text-xs text-muted-foreground">2 à 12 ans</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setChildren((c) => Math.max(0, c - 1))}
                      disabled={children <= 0}
                    >
                      −
                    </Button>
                    <span className="w-6 text-center tabular-nums font-medium">
                      {children}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setChildren((c) => c + 1)}
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Button
            size="lg"
            className="w-full lg:w-auto mb-3 shrink-0"
            onClick={handleSearch}
          >
            <Search className="mr-2 h-4 w-4" />
            Rechercher
          </Button>
        </div>
      </CardContent>
    </Card>
    </>
  );
}
