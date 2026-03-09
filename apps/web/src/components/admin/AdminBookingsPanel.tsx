'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

type BookingStatus = 'PENDING' | 'PAID' | 'CANCELLED' | 'REFUNDED';

type BookingHistoryItem = {
  id: string;
  previousStatus: BookingStatus | null;
  newStatus: BookingStatus;
  note: string | null;
  createdAt: string;
  changedByName: string | null;
  changedByEmail: string | null;
};

export type AdminBookingItem = {
  id: string;
  status: BookingStatus;
  startDate: string;
  endDate: string;
  guests: number;
  total: number;
  createdAt: string;
  cottageTitle: string;
  cottageSlug: string;
  userName: string | null;
  userEmail: string;
  invoiceNumber: string | null;
  history: BookingHistoryItem[];
};

const STATUS_LABEL: Record<BookingStatus, string> = {
  PENDING: 'En attente',
  PAID: 'Confirmée',
  CANCELLED: 'Annulée',
  REFUNDED: 'Remboursée',
};

const FILTERS: Array<{ key: 'ALL' | BookingStatus; label: string }> = [
  { key: 'ALL', label: 'Toutes' },
  { key: 'PENDING', label: 'En attente' },
  { key: 'PAID', label: 'Confirmées' },
  { key: 'CANCELLED', label: 'Annulées' },
  { key: 'REFUNDED', label: 'Remboursées' },
];

export default function AdminBookingsPanel({
  initialBookings,
}: {
  initialBookings: AdminBookingItem[];
}) {
  const [bookings, setBookings] = useState(initialBookings);
  const [activeFilter, setActiveFilter] = useState<'ALL' | BookingStatus>('ALL');
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [statusNotes, setStatusNotes] = useState<Record<string, string>>({});

  const filtered = useMemo(() => {
    if (activeFilter === 'ALL') return bookings;
    return bookings.filter((b) => b.status === activeFilter);
  }, [bookings, activeFilter]);

  const updateStatus = async (bookingId: string, nextStatus: BookingStatus) => {
    setPendingId(bookingId);
    try {
      const note = statusNotes[bookingId]?.trim();
      const res = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: nextStatus,
          note: note || undefined,
        }),
      });
      if (!res.ok) throw new Error('Failed to update booking status');

      const nowIso = new Date().toISOString();
      setBookings((prev) =>
        prev.map((b) => {
          if (b.id !== bookingId) return b;
          const historyEntry: BookingHistoryItem = {
            id: `${bookingId}-${nowIso}`,
            previousStatus: b.status,
            newStatus: nextStatus,
            note: note || null,
            createdAt: nowIso,
            changedByName: 'Admin',
            changedByEmail: null,
          };
          return {
            ...b,
            status: nextStatus,
            history: [historyEntry, ...b.history],
          };
        })
      );
      setStatusNotes((prev) => ({ ...prev, [bookingId]: '' }));
    } catch (error) {
      console.error(error);
    } finally {
      setPendingId(null);
    }
  };

  if (bookings.length === 0) {
    return <p className="text-muted-foreground">Aucune réservation pour le moment.</p>;
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        {FILTERS.map((filter) => (
          <Button
            key={filter.key}
            type="button"
            size="sm"
            variant={activeFilter === filter.key ? 'default' : 'outline'}
            onClick={() => setActiveFilter(filter.key)}
          >
            {filter.label}
          </Button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((booking) => {
          const isPending = pendingId === booking.id;
          return (
            <div key={booking.id} className="p-4 border rounded-lg">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div>
                  <p className="font-semibold">{booking.cottageTitle}</p>
                  <p className="text-xs text-muted-foreground">/{booking.cottageSlug}</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Créée le {new Date(booking.createdAt).toLocaleDateString('fr-FR')}
                </p>
              </div>

              <p className="text-sm mb-1">
                <span className="font-medium">Client :</span>{' '}
                {booking.userName ?? 'Client'} ({booking.userEmail})
              </p>
              <p className="text-sm mb-1">
                <span className="font-medium">Séjour :</span>{' '}
                {new Date(booking.startDate).toLocaleDateString('fr-FR')} -{' '}
                {new Date(booking.endDate).toLocaleDateString('fr-FR')} ({booking.guests} pers.)
              </p>
              <p className="text-sm mb-1">
                <span className="font-medium">Total :</span> {booking.total.toFixed(0)}€
              </p>
              <p className="text-sm mb-3">
                <span className="font-medium">Statut :</span> {STATUS_LABEL[booking.status]}
              </p>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  className="h-9 rounded-md border bg-background px-3 text-sm"
                  value={booking.status}
                  onChange={(e) =>
                    updateStatus(booking.id, e.target.value as BookingStatus)
                  }
                  disabled={isPending}
                >
                  <option value="PENDING">En attente</option>
                  <option value="PAID">Confirmée</option>
                  <option value="CANCELLED">Annulée</option>
                  <option value="REFUNDED">Remboursée</option>
                </select>
                <input
                  type="text"
                  value={statusNotes[booking.id] ?? ''}
                  onChange={(e) =>
                    setStatusNotes((prev) => ({
                      ...prev,
                      [booking.id]: e.target.value,
                    }))
                  }
                  placeholder="Note interne (optionnelle)"
                  className="h-9 rounded-md border bg-background px-3 text-sm min-w-[240px]"
                  disabled={isPending}
                />

                {booking.invoiceNumber && (
                  <Link href={`/api/invoices/${booking.id}/download`}>
                    <Button type="button" size="sm" variant="outline">
                      Facture {booking.invoiceNumber}
                    </Button>
                  </Link>
                )}
              </div>

              <div className="mt-4 border-t pt-3">
                <p className="text-sm font-medium mb-2">Historique</p>
                {booking.history.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Aucun événement enregistré.</p>
                ) : (
                  <div className="space-y-2">
                    {booking.history.map((event) => (
                      <div key={event.id} className="text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">
                          {new Date(event.createdAt).toLocaleString('fr-FR')}
                        </span>{' '}
                        - {event.previousStatus ? STATUS_LABEL[event.previousStatus] : 'Création'} →{' '}
                        {STATUS_LABEL[event.newStatus]}
                        {event.changedByName || event.changedByEmail ? (
                          <> (par {event.changedByName ?? event.changedByEmail})</>
                        ) : null}
                        {event.note ? <> - {event.note}</> : null}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
