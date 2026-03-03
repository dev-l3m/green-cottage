export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import AdminPublicReviewsPanel, {
  type AdminPublicReviewItem,
} from '@/components/admin/AdminPublicReviewsPanel';

async function getReviewsData() {
  const [reviews, pending, published, rejected] = await Promise.all([
    prisma.publicReview.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        author: true,
        comment: true,
        rating: true,
        status: true,
        createdAt: true,
        cottage: {
          select: { title: true },
        },
      },
    }),
    prisma.publicReview.count({ where: { status: 'PENDING' } }),
    prisma.publicReview.count({ where: { status: 'PUBLISHED' } }),
    prisma.publicReview.count({ where: { status: 'REJECTED' } }),
  ]);

  return { reviews, pending, published, rejected };
}

export default async function AdminReviewsPage() {
  const { reviews, pending, published, rejected } = await getReviewsData();
  const initialReviews: AdminPublicReviewItem[] = reviews.map((review) => ({
    id: review.id,
    author: review.author,
    comment: review.comment,
    rating: review.rating,
    status: review.status as 'PENDING' | 'PUBLISHED' | 'REJECTED',
    createdAt: review.createdAt.toISOString(),
    cottageTitle: review.cottage.title,
  }));

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold mb-4">Avis</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-muted-foreground">En attente</p>
          <p className="text-2xl font-bold">{pending}</p>
        </div>
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-muted-foreground">Publiés (affichés)</p>
          <p className="text-2xl font-bold">{published}</p>
        </div>
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-muted-foreground">Rejetés</p>
          <p className="text-2xl font-bold">{rejected}</p>
        </div>
      </div>

      <AdminPublicReviewsPanel initialReviews={initialReviews} />
    </div>
  );
}
