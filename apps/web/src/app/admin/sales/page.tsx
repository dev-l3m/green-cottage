export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';

type MonthlyPoint = {
  label: string;
  revenue: number;
  bookings: number;
};

async function getSalesData() {
  const bookings = await prisma.booking.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      cottage: {
        select: {
          title: true,
        },
      },
    },
  });

  const totalBookings = bookings.length;
  const paidBookings = bookings.filter((b) => b.status === 'PAID');
  const pendingBookings = bookings.filter((b) => b.status === 'PENDING');
  const cancelledBookings = bookings.filter((b) => b.status === 'CANCELLED');
  const refundedBookings = bookings.filter((b) => b.status === 'REFUNDED');

  const revenue = paidBookings.reduce((sum, booking) => sum + booking.total, 0);
  const averageTicket = paidBookings.length > 0 ? revenue / paidBookings.length : 0;

  const monthFormatter = new Intl.DateTimeFormat('fr-FR', { month: 'short', year: '2-digit' });
  const monthlyMap = new Map<string, MonthlyPoint>();
  const now = new Date();
  for (let i = 5; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    monthlyMap.set(key, { label: monthFormatter.format(d), revenue: 0, bookings: 0 });
  }

  for (const booking of paidBookings) {
    const d = booking.createdAt;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const point = monthlyMap.get(key);
    if (!point) continue;
    point.revenue += booking.total;
    point.bookings += 1;
  }

  const monthly = Array.from(monthlyMap.values());
  const maxMonthlyRevenue = monthly.reduce((max, item) => Math.max(max, item.revenue), 0);

  const byCottage = new Map<string, { title: string; revenue: number; bookings: number }>();
  for (const booking of paidBookings) {
    const key = booking.cottageId;
    const current = byCottage.get(key) ?? {
      title: booking.cottage.title,
      revenue: 0,
      bookings: 0,
    };
    current.revenue += booking.total;
    current.bookings += 1;
    byCottage.set(key, current);
  }
  const topCottages = Array.from(byCottage.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  return {
    totalBookings,
    revenue,
    averageTicket,
    paidBookings: paidBookings.length,
    pendingBookings: pendingBookings.length,
    cancelledBookings: cancelledBookings.length,
    refundedBookings: refundedBookings.length,
    monthly,
    maxMonthlyRevenue,
    topCottages,
  };
}

export default async function AdminSalesPage() {
  const data = await getSalesData();

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold mb-4">Suivi des ventes</h1>
      <p className="text-muted-foreground mb-6">
        Vision globale du chiffre d&apos;affaires, des statuts de réservation et des meilleures performances.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-muted-foreground">CA confirmé</p>
          <p className="text-2xl font-bold">{data.revenue.toFixed(0)}€</p>
        </div>
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-muted-foreground">Panier moyen</p>
          <p className="text-2xl font-bold">{data.averageTicket.toFixed(0)}€</p>
        </div>
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-muted-foreground">Total réservations</p>
          <p className="text-2xl font-bold">{data.totalBookings}</p>
        </div>
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-muted-foreground">Confirmées</p>
          <p className="text-2xl font-bold">{data.paidBookings}</p>
        </div>
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-muted-foreground">En attente</p>
          <p className="text-2xl font-bold">{data.pendingBookings}</p>
        </div>
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-muted-foreground">Annulées / remboursées</p>
          <p className="text-2xl font-bold">
            {data.cancelledBookings + data.refundedBookings}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="p-5 border rounded-lg">
          <h2 className="font-heading text-xl font-semibold mb-4">Tendance mensuelle (6 derniers mois)</h2>
          <div className="space-y-3">
            {data.monthly.map((point) => {
              const width =
                data.maxMonthlyRevenue > 0 ? (point.revenue / data.maxMonthlyRevenue) * 100 : 0;
              return (
                <div key={point.label}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>{point.label}</span>
                    <span className="text-muted-foreground">
                      {point.revenue.toFixed(0)}€ ({point.bookings} résa.)
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${width}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-5 border rounded-lg">
          <h2 className="font-heading text-xl font-semibold mb-4">Top cottages (CA confirmé)</h2>
          {data.topCottages.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune réservation confirmée pour le moment.</p>
          ) : (
            <div className="space-y-3">
              {data.topCottages.map((item) => (
                <div key={item.title} className="flex items-center justify-between border rounded-md p-3">
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.bookings} réservation(s)</p>
                  </div>
                  <p className="font-semibold">{item.revenue.toFixed(0)}€</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
