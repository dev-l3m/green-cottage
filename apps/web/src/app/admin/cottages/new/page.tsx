'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function AdminNewCottagePage() {
  const router = useRouter();
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
    capacity: 4,
    basePrice: 100,
    cleaningFee: 0,
    comfortStars: 4,
    heroImage: '',
    imagesText: '',
    amenitiesText: '',
    isActive: true,
  });
  const uploadTemporarilyDisabled = true;
  const galleryPreviewUrls = useMemo(
    () =>
      form.imagesText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
    [form.imagesText]
  );

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
    setSaving(true);
    setError(null);

    const galleryImages = form.imagesText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    const images = [form.heroImage.trim(), ...galleryImages].filter(Boolean);
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
          heroImage: form.heroImage.trim() || undefined,
          comfortStars: Number(form.comfortStars),
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <div className="rounded-md border px-3 py-2 text-sm text-muted-foreground">
            La note est calculée automatiquement à partir des avis clients publiés.
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
          {form.heroImage.trim() ? (
            <div className="mt-3">
              <p className="text-xs text-muted-foreground mb-2">Aperçu image principale</p>
              <img
                src={form.heroImage.trim()}
                alt="Aperçu image principale"
                className="w-full max-w-md h-48 object-cover rounded-md border bg-muted"
              />
            </div>
          ) : null}
        </div>

        <div>
          <label htmlFor="imagesText" className="block text-sm font-medium mb-1">
          Images secondaires (une URL par ligne, au moins une ligne requise)
          </label>
          <textarea
            id="imagesText"
            className="w-full rounded-md border px-3 py-2 min-h-[110px]"
            value={form.imagesText}
            onChange={(e) => setForm((s) => ({ ...s, imagesText: e.target.value }))}
            required
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
          {galleryPreviewUrls.length > 0 ? (
            <div className="mt-3">
              <p className="text-xs text-muted-foreground mb-2">Aperçu images secondaires</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {galleryPreviewUrls.map((url, index) => (
                  <img
                    key={`${url}-${index}`}
                    src={url}
                    alt={`Aperçu image secondaire ${index + 1}`}
                    className="w-full h-28 object-cover rounded-md border bg-muted"
                  />
                ))}
              </div>
            </div>
          ) : null}
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
