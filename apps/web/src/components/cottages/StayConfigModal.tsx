'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DayPicker, type ClassNames } from 'react-day-picker';
import { fr } from 'date-fns/locale';
import { Calendar, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/lib/use-media-query';
import 'react-day-picker/dist/style.css';

const WEEKDAYS = ['LU', 'MA', 'ME', 'JE', 'VE', 'SA', 'DI'];

export type StayConfig = {
  range: { from?: Date; to?: Date };
  adults: number;
  children: number;
};

interface StayConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slug: string;
  capacity?: number;
  defaultConfig?: Partial<StayConfig>;
}

export function StayConfigModal({
  open,
  onOpenChange,
  slug,
  capacity = 8,
  defaultConfig,
}: StayConfigModalProps) {
  const router = useRouter();
  const isMobile = useMediaQuery(767);
  const [activeTab, setActiveTab] = useState<'dates' | 'voyageurs'>('dates');
  const [range, setRange] = useState<{ from?: Date; to?: Date }>(
    defaultConfig?.range ?? { from: undefined, to: undefined }
  );
  const [adults, setAdults] = useState(defaultConfig?.adults ?? 1);
  const [children, setChildren] = useState(defaultConfig?.children ?? 0);
  const [month, setMonth] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });

  const totalGuests = adults + children;
  const maxAdults = Math.max(1, capacity - children);
  const maxChildren = Math.max(0, capacity - adults);

  const handleApply = () => {
    if (!range.from) return;
    const from = range.from;
    const to = range.to ?? range.from;
    const start = from.toISOString().split('T')[0];
    const end = to.toISOString().split('T')[0];
    onOpenChange(false);
    router.push(
      `/cottages/${slug}/book?start=${start}&end=${end}&adults=${adults}&children=${children}`
    );
  };

  const canApply = range.from && totalGuests >= 1 && totalGuests <= capacity;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[min(95vw,900px)] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="font-heading">Configuration du séjour</DialogTitle>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex border-b gap-1 -mx-4 sm:mx-0 px-4 sm:px-0">
          <button
            type="button"
            onClick={() => setActiveTab('dates')}
            className={cn(
              'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors touch-manipulation min-h-[44px]',
              activeTab === 'dates'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            <Calendar className="h-4 w-4" />
            Dates
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('voyageurs')}
            className={cn(
              'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors touch-manipulation min-h-[44px]',
              activeTab === 'voyageurs'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            <Users className="h-4 w-4" />
            Voyageurs
          </button>
        </div>

        {activeTab === 'dates' && (
          <div className="py-2 sm:py-4 flex flex-col items-center">
            <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2 w-full max-w-fit">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-10 w-10 shrink-0 touch-manipulation"
                onClick={() => {
                  const d = new Date(month);
                  d.setMonth(d.getMonth() - 1);
                  setMonth(d);
                }}
                aria-label="Mois précédent"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <span className="font-medium text-sm sm:text-base text-center capitalize">
                {month.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-10 w-10 shrink-0 touch-manipulation"
                onClick={() => {
                  const d = new Date(month);
                  d.setMonth(d.getMonth() + 1);
                  setMonth(d);
                }}
                aria-label="Mois suivant"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex justify-center w-full overflow-x-auto">
              <DayPicker
                mode="range"
                locale={fr}
                numberOfMonths={isMobile ? 1 : 2}
                month={month}
                onMonthChange={(m) => m && setMonth(m)}
                selected={
                  range.from !== undefined
                    ? { from: range.from, to: range.to }
                    : undefined
                }
                onSelect={(r) => setRange(r ?? {})}
                disabled={{ before: new Date() }}
                pagedNavigation
                classNames={{
                  months: 'flex flex-col sm:flex-row flex-wrap gap-4 sm:gap-8 justify-center',
                  month: 'space-y-4',
                  caption: 'flex justify-center font-medium mb-2',
                  weekdays: 'flex gap-0.5 sm:gap-1',
                  weekday:
                    'text-muted-foreground text-[10px] sm:text-xs w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center',
                  week: 'flex gap-0.5 sm:gap-1',
                  day: 'h-9 w-9 sm:h-8 sm:w-8 rounded-md text-center text-sm p-0 flex items-center justify-center',
                  day_button:
                    'h-9 w-9 sm:h-8 sm:w-8 rounded-md hover:bg-primary/10 focus:bg-primary/20 active:bg-primary/30 touch-manipulation',
                  selected:
                    'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground',
                  today: 'font-semibold',
                  disabled: 'text-muted-foreground opacity-50',
                  outside: 'text-muted-foreground opacity-40',
                  range_start: 'rounded-l-md bg-primary text-primary-foreground',
                  range_end: 'rounded-r-md bg-primary text-primary-foreground',
                  range_middle: 'bg-primary/20 rounded-none',
                } as ClassNames}
              formatters={{
                formatWeekdayName: (date) => WEEKDAYS[date.getDay() === 0 ? 6 : date.getDay() - 1],
              }}
              />
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-3 sm:gap-4 mt-4 sm:mt-6 pt-4 border-t text-xs sm:text-sm text-muted-foreground justify-center w-full">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-primary shrink-0" />
                <span>Green Cottage</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-red-500 shrink-0" />
                <span>Airbnb</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-blue-500 shrink-0" />
                <span>Booking.com</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-amber-500 shrink-0" />
                <span>Gîtes de France</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'voyageurs' && (
          <div className="py-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Adultes</p>
                <p className="text-sm text-muted-foreground">13 ans et plus</p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setAdults((a) => Math.max(1, a - 1))}
                  disabled={adults <= 1}
                  aria-label="Moins d'adultes"
                >
                  −
                </Button>
                <span className="w-8 text-center font-medium tabular-nums">{adults}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setAdults((a) => Math.min(maxAdults, a + 1))}
                  disabled={adults >= maxAdults}
                  aria-label="Plus d'adultes"
                >
                  +
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Enfants</p>
                <p className="text-sm text-muted-foreground">De 2 à 12 ans</p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setChildren((c) => Math.max(0, c - 1))}
                  disabled={children <= 0}
                  aria-label="Moins d'enfants"
                >
                  −
                </Button>
                <span className="w-8 text-center font-medium tabular-nums">{children}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setChildren((c) => Math.min(maxChildren, c + 1))}
                  disabled={children >= maxChildren}
                  aria-label="Plus d'enfants"
                >
                  +
                </Button>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="flex-col-reverse sm:flex-row gap-2 sm:justify-between pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto touch-manipulation min-h-[44px]"
          >
            Annuler
          </Button>
          <Button
            type="button"
            onClick={handleApply}
            disabled={!canApply}
            className="w-full sm:w-auto touch-manipulation min-h-[44px]"
          >
            Appliquer les modifications
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
