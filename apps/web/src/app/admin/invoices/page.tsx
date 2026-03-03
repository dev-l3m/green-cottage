export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import AdminInvoicesPanel, { type AdminInvoiceItem } from '@/components/admin/AdminInvoicesPanel';

async function getInvoicesData() {
  const bookings = await prisma.booking.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: {
      cottage: {
        select: {
          title: true,
          slug: true,
        },
      },
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      invoice: {
        select: {
          id: true,
          invoiceNumber: true,
          issuedAt: true,
        },
      },
    },
  });

  const generatedCount = bookings.filter((b) => b.invoice).length;
  const missingCount = bookings.filter((b) => b.status === 'PAID' && !b.invoice).length;
  const paidCount = bookings.filter((b) => b.status === 'PAID').length;

  return { bookings, generatedCount, missingCount, paidCount };
}

export default async function AdminInvoicesPage() {
  const { bookings, generatedCount, missingCount, paidCount } = await getInvoicesData();
  const initialInvoices: AdminInvoiceItem[] = bookings.map((booking) => ({
    bookingId: booking.id,
    bookingStatus: booking.status,
    total: booking.total,
    createdAt: booking.createdAt.toISOString(),
    cottageTitle: booking.cottage.title,
    cottageSlug: booking.cottage.slug,
    userName: booking.user.name,
    userEmail: booking.user.email,
    invoiceId: booking.invoice?.id ?? null,
    invoiceNumber: booking.invoice?.invoiceNumber ?? null,
    issuedAt: booking.invoice?.issuedAt?.toISOString() ?? null,
  }));

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold mb-4">Factures</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-muted-foreground">Réservations payées</p>
          <p className="text-2xl font-bold">{paidCount}</p>
        </div>
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-muted-foreground">Factures générées</p>
          <p className="text-2xl font-bold">{generatedCount}</p>
        </div>
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-muted-foreground">Factures manquantes</p>
          <p className="text-2xl font-bold">{missingCount}</p>
        </div>
      </div>

      <AdminInvoicesPanel initialInvoices={initialInvoices} />
    </div>
  );
}
