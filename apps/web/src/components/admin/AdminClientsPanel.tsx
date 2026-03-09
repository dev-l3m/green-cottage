'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PasswordField } from '@/components/ui/password-field';
import { isStrongPassword } from '@/lib/password';

export type AdminClientItem = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  bookingsCount: number;
  paidTotal: number;
};

export default function AdminClientsPanel({
  initialClients,
}: {
  initialClients: AdminClientItem[];
}) {
  const [passwords, setPasswords] = useState<Record<string, string>>({});
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const updatePassword = async (clientId: string) => {
    const newPassword = (passwords[clientId] ?? '').trim();
    if (!isStrongPassword(newPassword)) {
      setError(
        'Le mot de passe doit contenir minuscule, majuscule, chiffre, caractère spécial et 8 caractères minimum.'
      );
      setMessage(null);
      return;
    }

    setPendingId(clientId);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/users/${clientId}/password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
      });
      const payload = (await res.json()) as { error?: string; email?: string };
      if (!res.ok) {
        throw new Error(payload.error ?? 'Impossible de changer le mot de passe');
      }
      setPasswords((prev) => ({ ...prev, [clientId]: '' }));
      setMessage(`Mot de passe mis à jour pour ${payload.email ?? 'le client'}.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Impossible de changer le mot de passe');
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {message ? <p className="text-sm text-green-700">{message}</p> : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-muted/50">
            <tr className="text-left">
              <th className="px-3 py-2 font-medium">Client</th>
              <th className="px-3 py-2 font-medium">Email</th>
              <th className="px-3 py-2 font-medium">Inscrit le</th>
              <th className="px-3 py-2 font-medium">Réservations</th>
              <th className="px-3 py-2 font-medium">CA confirmé</th>
              <th className="px-3 py-2 font-medium">Mot de passe (admin)</th>
            </tr>
          </thead>
          <tbody>
            {initialClients.map((client) => (
              <tr key={client.id} className="border-t">
                <td className="px-3 py-2">{client.name}</td>
                <td className="px-3 py-2">
                  <a href={`mailto:${client.email}`} className="text-gc-green underline underline-offset-2">
                    {client.email}
                  </a>
                </td>
                <td className="px-3 py-2">
                  {new Date(client.createdAt).toLocaleDateString('fr-FR')}
                </td>
                <td className="px-3 py-2">{client.bookingsCount}</td>
                <td className="px-3 py-2">{client.paidTotal.toFixed(0)}€</td>
                <td className="px-3 py-2">
                  <div className="flex items-end gap-2">
                    <div className="min-w-[260px]">
                      <PasswordField
                        id={`admin-password-${client.id}`}
                        label="Nouveau mot de passe"
                        value={passwords[client.id] ?? ''}
                        onChange={(value) =>
                          setPasswords((prev) => ({
                            ...prev,
                            [client.id]: value,
                          }))
                        }
                      />
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={pendingId === client.id}
                      onClick={() => updatePassword(client.id)}
                    >
                      {pendingId === client.id ? 'Mise à jour...' : 'Mettre à jour'}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
