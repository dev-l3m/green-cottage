'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

type CottageEditData = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  description: string;
  capacity: number;
  basePrice: number;
  isActive: boolean;
};

export default function AdminEditCottagePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const cottageId = params?.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    slug: '',
    title: '',
    summary: '',
    description: '',
    capacity: 1,
    basePrice: 0,
    isActive: true,
  });

  useEffect(() => {
    if (!cottageId) return;

    const fetchCottage = async () => {
      try {
        const res = await fetch(`/api/admin/cottages/${cottageId}`);
        if (!res.ok) {
          setError('Impossible de charger le cottage');
          setLoading(false);
          return;
        }
        const data = (await res.json()) as CottageEditData;
        setForm({
          slug: data.slug ?? '',
          title: data.title ?? '',
          summary: data.summary ?? '',
          description: data.description ?? '',
          capacity: data.capacity ?? 1,
          basePrice: data.basePrice ?? 0,
          isActive: data.isActive ?? true,
        });
      } catch {
        setError('Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchCottage();
  }, [cottageId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cottageId) return;

    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/cottages/${cottageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: form.slug,
          title: form.title,
          summary: form.summary,
          description: form.description,
          capacity: Number(form.capacity),
          basePrice: Number(form.basePrice),
          isActive: form.isActive,
        }),
      });

      if (!res.ok) {
        setError('Échec de la mise à jour');
        setSaving(false);
        return;
      }

      router.push('/admin/cottages');
      router.refresh();
    } catch {
      setError('Une erreur est survenue');
      setSaving(false);
    }
  };

  if (loading) return <p>Chargement...</p>;

  if (error && !saving) {
    return (
      <div>
        <h1 className="font-heading text-3xl font-bold mb-4">Modifier le cottage</h1>
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold mb-6">Modifier le cottage</h1>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
        <div>
          <label htmlFor="slug" className="block text-sm font-medium mb-1">
            Slug
          </label>
          <input
            id="slug"
            className="w-full rounded-md border px-3 py-2"
            value={form.slug}
            onChange={(e) => setForm((s) => ({ ...s, slug: e.target.value }))}
            required
          />
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            Titre
          </label>
          <input
            id="title"
            className="w-full rounded-md border px-3 py-2"
            value={form.title}
            onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
            required
          />
        </div>

        <div>
          <label htmlFor="summary" className="block text-sm font-medium mb-1">
            Résumé
          </label>
          <textarea
            id="summary"
            className="w-full rounded-md border px-3 py-2 min-h-[80px]"
            value={form.summary}
            onChange={(e) => setForm((s) => ({ ...s, summary: e.target.value }))}
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1">
            Description
          </label>
          <textarea
            id="description"
            className="w-full rounded-md border px-3 py-2 min-h-[140px]"
            value={form.description}
            onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="capacity" className="block text-sm font-medium mb-1">
              Capacité
            </label>
            <input
              id="capacity"
              type="number"
              min={1}
              className="w-full rounded-md border px-3 py-2"
              value={form.capacity}
              onChange={(e) => setForm((s) => ({ ...s, capacity: Number(e.target.value) }))}
              required
            />
          </div>
          <div>
            <label htmlFor="basePrice" className="block text-sm font-medium mb-1">
              Prix / nuit
            </label>
            <input
              id="basePrice"
              type="number"
              min={0}
              step="0.01"
              className="w-full rounded-md border px-3 py-2"
              value={form.basePrice}
              onChange={(e) => setForm((s) => ({ ...s, basePrice: Number(e.target.value) }))}
              required
            />
          </div>
        </div>

        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setForm((s) => ({ ...s, isActive: e.target.checked }))}
          />
          Cottage actif
        </label>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex items-center gap-3 pt-2">
          <Button type="submit" disabled={saving}>
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push('/admin/cottages')}>
            Annuler
          </Button>
        </div>
      </form>
    </div>
  );
}
