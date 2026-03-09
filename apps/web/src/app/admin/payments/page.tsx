export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import AdminPaymentsPanel, { type AdminPaymentItem } from '@/components/admin/AdminPaymentsPanel';

function inferMode(booking: {
  stripePaymentIntentId: string | null;
  options: unknown;
}): 'CARTE_BANCAIRE' | 'STRIPE' | 'PAYPAL' | 'VIREMENT' | 'ESPECES' {
  const optionsObj =
    booking.options && typeof booking.options === 'object' && !Array.isArray(booking.options)
      ? (booking.options as Record<string, unknown>)
      : {};
  const payment = optionsObj._payment as Record<string, unknown> | undefined;
  const fromOptions = payment?.method;
  if (
    fromOptions === 'CARTE_BANCAIRE' ||
    fromOptions === 'STRIPE' ||
    fromOptions === 'PAYPAL' ||
    fromOptions === 'VIREMENT' ||
    fromOptions === 'ESPECES'
  ) {
    return fromOptions;
  }
  if (booking.stripePaymentIntentId) return 'STRIPE';
  return 'CARTE_BANCAIRE';
}

function extractPaymentAmounts(booking: {
  status: string;
  total: number;
  options: unknown;
}) {
  const optionsObj =
    booking.options && typeof booking.options === 'object' && !Array.isArray(booking.options)
      ? (booking.options as Record<string, unknown>)
      : {};
  const payment = optionsObj._payment as Record<string, unknown> | undefined;

  const defaultPaid = booking.status === 'PAID' ? booking.total : 0;
  const paidAmount =
    typeof payment?.paidAmount === 'number' ? payment.paidAmount : defaultPaid;
  const remainingAmount =
    typeof payment?.remainingAmount === 'number'
      ? payment.remainingAmount
      : Math.max(0, booking.total - paidAmount);

  return {
    paidAmount,
    remainingAmount,
  };
}

async function getPaymentsData() {
  const bookings = await prisma.booking.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
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
      invoice: {
        select: {
          id: true,
        },
      },
    },
    take: 300,
  });

  return bookings.map((booking) => {
    const { paidAmount, remainingAmount } = extractPaymentAmounts(booking);
    return {
      id: booking.id,
      reservation: `${booking.cottage.title} (${new Date(booking.startDate).toLocaleDateString('fr-FR')} - ${new Date(booking.endDate).toLocaleDateString('fr-FR')})`,
      clientName: booking.user.name ?? 'Client',
      clientEmail: booking.user.email,
      amount: booking.total,
      mode: inferMode(booking),
      status: booking.status,
      paidAmount,
      remainingAmount,
      hasInvoice: Boolean(booking.invoice),
    };
  });
}

export default async function AdminPaymentsPage() {
  const payments = await getPaymentsData();

  const initialPayments: AdminPaymentItem[] = payments.map((p) => ({
    id: p.id,
    reservation: p.reservation,
    clientName: p.clientName,
    clientEmail: p.clientEmail,
    amount: p.amount,
    mode: p.mode,
    status: p.status as AdminPaymentItem['status'],
    paidAmount: p.paidAmount,
    remainingAmount: p.remainingAmount,
    hasInvoice: p.hasInvoice,
  }));

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold mb-2">Paiements</h1>
      <p className="text-muted-foreground mb-6">
        Gestion des paiements: suivi, acomptes, remboursements et soldes restants.
      </p>

      <AdminPaymentsPanel initialPayments={initialPayments} />
    </div>
  );
}
