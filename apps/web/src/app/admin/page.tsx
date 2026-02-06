'use client';

import { useState, useEffect } from 'react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    cottages: 0,
    bookings: 0,
    reviews: 0,
    revenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch stats from API
    setStats({
      cottages: 0,
      bookings: 0,
      reviews: 0,
      revenue: 0,
    });
    setLoading(false);
  }, []);

  if (loading) {
    return <p>Chargement...</p>;
  }

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold mb-8">Tableau de bord</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="p-6 border rounded-lg">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Cottages actifs</h3>
          <p className="text-3xl font-bold">{stats.cottages}</p>
        </div>
        <div className="p-6 border rounded-lg">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Réservations</h3>
          <p className="text-3xl font-bold">{stats.bookings}</p>
        </div>
        <div className="p-6 border rounded-lg">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Avis publiés</h3>
          <p className="text-3xl font-bold">{stats.reviews}</p>
        </div>
        <div className="p-6 border rounded-lg">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Chiffre d&apos;affaires</h3>
          <p className="text-3xl font-bold">{stats.revenue.toFixed(0)}€</p>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="font-heading text-2xl font-semibold">Actions rapides</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a href="/admin/cottages/new" className="p-6 border rounded-lg hover:bg-muted transition-colors">
            <h3 className="font-semibold mb-2">Ajouter un cottage</h3>
            <p className="text-sm text-muted-foreground">Créer un nouveau cottage</p>
          </a>
          <a href="/admin/bookings" className="p-6 border rounded-lg hover:bg-muted transition-colors">
            <h3 className="font-semibold mb-2">Voir les réservations</h3>
            <p className="text-sm text-muted-foreground">Gérer les réservations</p>
          </a>
          <a href="/admin/reviews" className="p-6 border rounded-lg hover:bg-muted transition-colors">
            <h3 className="font-semibold mb-2">Modérer les avis</h3>
            <p className="text-sm text-muted-foreground">Approuver ou rejeter les avis</p>
          </a>
        </div>
      </div>
    </div>
  );
}
