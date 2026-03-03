'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

type BookingStatus = 'PENDING' | 'PAID' | 'CANCELLED' | 'REFUNDED';

export type AdminInvoiceItem = {
  bookingId: string;
  bookingStatus: BookingStatus;
  total: number;
  createdAt: string;
  cottageTitle: string;
  cottageSlug: string;
  userName: string | null;
  userEmail: string;
  invoiceId: string | null;
  invoiceNumber: string | null;
  issuedAt: string | null;
};

type InvoiceFilter = 'ALL' | 'GENERATED' | 'MISSING';

export default function AdminInvoicesPanel({
  initialInvoices,
}: {
  initialInvoices: AdminInvoiceItem[];
}) {
  const [invoices, setInvoices] = useState(initialInvoices);
  const [filter, setFilter] = useState<InvoiceFilter>('ALL');
  const [pendingBookingId, setPendingBookingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (filter === 'GENERATED') return invoices.filter((i) => !!i.invoiceId);
    if (filter === 'MISSING') {
      return invoices.filter((i) => i.bookingStatus === 'PAID' && !i.invoiceId);
    }
    return invoices;
  }, [invoices, filter]);

  const generateInvoice = async (bookingId: string) => {
    setPendingBookingId(bookingId);
    try {
      const res = await fetch(`/api/admin/invoices/${bookingId}/generate`, {
        method: 'POST',
      });
      if (!res.ok) {
        throw new Error('Échec de la génération de la facture');
      }
      const data = (await res.json()) as {
        invoiceId: string;
        invoiceNumber: string;
        issuedAt: string;
      };

      setInvoices((prev) =>
        prev.map((item) =>
          item.bookingId === bookingId
            ? {
                ...item,
                invoiceId: data.invoiceId,
                invoiceNumber: data.invoiceNumber,
                issuedAt: data.issuedAt,
              }
            : item
        )
      );
    } catch (error) {
      console.error(error);
    } finally {
      setPendingBookingId(null);
    }
  };

  if (invoices.length === 0) {
    return <p className="text-muted-foreground">Aucune réservation disponible.</p>;
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        <Button
          type="button"
          size="sm"
          variant={filter === 'ALL' ? 'default' : 'outline'}
          onClick={() => setFilter('ALL')}
        >
          Toutes
        </Button>
        <Button
          type="button"
          size="sm"
          variant={filter === 'GENERATED' ? 'default' : 'outline'}
          onClick={() => setFilter('GENERATED')}
        >
          Générées
        </Button>
        <Button
          type="button"
          size="sm"
          variant={filter === 'MISSING' ? 'default' : 'outline'}
          onClick={() => setFilter('MISSING')}
        >
          Manquantes
        </Button>
      </div>

      <div className="space-y-3">
        {filtered.map((item) => {
          const canGenerate = item.bookingStatus === 'PAID' && !item.invoiceId;
          const isPending = pendingBookingId === item.bookingId;

          return (
            <div key={item.bookingId} className="p-4 border rounded-lg">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div>
                  <p className="font-semibold">{item.cottageTitle}</p>
                  <p className="text-xs text-muted-foreground">/{item.cottageSlug}</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Réservation du {new Date(item.createdAt).toLocaleDateString('fr-FR')}
                </p>
              </div>

              <p className="text-sm mb-1">
                <span className="font-medium">Client :</span> {item.userName ?? 'Client'} ({item.userEmail})
              </p>
              <p className="text-sm mb-1">
                <span className="font-medium">Statut réservation :</span> {item.bookingStatus}
              </p>
              <p className="text-sm mb-3">
                <span className="font-medium">Montant total :</span> {item.total.toFixed(0)}€
              </p>

              {item.invoiceId ? (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Facture {item.invoiceNumber} -{' '}
                    {item.issuedAt
                      ? new Date(item.issuedAt).toLocaleDateString('fr-FR')
                      : 'date inconnue'}
                  </span>
                  <Link href={`/api/invoices/${item.bookingId}/download`}>
                    <Button type="button" size="sm" variant="outline">
                      Télécharger
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {canGenerate
                      ? 'Facture manquante pour une réservation payée'
                      : 'Aucune facture (réservation non payée)'}
                  </span>
                  {canGenerate && (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => generateInvoice(item.bookingId)}
                      disabled={isPending}
                    >
                      {isPending ? 'Génération...' : 'Générer la facture'}
                    </Button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
