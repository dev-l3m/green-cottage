export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import AdminIcalPanel, {
  type AdminIcalFeedItem,
  type AdminIcalCottageOption,
} from '../../../components/admin/AdminIcalPanel';

async function getIcalData() {
  const [feeds, cottages] = await Promise.all([
    prisma.icalFeed.findMany({
      include: {
        cottage: {
          select: {
            title: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.cottage.findMany({
      where: { isActive: true },
      select: {
        id: true,
        title: true,
        slug: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return { feeds, cottages };
}

export default async function AdminIcalPage() {
  const { feeds, cottages } = await getIcalData();
  const initialFeeds: AdminIcalFeedItem[] = feeds.map((feed) => ({
    id: feed.id,
    cottageId: feed.cottageId,
    importUrl: feed.importUrl ?? '',
    exportToken: feed.exportToken,
    lastSyncedAt: feed.lastSyncedAt?.toISOString() ?? null,
    cottageTitle: feed.cottage.title,
    cottageSlug: feed.cottage.slug,
  }));
  const cottageOptions: AdminIcalCottageOption[] = cottages.map((cottage) => ({
    id: cottage.id,
    title: cottage.title,
    slug: cottage.slug,
  }));

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold mb-4">Calendriers iCal</h1>
      <p className="text-muted-foreground mb-6">
        Gérez les flux iCal par gîte, ajoutez un lien d&apos;import et lancez une synchronisation manuelle.
      </p>
      <AdminIcalPanel initialFeeds={initialFeeds} cottages={cottageOptions} />
    </div>
  );
}
