import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

async function getDashboardStats() {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const endOfYear = new Date(now.getFullYear() + 1, 0, 1);

  const monthFormatter = new Intl.DateTimeFormat('fr-FR', { month: 'short', year: '2-digit' });
  const revenueByMonthMap = new Map<string, { label: string; revenue: number; bookings: number }>();
  const bookingsByMonthMap = new Map<string, { label: string; value: number }>();
  for (let i = 11; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    revenueByMonthMap.set(key, { label: monthFormatter.format(d), revenue: 0, bookings: 0 });
    bookingsByMonthMap.set(key, { label: monthFormatter.format(d), value: 0 });
  }

  const [
    activeCottages,
    bookingsTotal,
    bookingsToday,
    bookingsMonth,
    pendingPayments,
    arrivalsToday,
    departuresToday,
    clientsCount,
    messagesClients,
    paidMonthRevenue,
    paidYearRevenue,
    paidBookingsLastYear,
    bookingsLastYear,
    occupancyBookings,
    occupancyByCottageBookings,
  ] = await Promise.all([
    prisma.cottage.count({ where: { isActive: true } }),
    prisma.booking.count(),
    prisma.booking.count({
      where: {
        createdAt: { gte: startOfToday, lt: endOfToday },
      },
    }),
    prisma.booking.count({
      where: {
        createdAt: { gte: startOfMonth, lt: endOfMonth },
      },
    }),
    prisma.booking.count({ where: { status: 'PENDING' } }),
    prisma.booking.count({
      where: {
        startDate: { gte: startOfToday, lt: endOfToday },
        status: { notIn: ['CANCELLED', 'REFUNDED'] },
      },
    }),
    prisma.booking.count({
      where: {
        endDate: { gte: startOfToday, lt: endOfToday },
        status: { notIn: ['CANCELLED', 'REFUNDED'] },
      },
    }),
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.publicReview.count({ where: { status: 'PENDING' } }),
    prisma.booking.aggregate({
      where: {
        status: 'PAID',
        createdAt: { gte: startOfMonth, lt: endOfMonth },
      },
      _sum: { total: true },
    }),
    prisma.booking.aggregate({
      where: {
        status: 'PAID',
        createdAt: { gte: startOfYear, lt: endOfYear },
      },
      _sum: { total: true },
    }),
    prisma.booking.findMany({
      where: {
        status: 'PAID',
        createdAt: { gte: new Date(now.getFullYear(), now.getMonth() - 11, 1), lt: endOfMonth },
      },
      select: { createdAt: true, total: true },
    }),
    prisma.booking.findMany({
      where: {
        createdAt: { gte: new Date(now.getFullYear(), now.getMonth() - 11, 1), lt: endOfMonth },
      },
      select: { createdAt: true },
    }),
    prisma.booking.findMany({
      where: {
        status: { notIn: ['CANCELLED', 'REFUNDED'] },
        startDate: { lt: endOfMonth },
        endDate: { gt: startOfMonth },
      },
      select: { startDate: true, endDate: true },
    }),
    prisma.booking.findMany({
      where: {
        status: { notIn: ['CANCELLED', 'REFUNDED'] },
        startDate: { lt: endOfMonth },
        endDate: { gt: startOfMonth },
      },
      select: {
        startDate: true,
        endDate: true,
        cottage: { select: { title: true } },
      },
    }),
  ]);

  for (const b of paidBookingsLastYear) {
    const key = `${b.createdAt.getFullYear()}-${String(b.createdAt.getMonth() + 1).padStart(2, '0')}`;
    const point = revenueByMonthMap.get(key);
    if (!point) continue;
    point.revenue += b.total;
    point.bookings += 1;
  }
  for (const b of bookingsLastYear) {
    const key = `${b.createdAt.getFullYear()}-${String(b.createdAt.getMonth() + 1).padStart(2, '0')}`;
    const point = bookingsByMonthMap.get(key);
    if (!point) continue;
    point.value += 1;
  }

  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const monthCapacityNights = Math.max(1, activeCottages * daysInMonth);
  const bookedNights = occupancyBookings.reduce((sum, booking) => {
    const overlapStart = Math.max(booking.startDate.getTime(), startOfMonth.getTime());
    const overlapEnd = Math.min(booking.endDate.getTime(), endOfMonth.getTime());
    const overlapDays = Math.max(0, Math.ceil((overlapEnd - overlapStart) / (1000 * 60 * 60 * 24)));
    return sum + overlapDays;
  }, 0);
  const occupancyRate = Math.min(100, (bookedNights / monthCapacityNights) * 100);

  const occupancyByCottageMap = new Map<string, { title: string; nights: number }>();
  for (const booking of occupancyByCottageBookings) {
    const overlapStart = Math.max(booking.startDate.getTime(), startOfMonth.getTime());
    const overlapEnd = Math.min(booking.endDate.getTime(), endOfMonth.getTime());
    const overlapDays = Math.max(0, Math.ceil((overlapEnd - overlapStart) / (1000 * 60 * 60 * 24)));
    const title = booking.cottage.title;
    const current = occupancyByCottageMap.get(title) ?? { title, nights: 0 };
    current.nights += overlapDays;
    occupancyByCottageMap.set(title, current);
  }

  const occupationByCottage = Array.from(occupancyByCottageMap.values())
    .map((item) => ({
      title: item.title,
      occupancy: Math.min(100, (item.nights / Math.max(1, daysInMonth)) * 100),
    }))
    .sort((a, b) => b.occupancy - a.occupancy);

  const revenueByMonth = Array.from(revenueByMonthMap.values());
  const bookingsByMonth = Array.from(bookingsByMonthMap.values());
  const maxRevenueMonth = revenueByMonth.reduce((max, m) => Math.max(max, m.revenue), 0);
  const maxBookingsMonth = bookingsByMonth.reduce((max, m) => Math.max(max, m.value), 0);
  const maxOccupationByCottage = occupationByCottage.reduce((max, c) => Math.max(max, c.occupancy), 0);

  return {
    bookingsTotal,
    bookingsToday,
    bookingsMonth,
    revenueMonth: paidMonthRevenue._sum.total ?? 0,
    revenueYear: paidYearRevenue._sum.total ?? 0,
    occupancyRate,
    clientsCount,
    pendingPayments,
    arrivalsToday,
    departuresToday,
    messagesClients,
    revenueByMonth,
    bookingsByMonth,
    occupationByCottage,
    maxRevenueMonth,
    maxBookingsMonth,
    maxOccupationByCottage,
  };
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats();

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold mb-8">Tableau de bord</h1>

      <h2 className="font-heading text-2xl font-semibold mb-4">Statistiques clés</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-10">
        <div className="p-6 border rounded-lg">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Réservations aujourd&apos;hui</h3>
          <p className="text-3xl font-bold">{stats.bookingsToday}</p>
        </div>
        <div className="p-6 border rounded-lg">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Réservations ce mois</h3>
          <p className="text-3xl font-bold">{stats.bookingsMonth}</p>
        </div>
        <div className="p-6 border rounded-lg">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Revenus du mois</h3>
          <p className="text-3xl font-bold">{stats.revenueMonth.toFixed(0)}€</p>
        </div>
        <div className="p-6 border rounded-lg">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Revenus annuels</h3>
          <p className="text-3xl font-bold">{stats.revenueYear.toFixed(0)}€</p>
        </div>
        <div className="p-6 border rounded-lg">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Taux d&apos;occupation</h3>
          <p className="text-3xl font-bold">{stats.occupancyRate.toFixed(1)}%</p>
        </div>
        <div className="p-6 border rounded-lg">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Nombre de clients</h3>
          <p className="text-3xl font-bold">{stats.clientsCount}</p>
        </div>
      </div>

      <h2 className="font-heading text-2xl font-semibold mb-4">Graphiques utiles</h2>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-10">
        <div className="p-5 border rounded-lg">
          <h3 className="font-semibold mb-4">📈 Revenus par mois</h3>
          <div className="space-y-2">
            {stats.revenueByMonth.map((point) => {
              const width =
                stats.maxRevenueMonth > 0 ? (point.revenue / stats.maxRevenueMonth) * 100 : 0;
              return (
                <div key={`rev-${point.label}`}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span>{point.label}</span>
                    <span className="text-muted-foreground">{point.revenue.toFixed(0)}€</span>
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
          <h3 className="font-semibold mb-4">📅 Réservations par période</h3>
          <div className="space-y-2">
            {stats.bookingsByMonth.map((point) => {
              const width =
                stats.maxBookingsMonth > 0 ? (point.value / stats.maxBookingsMonth) * 100 : 0;
              return (
                <div key={`book-${point.label}`}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span>{point.label}</span>
                    <span className="text-muted-foreground">{point.value} résa.</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gc-green rounded-full" style={{ width: `${width}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-5 border rounded-lg">
          <h3 className="font-semibold mb-4">🏡 Occupation des gîtes</h3>
          {stats.occupationByCottage.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune occupation enregistrée ce mois.</p>
          ) : (
            <div className="space-y-2">
              {stats.occupationByCottage.map((item) => {
                const width =
                  stats.maxOccupationByCottage > 0
                    ? (item.occupancy / stats.maxOccupationByCottage) * 100
                    : 0;
                return (
                  <div key={`occ-${item.title}`}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span>{item.title}</span>
                      <span className="text-muted-foreground">{item.occupancy.toFixed(0)}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${width}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <h2 className="font-heading text-2xl font-semibold mb-4">Alertes importantes</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-10">
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-muted-foreground">Paiements en attente</p>
          <p className="text-2xl font-bold">{stats.pendingPayments}</p>
        </div>
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-muted-foreground">Arrivées aujourd&apos;hui</p>
          <p className="text-2xl font-bold">{stats.arrivalsToday}</p>
        </div>
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-muted-foreground">Départs aujourd&apos;hui</p>
          <p className="text-2xl font-bold">{stats.departuresToday}</p>
        </div>
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-muted-foreground">Messages clients</p>
          <p className="text-2xl font-bold">{stats.messagesClients}</p>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="font-heading text-2xl font-semibold">Actions rapides</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link href="/admin/cottages/new" className="p-6 border rounded-lg hover:bg-muted transition-colors">
            <h3 className="font-semibold mb-2">Ajouter un cottage</h3>
            <p className="text-sm text-muted-foreground">Créer un nouveau cottage</p>
          </Link>
          <Link href="/admin/bookings" className="p-6 border rounded-lg hover:bg-muted transition-colors">
            <h3 className="font-semibold mb-2">Voir les réservations</h3>
            <p className="text-sm text-muted-foreground">Gérer les réservations</p>
          </Link>
          <Link href="/admin/invoices" className="p-6 border rounded-lg hover:bg-muted transition-colors">
            <h3 className="font-semibold mb-2">Gérer les factures</h3>
            <p className="text-sm text-muted-foreground">Suivre paiements et facturation</p>
          </Link>
          <Link href="/admin/reviews" className="p-6 border rounded-lg hover:bg-muted transition-colors">
            <h3 className="font-semibold mb-2">Modérer les avis</h3>
            <p className="text-sm text-muted-foreground">Approuver ou rejeter les avis</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
