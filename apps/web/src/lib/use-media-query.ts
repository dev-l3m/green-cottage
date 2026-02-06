'use client';

import { useState, useEffect } from 'react';

/**
 * Returns true when viewport is below the given width (e.g. mobile).
 * Uses 768px by default (Tailwind md breakpoint).
 */
export function useMediaQuery(maxWidth: number = 768): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(`(max-width: ${maxWidth}px)`);
    setMatches(media.matches);
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [maxWidth]);

  return matches;
}
