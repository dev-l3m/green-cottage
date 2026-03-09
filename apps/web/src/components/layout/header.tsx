'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Menu, X, ChevronDown, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { HeroSearchForm } from '@/components/home/HeroSearchForm';
import { useHeaderUi } from '@/components/ui/header-scroll-context';

const HEADER_OFFSET = 100;

function scrollToId(id: string) {
  if (typeof document === 'undefined') return;
  const el = document.getElementById(id);
  if (el) {
    const top = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
    window.scrollTo({ top, behavior: 'smooth' });
  }
}

const navLanding = [
  { name: 'Nos gîtes', id: 'cottages', hash: '#cottages' },
  { name: 'À propos', id: 'about', hash: '#about' },
  { name: 'Avis', id: 'reviews', hash: '#reviews' },
];

const navigation = {
  main: [
    { name: 'Accueil', href: '/' },
    {
      name: 'Gîtes',
      href: '#',
      dropdown: [
        { name: 'Gîte Puma', href: '/cottages/puma' },
        { name: 'Gîte Bruyère', href: '/cottages/bruyere' },
        { name: 'Gîte Petit Pierre', href: '/cottages/petit-pierre' },
        { name: 'Gîte Télégraphe', href: '/cottages/telegaphe' },
      ],
    },
    {
      name: 'Activités',
      href: '#',
      dropdown: [
        { name: 'Trouvez votre gîte', href: '/trouvez-votre-gite' },
        { name: 'Qui sommes-nous ?', href: '/about' },
        { name: 'Infos pratiques', href: '/infos-pratiques' },
        { name: 'Activités & Restos', href: '/activities' },
        { name: 'Préparation au départ', href: '/preparation-au-depart' },
      ],
    },
    { name: 'Nos offres', href: '/cottages' },
    { name: 'Les Éco-Héros', href: '/eco-heros' },
    { name: 'Blog', href: '/blog' },
  ],
};

const sortByNameAsc = <T extends { name: string }>(items: T[]) =>
  [...items].sort((a, b) =>
    a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' })
  );

type HeaderNotification = {
  id: string;
  label: string;
  href: string;
};

