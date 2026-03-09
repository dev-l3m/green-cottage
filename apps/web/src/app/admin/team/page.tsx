'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

type TeamRole = 'ADMIN' | 'MANAGER' | 'RECEPTION';

type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: TeamRole;
  permissions: {
    bookings: boolean;
    invoices: boolean;
    stats: boolean;
  };
  createdAt: string;
  updatedAt: string;
};

const ROLE_LABEL: Record<TeamRole, string> = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  RECEPTION: 'réception',
};

const defaultPermissionsByRole: Record<TeamRole, TeamMember['permissions']> = {
  ADMIN: { bookings: true, invoices: true, stats: true },
  MANAGER: { bookings: true, invoices: true, stats: true },
  RECEPTION: { bookings: true, invoices: false, stats: false },
};

export default function AdminTeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<TeamRole>('RECEPTION');
  const [permissions, setPermissions] = useState<TeamMember['permissions']>(
    defaultPermissionsByRole.RECEPTION
  );

  const fetchMembers = async () => {
    try {
      const res = await fetch('/api/admin/team');
      if (!res.ok) return;
      const data = await res.json();
      setMembers(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const createMember = async () => {
    if (!name.trim() || !email.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          role,
          permissions,
        }),
      });
      if (!res.ok) throw new Error('Impossible de créer le membre');
      const created = await res.json();
      setMembers((prev) => [created, ...prev]);
      setName('');
      setEmail('');
      setRole('RECEPTION');
      setPermissions(defaultPermissionsByRole.RECEPTION);
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const updateMember = async (member: TeamMember, patch: Partial<TeamMember>) => {
    try {
      const payload = {
        name: patch.name ?? member.name,
        email: patch.email ?? member.email,
        role: patch.role ?? member.role,
        permissions: patch.permissions ?? member.permissions,
      };
      const res = await fetch(`/api/admin/team/${member.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Impossible de mettre à jour le membre');
      const updated = await res.json();
      setMembers((prev) => prev.map((m) => (m.id === member.id ? updated : m)));
    } catch (error) {
      console.error(error);
    }
  };

  const deleteMember = async (id: string) => {
    const confirmed = window.confirm('Supprimer cet utilisateur équipe ?');
    if (!confirmed) return;
    try {
      const res = await fetch(`/api/admin/team/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Impossible de supprimer le membre');
      setMembers((prev) => prev.filter((m) => m.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold mb-2">Gestion équipe</h1>
        <p className="text-muted-foreground">
          Section Utilisateurs: création des rôles admin, manager, réception avec permissions.
        </p>
      </div>

      <div className="border rounded-lg p-4 space-y-3">
        <h2 className="font-semibold">Créer un utilisateur équipe</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            className="h-10 rounded-md border px-3 text-sm"
            placeholder="Nom"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="h-10 rounded-md border px-3 text-sm"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <select
            className="h-10 rounded-md border px-3 text-sm"
            value={role}
            onChange={(e) => {
              const nextRole = e.target.value as TeamRole;
              setRole(nextRole);
              setPermissions(defaultPermissionsByRole[nextRole]);
            }}
          >
            <option value="ADMIN">admin</option>
            <option value="MANAGER">manager</option>
            <option value="RECEPTION">réception</option>
          </select>
          <Button type="button" disabled={saving} onClick={createMember}>
            {saving ? 'Création...' : 'Créer'}
          </Button>
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={permissions.bookings}
              onChange={(e) => setPermissions((p) => ({ ...p, bookings: e.target.checked }))}
            />
            accès réservations
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={permissions.invoices}
              onChange={(e) => setPermissions((p) => ({ ...p, invoices: e.target.checked }))}
            />
            accès factures
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={permissions.stats}
              onChange={(e) => setPermissions((p) => ({ ...p, stats: e.target.checked }))}
            />
            accès statistiques
          </label>
        </div>
      </div>

      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-muted/50">
            <tr className="text-left">
              <th className="px-3 py-2 font-medium">Utilisateur</th>
              <th className="px-3 py-2 font-medium">Rôle</th>
              <th className="px-3 py-2 font-medium">Permissions</th>
              <th className="px-3 py-2 font-medium">Créé le</th>
              <th className="px-3 py-2 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-3 py-3" colSpan={5}>
                  Chargement...
                </td>
              </tr>
            ) : members.length === 0 ? (
              <tr>
                <td className="px-3 py-3 text-muted-foreground" colSpan={5}>
                  Aucun utilisateur équipe.
                </td>
              </tr>
            ) : (
              members.map((member) => (
                <tr key={member.id} className="border-t">
                  <td className="px-3 py-2">
                    <div className="font-medium">{member.name}</div>
                    <div className="text-muted-foreground">{member.email}</div>
                  </td>
                  <td className="px-3 py-2">
                    <select
                      className="h-9 rounded-md border px-2"
                      value={member.role}
                      onChange={(e) =>
                        updateMember(member, {
                          role: e.target.value as TeamRole,
                          permissions: defaultPermissionsByRole[e.target.value as TeamRole],
                        })
                      }
                    >
                      <option value="ADMIN">admin</option>
                      <option value="MANAGER">manager</option>
                      <option value="RECEPTION">réception</option>
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-3">
                      <label className="inline-flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={member.permissions.bookings}
                          onChange={(e) =>
                            updateMember(member, {
                              permissions: {
                                ...member.permissions,
                                bookings: e.target.checked,
                              },
                            })
                          }
                        />
                        résa
                      </label>
                      <label className="inline-flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={member.permissions.invoices}
                          onChange={(e) =>
                            updateMember(member, {
                              permissions: {
                                ...member.permissions,
                                invoices: e.target.checked,
                              },
                            })
                          }
                        />
                        factures
                      </label>
                      <label className="inline-flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={member.permissions.stats}
                          onChange={(e) =>
                            updateMember(member, {
                              permissions: {
                                ...member.permissions,
                                stats: e.target.checked,
                              },
                            })
                          }
                        />
                        stats
                      </label>
                    </div>
                  </td>
                  <td className="px-3 py-2">{new Date(member.createdAt).toLocaleDateString('fr-FR')}</td>
                  <td className="px-3 py-2 text-right">
                    <Button type="button" size="sm" variant="outline" onClick={() => deleteMember(member.id)}>
                      Supprimer
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
