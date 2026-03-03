export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import AdminBookingsPanel, { type AdminBookingItem } from '@/components/admin/AdminBookingsPanel';

async function getBookingsData() {
  const [bookings, pending, paid, cancelled, refunded] = await Promise.all([
    prisma.booking.findMany({
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
            invoiceNumber: true,
          },
        },
      },
    }),
    prisma.booking.count({ where: { status: 'PENDING' } }),
    prisma.booking.count({ where: { status: 'PAID' } }),
    prisma.booking.count({ where: { status: 'CANCELLED' } }),
    prisma.booking.count({ where: { status: 'REFUNDED' } }),
  ]);

  return { bookings, pending, paid, cancelled, refunded };
}

export default async function AdminBookingsPage() {
  const { bookings, pending, paid, cancelled, refunded } = await getBookingsData();
  const initialBookings: AdminBookingItem[] = bookings.map((booking) => ({
    id: booking.id,
    status: booking.status,
    startDate: booking.startDate.toISOString(),
    endDate: booking.endDate.toISOString(),
    guests: booking.guests,
    total: booking.total,
    createdAt: booking.createdAt.toISOString(),
    cottageTitle: booking.cottage.title,
    cottageSlug: booking.cottage.slug,
    userName: booking.user.name,
    userEmail: booking.user.email,
    invoiceNumber: booking.invoice?.invoiceNumber ?? null,
  }));

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold mb-4">Réservations</h1>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="text-2xl font-bold">{initialBookings.length}</p>
        </div>
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-muted-foreground">En attente</p>
          <p className="text-2xl font-bold">{pending}</p>
        </div>
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-muted-foreground">Payées</p>
          <p className="text-2xl font-bold">{paid}</p>
        </div>
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-muted-foreground">Annulées</p>
          <p className="text-2xl font-bold">{cancelled}</p>
        </div>
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-muted-foreground">Remboursées</p>
          <p className="text-2xl font-bold">{refunded}</p>
        </div>
      </div>

      <AdminBookingsPanel initialBookings={initialBookings} />
    </div>
  );
}
