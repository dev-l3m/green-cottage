export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';

type NewsletterStatus = 'PENDING' | 'SUBSCRIBED' | 'UNSUBSCRIBED';

type NewsletterRow = {
  id: string;
  email: string;
  source: string;
  status: NewsletterStatus;
  gdprConsentAt: Date;
  confirmedAt: Date | null;
  lastDownloadEmailSentAt: Date | null;
  createdAt: Date;
};

type CountRow = {
  count: bigint;
};

const STATUS_LABEL: Record<NewsletterStatus, string> = {
  PENDING: 'En attente',
  SUBSCRIBED: 'Abonne',
  UNSUBSCRIBED: 'Desabonne',
};

async function getStatusCount(status: NewsletterStatus) {
  const rows = await prisma.$queryRaw<CountRow[]>`
    SELECT COUNT(*)::bigint AS count
    FROM "newsletter"
    WHERE "status" = ${status}::"NewsletterStatus"
  `;
  return Number(rows[0]?.count ?? 0n);
}

async function getNewsletterRows() {
  const [rows, total, pending, subscribed, unsubscribed] = await Promise.all([
    prisma.$queryRaw<NewsletterRow[]>`
      SELECT
        "id",
        "email",
        "source",
        "status",
        "gdprConsentAt",
        "confirmedAt",
        "lastDownloadEmailSentAt",
        "createdAt"
      FROM "newsletter"
      ORDER BY "createdAt" DESC
      LIMIT 200
    `,
    prisma.$queryRaw<CountRow[]>`
      SELECT COUNT(*)::bigint AS count
      FROM "newsletter"
    `,
    getStatusCount('PENDING'),
    getStatusCount('SUBSCRIBED'),
    getStatusCount('UNSUBSCRIBED'),
  ]);

  return {
    rows,
    total: Number(total[0]?.count ?? 0n),
    pending,
    subscribed,
    unsubscribed,
  };
}

function formatDate(value: Date | null) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export default async function AdminNewsletterPage() {
  const { rows, total, pending, subscribed, unsubscribed } = await getNewsletterRows();

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold mb-4">Newsletter</h1>
      <p className="text-muted-foreground mb-6">
        Liste des contacts collectes via le popup Eco Booklet.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="text-2xl font-bold">{total}</p>
        </div>
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-muted-foreground">En attente</p>
          <p className="text-2xl font-bold">{pending}</p>
        </div>
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-muted-foreground">Abonné</p>
          <p className="text-2xl font-bold">{subscribed}</p>
        </div>
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-muted-foreground">Désabonné</p>
          <p className="text-2xl font-bold">{unsubscribed}</p>
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="text-muted-foreground">Aucun contact newsletter pour le moment.</p>
      ) : (
        <div className="overflow-x-auto border rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="px-3 py-2 font-medium">Email</th>
                <th className="px-3 py-2 font-medium">Statut</th>
                <th className="px-3 py-2 font-medium">Source</th>
                <th className="px-3 py-2 font-medium">Consentement RGPD</th>
                <th className="px-3 py-2 font-medium">Confirme le</th>
                <th className="px-3 py-2 font-medium">Dernier email PDF</th>
                <th className="px-3 py-2 font-medium">Cree le</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="px-3 py-2">
                    <a
                      href={`mailto:${item.email}`}
                      className="text-gc-green underline underline-offset-2 hover:opacity-80"
                    >
                      {item.email}
                    </a>
                  </td>
                  <td className="px-3 py-2">{STATUS_LABEL[item.status]}</td>
                  <td className="px-3 py-2">{item.source}</td>
                  <td className="px-3 py-2">{formatDate(item.gdprConsentAt)}</td>
                  <td className="px-3 py-2">{formatDate(item.confirmedAt)}</td>
                  <td className="px-3 py-2">{formatDate(item.lastDownloadEmailSentAt)}</td>
                  <td className="px-3 py-2">{formatDate(item.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
