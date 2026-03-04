'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type CottageEditData = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  description: string;
  capacity: number;
  basePrice: number;
  images: string[];
  ratingScore: number | null;
  comfortStars: number | null;
  heroImage: string | null;
  isActive: boolean;
};

export default function AdminEditCottagePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const cottageId = params?.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);
  const [helpDialogType, setHelpDialogType] = useState<'hero' | 'gallery'>('hero');
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    slug: '',
    title: '',
    summary: '',
    description: '',
    capacity: 1,
    basePrice: 0,
    heroImage: '',
    imagesText: '',
    ratingScore: 8.5,
    comfortStars: 4,
    isActive: true,
  });
  const uploadTemporarilyDisabled = true;

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
          heroImage: data.heroImage ?? data.images?.[0] ?? '',
          imagesText: (data.images ?? []).slice(1).join('\n'),
          ratingScore: data.ratingScore ?? 8.5,
          comfortStars: data.comfortStars ?? 4,
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

  const uploadImage = async (file: File): Promise<string> => {
    const payload = new FormData();
    payload.append('file', file);
    const response = await fetch('/api/admin/uploads/cottages', {
      method: 'POST',
      body: payload,
    });
    const data = (await response.json()) as { url?: string; error?: string };
    if (!response.ok || !data.url) {
      throw new Error(data.error ?? "Échec de l'upload");
    }
    return data.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cottageId) return;

    setSaving(true);
    setError(null);
    const galleryImages = form.imagesText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
    const images = [form.heroImage.trim(), ...galleryImages].filter(Boolean);
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
          images,
          heroImage: form.heroImage.trim() || undefined,
          ratingScore: Number(form.ratingScore),
          comfortStars: Number(form.comfortStars),
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

  const handleHeroUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setUploadingHero(true);
      setError(null);
      const url = await uploadImage(file);
      setForm((s) => ({ ...s, heroImage: url }));
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Erreur d'upload");
    } finally {
      setUploadingHero(false);
      event.target.value = '';
    }
  };

  const handleGalleryUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setUploadingGallery(true);
      setError(null);
      const url = await uploadImage(file);
      setForm((s) => ({
        ...s,
        imagesText: s.imagesText.trim() ? `${s.imagesText.trim()}\n${url}` : url,
      }));
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Erreur d'upload");
    } finally {
      setUploadingGallery(false);
      event.target.value = '';
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="ratingScore" className="block text-sm font-medium mb-1">
              Note /10
            </label>
            <input
              id="ratingScore"
              type="number"
              min={0}
              max={10}
              step="0.1"
              className="w-full rounded-md border px-3 py-2"
              value={form.ratingScore}
              onChange={(e) => setForm((s) => ({ ...s, ratingScore: Number(e.target.value) }))}
              required
            />
          </div>
          <div>
            <label htmlFor="comfortStars" className="block text-sm font-medium mb-1">
              Étoiles de confort
            </label>
            <select
              id="comfortStars"
              className="w-full rounded-md border px-3 py-2"
              value={form.comfortStars}
              onChange={(e) => setForm((s) => ({ ...s, comfortStars: Number(e.target.value) }))}
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <option key={star} value={star}>
                  {star} étoile{star > 1 ? 's' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="heroImage" className="block text-sm font-medium mb-1">
            Image principale du gîte (URL)
          </label>
          <input
            id="heroImage"
            type="text"
            className="w-full rounded-md border px-3 py-2"
            value={form.heroImage}
            onChange={(e) => setForm((s) => ({ ...s, heroImage: e.target.value }))}
            placeholder="https://..."
          />
          <div className="mt-2">
            {uploadTemporarilyDisabled ? (
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted"
                onClick={() => {
                  setHelpDialogType('hero');
                  setHelpDialogOpen(true);
                }}
              >
                Uploader une image principale
              </button>
            ) : (
              <label className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm cursor-pointer hover:bg-muted">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleHeroUpload}
                  disabled={uploadingHero}
                />
                {uploadingHero ? 'Upload en cours...' : 'Uploader une image principale'}
              </label>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="imagesText" className="block text-sm font-medium mb-1">
            Images secondaires (une URL par ligne)
          </label>
          <textarea
            id="imagesText"
            className="w-full rounded-md border px-3 py-2 min-h-[110px]"
            value={form.imagesText}
            onChange={(e) => setForm((s) => ({ ...s, imagesText: e.target.value }))}
          />
          <div className="mt-2">
            {uploadTemporarilyDisabled ? (
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted"
                onClick={() => {
                  setHelpDialogType('gallery');
                  setHelpDialogOpen(true);
                }}
              >
                Uploader une image secondaire
              </button>
            ) : (
              <label className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm cursor-pointer hover:bg-muted">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleGalleryUpload}
                  disabled={uploadingGallery}
                />
                {uploadingGallery ? 'Upload en cours...' : 'Uploader une image secondaire'}
              </label>
            )}
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

      <Dialog open={helpDialogOpen} onOpenChange={setHelpDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Fonctionnement provisoire des images</DialogTitle>
            <DialogDescription>
              L&apos;upload direct est temporairement désactivé en production. Merci de copier-coller
              l&apos;URL de l&apos;image dans le champ correspondant.
            </DialogDescription>
          </DialogHeader>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              {helpDialogType === 'hero'
                ? "Bouton cliqué : image principale du gîte."
                : "Bouton cliqué : image secondaire du gîte."}
            </p>
            <p>
              Exemple valide : <code>https://...</code>
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
