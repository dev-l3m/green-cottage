'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import Link from 'next/link';
import { Plus, Edit, Trash2, Power, BadgePercent } from 'lucide-react';

type PromotionForm = {
  enabled: boolean;
  title: string;
  percent: string;
  startDate: string;
  endDate: string;
};

function toPromotionForm(raw: any): PromotionForm {
  const value = raw && typeof raw === 'object' ? raw : {};
  return {
    enabled: Boolean(value.enabled),
    title: typeof value.title === 'string' ? value.title : '',
    percent: typeof value.percent === 'number' ? String(value.percent) : '',
    startDate: typeof value.startDate === 'string' ? value.startDate : '',
    endDate: typeof value.endDate === 'string' ? value.endDate : '',
  };
}

export default function AdminCottagesPage() {
  const [cottages, setCottages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [availabilityPendingId, setAvailabilityPendingId] = useState<string | null>(null);
  const [savingPromotionId, setSavingPromotionId] = useState<string | null>(null);
  const [promotionForms, setPromotionForms] = useState<Record<string, PromotionForm>>({});
  const [availabilityTarget, setAvailabilityTarget] = useState<any | null>(null);
  const [promotionTargetId, setPromotionTargetId] = useState<string | null>(null);

  useEffect(() => {
    fetchCottages();
  }, []);

  const fetchCottages = async () => {
    try {
      const res = await fetch('/api/admin/cottages');
      if (res.ok) {
        const data = await res.json();
        setCottages(data);
        const forms = Object.fromEntries(
          data.map((cottage: any) => [cottage.id, toPromotionForm(cottage.promotion)])
        ) as Record<string, PromotionForm>;
        setPromotionForms(forms);
      }
    } catch (error) {
      console.error('Error fetching cottages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/cottages/${deleteTarget.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setDeleteTarget(null);
        fetchCottages();
      }
    } catch (error) {
      console.error('Error deleting cottage:', error);
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleAvailability = async (cottageId: string, nextValue: boolean) => {
    setAvailabilityPendingId(cottageId);
    try {
      const res = await fetch(`/api/admin/cottages/${cottageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: nextValue }),
      });
      if (!res.ok) throw new Error('Impossible de mettre à jour la disponibilité');
      setCottages((prev) =>
        prev.map((cottage) =>
          cottage.id === cottageId ? { ...cottage, isActive: nextValue } : cottage
        )
      );
    } catch (error) {
      console.error(error);
    } finally {
      setAvailabilityPendingId(null);
    }
  };

  const handlePromotionChange = (
    cottageId: string,
    key: keyof PromotionForm,
    value: string | boolean
  ) => {
    setPromotionForms((prev) => ({
      ...prev,
      [cottageId]: {
        ...prev[cottageId],
        [key]: value,
      },
    }));
  };

  const handleSavePromotion = async (cottageId: string) => {
    const form = promotionForms[cottageId];
    if (!form) return;
    setSavingPromotionId(cottageId);
    try {
      const percentNum = form.percent === '' ? undefined : Number(form.percent);
      const payload = {
        promotionEnabled: form.enabled,
        promotionTitle: form.title || undefined,
        promotionPercent: Number.isFinite(percentNum) ? percentNum : undefined,
        promotionStartDate: form.startDate || undefined,
        promotionEndDate: form.endDate || undefined,
      };

      const res = await fetch(`/api/admin/cottages/${cottageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Impossible d’enregistrer la promotion');
      setCottages((prev) =>
        prev.map((cottage) =>
          cottage.id === cottageId
            ? {
                ...cottage,
                promotion: {
                  enabled: form.enabled,
                  title: form.title || null,
                  percent: percentNum ?? null,
                  startDate: form.startDate || null,
                  endDate: form.endDate || null,
                },
              }
            : cottage
        )
      );
    } catch (error) {
      console.error(error);
    } finally {
      setSavingPromotionId(null);
    }
  };

  if (loading) {
    return <p>Chargement...</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-heading text-3xl font-bold">Cottages</h1>
        <Link href="/admin/cottages/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un cottage
          </Button>
        </Link>
      </div>

      {cottages.length === 0 ? (
        <p className="text-muted-foreground">Aucun cottage pour le moment.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cottages.map((cottage) => (
            <Card key={cottage.id}>
              <CardContent className="p-4">
                <div className="mb-3 overflow-hidden rounded-md border bg-muted">
                  {cottage.images?.[0] ? (
                    <div
                      className="h-40 w-full bg-cover bg-center"
                      style={{ backgroundImage: `url("${cottage.images[0]}")` }}
                      aria-label={`Photo du gîte ${cottage.title}`}
                    />
                  ) : (
                    <div className="h-40 w-full flex items-center justify-center text-sm text-muted-foreground">
                      Aucune photo
                    </div>
                  )}
                </div>
                <h3 className="font-semibold text-lg mb-2">{cottage.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{cottage.summary}</p>
                <p className="text-sm text-muted-foreground mb-4">
                  {cottage.basePrice}€/nuit • {cottage.capacity} personnes
                </p>
                <p className="text-sm text-muted-foreground mb-2">
                  {cottage.reviewsCount > 0
                    ? `Note clients: ${Number(cottage.averageRating).toFixed(1)}/5 (${cottage.reviewsCount} avis)`
                    : 'Note clients: aucun avis publié'}
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  Photos disponibles: {Array.isArray(cottage.images) ? cottage.images.length : 0}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      title={cottage.isActive ? 'Fermer la disponibilité' : 'Ouvrir la disponibilité'}
                      onClick={() => setAvailabilityTarget(cottage)}
                    >
                      <Power className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      title="Configurer la promotion"
                      onClick={() => setPromotionTargetId(cottage.id)}
                    >
                      <BadgePercent className="h-4 w-4" />
                    </Button>
                    <Link href={`/admin/cottages/${cottage.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setDeleteTarget({
                          id: cottage.id,
                          title: cottage.title,
                        })
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open && !deleting) setDeleteTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer ce cottage ?</DialogTitle>
            <DialogDescription>
              Cette action est irréversible.
              {deleteTarget?.title ? ` Cottage concerné : ${deleteTarget.title}.` : ''}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
            >
              Annuler
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? 'Suppression...' : 'Supprimer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={availabilityTarget !== null}
        onOpenChange={(open) => {
          if (!open && availabilityPendingId === null) setAvailabilityTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gestion de disponibilité</DialogTitle>
            <DialogDescription>
              {availabilityTarget
                ? `Modifier la disponibilité de "${availabilityTarget.title}".`
                : 'Modifier la disponibilité du gîte.'}
            </DialogDescription>
          </DialogHeader>
          {availabilityTarget && (
            <p className="text-sm text-muted-foreground">
              Statut actuel: {availabilityTarget.isActive ? 'Ouvert aux réservations' : 'Fermé (non réservable)'}
            </p>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setAvailabilityTarget(null)}
              disabled={availabilityPendingId !== null}
            >
              Annuler
            </Button>
            <Button
              type="button"
              disabled={!availabilityTarget || availabilityPendingId === availabilityTarget.id}
              onClick={async () => {
                if (!availabilityTarget) return;
                await handleToggleAvailability(availabilityTarget.id, !availabilityTarget.isActive);
                setAvailabilityTarget(null);
              }}
            >
              {availabilityTarget && availabilityPendingId === availabilityTarget.id
                ? 'Mise à jour...'
                : availabilityTarget?.isActive
                ? 'Fermer la disponibilité'
                : 'Ouvrir la disponibilité'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={promotionTargetId !== null}
        onOpenChange={(open) => {
          if (!open && savingPromotionId === null) setPromotionTargetId(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gestion de promotion</DialogTitle>
            <DialogDescription>Configurer une promotion pour ce gîte.</DialogDescription>
          </DialogHeader>
          {promotionTargetId && (
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={Boolean(promotionForms[promotionTargetId]?.enabled)}
                  onChange={(e) =>
                    handlePromotionChange(promotionTargetId, 'enabled', e.target.checked)
                  }
                />
                Activer la promotion
              </label>
              <input
                type="text"
                placeholder="Titre promotion (ex: Offre printemps)"
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                value={promotionForms[promotionTargetId]?.title ?? ''}
                onChange={(e) =>
                  handlePromotionChange(promotionTargetId, 'title', e.target.value)
                }
              />
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="% remise"
                  className="h-9 rounded-md border bg-background px-3 text-sm"
                  value={promotionForms[promotionTargetId]?.percent ?? ''}
                  onChange={(e) =>
                    handlePromotionChange(promotionTargetId, 'percent', e.target.value)
                  }
                />
                <input
                  type="date"
                  className="h-9 rounded-md border bg-background px-3 text-sm"
                  value={promotionForms[promotionTargetId]?.startDate ?? ''}
                  onChange={(e) =>
                    handlePromotionChange(promotionTargetId, 'startDate', e.target.value)
                  }
                />
                <input
                  type="date"
                  className="h-9 rounded-md border bg-background px-3 text-sm"
                  value={promotionForms[promotionTargetId]?.endDate ?? ''}
                  onChange={(e) =>
                    handlePromotionChange(promotionTargetId, 'endDate', e.target.value)
                  }
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setPromotionTargetId(null)}
              disabled={savingPromotionId !== null}
            >
              Annuler
            </Button>
            <Button
              type="button"
              disabled={!promotionTargetId || savingPromotionId === promotionTargetId}
              onClick={async () => {
                if (!promotionTargetId) return;
                await handleSavePromotion(promotionTargetId);
                setPromotionTargetId(null);
              }}
            >
              {promotionTargetId && savingPromotionId === promotionTargetId
                ? 'Enregistrement...'
                : 'Enregistrer promotion'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
