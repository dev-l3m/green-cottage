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
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (session) {
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
                                    ? 'bg-green-100 text-green-800'
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
                <p className="text-sm text-muted-foreground mb-2">
                  <strong>Email:</strong> {session?.user?.email}
                </p>
                {session?.user?.name && (
                  <p className="text-sm text-muted-foreground">
                    <strong>Nom:</strong> {session.user.name}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
