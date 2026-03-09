export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import AdminClientsPanel, { type AdminClientItem } from '@/components/admin/AdminClientsPanel';

async function getClientsData() {
  const users = await prisma.user.findMany({
    where: { role: 'CUSTOMER' },
    orderBy: { createdAt: 'desc' },
    include: {
      reviews: {
        select: {
          id: true,
          comment: true,
          status: true,
          createdAt: true,
          cottage: {
            select: {
              title: true,
            },
          },
        },
      },
      bookings: {
        select: {
          id: true,
          startDate: true,
          endDate: true,
          total: true,
          status: true,
          createdAt: true,
          cottage: {
            select: {
              title: true,
            },
          },
          invoice: {
            select: {
              invoiceNumber: true,
              issuedAt: true,
            },
          },
          history: {
            where: {
              note: {
                not: null,
              },
            },
            select: {
              id: true,
              note: true,
              createdAt: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
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
      phone: user.phone,
      addressLine1: user.addressLine1,
      city: user.city,
      postalCode: user.postalCode,
      country: user.country,
      createdAt: user.createdAt,
      bookingsCount: user.bookings.length,
      paidTotal,
      bookings: user.bookings,
      invoices: user.bookings.filter((b) => b.invoice).map((b) => ({
        bookingId: b.id,
        total: b.total,
        invoiceNumber: b.invoice?.invoiceNumber ?? null,
        issuedAt: b.invoice?.issuedAt ?? null,
      })),
      internalNotes: user.bookings
        .flatMap((b) => b.history)
        .filter((h) => Boolean(h.note))
        .map((h) => ({
          id: h.id,
          note: h.note ?? '',
          createdAt: h.createdAt,
        })),
      messages: user.reviews
        .filter((r) => Boolean(r.comment))
        .map((r) => ({
          id: r.id,
          message: r.comment ?? '',
          status: r.status,
          createdAt: r.createdAt,
          cottageTitle: r.cottage.title,
        })),
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
    phone: client.phone ?? null,
    addressLine1: client.addressLine1 ?? null,
    city: client.city ?? null,
    postalCode: client.postalCode ?? null,
    country: client.country ?? null,
    createdAt: client.createdAt.toISOString(),
    bookingsCount: client.bookingsCount,
    paidTotal: client.paidTotal,
    bookings: client.bookings.map((b) => ({
      id: b.id,
      cottageTitle: b.cottage.title,
      startDate: b.startDate.toISOString(),
      endDate: b.endDate.toISOString(),
      total: b.total,
      status: b.status,
      createdAt: b.createdAt.toISOString(),
    })),
    invoices: client.invoices.map((i) => ({
      bookingId: i.bookingId,
      invoiceNumber: i.invoiceNumber ?? 'N/A',
      total: i.total,
      issuedAt: i.issuedAt ? i.issuedAt.toISOString() : null,
    })),
    internalNotes: client.internalNotes.map((n) => ({
      id: n.id,
      note: n.note,
      createdAt: n.createdAt.toISOString(),
    })),
    messages: client.messages.map((m) => ({
      id: m.id,
      message: m.message,
      status: m.status,
      createdAt: m.createdAt.toISOString(),
      cottageTitle: m.cottageTitle,
    })),
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
