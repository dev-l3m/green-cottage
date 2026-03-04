'use client';

import { useEffect, useMemo, useState } from 'react';
import { Leaf, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const POPUP_STORAGE_KEY = 'gc_eco_booklet_popup_seen_v1';
const PDF_URL = '/jeux-a-imprimer-green-cottage.pdf';

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function EcoBookletPopup() {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const alreadySeen = window.localStorage.getItem(POPUP_STORAGE_KEY);
    if (alreadySeen) return;
    const timer = window.setTimeout(() => setVisible(true), 1200);
    return () => window.clearTimeout(timer);
  }, []);

  const canSubmit = useMemo(
    () => isValidEmail(email.trim()) && consent && !submitting,
    [email, consent, submitting]
  );

  const markAsSeen = () => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(POPUP_STORAGE_KEY, '1');
  };

  const closeBanner = () => {
    setVisible(false);
    markAsSeen();
  };

  const startDownload = () => {
    const anchor = document.createElement('a');
    anchor.href = PDF_URL;
    anchor.download = 'jeux-a-imprimer-green-cottage.pdf';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!isValidEmail(email.trim())) {
      setError('Veuillez saisir un email valide.');
      return;
    }
    if (!consent) {
      setError('Veuillez accepter la politique de confidentialité (RGPD).');
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch('/api/eco-booklet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          consent: true,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(payload.error ?? 'Erreur lors de la soumission');
      }

      setSuccess(true);
      markAsSeen();
      startDownload();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Une erreur est survenue, merci de réessayer.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!visible) return null;

  return (
    <aside className="fixed z-50 bottom-4 left-3 right-3 sm:left-auto sm:right-4 sm:w-[360px] md:bottom-6 md:right-6 md:w-[380px] animate-in fade-in-0 slide-in-from-bottom-6 duration-500">
      <div className="rounded-xl border bg-white/95 shadow-xl backdrop-blur-md p-3.5 md:p-4">
        <button
          type="button"
          aria-label="Fermer la bannière"
          onClick={closeBanner}
          className="absolute right-2.5 top-2.5 rounded-md p-1 text-muted-foreground hover:bg-muted"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-2.5 pr-7">
          <p className="text-sm font-semibold text-gc-forest flex items-center gap-1.5">
            <Leaf className="h-4 w-4 text-gc-green" />
            Livret d&apos;activités écologiques enfants
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Laissez votre email, acceptez le RGPD, puis téléchargez le PDF.
          </p>
        </div>

        {success ? (
          <div className="space-y-2">
            <p className="text-xs text-green-700">Merci ! Le téléchargement a démarré.</p>
            <Button
              type="button"
              className="w-full bg-gc-green hover:bg-gc-green/90 text-white"
              onClick={startDownload}
            >
              Télécharger à nouveau
            </Button>
          </div>
        ) : (
          <form className="space-y-2.5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Input
                id="eco-booklet-email"
                type="email"
                placeholder="prenom.nom@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <label className="flex items-start gap-2 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 rounded border-input"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  required
                />
                <span>
                  J&apos;accepte le traitement de mon email selon le RGPD (
                  <a href="/legal" className="text-gc-green underline underline-offset-2">
                    politique
                  </a>
                  ).
                </span>
              </label>
              {error && <p className="text-xs text-red-600">{error}</p>}
            </div>
            <Button
              type="submit"
              disabled={!canSubmit}
              className="w-full bg-gc-green hover:bg-gc-green/90 text-white"
              size="sm"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {submitting ? 'Validation...' : 'Recevoir le PDF'}
            </Button>
          </form>
        )}
      </div>
    </aside>
  );
}
