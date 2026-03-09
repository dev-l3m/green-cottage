'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { calculateNights } from '@/lib/utils';

export default function BookPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [cottage, setCottage] = useState<{
    id: string;
    title: string;
    capacity: number;
  } | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    guests: 2,
    options: {
      cleaning: false,
      breakfast: false,
    },
  });

  // Prefill from URL (Configuration du séjour modal)
  useEffect(() => {
    const start = searchParams.get('start');
    const end = searchParams.get('end');
    const adults = parseInt(searchParams.get('adults') ?? '1', 10);
    const children = parseInt(searchParams.get('children') ?? '0', 10);
    if (start && end) {
      setFormData((prev) => ({
        ...prev,
        startDate: start,
        endDate: end,
        guests: adults + children,
      }));
    } else if (adults + children > 0) {
      setFormData((prev) => ({ ...prev, guests: adults + children }));
    }
  }, [searchParams]);

  // Fetch cottage by slug (API uses DB; basePrice 100€ for all)
  useEffect(() => {
    let cancelled = false;
    async function fetchCottage() {
      try {
        const res = await fetch(`/api/cottages/${params.slug}`);
        if (!res.ok) {
          if (res.status === 404) setFetchError('Cottage non trouvé pour la réservation.');
          else setFetchError('Erreur lors du chargement.');
          return;
        }
        const data = await res.json();
        if (!cancelled) {
          setCottage({
            id: data.id,
            title: data.title,
            capacity: data.capacity ?? 4,
          });
        }
      } catch {
        if (!cancelled) setFetchError('Erreur lors du chargement.');
      }
    }
    fetchCottage();
    return () => { cancelled = true; };
  }, [params.slug]);

  const effectiveCottage = cottage ?? {
    id: '',
    title: params.slug,
    capacity: 4,
  };

  const nights = formData.startDate && formData.endDate
    ? calculateNights(formData.startDate, formData.endDate)
    : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.startDate || !formData.endDate) {
      toast({
        title: 'Erreur',
        description: 'Veuillez sélectionner vos dates',
        variant: 'destructive',
      });
      return;
    }

    if (!cottage) return;

    setLoading(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cottageId: cottage.id,
          startDate: formData.startDate,
          endDate: formData.endDate,
          guests: formData.guests,
          options: formData.options,
        }),
      });

      if (res.status === 401) {
        const callback = encodeURIComponent(`/cottages/${params.slug}/book`);
        router.push(`/auth/signin?callbackUrl=${callback}`);
        return;
      }

      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload?.error || 'Impossible d’envoyer la réservation');
      }

      setRequestDialogOpen(true);
    } catch (error) {
      toast({
        title: 'Erreur',
        description:
          error instanceof Error ? error.message : 'Impossible d’envoyer votre demande.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetchError && !cottage) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 container py-8">
          <p className="text-muted-foreground">{fetchError}</p>
          <Button variant="outline" className="mt-4" onClick={() => router.push('/cottages')}>
            Retour aux cottages
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <h1 className="font-heading text-3xl font-bold mb-8">Réserver: {effectiveCottage.title}</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Dates et voyageurs</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startDate">Date d&apos;arrivée</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="endDate">Date de départ</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        min={formData.startDate || new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="guests">Nombre de voyageurs</Label>
                    <Input
                      id="guests"
                      type="number"
                      min="1"
                      max={effectiveCottage.capacity}
                      value={formData.guests}
                      onChange={(e) =>
                        setFormData({ ...formData, guests: parseInt(e.target.value) })
                      }
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.options.cleaning}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          options: { ...formData.options, cleaning: e.target.checked },
                        })
                      }
                    />
                    <span>Ménage final (option)</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.options.breakfast}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          options: { ...formData.options, breakfast: e.target.checked },
                        })
                      }
                    />
                    <span>Petit-déjeuner (sur demande)</span>
                  </label>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="sticky top-20">
                <CardHeader>
                  <CardTitle>Résumé</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Durée du séjour</span>
                      <span>{nights > 0 ? `${nights} nuit${nights > 1 ? 's' : ''}` : '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Voyageurs</span>
                      <span>{formData.guests}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ménage final</span>
                      <span>{formData.options.cleaning ? 'Oui' : 'Non'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Petit-déjeuner</span>
                      <span>{formData.options.breakfast ? 'Oui' : 'Non'}</span>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={loading || !cottage}
                  >
                    {loading ? 'Paiement en cours...' : !cottage ? 'Chargement...' : 'Payer avec mon solde'}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    Paiement immédiat via votre solde interne de test.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>

        <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Paiement confirmé</DialogTitle>
            </DialogHeader>
            <p className="text-muted-foreground">
              Votre paiement a été validé avec le solde interne et votre réservation est confirmée.
            </p>
            <DialogFooter>
              <Button type="button" onClick={() => router.push('/account')}>
                Voir mes réservations
              </Button>
              <Button type="button" variant="outline" onClick={() => setRequestDialogOpen(false)}>
                Continuer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
      <Footer />
    </div>
  );
}
