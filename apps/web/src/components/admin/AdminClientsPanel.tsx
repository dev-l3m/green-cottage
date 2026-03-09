'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type BookingStatus = 'PENDING' | 'PAID' | 'CANCELLED' | 'REFUNDED';

export type AdminClientItem = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  addressLine1: string | null;
  city: string | null;
  postalCode: string | null;
  country: string | null;
  createdAt: string;
  bookingsCount: number;
  paidTotal: number;
  bookings: Array<{
    id: string;
    cottageTitle: string;
    startDate: string;
    endDate: string;
    total: number;
    status: BookingStatus;
    createdAt: string;
  }>;
  invoices: Array<{
    bookingId: string;
    invoiceNumber: string;
    total: number;
    issuedAt: string | null;
  }>;
  internalNotes: Array<{
    id: string;
    note: string;
    createdAt: string;
  }>;
  messages: Array<{
    id: string;
    message: string;
    status: string;
    createdAt: string;
    cottageTitle: string;
  }>;
};

const STATUS_LABEL: Record<BookingStatus, string> = {
  PENDING: 'En attente',
  PAID: 'Confirmée',
  CANCELLED: 'Annulée',
  REFUNDED: 'Paiement incomplet',
};

export default function AdminClientsPanel({
  initialClients,
}: {
  initialClients: AdminClientItem[];
}) {
  const [selectedClient, setSelectedClient] = useState<AdminClientItem | null>(null);

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-muted/50">
            <tr className="text-left">
              <th className="px-3 py-2 font-medium">Client</th>
              <th className="px-3 py-2 font-medium">Email</th>
              <th className="px-3 py-2 font-medium">Inscrit le</th>
              <th className="px-3 py-2 font-medium">Réservations</th>
              <th className="px-3 py-2 font-medium">CA confirmé</th>
              <th className="px-3 py-2 font-medium text-right">Détails</th>
            </tr>
          </thead>
          <tbody>
            {initialClients.map((client) => (
              <tr key={client.id} className="border-t">
                <td className="px-3 py-2">{client.name}</td>
                <td className="px-3 py-2">
                  <a href={`mailto:${client.email}`} className="text-gc-green underline underline-offset-2">
                    {client.email}
                  </a>
                </td>
                <td className="px-3 py-2">
                  {new Date(client.createdAt).toLocaleDateString('fr-FR')}
                </td>
                <td className="px-3 py-2">{client.bookingsCount}</td>
                <td className="px-3 py-2">{client.paidTotal.toFixed(0)}€</td>
                <td className="px-3 py-2 text-right">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedClient(client)}
                    aria-label={`Voir les détails de ${client.name}`}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={Boolean(selectedClient)} onOpenChange={(open) => !open && setSelectedClient(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Fiche client - {selectedClient?.name ?? 'Client'}</DialogTitle>
            <DialogDescription>
              Vue détaillée: coordonnées, réservations, factures, notes internes et messages.
            </DialogDescription>
          </DialogHeader>

          {selectedClient && (
            <div className="space-y-6">
              <section className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Coordonnées</h3>
                <p className="text-sm"><span className="font-medium">Nom:</span> {selectedClient.name}</p>
                <p className="text-sm">
                  <span className="font-medium">Email:</span>{' '}
                  <a href={`mailto:${selectedClient.email}`} className="text-gc-green underline underline-offset-2">
                    {selectedClient.email}
                  </a>
                </p>
                <p className="text-sm"><span className="font-medium">Téléphone:</span> {selectedClient.phone ?? 'N/A'}</p>
                <p className="text-sm">
                  <span className="font-medium">Adresse:</span>{' '}
                  {[selectedClient.addressLine1, selectedClient.postalCode, selectedClient.city, selectedClient.country]
                    .filter(Boolean)
                    .join(', ') || 'N/A'}
                </p>
              </section>

              <section className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Historique réservations</h3>
                {selectedClient.bookings.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucune réservation.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedClient.bookings.map((booking) => (
                      <div key={booking.id} className="text-sm border rounded-md p-3">
                        <p className="font-medium">{booking.cottageTitle}</p>
                        <p className="text-muted-foreground">
                          {new Date(booking.startDate).toLocaleDateString('fr-FR')} -{' '}
                          {new Date(booking.endDate).toLocaleDateString('fr-FR')}
                        </p>
                        <p>
                          {STATUS_LABEL[booking.status]} • {booking.total.toFixed(0)}€
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Factures</h3>
                {selectedClient.invoices.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucune facture.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedClient.invoices.map((invoice) => (
                      <div key={invoice.bookingId} className="flex items-center justify-between gap-2 border rounded-md p-3">
                        <div className="text-sm">
                          <p className="font-medium">{invoice.invoiceNumber}</p>
                          <p className="text-muted-foreground">
                            {invoice.issuedAt
                              ? new Date(invoice.issuedAt).toLocaleDateString('fr-FR')
                              : 'Date indisponible'}{' '}
                            • {invoice.total.toFixed(0)}€
                          </p>
                        </div>
                        <Link href={`/api/invoices/${invoice.bookingId}/download`}>
                          <Button type="button" size="sm" variant="outline">
                            PDF
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Notes internes</h3>
                {selectedClient.internalNotes.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucune note interne.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedClient.internalNotes.map((note) => (
                      <div key={note.id} className="text-sm border rounded-md p-3">
                        <p>{note.note}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(note.createdAt).toLocaleString('fr-FR')}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Messages</h3>
                {selectedClient.messages.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucun message client.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedClient.messages.map((msg) => (
                      <div key={msg.id} className="text-sm border rounded-md p-3">
                        <p className="font-medium">{msg.cottageTitle}</p>
                        <p>{msg.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(msg.createdAt).toLocaleString('fr-FR')} • {msg.status}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
