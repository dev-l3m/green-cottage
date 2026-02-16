'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import cottagesData from '@/content/cottages.json';

export type CottageOption = { slug: string; name: string };

export type SearchState = {
  destination: CottageOption | null;
  range: { from?: Date; to?: Date };
  adults: number;
  children: number;
};

const COTTAGES_OPTIONS: CottageOption[] = (
  cottagesData as { slug: string; name: string }[]
).map((c) => ({ slug: c.slug, name: c.name }));

type HeaderScrollContextValue = {
  isHeaderScrolled: boolean;
  searchState: SearchState;
  setSearchState: React.Dispatch<React.SetStateAction<SearchState>>;
  updateDestination: (dest: CottageOption | null) => void;
  updateRange: (range: { from?: Date; to?: Date }) => void;
  updateTravelers: (adults: number, children: number) => void;
  submitSearch: () => void;
  cottages: CottageOption[];
};

const defaultSearchState: SearchState = {
  destination: null,
  range: {},
  adults: 2,
  children: 0,
};

const HeaderScrollContext = createContext<HeaderScrollContextValue | null>(null);

const SCROLL_THRESHOLD = 80;

export function HeaderScrollProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isHeaderScrolled, setIsHeaderScrolled] = useState(false);
  const [searchState, setSearchState] = useState<SearchState>(defaultSearchState);

  const updateScrollState = useCallback(() => {
    if (typeof window === 'undefined') return;
    const hasScrolled = window.scrollY > SCROLL_THRESHOLD;
    const hasHash = window.location.hash.length > 1;
    setIsHeaderScrolled(hasScrolled || hasHash);
  }, []);

  useEffect(() => {
    updateScrollState();
    window.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('hashchange', updateScrollState);
    return () => {
      window.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('hashchange', updateScrollState);
    };
  }, [updateScrollState]);

  const updateDestination = useCallback((dest: CottageOption | null) => {
    setSearchState((s) => ({ ...s, destination: dest }));
  }, []);

  const updateRange = useCallback((range: { from?: Date; to?: Date }) => {
    setSearchState((s) => ({ ...s, range }));
  }, []);

  const updateTravelers = useCallback((adults: number, children: number) => {
    setSearchState((s) => ({ ...s, adults, children }));
  }, []);

  const submitSearch = useCallback(() => {
    const params = new URLSearchParams();
    const { destination, range, adults, children } = searchState;
    if (range.from)
      params.set('start', range.from.toISOString().split('T')[0] ?? '');
    if (range.to)
      params.set('end', range.to.toISOString().split('T')[0] ?? '');
    if (adults > 0) params.set('adults', String(adults));
    if (children > 0) params.set('children', String(children));
    const query = params.toString();
    const path = destination?.slug
      ? `/cottages/${destination.slug}${query ? `?${query}` : ''}`
      : `/cottages${query ? `?${query}` : ''}`;
    router.push(path);
  }, [searchState, router]);

  const value: HeaderScrollContextValue = {
    isHeaderScrolled,
    searchState,
    setSearchState,
    updateDestination,
    updateRange,
    updateTravelers,
    submitSearch,
    cottages: COTTAGES_OPTIONS,
  };

  return (
    <HeaderScrollContext.Provider value={value}>
      {children}
    </HeaderScrollContext.Provider>
  );
}

export function useHeaderUi() {
  const ctx = useContext(HeaderScrollContext);
  if (!ctx) {
    throw new Error('useHeaderUi must be used within HeaderScrollProvider');
  }
  return ctx;
}
