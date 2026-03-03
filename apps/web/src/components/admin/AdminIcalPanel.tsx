'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export type AdminIcalFeedItem = {
  id: string;
  cottageId: string;
  importUrl: string;
  exportToken: string;
  lastSyncedAt: string | null;
  cottageTitle: string;
  cottageSlug: string;
};

export type AdminIcalCottageOption = {
  id: string;
  title: string;
  slug: string;
};

export default function AdminIcalPanel({
  initialFeeds,
  cottages,
}: {
  initialFeeds: AdminIcalFeedItem[];
  cottages: AdminIcalCottageOption[];
}) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    cottageId: cottages[0]?.id ?? '',
    importUrl: '',
  });

  const createFeed = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/ical/feeds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cottageId: form.cottageId,
          importUrl: form.importUrl,
        }),
      });
      if (!res.ok) {
        throw new Error('Échec de la création du flux iCal');
      }
      setForm((s) => ({ ...s, importUrl: '' }));
      router.refresh();
    } catch (err) {
      console.error(err);
      setError('Impossible de créer le flux iCal');
    } finally {
      setCreating(false);
    }
  };

  const syncFeed = async (feed: AdminIcalFeedItem) => {
    if (!feed.importUrl) return;
    setSyncingId(feed.id);
    setError(null);
    try {
      const res = await fetch('/api/admin/ical/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cottageId: feed.cottageId,
          importUrl: feed.importUrl,
        }),
      });
      if (!res.ok) {
        throw new Error('Échec de la synchronisation iCal');
      }
      router.refresh();
    } catch (err) {
      console.error(err);
      setError('La synchronisation iCal a échoué');
    } finally {
      setSyncingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={createFeed} className="border rounded-lg p-4 space-y-4">
        <h2 className="font-semibold text-lg">Ajouter un flux iCal</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="cottageId" className="block text-sm font-medium mb-1">
              Gîte
            </label>
            <select
              id="cottageId"
              className="w-full h-10 rounded-md border bg-background px-3 text-sm"
              value={form.cottageId}
              onChange={(e) => setForm((s) => ({ ...s, cottageId: e.target.value }))}
              required
            >
              {cottages.map((cottage) => (
                <option key={cottage.id} value={cottage.id}>
                  {cottage.title} ({cottage.slug})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="importUrl" className="block text-sm font-medium mb-1">
              URL d&apos;import iCal
            </label>
            <input
              id="importUrl"
              type="url"
              className="w-full h-10 rounded-md border bg-background px-3 text-sm"
              placeholder="https://..."
              value={form.importUrl}
              onChange={(e) => setForm((s) => ({ ...s, importUrl: e.target.value }))}
              required
            />
          </div>
        </div>
        <Button type="submit" disabled={creating || cottages.length === 0}>
          {creating ? 'Création...' : 'Ajouter le flux'}
        </Button>
      </form>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {initialFeeds.length === 0 ? (
        <p className="text-muted-foreground">Aucun flux iCal configuré pour le moment.</p>
      ) : (
        <div className="space-y-3">
          {initialFeeds.map((feed) => (
            <div key={feed.id} className="p-4 border rounded-lg">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div>
                  <p className="font-semibold">{feed.cottageTitle}</p>
                  <p className="text-xs text-muted-foreground">/{feed.cottageSlug}</p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => syncFeed(feed)}
                  disabled={syncingId === feed.id || !feed.importUrl}
                >
                  {syncingId === feed.id ? 'Synchronisation...' : 'Synchroniser'}
                </Button>
              </div>
              <p className="text-sm mb-1 break-all">
                <span className="font-medium">Import:</span> {feed.importUrl || 'Non configuré'}
              </p>
              <p className="text-sm mb-1 break-all">
                <span className="font-medium">Export:</span>{' '}
                <code>/api/ical/{feed.exportToken}</code>
              </p>
              <p className="text-sm text-muted-foreground">
                Dernière synchronisation:{' '}
                {feed.lastSyncedAt
                  ? new Date(feed.lastSyncedAt).toLocaleString('fr-FR')
                  : 'Jamais'}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
