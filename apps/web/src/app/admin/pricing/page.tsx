'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';

type CottageOption = {
  id: string;
  title: string;
  slug: string;
  basePrice: number;
};

type PricingRule = {
  id: string;
  cottageId: string;
  startDate: string;
  endDate: string;
  nightlyPrice: number;
};

export default function AdminPricingPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cottages, setCottages] = useState<CottageOption[]>([]);
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [form, setForm] = useState({
    cottageId: '',
    startDate: '',
    endDate: '',
    nightlyPrice: '',
  });

  const cottageMap = useMemo(() => new Map(cottages.map((c) => [c.id, c])), [cottages]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/pricing');
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Erreur de chargement');
      setCottages(data.cottages ?? []);
      setRules(data.rules ?? []);
      setForm((prev) => ({
        ...prev,
        cottageId: prev.cottageId || data.cottages?.[0]?.id || '',
      }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const createRule = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cottageId: form.cottageId,
          startDate: form.startDate,
          endDate: form.endDate,
          nightlyPrice: Number(form.nightlyPrice),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Création impossible');
      setRules((prev) => [data, ...prev]);
      setForm((prev) => ({ ...prev, startDate: '', endDate: '', nightlyPrice: '' }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Création impossible');
    } finally {
      setSaving(false);
    }
  };

  const removeRule = async (id: string) => {
    if (!confirm('Supprimer cette règle de prix ?')) return;
    try {
      const res = await fetch(`/api/admin/pricing/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Suppression impossible');
      setRules((prev) => prev.filter((item) => item.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Suppression impossible');
    }
  };

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold mb-2">Tarifs par période</h1>
      <p className="text-muted-foreground mb-6">
        Définissez des prix spéciaux selon les dates (haute saison, événements, promos).
      </p>

      <form onSubmit={createRule} className="border rounded-lg p-4 space-y-4 mb-6">
        <h2 className="font-semibold">Ajouter une règle de prix</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <select
            className="h-10 rounded-md border px-3"
            value={form.cottageId}
            onChange={(e) => setForm((s) => ({ ...s, cottageId: e.target.value }))}
            required
          >
            {cottages.map((cottage) => (
              <option key={cottage.id} value={cottage.id}>
                {cottage.title} ({cottage.basePrice.toFixed(0)}€/nuit)
              </option>
            ))}
          </select>
          <input
            type="date"
            className="h-10 rounded-md border px-3"
            value={form.startDate}
            onChange={(e) => setForm((s) => ({ ...s, startDate: e.target.value }))}
            required
          />
          <input
            type="date"
            className="h-10 rounded-md border px-3"
            value={form.endDate}
            onChange={(e) => setForm((s) => ({ ...s, endDate: e.target.value }))}
            required
          />
          <input
            type="number"
            min={0}
            step="0.01"
            placeholder="Prix / nuit"
            className="h-10 rounded-md border px-3"
            value={form.nightlyPrice}
            onChange={(e) => setForm((s) => ({ ...s, nightlyPrice: e.target.value }))}
            required
          />
        </div>
        <Button type="submit" disabled={saving || loading}>
          {saving ? 'Enregistrement...' : 'Ajouter la règle'}
        </Button>
      </form>

      {error ? <p className="text-sm text-destructive mb-4">{error}</p> : null}
      {loading ? <p>Chargement...</p> : null}

      <div className="space-y-3">
        {rules.length === 0 ? (
          <p className="text-muted-foreground">Aucune règle de prix configurée.</p>
        ) : (
          rules.map((rule) => {
            const cottage = cottageMap.get(rule.cottageId);
            return (
              <div key={rule.id} className="border rounded-lg p-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium">{cottage?.title ?? 'Gîte inconnu'}</p>
                  <p className="text-sm text-muted-foreground">
                    {rule.startDate} → {rule.endDate} • {rule.nightlyPrice.toFixed(0)}€/nuit
                  </p>
                </div>
                <Button type="button" size="sm" variant="destructive" onClick={() => removeRule(rule.id)}>
                  Supprimer
                </Button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
