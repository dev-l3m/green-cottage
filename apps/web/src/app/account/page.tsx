'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDateRange, formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { Download } from 'lucide-react';

export default function AccountPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileForm, setProfileForm] = useState({ name: '', email: '' });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (session) {
      setProfileForm({
        name: session.user?.name ?? '',
        email: session.user?.email ?? '',
      });
      fetchBookings();
    }
  }, [session, status, router]);

  const fetchBookings = async () => {
    try {
      const res = await fetch('/api/bookings');
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMessage(null);
    setProfileError(null);

    try {
      const res = await fetch('/api/account/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profileForm.name,
          email: profileForm.email,
        }),
      });

      const payload = (await res.json()) as { name?: string; email?: string; error?: string };
      if (!res.ok) {
        setProfileError(payload.error ?? 'Impossible de mettre à jour le profil');
        setProfileSaving(false);
        return;
      }

      await update({
        user: {
          name: payload.name ?? profileForm.name,
          email: payload.email ?? profileForm.email,
        },
      });

      setProfileMessage('Informations mises à jour avec succès.');
    } catch {
      setProfileError('Une erreur est survenue pendant la mise à jour.');
    } finally {
      setProfileSaving(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 container py-12">
          <p>Chargement...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container py-12">
        <h1 className="font-heading text-3xl font-bold mb-8">Mon compte</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Mes réservations</CardTitle>
              </CardHeader>
              <CardContent>
                {bookings.length === 0 ? (
                  <p className="text-muted-foreground">Aucune réservation pour le moment.</p>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <Card key={booking.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold mb-2">{booking.cottage?.title}</h3>
                              <p className="text-sm text-muted-foreground mb-1">
                                {formatDateRange(booking.startDate, booking.endDate)}
                              </p>
                              <p className="text-sm text-muted-foreground mb-2">
                                {booking.guests} invité{booking.guests > 1 ? 's' : ''} •{' '}
                                {formatCurrency(booking.total)}
                              </p>
                              <span
                                className={`inline-block px-2 py-1 text-xs rounded ${
                                  booking.status === 'PAID'
                                    ? 'bg-gc-green/15 text-gc-forest'
                                    : booking.status === 'PENDING'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {booking.status === 'PAID'
                                  ? 'Payé'
                                  : booking.status === 'PENDING'
                                  ? 'En attente'
                                  : booking.status}
                              </span>
                            </div>
                            {booking.status === 'PAID' && booking.invoice && (
                              <Link href={`/api/invoices/${booking.id}/download`}>
                                <Button variant="outline" size="sm">
                                  <Download className="h-4 w-4 mr-2" />
                                  Facture
                                </Button>
                              </Link>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Informations</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileSave} className="space-y-4">
                  <div>
                    <label htmlFor="account-name" className="block text-sm font-medium mb-1">
                      Nom
                    </label>
                    <input
                      id="account-name"
                      className="w-full rounded-md border px-3 py-2 text-sm"
                      value={profileForm.name}
                      onChange={(e) =>
                        setProfileForm((s) => ({ ...s, name: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="account-email" className="block text-sm font-medium mb-1">
                      Email
                    </label>
                    <input
                      id="account-email"
                      type="email"
                      className="w-full rounded-md border px-3 py-2 text-sm"
                      value={profileForm.email}
                      onChange={(e) =>
                        setProfileForm((s) => ({ ...s, email: e.target.value }))
                      }
                      required
                    />
                  </div>
                  {profileMessage && (
                    <p className="text-sm text-green-700">{profileMessage}</p>
                  )}
                  {profileError && (
                    <p className="text-sm text-destructive">{profileError}</p>
                  )}
                  <Button type="submit" size="sm" disabled={profileSaving}>
                    {profileSaving ? 'Enregistrement...' : 'Mettre à jour'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
