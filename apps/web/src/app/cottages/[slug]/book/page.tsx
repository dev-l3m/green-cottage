'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { loadStripe } from '@stripe/stripe-js';
import { formatCurrency, calculateNights } from '@/lib/utils';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

const DEFAULT_PRICE = 100;

export default function BookPage({ params }: { params: { slug: string } }) {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [cottage, setCottage] = useState<{
    id: string;
    title: string;
    basePrice: number;
    cleaningFee: number;
    capacity: number;
  } | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
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
            basePrice: typeof data.basePrice === 'number' ? data.basePrice : DEFAULT_PRICE,
            cleaningFee: data.cleaningFee ?? 30,
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
    basePrice: DEFAULT_PRICE,
    cleaningFee: 30,
    capacity: 4,
  };

  const nights = formData.startDate && formData.endDate
    ? calculateNights(formData.startDate, formData.endDate)
    : 0;
  const baseAmount = effectiveCottage.basePrice * nights;
  const cleaningFee = formData.options.cleaning ? effectiveCottage.cleaningFee : 0;
  const touristTax = (baseAmount + cleaningFee) * 0.025;
  const total = baseAmount + cleaningFee + touristTax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session) {
      router.push('/auth/signin?callbackUrl=' + encodeURIComponent(window.location.href));
      return;
    }

    if (!formData.startDate || !formData.endDate) {
      toast({
        title: 'Erreur',
        description: 'Veuillez sélectionner vos dates',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/bookings/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cottageId: effectiveCottage.id,
          startDate: formData.startDate,
          endDate: formData.endDate,
          guests: formData.guests,
          options: formData.options,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la création de la réservation');
      }

      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe not loaded');

      await stripe.redirectToCheckout({ sessionId: data.sessionId });
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue',
        variant: 'destructive',
      });
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
                    <span>Ménage final ({formatCurrency(effectiveCottage.cleaningFee)})</span>
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
                      <span>{effectiveCottage.basePrice.toFixed(0)}€ × {nights} nuit{nights > 1 ? 's' : ''}</span>
                      <span>{formatCurrency(baseAmount)}</span>
                    </div>
                    {formData.options.cleaning && (
                      <div className="flex justify-between">
                        <span>Ménage</span>
                        <span>{formatCurrency(cleaningFee)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Taxe de séjour</span>
                      <span>{formatCurrency(touristTax)}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-semibold">
                      <span>Total</span>
                      <span>{formatCurrency(total)}</span>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={loading || !cottage}
                  >
                    {loading ? 'Traitement...' : !cottage ? 'Chargement...' : 'Procéder au paiement'}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    Paiement sécurisé par Stripe
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
}
