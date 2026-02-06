'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionId) {
      setLoading(false);
    }
  }, [sessionId]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 container py-12">
          <p>Vérification...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container py-12">
        <div className="max-w-2xl mx-auto text-center">
          <CheckCircle className="h-16 w-16 text-primary mx-auto mb-4" />
          <h1 className="font-heading text-3xl font-bold mb-4">Réservation confirmée !</h1>
          <p className="text-muted-foreground mb-8">
            Merci pour votre réservation. Vous recevrez un email de confirmation sous peu.
          </p>
          <Card>
            <CardContent className="p-6">
              <p className="mb-4">Votre réservation a été enregistrée avec succès.</p>
              <div className="flex gap-4 justify-center">
                <Link href="/account">
                  <Button>Voir mes réservations</Button>
                </Link>
                <Link href="/cottages">
                  <Button variant="outline">Explorer d&apos;autres cottages</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 container py-12"><p>Chargement...</p></main>
        <Footer />
      </div>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
