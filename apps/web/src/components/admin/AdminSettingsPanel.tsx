'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export type AdminSettingsValues = {
  homeHeroTitle: string;
  homeHeroDescription: string;
  bookingManagementFeePercent: string;
  touristTaxPercent: string;
  invoiceCompanyName: string;
  invoiceCompanyAddress: string;
  invoiceCompanyEmail: string;
  invoiceCompanyPhone: string;
};

export default function AdminSettingsPanel({
  initialValues,
}: {
  initialValues: AdminSettingsValues;
}) {
  const [values, setValues] = useState<AdminSettingsValues>(initialValues);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatus('idle');

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        throw new Error('Échec de mise à jour');
      }
      setStatus('success');
    } catch (error) {
      console.error(error);
      setStatus('error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6 max-w-3xl">
      <section className="border rounded-lg p-4 space-y-4">
        <h2 className="font-semibold text-lg">Accueil</h2>
        <div>
          <label htmlFor="homeHeroTitle" className="block text-sm font-medium mb-1">
            Titre principal
          </label>
          <input
            id="homeHeroTitle"
            className="w-full rounded-md border px-3 py-2"
            value={values.homeHeroTitle}
            onChange={(e) => setValues((s) => ({ ...s, homeHeroTitle: e.target.value }))}
            placeholder="Ex: Trouvez votre cottage idéal"
          />
        </div>
        <div>
          <label htmlFor="homeHeroDescription" className="block text-sm font-medium mb-1">
            Description principale
          </label>
          <textarea
            id="homeHeroDescription"
            className="w-full rounded-md border px-3 py-2 min-h-[90px]"
            value={values.homeHeroDescription}
            onChange={(e) => setValues((s) => ({ ...s, homeHeroDescription: e.target.value }))}
            placeholder="Texte d&apos;accroche affiché sur l&apos;accueil"
          />
        </div>
      </section>

      <section className="border rounded-lg p-4 space-y-4">
        <h2 className="font-semibold text-lg">Tarification</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="bookingManagementFeePercent" className="block text-sm font-medium mb-1">
              Frais de gestion (%)
            </label>
            <input
              id="bookingManagementFeePercent"
              type="number"
              min={0}
              step="0.1"
              className="w-full rounded-md border px-3 py-2"
              value={values.bookingManagementFeePercent}
              onChange={(e) =>
                setValues((s) => ({ ...s, bookingManagementFeePercent: e.target.value }))
              }
            />
          </div>
          <div>
            <label htmlFor="touristTaxPercent" className="block text-sm font-medium mb-1">
              Taxe de séjour (%)
            </label>
            <input
              id="touristTaxPercent"
              type="number"
              min={0}
              step="0.1"
              className="w-full rounded-md border px-3 py-2"
              value={values.touristTaxPercent}
              onChange={(e) => setValues((s) => ({ ...s, touristTaxPercent: e.target.value }))}
            />
          </div>
        </div>
      </section>

      <section className="border rounded-lg p-4 space-y-4">
        <h2 className="font-semibold text-lg">Facturation</h2>
        <div>
          <label htmlFor="invoiceCompanyName" className="block text-sm font-medium mb-1">
            Nom de société
          </label>
          <input
            id="invoiceCompanyName"
            className="w-full rounded-md border px-3 py-2"
            value={values.invoiceCompanyName}
            onChange={(e) => setValues((s) => ({ ...s, invoiceCompanyName: e.target.value }))}
          />
        </div>
        <div>
          <label htmlFor="invoiceCompanyAddress" className="block text-sm font-medium mb-1">
            Adresse
          </label>
          <textarea
            id="invoiceCompanyAddress"
            className="w-full rounded-md border px-3 py-2 min-h-[80px]"
            value={values.invoiceCompanyAddress}
            onChange={(e) => setValues((s) => ({ ...s, invoiceCompanyAddress: e.target.value }))}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="invoiceCompanyEmail" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              id="invoiceCompanyEmail"
              type="email"
              className="w-full rounded-md border px-3 py-2"
              value={values.invoiceCompanyEmail}
              onChange={(e) => setValues((s) => ({ ...s, invoiceCompanyEmail: e.target.value }))}
            />
          </div>
          <div>
            <label htmlFor="invoiceCompanyPhone" className="block text-sm font-medium mb-1">
              Téléphone
            </label>
            <input
              id="invoiceCompanyPhone"
              className="w-full rounded-md border px-3 py-2"
              value={values.invoiceCompanyPhone}
              onChange={(e) => setValues((s) => ({ ...s, invoiceCompanyPhone: e.target.value }))}
            />
          </div>
        </div>
      </section>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? 'Enregistrement...' : 'Enregistrer les paramètres'}
        </Button>
        {status === 'success' && (
          <span className="text-sm text-green-700">Paramètres enregistrés.</span>
        )}
        {status === 'error' && (
          <span className="text-sm text-destructive">
            Impossible d&apos;enregistrer les paramètres.
          </span>
        )}
      </div>
    </form>
  );
}