export function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { isHeaderScrolled, cottages } = useHeaderUi();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileDropdowns, setMobileDropdowns] = useState<Record<string, boolean>>({});
  const [landingHash, setLandingHash] = useState('');
  const [notifications, setNotifications] = useState<HeaderNotification[]>([]);
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>([]);
  const cottagesDropdown = sortByNameAsc(
    cottages.map((c) => ({ name: c.name, href: `/cottages/${c.slug}` }))
  );
  const notificationStorageKey = `gc-notifications-read-${(session?.user as { email?: string } | undefined)?.email ?? 'guest'}`;

  const handleLandingNavClick = useCallback((e: React.MouseEvent, id: string, hash: string) => {
    e.preventDefault();
    history.pushState(null, '', hash);
    setLandingHash(id);
    scrollToId(id);
    setMobileMenuOpen(false);
  }, []);

  useEffect(() => {
    const syncHash = () => {
      if (typeof window === 'undefined') return;
      const h = window.location.hash.replace('#', '');
      setLandingHash(h);
      if (pathname === '/' && h) {
        requestAnimationFrame(() => scrollToId(h));
      }
    };
    syncHash();
    window.addEventListener('hashchange', syncHash);
    return () => window.removeEventListener('hashchange', syncHash);
  }, [pathname]);

  useEffect(() => {
    if (pathname !== '/') return;
    const hash = typeof window !== 'undefined' ? window.location.hash.replace('#', '') : '';
    if (hash) {
      const raf = requestAnimationFrame(() => {
        scrollToId(hash);
        setLandingHash(hash);
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [pathname]);

  useEffect(() => {
    if (!session) {
      setNotifications([]);
      setReadNotificationIds([]);
      return;
    }

    let cancelled = false;
    const loadNotifications = async () => {
      try {
        const res = await fetch('/api/bookings');
        if (!res.ok) return;
        const bookings = (await res.json()) as Array<{
          status: string;
          invoice?: { invoiceNumber: string } | null;
          startDate: string;
        }>;
        if (cancelled) return;

        const hasPaid = bookings.some((b) => b.status === 'PAID');
        const hasInvoice = bookings.some((b) => Boolean(b.invoice));
        const hasUpcomingStay = bookings.some((b) => {
          const start = new Date(b.startDate).getTime();
          const now = Date.now();
          const threeDays = 3 * 24 * 60 * 60 * 1000;
          return start > now && start - now <= threeDays;
        });

        const nextNotifications: HeaderNotification[] = [];
        if (hasPaid) {
          nextNotifications.push({
            id: 'booking-confirmed',
            label: 'Confirmation de réservation',
            href: '/account',
          });
          nextNotifications.push({
            id: 'payment-received',
            label: 'Paiement reçu',
            href: '/account',
          });
        }
        if (hasInvoice) {
          nextNotifications.push({
            id: 'invoice-available',
            label: 'Facture disponible',
            href: '/account',
          });
        }
        if (hasUpcomingStay) {
          nextNotifications.push({
            id: 'arrival-reminder',
            label: 'Rappel avant arrivée',
            href: '/account',
          });
        }

        setNotifications(nextNotifications);
      } catch {
        if (!cancelled) setNotifications([]);
      }
    };

    loadNotifications();
    return () => {
      cancelled = true;
    };
  }, [session]);

  useEffect(() => {
    if (!session || typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(notificationStorageKey);
      const parsed = raw ? (JSON.parse(raw) as string[]) : [];
      setReadNotificationIds(Array.isArray(parsed) ? parsed : []);
    } catch {
      setReadNotificationIds([]);
    }
  }, [session, notificationStorageKey]);

  useEffect(() => {
    // Keep only read IDs that still exist in current notification list.
    setReadNotificationIds((prev) => {
      const validIds = prev.filter((id) => notifications.some((n) => n.id === id));
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(notificationStorageKey, JSON.stringify(validIds));
      }
      return validIds;
    });
  }, [notifications, notificationStorageKey]);

  const unreadNotificationsCount = notifications.filter(
    (n) => !readNotificationIds.includes(n.id)
  ).length;

  const markNotificationsAsRead = (ids: string[]) => {
    if (!ids.length || typeof window === 'undefined') return;
    setReadNotificationIds((prev) => {
      const next = Array.from(new Set([...prev, ...ids]));
      window.localStorage.setItem(notificationStorageKey, JSON.stringify(next));
      return next;
    });
  };

  const handleNotificationsMenuOpenChange = (open: boolean) => {
    if (!open) return;
    markNotificationsAsRead(notifications.map((n) => n.id));
  };

  const handleNotificationClick = (id: string) => {
    markNotificationsAsRead([id]);
  };

  const toggleMobileDropdown = (key: string) => {
    setMobileDropdowns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  const isHome = pathname === '/';
  const isAdminArea = pathname.startsWith('/admin');
  const headerScrolledStyle = isHeaderScrolled && isHome;
  const headerClassName = headerScrolledStyle
    ? 'sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur-md shadow-md transition-all duration-300 py-3'
    : isHome
      ? 'sticky top-0 z-50 w-full border-b border-transparent bg-transparent transition-all duration-300 py-5'
      : 'sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60';

  return (
    <header className={headerClassName}>
      <div
        className={cn(
          'container flex items-center',
          isHome && !isAdminArea ? 'gap-4' : 'justify-between',
          headerScrolledStyle ? 'h-14' : 'h-16'
        )}
      >
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 flex-shrink-0"
        >
          <Image
            src="/logo_l3m.png"
            alt="L3M Logo"
            width={40}
            height={40}
            className="h-8 w-auto flex-shrink-0"
            priority
          />
        </Link>

        {/* Desktop SearchForm - visible when scrolled on home (md+) */}
        {isHome && !isAdminArea && (
          <div
            className={cn(
              'hidden md:flex flex-1 justify-center min-w-0 mx-2 lg:mx-4 transition-all duration-500',
              headerScrolledStyle
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 -translate-y-2 pointer-events-none'
            )}
          >
            <div className="w-full max-w-[760px]">
              <HeroSearchForm variant="header" />
            </div>
          </div>
        )}

        {/* Desktop Navigation */}
        {!isAdminArea && (
        <nav className="hidden lg:flex items-center space-x-1 flex-shrink-0">
          {pathname === '/' ? (
            navLanding.map((item) => {
              const isLandingActive = landingHash === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={(e) => handleLandingNavClick(e, item.id, item.hash)}
                  className={cn(
                    'text-sm font-medium transition-colors px-3 py-2 rounded-md text-gray-900 hover:text-gc-green hover:bg-muted',
                    isLandingActive && 'text-gc-green bg-gc-green/10'
                  )}
                >
                  {item.name}
                </button>
              );
            })
          ) : (
            navigation.main.map((item) => {
            const dropdownItems =
              item.name === 'Gîtes' ? cottagesDropdown : item.dropdown;
            if (dropdownItems) {
              return (
                <DropdownMenu key={item.name}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className={`text-sm font-medium transition-colors hover:bg-gc-green hover:text-white ${
                        dropdownItems.some((d) => isActive(d.href))
                          ? 'text-gc-green'
                          : 'text-foreground'
                      }`}
                    >
                      {item.name}
                      <ChevronDown className="ml-1 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className="w-56 bg-background rounded-lg shadow-lg border mt-2"
                  >
                    {dropdownItems.map((dropdownItem) => (
                      <DropdownMenuItem key={dropdownItem.name} asChild>
                        <Link
                          href={dropdownItem.href}
                          className={`block px-4 py-2 text-sm transition-colors ${
                            isActive(dropdownItem.href)
                              ? 'text-gc-green font-medium bg-gc-green/10'
                              : 'text-foreground hover:bg-muted'
                          }`}
                        >
                          {dropdownItem.name}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            }
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`text-sm font-medium transition-colors px-3 py-2 rounded-md ${
                  isActive(item.href)
                    ? 'text-gc-green bg-gc-green/10'
                    : 'text-foreground hover:text-white hover:bg-gc-green'
                }`}
              >
                {item.name}
              </Link>
            );
          })
          )}
        </nav>
        )}

        {/* Desktop Auth */}
        <div className={cn('items-center space-x-4', isAdminArea ? 'flex' : 'hidden lg:flex')}>
          {session ? (
            <>
              <DropdownMenu onOpenChange={handleNotificationsMenuOpenChange}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative text-gray-900 hover:bg-gc-green hover:text-white"
                    aria-label="Mes notifications"
                  >
                    <Bell className="h-4 w-4" />
                    <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[10px] leading-4 text-center">
                      {unreadNotificationsCount}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72">
                  <DropdownMenuLabel>Mes notifications</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {notifications.length === 0 ? (
                    <DropdownMenuItem disabled>Aucune notification</DropdownMenuItem>
                  ) : (
                    notifications.map((item) => (
                      <DropdownMenuItem key={item.id} asChild className="py-2">
                        <Link href={item.href} onClick={() => handleNotificationClick(item.id)}>
                          {item.label}
                        </Link>
                      </DropdownMenuItem>
                    ))
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              <Link href="/account">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-900 hover:bg-gc-green hover:text-white"
                >
                  Mon compte
                </Button>
              </Link>
              {(session.user as { role?: string })?.role === 'ADMIN' && (
                <Link href="/admin">
                  <Button variant="outline" size="sm">
                    Admin
                  </Button>
                </Link>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-900 hover:bg-gc-green hover:text-white"
                onClick={() => signOut()}
              >
                Déconnexion
              </Button>
            </>
          ) : (
            <Link href="/auth/signin">
              <Button size="sm">Connexion</Button>
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        {!isAdminArea && (
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden text-gray-900 hover:text-gc-green"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        )}
      </div>

      {/* Mobile Navigation */}
      {!isAdminArea && mobileMenuOpen && (
        <div className="lg:hidden border-t bg-background">
          <nav className="container py-4 space-y-1">
            {pathname === '/' ? (
              navLanding.map((item) => {
                const isLandingActive = landingHash === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={(e) => handleLandingNavClick(e, item.id, item.hash)}
                    className={cn(
                      'block w-full text-left px-4 py-3 text-sm font-medium rounded-md transition-colors text-gray-900 hover:text-gc-green hover:bg-muted',
                      isLandingActive && 'text-gc-green bg-gc-green/10'
                    )}
                  >
                    {item.name}
                  </button>
                );
              })
            ) : (
              navigation.main.map((item) => {
              const dropdownItems =
                item.name === 'Gîtes' ? cottagesDropdown : item.dropdown;
              if (dropdownItems) {
                const isOpen = mobileDropdowns[item.name];
                return (
                  <div key={item.name}>
                    <button
                      onClick={() => toggleMobileDropdown(item.name)}
                      className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-foreground hover:text-gc-green hover:bg-muted rounded-md transition-colors"
                    >
                      <span>{item.name}</span>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                      />
                    </button>
                    {isOpen && (
                      <div className="pl-4 space-y-1 mt-1">
                        {dropdownItems.map((dropdownItem) => (
                          <Link
                            key={dropdownItem.name}
                            href={dropdownItem.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`block px-4 py-2 text-sm rounded-md transition-colors ${
                              isActive(dropdownItem.href)
                                ? 'text-gc-green font-medium bg-gc-green/10'
                                : 'text-foreground hover:bg-muted'
                            }`}
                          >
                            {dropdownItem.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                    isActive(item.href)
                      ? 'text-gc-green bg-gc-green/10'
                      : 'text-foreground hover:bg-muted'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })
            )}
            <div className="pt-4 border-t mt-4 space-y-2">
              {session ? (
                <>
                  <DropdownMenu onOpenChange={handleNotificationsMenuOpenChange}>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="w-full justify-start relative">
                        <Bell className="h-4 w-4 mr-2" />
                        Mes notifications
                        <span className="ml-auto min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[10px] leading-4 text-center">
                          {unreadNotificationsCount}
                        </span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-72">
                      <DropdownMenuLabel>Mes notifications</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {notifications.length === 0 ? (
                        <DropdownMenuItem disabled>Aucune notification</DropdownMenuItem>
                      ) : (
                        notifications.map((item) => (
                          <DropdownMenuItem key={`mobile-${item.id}`} asChild className="py-2">
                            <Link
                              href={item.href}
                              onClick={() => {
                                handleNotificationClick(item.id);
                                setMobileMenuOpen(false);
                              }}
                            >
                              {item.label}
                            </Link>
                          </DropdownMenuItem>
                        ))
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Link href="/account" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" size="sm" className="w-full justify-start">
                      Mon compte
                    </Button>
                  </Link>
                  {(session.user as any)?.role === 'ADMIN' && (
                    <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        Admin
                      </Button>
                    </Link>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => {
                      signOut();
                      setMobileMenuOpen(false);
                    }}
                  >
                    Déconnexion
                  </Button>
                </>
              ) : (
                <Link href="/auth/signin" onClick={() => setMobileMenuOpen(false)}>
                  <Button size="sm" className="w-full">
                    Connexion
                  </Button>
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
