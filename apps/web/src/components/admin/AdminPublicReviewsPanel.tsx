'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export type AdminPublicReviewItem = {
  id: string;
  author: string | null;
  comment: string;
  rating: number;
  status: 'PENDING' | 'PUBLISHED' | 'REJECTED';
  createdAt: string;
  cottageTitle: string;
};

const STATUS_LABEL: Record<AdminPublicReviewItem['status'], string> = {
  PENDING: 'En attente',
  PUBLISHED: 'Publié',
  REJECTED: 'Masqué',
};

function getStatusLabel(status: string): string {
  const normalized = status.trim().toUpperCase();
  if (normalized === 'PENDING') return 'En attente';
  if (normalized === 'PUBLISHED') return 'Publié';
  if (normalized === 'REJECTED') return 'Masqué';
  return 'Inconnu';
}

export default function AdminPublicReviewsPanel({
  initialReviews,
}: {
  initialReviews: AdminPublicReviewItem[];
}) {
  const [reviews, setReviews] = useState(initialReviews);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const updateStatus = async (
    reviewId: string,
    nextStatus: 'PUBLISHED' | 'REJECTED'
  ) => {
    setPendingId(reviewId);
    try {
      const res = await fetch(`/api/admin/public-reviews/${reviewId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!res.ok) {
        throw new Error('Failed to update review status');
      }

      setReviews((prev) =>
        prev.map((r) => (r.id === reviewId ? { ...r, status: nextStatus } : r))
      );
    } catch (error) {
      console.error(error);
    } finally {
      setPendingId(null);
    }
  };

  if (reviews.length === 0) {
    return <p className="text-muted-foreground">Aucun avis pour le moment.</p>;
  }

  return (
    <div className="space-y-3">
      {reviews.map((review) => {
        const isPublished = review.status === 'PUBLISHED';
        const isPending = pendingId === review.id;

        return (
          <div key={review.id} className="p-4 border rounded-lg">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <p className="font-semibold">{review.cottageTitle}</p>
              <p className="text-sm text-muted-foreground">
                {new Date(review.createdAt).toLocaleDateString('fr-FR')}
              </p>
            </div>
            <p className="text-sm mb-1">
              <span className="font-medium">Auteur :</span> {review.author ?? 'Anonyme'}
            </p>
            <p className="text-sm mb-1">
              <span className="font-medium">Note :</span> {review.rating}/5
            </p>
            <p className="text-sm mb-3">
              <span className="font-medium">Statut :</span> {getStatusLabel(review.status)}
            </p>
            <p className="text-sm text-muted-foreground whitespace-pre-line mb-3">{review.comment}</p>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant={isPublished ? 'outline' : 'default'}
                onClick={() => updateStatus(review.id, 'PUBLISHED')}
                disabled={isPending || isPublished}
              >
                Afficher
              </Button>
              <Button
                type="button"
                size="sm"
                variant={!isPublished ? 'outline' : 'destructive'}
                onClick={() => updateStatus(review.id, 'REJECTED')}
                disabled={isPending || !isPublished}
              >
                Masquer
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
