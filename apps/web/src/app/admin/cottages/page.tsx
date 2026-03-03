'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import Link from 'next/link';
import { Plus, Edit, Trash2 } from 'lucide-react';

export default function AdminCottagesPage() {
  const [cottages, setCottages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchCottages();
  }, []);

  const fetchCottages = async () => {
    try {
      const res = await fetch('/api/admin/cottages');
      if (res.ok) {
        const data = await res.json();
        setCottages(data);
      }
    } catch (error) {
      console.error('Error fetching cottages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/cottages/${deleteTarget.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setDeleteTarget(null);
        fetchCottages();
      }
    } catch (error) {
      console.error('Error deleting cottage:', error);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <p>Chargement...</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-heading text-3xl font-bold">Cottages</h1>
        <Link href="/admin/cottages/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un cottage
          </Button>
        </Link>
      </div>

      {cottages.length === 0 ? (
        <p className="text-muted-foreground">Aucun cottage pour le moment.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cottages.map((cottage) => (
            <Card key={cottage.id}>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2">{cottage.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{cottage.summary}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm">
                    {cottage.basePrice}€/nuit • {cottage.capacity} personnes
                  </span>
                  <div className="flex gap-2">
                    <Link href={`/admin/cottages/${cottage.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setDeleteTarget({
                          id: cottage.id,
                          title: cottage.title,
                        })
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open && !deleting) setDeleteTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer ce cottage ?</DialogTitle>
            <DialogDescription>
              Cette action est irréversible.
              {deleteTarget?.title ? ` Cottage concerné : ${deleteTarget.title}.` : ''}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
            >
              Annuler
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? 'Suppression...' : 'Supprimer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
