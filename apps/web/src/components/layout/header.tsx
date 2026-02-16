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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Menu, X, ChevronDown } from 'lucide-react';

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
    { name: 'Tarifs', href: '/tarifs' },
    { name: 'Blog', href: '/blog' },
  ],
};

export function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileDropdowns, setMobileDropdowns] = useState<Record<string, boolean>>({});
  const [landingHash, setLandingHash] = useState('');

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

  const toggleMobileDropdown = (key: string) => {
    setMobileDropdowns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo - flex-shrink-0 so "Green Cottage" stays visible on mobile */}
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

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-1">
          {pathname === '/' ? (
            navLanding.map((item) => {
              const isLandingActive = landingHash === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={(e) => handleLandingNavClick(e, item.id, item.hash)}
                  className={`text-sm font-medium transition-colors px-3 py-2 rounded-md ${
                    isLandingActive
                      ? 'text-gc-green bg-gc-green/10'
                      : 'text-foreground hover:text-gc-green hover:bg-muted'
                  }`}
                >
                  {item.name}
                </button>
              );
            })
          ) : (
            navigation.main.map((item) => {
            if (item.dropdown) {
              return (
                <DropdownMenu key={item.name}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className={`text-sm font-medium hover:text-gc-green transition-colors ${
                        item.dropdown.some((d) => isActive(d.href))
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
                    {item.dropdown.map((dropdownItem) => (
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
                    : 'text-foreground hover:text-gc-green hover:bg-muted'
                }`}
              >
                {item.name}
              </Link>
            );
          })
          )}
        </nav>

        {/* Desktop Auth */}
        <div className="hidden lg:flex items-center space-x-4">
          {session ? (
            <>
              <Link href="/account">
                <Button variant="ghost" size="sm">
                  Mon compte
                </Button>
              </Link>
              {(session.user as any)?.role === 'ADMIN' && (
                <Link href="/admin">
                  <Button variant="outline" size="sm">
                    Admin
                  </Button>
                </Link>
              )}
              <Button variant="ghost" size="sm" onClick={() => signOut()}>
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
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
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
                    className={`block w-full text-left px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                      isLandingActive
                        ? 'text-gc-green bg-gc-green/10'
                        : 'text-foreground hover:bg-muted'
                    }`}
                  >
                    {item.name}
                  </button>
                );
              })
            ) : (
              navigation.main.map((item) => {
              if (item.dropdown) {
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
                        {item.dropdown.map((dropdownItem) => (
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
