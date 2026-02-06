'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Home,
  Calendar,
  Star,
  FileText,
  Settings,
  Calendar as CalendarIcon,
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (session && (session.user as any)?.role !== 'ADMIN') {
      router.push('/');
      return;
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Chargement...</p>
      </div>
    );
  }

  if (!session || (session.user as any)?.role !== 'ADMIN') {
    return null;
  }

  const menuItems = [
    { href: '/admin', label: 'Tableau de bord', icon: LayoutDashboard },
    { href: '/admin/cottages', label: 'Cottages', icon: Home },
    { href: '/admin/bookings', label: 'Réservations', icon: Calendar },
    { href: '/admin/reviews', label: 'Avis', icon: Star },
    { href: '/admin/invoices', label: 'Factures', icon: FileText },
    { href: '/admin/ical', label: 'Calendriers iCal', icon: CalendarIcon },
    { href: '/admin/settings', label: 'Paramètres', icon: Settings },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1">
        <aside className="w-64 border-r bg-muted/50 p-4">
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </aside>
        <main className="flex-1 p-8">{children}</main>
      </div>
      <Footer />
    </div>
  );
}
