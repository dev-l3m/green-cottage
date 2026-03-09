export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import AdminClientsPanel, { type AdminClientItem } from '@/components/admin/AdminClientsPanel';

async function getClientsData() {
  const users = await prisma.user.findMany({
    where: { role: 'CUSTOMER' },
    orderBy: { createdAt: 'desc' },
    include: {
      bookings: {
        select: {
          id: true,
          total: true,
          status: true,
          createdAt: true,
        },
      },
    },
    take: 200,
  });

  const clients = users.map((user) => {
    const paidTotal = user.bookings
      .filter((b) => b.status === 'PAID')
      .reduce((sum, booking) => sum + booking.total, 0);
    return {
      id: user.id,
      name: user.name ?? 'Client',
      email: user.email,
      createdAt: user.createdAt,
      bookingsCount: user.bookings.length,
      paidTotal,
    };
  });

  return clients;
}

export default async function AdminClientsPage() {
  const clients = await getClientsData();
  const initialClients: AdminClientItem[] = clients.map((client) => ({
    id: client.id,
    name: client.name,
    email: client.email,
    createdAt: client.createdAt.toISOString(),
    bookingsCount: client.bookingsCount,
    paidTotal: client.paidTotal,
  }));

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold mb-2">Clients</h1>
      <p className="text-muted-foreground mb-6">
        Interface de gestion client: réservations et chiffre d&apos;affaires par client.
      </p>

      {initialClients.length === 0 ? (
        <p className="text-muted-foreground">Aucun client pour le moment.</p>
      ) : (
        <AdminClientsPanel initialClients={initialClients} />
      )}
    </div>
  );
}
