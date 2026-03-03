'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function AdminNewCottagePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    slug: '',
    title: '',
    summary: '',
    description: '',
    capacity: 4,
    basePrice: 100,
    cleaningFee: 0,
    imagesText: '',
    amenitiesText: '',
    isActive: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const images = form.imagesText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    const amenities = form.amenitiesText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      const res = await fetch('/api/admin/cottages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: form.slug,
          title: form.title,
          summary: form.summary || undefined,
          description: form.description,
          capacity: Number(form.capacity),
          basePrice: Number(form.basePrice),
          cleaningFee: Number(form.cleaningFee),
          images,
          amenities,
          isActive: form.isActive,
        }),
      });

      if (!res.ok) {
        setError('Échec de la création du cottage. Veuillez vérifier les champs et réessayer.');
        setSaving(false);
        return;
      }

      router.push('/admin/cottages');
      router.refresh();
    } catch {
      setError('Une erreur est survenue. Veuillez réessayer plus tard.');
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold mb-6">Ajouter un cottage</h1>

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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <div>
            <label htmlFor="cleaningFee" className="block text-sm font-medium mb-1">
              Frais de ménage
            </label>
            <input
              id="cleaningFee"
              type="number"
              min={0}
              step="0.01"
              className="w-full rounded-md border px-3 py-2"
              value={form.cleaningFee}
              onChange={(e) => setForm((s) => ({ ...s, cleaningFee: Number(e.target.value) }))}
            />
          </div>
        </div>

        <div>
          <label htmlFor="imagesText" className="block text-sm font-medium mb-1">
          Images (une URL par ligne, au moins une ligne requise)
          </label>
          <textarea
            id="imagesText"
            className="w-full rounded-md border px-3 py-2 min-h-[110px]"
            value={form.imagesText}
            onChange={(e) => setForm((s) => ({ ...s, imagesText: e.target.value }))}
            required
          />
        </div>

        <div>
          <label htmlFor="amenitiesText" className="block text-sm font-medium mb-1">
            Équipements (un équipement par ligne, au moins une ligne requise)
          </label>
          <textarea
            id="amenitiesText"
            className="w-full rounded-md border px-3 py-2 min-h-[110px]"
            value={form.amenitiesText}
            onChange={(e) => setForm((s) => ({ ...s, amenitiesText: e.target.value }))}
            required
          />
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
            {saving ? 'Enregistrement...' : 'Créer'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push('/admin/cottages')}>
            Annuler
          </Button>
        </div>
      </form>
    </div>
  );
}
