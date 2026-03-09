'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatDateRange, formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { Download, ChevronDown } from 'lucide-react';
import { PasswordField } from '@/components/ui/password-field';
import { isStrongPassword } from '@/lib/password';

type ProfileForm = {
  name: string;
  email: string;
  phone: string;
  addressLine1: string;
  city: string;
  postalCode: string;
  country: string;
  isProfessional: boolean;
  companyName: string;
  vatNumber: string;
};

export default function AccountPage() {
  const ITEMS_PER_PAGE = 3;
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [bookings, setBookings] = useState<any[]>([]);
  const [expandedBookings, setExpandedBookings] = useState<Record<string, boolean>>({});
  const [reservationsPage, setReservationsPage] = useState(1);
  const [invoicesPage, setInvoicesPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [profileForm, setProfileForm] = useState<ProfileForm>({
    name: '',
    email: '',
    phone: '',
    addressLine1: '',
    city: '',
    postalCode: '',
    country: '',
    isProfessional: false,
    companyName: '',
    vatNumber: '',
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [bookingToCancelId, setBookingToCancelId] = useState<string | null>(null);
  const [cancelDialogError, setCancelDialogError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (session) {
      fetchProfile();
      fetchBookings();
    }
  }, [session, status, router]);

  useEffect(() => {
    setReservationsPage(1);
    setInvoicesPage(1);
  }, [bookings]);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/account/profile');
      if (!res.ok) return;
      const data = await res.json();
      setProfileForm({
        name: data.name ?? '',
        email: data.email ?? '',
        phone: data.phone ?? '',
        addressLine1: data.addressLine1 ?? '',
        city: data.city ?? '',
        postalCode: data.postalCode ?? '',
        country: data.country ?? '',
        isProfessional: Boolean(data.isProfessional),
        companyName: data.companyName ?? '',
        vatNumber: data.vatNumber ?? '',
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

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
        body: JSON.stringify(profileForm),
      });

      const payload = (await res.json()) as {
        name?: string;
        email?: string;
        error?: string;
      };
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

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isStrongPassword(passwordForm.newPassword)) {
      setPasswordError(
        'Le nouveau mot de passe doit contenir minuscule, majuscule, chiffre, caractère spécial et 8 caractères minimum.'
      );
      setPasswordMessage(null);
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('La confirmation du mot de passe ne correspond pas.');
      setPasswordMessage(null);
      return;
    }
    setPasswordSaving(true);
    setPasswordMessage(null);
    setPasswordError(null);
    try {
      const res = await fetch('/api/account/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(passwordForm),
      });
      const payload = (await res.json()) as { error?: string };
      if (!res.ok) {
        setPasswordError(payload.error ?? 'Impossible de modifier le mot de passe');
        return;
      }
      setPasswordMessage('Mot de passe mis à jour avec succès.');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch {
      setPasswordError('Une erreur est survenue pendant la mise à jour du mot de passe.');
    } finally {
      setPasswordSaving(false);
    }
  };

  const paidInvoices = bookings.filter((booking) => booking.status === 'PAID' && booking.invoice);
  const paymentHistory = [...paidInvoices].sort(
    (a, b) =>
      new Date(getPaymentDateValue(b)).getTime() -
      new Date(getPaymentDateValue(a)).getTime()
  );
  const reservationsTotalPages = Math.max(1, Math.ceil(bookings.length / ITEMS_PER_PAGE));
  const invoicesTotalPages = Math.max(1, Math.ceil(paymentHistory.length / ITEMS_PER_PAGE));
  const paginatedBookings = bookings.slice(
    (reservationsPage - 1) * ITEMS_PER_PAGE,
    reservationsPage * ITEMS_PER_PAGE
  );
  const paginatedPaymentHistory = paymentHistory.slice(
    (invoicesPage - 1) * ITEMS_PER_PAGE,
    invoicesPage * ITEMS_PER_PAGE
  );

  const getBookingDisplayStatus = (booking: any) => {
    if (booking.status === 'PAID') {
      const hasEnded = new Date(booking.endDate).getTime() < Date.now();
      if (hasEnded) return 'COMPLETED';
    }
    return booking.status;
  };

  const getBookingStatusLabel = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'Confirmée';
      case 'PENDING':
        return 'En attente';
      case 'CANCELLED':
        return 'Annulée';
      case 'COMPLETED':
        return 'Terminée';
      case 'REFUNDED':
        return 'Paiement incomplet';
      default:
        return status;
    }
  };

  const getBookingStatusClass = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      case 'REFUNDED':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatBookingDate = (value: string | Date) =>
    new Date(value).toLocaleDateString('fr-FR');

  const getNights = (startDate: string | Date, endDate: string | Date) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffMs = end.getTime() - start.getTime();
    return Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24)));
  };

  const toggleBookingDetails = (bookingId: string | number) => {
    const key = String(bookingId);
    setExpandedBookings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const formatReservationNumber = (booking: any) => {
    const existingReference = String(booking.reference ?? '').trim();
    if (/^GC-\d{4,}$/.test(existingReference)) {
      return existingReference;
    }

    const numericId = Number.parseInt(String(booking.id).replace(/\D/g, ''), 10);
    const baseNumber = Number.isNaN(numericId) ? 1000 : 1000 + numericId;
    return `GC-${baseNumber}`;
  };

  function getPaymentDateValue(booking: any) {
    return booking.history?.[0]?.createdAt ?? booking.updatedAt ?? booking.createdAt;
  }

  const getPaymentMethodLabel = (booking: any) => {
    const note = String(booking.history?.[0]?.note ?? '').toLowerCase();
    if (note.includes('solde interne')) return 'Solde interne';
    if (booking.stripePaymentIntentId) return 'Carte bancaire (Stripe)';
    return 'Paiement validé';
  };

  const canModifyBooking = (booking: any) => {
    if (booking.status === 'CANCELLED' || booking.status === 'REFUNDED') return false;
    return new Date(booking.startDate).getTime() > Date.now();
  };

  const canCancelBooking = (booking: any) => {
    if (booking.status === 'CANCELLED' || booking.status === 'REFUNDED') return false;
    return new Date(booking.startDate).getTime() > Date.now();
  };

  const handleCancelBooking = async (bookingId: string) => {
    setCancellingBookingId(bookingId);
    setCancelDialogError(null);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'POST',
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(payload?.error || 'Impossible d’annuler la réservation.');
      }
      await fetchBookings();
      setCancelDialogOpen(false);
      setBookingToCancelId(null);
    } catch (error) {
      setCancelDialogError(
        error instanceof Error ? error.message : 'Erreur pendant l’annulation.'
      );
    } finally {
      setCancellingBookingId(null);
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

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Mes réservations</CardTitle>
              </CardHeader>
              <CardContent>
                {bookings.length === 0 ? (
                  <p className="text-muted-foreground">Aucune réservation pour le moment.</p>
                ) : (
                  <div className="space-y-4">
                    {paginatedBookings.map((booking) => (
                      <Card key={booking.id}>
                        <CardContent className="p-4">
                          {/** display status aligned with admin wording */}
                          {(() => {
                            const displayStatus = getBookingDisplayStatus(booking);
                            return (
                              <>
                          <div className="flex items-start justify-between gap-4">
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
                                className={`inline-block px-2 py-1 text-xs rounded ${getBookingStatusClass(
                                  displayStatus
                                )}`}
                              >
                                {getBookingStatusLabel(displayStatus)}
                              </span>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => toggleBookingDetails(booking.id)}
                              >
                                {expandedBookings[String(booking.id)] ? 'Masquer détails' : 'Détails'}
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button type="button" variant="outline" size="sm">
                                    Actions
                                    <ChevronDown className="h-4 w-4 ml-2" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                  {canModifyBooking(booking) && booking.cottage?.slug ? (
                                    <DropdownMenuItem asChild>
                                      <Link
                                        href={`/cottages/${booking.cottage.slug}/book?start=${booking.startDate}&end=${booking.endDate}&adults=${booking.guests}&children=0`}
                                      >
                                        Modifier réservation
                                      </Link>
                                    </DropdownMenuItem>
                                  ) : (
                                    <DropdownMenuItem disabled>
                                      Modifier réservation
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem
                                    disabled={
                                      !canCancelBooking(booking) ||
                                      cancellingBookingId === String(booking.id)
                                    }
                                    onSelect={() => {
                                      setCancelDialogError(null);
                                      setBookingToCancelId(String(booking.id));
                                      setCancelDialogOpen(true);
                                    }}
                                  >
                                    {cancellingBookingId === String(booking.id)
                                      ? 'Annulation...'
                                      : 'Annuler réservation'}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem asChild>
                                    <Link href="/contact">Contacter le propriétaire</Link>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                              {booking.status === 'PAID' && booking.invoice && (
                                <Link href={`/api/invoices/${booking.id}/download`}>
                                  <Button variant="outline" size="sm">
                                    <Download className="h-4 w-4 mr-2" />
                                    Facture
                                  </Button>
                                </Link>
                              )}
                            </div>
                          </div>
                          {expandedBookings[String(booking.id)] && (
                            <div className="mt-4 rounded-md border bg-muted/20 p-3 text-sm">
                              <div className="grid gap-1">
                                <p>
                                  <span className="font-medium">Numéro de réservation :</span>{' '}
                                  {formatReservationNumber(booking)}
                                </p>
                                <p>
                                  <span className="font-medium">Nom du gîte réservé :</span>{' '}
                                  {booking.cottage?.title ?? '—'}
                                </p>
                                <p>
                                  <span className="font-medium">Date d’arrivée :</span>{' '}
                                  {formatBookingDate(booking.startDate)}
                                </p>
                                <p>
                                  <span className="font-medium">Date de départ :</span>{' '}
                                  {formatBookingDate(booking.endDate)}
                                </p>
                                <p>
                                  <span className="font-medium">Nombre de nuits :</span>{' '}
                                  {getNights(booking.startDate, booking.endDate)}
                                </p>
                                <p>
                                  <span className="font-medium">Nombre de personnes :</span>{' '}
                                  {booking.guests}
                                </p>
                                <p>
                                  <span className="font-medium">Statut de la réservation :</span>{' '}
                                  {getBookingStatusLabel(displayStatus)}
                                </p>
                                <p>
                                  <span className="font-medium">Prix total :</span>{' '}
                                  {formatCurrency(booking.total)}
                                </p>
                              </div>
                            </div>
                          )}
                              </>
                            );
                          })()}
                        </CardContent>
                      </Card>
                    ))}
                    {reservationsTotalPages > 1 && (
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={reservationsPage <= 1}
                          onClick={() => setReservationsPage((prev) => Math.max(1, prev - 1))}
                        >
                          Précédent
                        </Button>
                        <span className="text-sm text-muted-foreground">
                          Page {reservationsPage} / {reservationsTotalPages}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={reservationsPage >= reservationsTotalPages}
                          onClick={() =>
                            setReservationsPage((prev) => Math.min(reservationsTotalPages, prev + 1))
                          }
                        >
                          Suivant
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Mes facturations - Historique des paiements</CardTitle>
              </CardHeader>
              <CardContent>
                {paymentHistory.length === 0 ? (
                  <p className="text-muted-foreground">Aucune facture disponible pour le moment.</p>
                ) : (
                  <div className="space-y-3">
                    {paginatedPaymentHistory.map((booking) => (
                      (() => {
                        const displayStatus = getBookingDisplayStatus(booking);
                        return (
                      <div
                        key={`invoice-${booking.id}`}
                        className="flex items-center justify-between gap-4 border rounded-md p-4"
                      >
                        <div className="min-w-0">
                          <p className="font-medium truncate">{booking.cottage?.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDateRange(booking.startDate, booking.endDate)} • {formatCurrency(booking.total)}
                          </p>
                          <p className="mt-1">
                            <span
                              className={`inline-block px-2 py-1 text-xs rounded ${getBookingStatusClass(
                                displayStatus
                              )}`}
                            >
                              {getBookingStatusLabel(displayStatus)}
                            </span>
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Paiement: {formatBookingDate(getPaymentDateValue(booking))} •{' '}
                            {getPaymentMethodLabel(booking)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Facture: {booking.invoice?.invoiceNumber ?? formatReservationNumber(booking)}
                          </p>
                        </div>
                        <Link href={`/api/invoices/${booking.id}/download`}>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Télécharger PDF
                          </Button>
                        </Link>
                      </div>
                        );
                      })()
                    ))}
                    {invoicesTotalPages > 1 && (
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={invoicesPage <= 1}
                          onClick={() => setInvoicesPage((prev) => Math.max(1, prev - 1))}
                        >
                          Précédent
                        </Button>
                        <span className="text-sm text-muted-foreground">
                          Page {invoicesPage} / {invoicesTotalPages}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={invoicesPage >= invoicesTotalPages}
                          onClick={() =>
                            setInvoicesPage((prev) => Math.min(invoicesTotalPages, prev + 1))
                          }
                        >
                          Suivant
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
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
                  <div>
                    <label htmlFor="account-phone" className="block text-sm font-medium mb-1">
                      Téléphone
                    </label>
                    <input
                      id="account-phone"
                      className="w-full rounded-md border px-3 py-2 text-sm"
                      value={profileForm.phone}
                      onChange={(e) =>
                        setProfileForm((s) => ({ ...s, phone: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <label htmlFor="account-address" className="block text-sm font-medium mb-1">
                      Adresse
                    </label>
                    <input
                      id="account-address"
                      className="w-full rounded-md border px-3 py-2 text-sm"
                      value={profileForm.addressLine1}
                      onChange={(e) =>
                        setProfileForm((s) => ({ ...s, addressLine1: e.target.value }))
                      }
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="account-city" className="block text-sm font-medium mb-1">
                        Ville
                      </label>
                      <input
                        id="account-city"
                        className="w-full rounded-md border px-3 py-2 text-sm"
                        value={profileForm.city}
                        onChange={(e) =>
                          setProfileForm((s) => ({ ...s, city: e.target.value }))
                        }
                      />
                    </div>
                    <div>
                      <label htmlFor="account-postal-code" className="block text-sm font-medium mb-1">
                        Code postal
                      </label>
                      <input
                        id="account-postal-code"
                        className="w-full rounded-md border px-3 py-2 text-sm"
                        value={profileForm.postalCode}
                        onChange={(e) =>
                          setProfileForm((s) => ({ ...s, postalCode: e.target.value }))
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="account-country" className="block text-sm font-medium mb-1">
                      Pays
                    </label>
                    <input
                      id="account-country"
                      className="w-full rounded-md border px-3 py-2 text-sm"
                      value={profileForm.country}
                      onChange={(e) =>
                        setProfileForm((s) => ({ ...s, country: e.target.value }))
                      }
                    />
                  </div>
                  <label className="inline-flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={profileForm.isProfessional}
                      onChange={(e) =>
                        setProfileForm((s) => ({ ...s, isProfessional: e.target.checked }))
                      }
                    />
                    Je suis un professionnel
                  </label>
                  {profileForm.isProfessional ? (
                    <div className="space-y-3 border rounded-md p-3">
                      <div>
                        <label htmlFor="account-company" className="block text-sm font-medium mb-1">
                          Société
                        </label>
                        <input
                          id="account-company"
                          className="w-full rounded-md border px-3 py-2 text-sm"
                          value={profileForm.companyName}
                          onChange={(e) =>
                            setProfileForm((s) => ({ ...s, companyName: e.target.value }))
                          }
                        />
                      </div>
                      <div>
                        <label htmlFor="account-vat" className="block text-sm font-medium mb-1">
                          Numéro TVA
                        </label>
                        <input
                          id="account-vat"
                          className="w-full rounded-md border px-3 py-2 text-sm"
                          value={profileForm.vatNumber}
                          onChange={(e) =>
                            setProfileForm((s) => ({ ...s, vatNumber: e.target.value }))
                          }
                        />
                      </div>
                    </div>
                  ) : null}
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

            <Card>
              <CardHeader>
                <CardTitle>Mot de passe</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordSave} className="space-y-4">
                  <PasswordField
                    id="current-password"
                    label="Mot de passe actuel"
                    value={passwordForm.currentPassword}
                    onChange={(value) =>
                      setPasswordForm((s) => ({ ...s, currentPassword: value }))
                    }
                    required
                  />
                  <PasswordField
                    id="new-password"
                    label="Nouveau mot de passe"
                    value={passwordForm.newPassword}
                    onChange={(value) =>
                      setPasswordForm((s) => ({ ...s, newPassword: value }))
                    }
                    required
                    showChecks
                  />
                  <PasswordField
                    id="confirm-password"
                    label="Confirmer le mot de passe"
                    value={passwordForm.confirmPassword}
                    onChange={(value) =>
                      setPasswordForm((s) => ({ ...s, confirmPassword: value }))
                    }
                    required
                  />
                  {passwordMessage ? <p className="text-sm text-green-700">{passwordMessage}</p> : null}
                  {passwordError ? <p className="text-sm text-destructive">{passwordError}</p> : null}
                  <Button type="submit" size="sm" disabled={passwordSaving}>
                    {passwordSaving ? 'Mise à jour...' : 'Changer le mot de passe'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
      <Dialog
        open={cancelDialogOpen}
        onOpenChange={(open) => {
          setCancelDialogOpen(open);
          if (!open) {
            setCancelDialogError(null);
            setBookingToCancelId(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer l’annulation</DialogTitle>
            <DialogDescription>
              Cette action annulera votre réservation. Voulez-vous continuer ?
            </DialogDescription>
          </DialogHeader>
          {cancelDialogError ? (
            <p className="text-sm text-destructive">{cancelDialogError}</p>
          ) : null}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setCancelDialogOpen(false);
                setCancelDialogError(null);
                setBookingToCancelId(null);
              }}
            >
              Garder la réservation
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={!bookingToCancelId || cancellingBookingId === bookingToCancelId}
              onClick={() => bookingToCancelId && handleCancelBooking(bookingToCancelId)}
            >
              {cancellingBookingId === bookingToCancelId
                ? 'Annulation...'
                : 'Confirmer l’annulation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
