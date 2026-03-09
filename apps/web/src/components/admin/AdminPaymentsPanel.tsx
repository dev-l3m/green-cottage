'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type PaymentMode = 'CARTE_BANCAIRE' | 'STRIPE' | 'PAYPAL' | 'VIREMENT' | 'ESPECES';
type BookingStatus = 'PENDING' | 'PAID' | 'CANCELLED' | 'REFUNDED';
type PaymentAction = 'SET_PENDING' | 'SET_DEPOSIT' | 'SETTLE_REMAINING' | 'REFUND';

export type AdminPaymentItem = {
  id: string;
  reservation: string;
  clientName: string;
  clientEmail: string;
  amount: number;
  mode: PaymentMode;
  status: BookingStatus;
  paidAmount: number;
  remainingAmount: number;
  hasInvoice: boolean;
};

const MODE_LABEL: Record<PaymentMode, string> = {
  CARTE_BANCAIRE: 'Carte bancaire',
  STRIPE: 'Stripe',
  PAYPAL: 'Paypal',
  VIREMENT: 'Virement',
  ESPECES: 'Espèces',
};

const STATUS_LABEL: Record<BookingStatus, string> = {
  PENDING: 'En attente',
  PAID: 'Confirmée',
  CANCELLED: 'Annulée',
  REFUNDED: 'Paiement incomplet',
};

const ACTION_LABEL: Record<PaymentAction, string> = {
  SET_PENDING: 'Paiement en attente',
  SET_DEPOSIT: 'Acompte',
  SETTLE_REMAINING: 'Solde restant',
  REFUND: 'Remboursement',
};

export default function AdminPaymentsPanel({ initialPayments }: { initialPayments: AdminPaymentItem[] }) {
  const [payments, setPayments] = useState(initialPayments);
  const [filter, setFilter] = useState<'ALL' | 'PENDING'>('ALL');
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [selectedActionById, setSelectedActionById] = useState<Record<string, PaymentAction | ''>>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogPaymentId, setDialogPaymentId] = useState<string | null>(null);
  const [dialogAction, setDialogAction] = useState<PaymentAction | null>(null);

  const list = useMemo(() => {
    if (filter === 'PENDING') return payments.filter((p) => p.status === 'PENDING');
    return payments;
  }, [payments, filter]);

  const updatePayment = async (
    paymentId: string,
    payload: { mode?: PaymentMode; action?: PaymentAction; depositAmount?: number }
  ) => {
    setPendingId(paymentId);
    try {
      const res = await fetch(`/api/admin/payments/${paymentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Impossible de mettre à jour le paiement');
      const updated = await res.json();
      const updatedPayment = updated.options?._payment ?? {};

      setPayments((prev) =>
        prev.map((p) => {
          if (p.id !== paymentId) return p;
          return {
            ...p,
            status: updated.status as BookingStatus,
            mode: (updatedPayment.method as PaymentMode) ?? p.mode,
            paidAmount: Number(updatedPayment.paidAmount ?? p.paidAmount),
            remainingAmount: Number(updatedPayment.remainingAmount ?? p.remainingAmount),
          };
        })
      );
      if (payload.action) {
        setSelectedActionById((prev) => ({ ...prev, [paymentId]: '' }));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setPendingId(null);
    }
  };

  if (payments.length === 0) {
    return <p className="text-muted-foreground">Aucun paiement enregistré.</p>;
  }

  const selectedPayment = payments.find((p) => p.id === dialogPaymentId) ?? null;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button size="sm" variant={filter === 'ALL' ? 'default' : 'outline'} onClick={() => setFilter('ALL')}>
          Voir paiements
        </Button>
        <Button
          size="sm"
          variant={filter === 'PENDING' ? 'default' : 'outline'}
          onClick={() => setFilter('PENDING')}
        >
          Paiements en attente
        </Button>
      </div>

      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-muted/50">
            <tr className="text-left">
              <th className="px-3 py-2 font-medium">Réservation</th>
              <th className="px-3 py-2 font-medium">Client</th>
              <th className="px-3 py-2 font-medium">Montant</th>
              <th className="px-3 py-2 font-medium">Mode</th>
              <th className="px-3 py-2 font-medium">Statut</th>
              <th className="px-3 py-2 font-medium">Acompte</th>
              <th className="px-3 py-2 font-medium">Solde restant</th>
              <th className="px-3 py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((payment) => {
              const busy = pendingId === payment.id;
              return (
                <tr key={payment.id} className="border-t">
                  <td className="px-3 py-2">{payment.reservation}</td>
                  <td className="px-3 py-2">
                    <div>{payment.clientName}</div>
                    <a href={`mailto:${payment.clientEmail}`} className="text-gc-green underline underline-offset-2">
                      {payment.clientEmail}
                    </a>
                  </td>
                  <td className="px-3 py-2">{payment.amount.toFixed(0)}€</td>
                  <td className="px-3 py-2">
                    <select
                      className="h-9 rounded-md border bg-background px-2"
                      value={payment.mode}
                      disabled={busy}
                      onChange={(e) =>
                        updatePayment(payment.id, { mode: e.target.value as PaymentMode })
                      }
                    >
                      {Object.entries(MODE_LABEL).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2">{STATUS_LABEL[payment.status]}</td>
                  <td className="px-3 py-2">{payment.paidAmount.toFixed(0)}€</td>
                  <td className="px-3 py-2">{payment.remainingAmount.toFixed(0)}€</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <select
                        className="h-9 rounded-md border bg-background px-2 min-w-[180px]"
                        value={selectedActionById[payment.id] ?? ''}
                        disabled={busy}
                        onChange={(e) => {
                          const nextAction = e.target.value as PaymentAction | '';
                          setSelectedActionById((prev) => ({
                            ...prev,
                            [payment.id]: nextAction,
                          }));
                          if (nextAction) {
                            setDialogPaymentId(payment.id);
                            setDialogAction(nextAction);
                            setDialogOpen(true);
                          }
                        }}
                      >
                        <option value="">Sélectionner une action</option>
                        {Object.entries(ACTION_LABEL).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open && dialogPaymentId) {
            setSelectedActionById((prev) => ({ ...prev, [dialogPaymentId]: '' }));
            setDialogPaymentId(null);
            setDialogAction(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer l&apos;action paiement</DialogTitle>
            <DialogDescription>
              {selectedPayment && dialogAction
                ? `Vous allez appliquer "${ACTION_LABEL[dialogAction]}" pour la réservation "${selectedPayment.reservation}".`
                : 'Confirmez cette action de paiement.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDialogOpen(false);
              }}
            >
              Annuler
            </Button>
            <Button
              type="button"
              disabled={!dialogPaymentId || !dialogAction || pendingId === dialogPaymentId}
              onClick={async () => {
                if (!dialogPaymentId || !dialogAction) return;
                await updatePayment(dialogPaymentId, { action: dialogAction });
                setDialogOpen(false);
                setDialogPaymentId(null);
                setDialogAction(null);
              }}
            >
              {pendingId === dialogPaymentId ? 'Traitement...' : 'Confirmer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
