'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Users } from 'lucide-react';
import Link from 'next/link';
import { StayConfigModal } from './StayConfigModal';

interface BookingCardProps {
  slug: string;
  capacity?: number;
  arrival?: string;
  departure?: string;
}

export function BookingCard({
  slug,
  capacity = 4,
  arrival = '17h00',
  departure = '10h00',
}: BookingCardProps) {
  const [configOpen, setConfigOpen] = useState(false);

  return (
    <>
      <div className="lg:sticky lg:top-20 h-fit">
        <Card className="p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl font-bold">
                100€
                <span className="text-base font-normal text-muted-foreground">/nuit</span>
              </span>
            </div>
            <div className="space-y-3">
              {capacity > 0 && (
                <div className="flex items-center text-sm">
                  <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>Jusqu&apos;à {capacity} personnes</span>
                </div>
              )}
              <div className="flex items-center text-sm">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>Arrivée: {arrival} | Départ: {departure}</span>
              </div>
            </div>
          </div>
          <Button className="w-full" size="lg" onClick={() => setConfigOpen(true)}>
            Réserver
          </Button>
          <p className="text-xs text-center text-muted-foreground mt-4">
            Vous ne serez pas débité pour le moment
          </p>
        </Card>
      </div>

      <StayConfigModal
        open={configOpen}
        onOpenChange={setConfigOpen}
        slug={slug}
        capacity={capacity}
      />
    </>
  );
}
