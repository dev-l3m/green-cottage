'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
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
import { useHeaderUi, type CottageOption } from '@/components/ui/header-scroll-context';
import 'react-day-picker/dist/style.css';

const WEEKDAYS = ['LU', 'MA', 'ME', 'JE', 'VE', 'SA', 'DI'];

interface HeroSearchFormProps {
  variant: 'hero' | 'header';
  /** @deprecated cottages comes from context - kept for backward compat, ignored */
  cottages?: CottageOption[];
}

export function HeroSearchForm({ variant }: HeroSearchFormProps) {
  const {
    searchState,
    updateDestination,
    updateRange,
    updateTravelers,
    submitSearch,
    cottages,
  } = useHeaderUi();

  const isMobile = useMediaQuery(767);
  const [dateOpen, setDateOpen] = useState(false);
  const [travelersOpen, setTravelersOpen] = useState(false);
  const [destOpen, setDestOpen] = useState(false);

  const { destination, range, adults, children } = searchState;
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

  const dateTextCompact =
    range.from && range.to
      ? `${fromLabel} - ${toLabel}`
      : range.from
        ? fromLabel + ' - …'
        : 'Dates';

  const travelersTextCompact =
    totalGuests === 0
      ? 'Voyageurs'
      : totalGuests === 1
        ? '1 voyageur'
        : `${totalGuests} voyageurs`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitSearch();
  };

  const isCompact = variant === 'header';

  return (
    <>
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

      <Card
        className={cn(
          isCompact
            ? 'rounded-full bg-white shadow-md border-0 overflow-hidden'
            : 'shadow-2xl bg-white/95 backdrop-blur-sm border-primary/20 p-4 md:p-6'
        )}
      >
        <CardContent className={cn(isCompact ? 'p-0' : 'p-0')}>
          <form onSubmit={handleSubmit}>
            <div
              className={cn(
                'flex flex-col lg:flex-row',
                isCompact
                  ? 'lg:flex-row lg:items-stretch'
                  : 'gap-3 lg:gap-2 lg:items-end'
              )}
            >
              {/* Destination */}
              <Popover open={destOpen} onOpenChange={setDestOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      'flex flex-1 min-w-0 items-center text-left transition-colors',
                      'hover:bg-muted/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20',
                      isCompact
                        ? 'flex-col items-start gap-0.5 px-4 py-2.5 rounded-l-full'
                        : 'gap-3 rounded-lg border border-input bg-background px-4 py-3'
                    )}
                  >
                    {!isCompact && (
                      <div className="shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary flex h-9 w-9">
                        <MapPin className="h-4 w-4" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0 w-full">
                      {isCompact ? (
                        <>
                          <span className="block text-xs font-semibold text-gc-green">
                            Destination
                          </span>
                          <span className="flex items-center gap-1.5">
                            <span className="block truncate text-sm text-muted-foreground">
                              {destination?.name ?? 'Tous nos gîtes'}
                            </span>
                            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                          </span>
                        </>
                      ) : (
                        <>
                          <Label className="text-xs text-muted-foreground font-normal block">
                            Destination
                          </Label>
                          <span className="block truncate font-medium">
                            {destination?.name ?? 'Tous nos gîtes'}
                          </span>
                        </>
                      )}
                    </div>
                    {!isCompact && (
                      <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[var(--radix-popover-trigger-width)] p-0"
                  align="start"
                >
                  <div className="max-h-[280px] overflow-y-auto">
                    <button
                      type="button"
                      onClick={() => {
                        updateDestination(null);
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
                          updateDestination(c);
                          setDestOpen(false);
                        }}
                        className={cn(
                          'w-full px-4 py-3 text-left text-sm transition-colors hover:bg-muted/50 flex items-center gap-2',
                          destination?.slug === c.slug &&
                            'bg-primary/10 text-primary font-medium'
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
                      'flex flex-1 min-w-0 items-center text-left transition-colors',
                      'hover:bg-muted/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20',
                      isCompact
                        ? 'flex-col items-start gap-0.5 px-4 py-2.5 lg:min-w-[140px] border-l border-border/60'
                        : 'gap-3 lg:min-w-[200px] rounded-lg border border-input bg-background px-4 py-3'
                    )}
                  >
                    {!isCompact && (
                      <div className="shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary flex h-9 w-9">
                        <Calendar className="h-4 w-4" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0 w-full">
                      {isCompact ? (
                        <>
                          <span className="block text-xs font-semibold text-gc-green">
                            Dates
                          </span>
                          <span className="block truncate text-sm text-muted-foreground">
                            {dateTextCompact}
                          </span>
                        </>
                      ) : (
                        <>
                          <Label className="text-xs text-muted-foreground font-normal block">
                            Arrivée · Départ
                          </Label>
                          <span className="block truncate font-medium">
                            {dateText}
                          </span>
                        </>
                      )}
                    </div>
                    {!isCompact && (
                      <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
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
                    onSelect={(r) => updateRange(r ?? {})}
                    disabled={{ before: new Date() }}
                    classNames={{
                      months: 'flex flex-col sm:flex-row gap-3 justify-center',
                      month: 'space-y-3',
                      caption_label:
                        'flex justify-center font-medium text-sm',
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
                      'flex flex-1 min-w-0 items-center text-left transition-colors',
                      'hover:bg-muted/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20',
                      isCompact
                        ? 'flex-col items-start gap-0.5 px-4 py-2.5 lg:min-w-[120px] border-l border-border/60'
                        : 'gap-3 lg:min-w-[160px] rounded-lg border border-input bg-background px-4 py-3'
                    )}
                  >
                    {!isCompact && (
                      <div className="shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary flex h-9 w-9">
                        <Users className="h-4 w-4" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0 w-full">
                      {isCompact ? (
                        <>
                          <span className="block text-xs font-semibold text-gc-green">
                            Voyageurs
                          </span>
                          <span className="flex items-center gap-1.5">
                            <span className="block truncate text-sm text-muted-foreground">
                              {travelersTextCompact}
                            </span>
                            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                          </span>
                        </>
                      ) : (
                        <>
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
                        </>
                      )}
                    </div>
                    {!isCompact && (
                      <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-72 p-4" align="end">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Adultes</p>
                        <p className="text-xs text-muted-foreground">
                          13 ans et plus
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            updateTravelers(Math.max(1, adults - 1), children)
                          }
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
                          onClick={() => updateTravelers(adults + 1, children)}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Enfants</p>
                        <p className="text-xs text-muted-foreground">
                          2 à 12 ans
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            updateTravelers(adults, Math.max(0, children - 1))
                          }
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
                          onClick={() => updateTravelers(adults, children + 1)}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              <Button
                type="submit"
                size={isCompact ? 'icon' : 'lg'}
                className={cn(
                  'shrink-0 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                  isCompact
                    ? 'self-stretch min-h-[60px] rounded-r-full px-5 bg-primary hover:bg-primary/90 rounded-l-none [&_svg]:text-white'
                    : 'w-full lg:w-auto mb-3'
                )}
                title="Rechercher"
              >
                <Search
                  className={cn(
                    'h-4 w-4 shrink-0',
                    !isCompact && 'mr-2',
                    isCompact && 'text-white'
                  )}
                />
                {!isCompact && 'Rechercher'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
