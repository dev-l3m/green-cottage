export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/button';

const VAT_RATE = 0.2;

function formatReservationNumber(rawId: string) {
  const numericId = Number.parseInt(String(rawId).replace(/\D/g, ''), 10);
  const baseNumber = Number.isNaN(numericId) ? 1000 : 1000 + numericId;
  return `GC-${baseNumber}`;
}

async function getInvoiceHistory() {
  const rows = await prisma.invoice.findMany({
    orderBy: { issuedAt: 'desc' },
    include: {
      booking: {
        select: {
          id: true,
          total: true,
          createdAt: true,
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          cottage: {
            select: {
              title: true,
            },
          },
        },
      },
    },
    take: 300,
  });

  return rows.map((row) => {
    const ttc = row.booking.total;
    const ht = ttc / (1 + VAT_RATE);
    const tva = ttc - ht;
    return {
      id: row.id,
      bookingId: row.booking.id,
      invoiceNumber: row.invoiceNumber,
      issuedAt: row.issuedAt,
      reservationDate: row.booking.createdAt,
      clientName: row.booking.user.name ?? 'Client',
      clientEmail: row.booking.user.email,
      cottageTitle: row.booking.cottage.title,
      ht,
      tva,
      ttc,
    };
  });
}

export default async function AdminInvoicesHistoryPage() {
  const history = await getInvoiceHistory();

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-heading text-3xl font-bold">Historique des factures</h1>
          <p className="text-muted-foreground">Suivi complet des factures émises (TVA, HT, TTC).</p>
        </div>
        <Link href="/admin/invoices">
          <Button variant="outline">Retour facturation</Button>
        </Link>
      </div>

      {history.length === 0 ? (
        <p className="text-muted-foreground">Aucune facture générée pour le moment.</p>
      ) : (
        <div className="overflow-x-auto border rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="px-3 py-2 font-medium">Facture</th>
                <th className="px-3 py-2 font-medium">Réservation</th>
                <th className="px-3 py-2 font-medium">Client</th>
                <th className="px-3 py-2 font-medium">Gîte</th>
                <th className="px-3 py-2 font-medium">HT</th>
                <th className="px-3 py-2 font-medium">TVA (20%)</th>
                <th className="px-3 py-2 font-medium">TTC</th>
                <th className="px-3 py-2 font-medium">Date émission</th>
                <th className="px-3 py-2 font-medium">PDF</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="px-3 py-2 font-medium">{item.invoiceNumber}</td>
                  <td className="px-3 py-2">{formatReservationNumber(item.bookingId)}</td>
                  <td className="px-3 py-2">
                    <div>{item.clientName}</div>
                    <a href={`mailto:${item.clientEmail}`} className="text-gc-green underline underline-offset-2">
                      {item.clientEmail}
                    </a>
                  </td>
                  <td className="px-3 py-2">{item.cottageTitle}</td>
                  <td className="px-3 py-2">{item.ht.toFixed(2)}€</td>
                  <td className="px-3 py-2">{item.tva.toFixed(2)}€</td>
                  <td className="px-3 py-2 font-semibold">{item.ttc.toFixed(2)}€</td>
                  <td className="px-3 py-2">{new Date(item.issuedAt).toLocaleDateString('fr-FR')}</td>
                  <td className="px-3 py-2">
                    <Link href={`/api/invoices/${item.bookingId}/download`}>
                      <Button size="sm" variant="outline">Télécharger</Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
