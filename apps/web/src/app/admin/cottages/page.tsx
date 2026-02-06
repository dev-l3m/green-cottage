'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Plus, Edit, Trash2 } from 'lucide-react';

export default function AdminCottagesPage() {
  const [cottages, setCottages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce cottage ?')) return;

    try {
      const res = await fetch(`/api/admin/cottages/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchCottages();
      }
    } catch (error) {
      console.error('Error deleting cottage:', error);
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
                      onClick={() => handleDelete(cottage.id)}
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
    </div>
  );
}
