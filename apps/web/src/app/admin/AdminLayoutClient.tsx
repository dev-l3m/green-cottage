'use client';

import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { FooterAdmin } from '@/components/layout/footeradmin';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  LineChart,
  Home,
  Users,
  Calendar,
  Star,
  FileText,
  BookOpen,
  Tags,
  Settings,
  Calendar as CalendarIcon,
  Mail,
  CreditCard,
  ShieldCheck,
} from 'lucide-react';

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [accessLoading, setAccessLoading] = useState(true);
  const [access, setAccess] = useState<{
    allowed: boolean;
    role: 'ADMIN' | 'MANAGER' | 'RECEPTION';
    permissions: { bookings: boolean; invoices: boolean; stats: boolean };
    superAdmin: boolean;
  } | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (!session || status !== 'authenticated') return;

    let cancelled = false;
    const resolveAccess = async () => {
      try {
        const res = await fetch('/api/admin/access');
        if (!res.ok) {
          if (!cancelled) {
            setAccess({ allowed: false, role: 'RECEPTION', permissions: { bookings: false, invoices: false, stats: false }, superAdmin: false });
            setAccessLoading(false);
            router.push('/');
          }
          return;
        }
        const data = await res.json();
        if (cancelled) return;
        setAccess(data);
        setAccessLoading(false);
      } catch {
        if (!cancelled) {
          setAccessLoading(false);
          router.push('/');
        }
      }
    };

    resolveAccess();
    return () => {
      cancelled = true;
    };
  }, [session, status, router]);

  const menuItems = useMemo(
    () => [
      { href: '/admin', label: 'Tableau de bord', icon: LayoutDashboard, requires: 'stats' as const },
      { href: '/admin/cottages', label: 'Cottages', icon: Home, requires: null },
      { href: '/admin/bookings', label: 'Réservations', icon: Calendar, requires: 'bookings' as const },
      { href: '/admin/clients', label: 'Clients', icon: Users, requires: 'bookings' as const },
      { href: '/admin/payments', label: 'Paiements', icon: CreditCard, requires: 'bookings' as const },
      { href: '/admin/invoices', label: 'Factures', icon: FileText, requires: 'invoices' as const },
      { href: '/admin/sales', label: 'Suivi des ventes', icon: LineChart, requires: 'stats' as const },
      { href: '/admin/pricing', label: 'Tarifs saisonniers', icon: Tags, requires: null },
      { href: '/admin/reviews', label: 'Avis', icon: Star, requires: null },
      { href: '/admin/blog', label: 'Blog', icon: BookOpen, requires: null },
      { href: '/admin/newsletter', label: 'Newsletter', icon: Mail, requires: null },
      { href: '/admin/ical', label: 'Calendriers iCal', icon: CalendarIcon, requires: null },
      { href: '/admin/settings', label: 'Paramètres', icon: Settings, requires: null },
      { href: '/admin/team', label: 'Gestion équipe', icon: ShieldCheck, requires: null, superAdminOnly: true },
    ],
    []
  );

  const visibleMenuItems = menuItems.filter((item) => {
    if (!access?.allowed) return false;
    if (item.superAdminOnly && !access.superAdmin) return false;
    if (!item.requires) return true;
    return access.permissions[item.requires];
  });

  useEffect(() => {
    if (status !== 'authenticated' || !access?.allowed) return;
    const allowed = visibleMenuItems.some((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
    if (!allowed) {
      const fallback = visibleMenuItems[0]?.href ?? '/';
      router.push(fallback);
    }
  }, [pathname, router, visibleMenuItems, status, access]);

  if (status === 'loading' || accessLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Chargement...</p>
      </div>
    );
  }

  if (!session || !access?.allowed) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1">
        <aside className="w-64 border-r bg-muted/50 p-4">
          <nav className="space-y-2">
            {visibleMenuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href}>
                  <Button variant="ghost" className="w-full justify-start">
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
      <FooterAdmin />
    </div>
  );
}
