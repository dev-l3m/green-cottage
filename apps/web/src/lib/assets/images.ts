/**
 * Central image mapping for Green Cottage
 * All images should be optimized WebP files from /public/images/optimized/
 * Run `pnpm images:optimize` when adding new images
 */

export const siteImages = {
  brand: {
    logo: '/images/optimized/branding/logo-l3m.webp',
    logoPng: '/logo_l3m.png', // Fallback if WebP not available
  },
  home: {
    hero: '/images/optimized/hero/bandeau-accueil-3-600x500.webp',
    highlights: [
      '/images/optimized/cards/green-cottage-1.webp',
      '/images/optimized/cards/green-cottage-2.webp',
      '/images/optimized/cards/green-cottage-3.webp',
      '/images/optimized/cards/green-cottage-4.webp',
      '/images/optimized/cards/green-cottage-5.webp',
      '/images/optimized/cards/green-cottage-6.webp',
    ],
    banner: '/images/optimized/hero/accueil-vue-600x500.webp',
  },
  cottages: {
    listingCards: [
      '/images/optimized/cards/green-cottage-1.webp',
      '/images/optimized/cards/green-cottage-2.webp',
      '/images/optimized/cards/green-cottage-3.webp',
      '/images/optimized/cards/green-cottage-4.webp',
      '/images/optimized/cards/green-cottage-5.webp',
      '/images/optimized/cards/green-cottage-6.webp',
      '/images/optimized/cards/green-cottage-7.webp',
      '/images/optimized/cards/green-cottage-8.webp',
      '/images/optimized/cards/green-cottage-9.webp',
      '/images/optimized/cards/green-cottage-10.webp',
      '/images/optimized/cards/green-cottage-11.webp',
    ],
    defaultGallery: [
      '/images/optimized/gallery/green-cottage-1.webp',
      '/images/optimized/gallery/green-cottage-2.webp',
      '/images/optimized/gallery/green-cottage-3.webp',
      '/images/optimized/gallery/green-cottage-4.webp',
      '/images/optimized/gallery/green-cottage-5.webp',
    ],
  },
  about: {
    cover: '/images/optimized/gallery/beautiful-mountain-forest-landscape.webp',
  },
  activities: {
    cover: '/images/optimized/gallery/cropped-accueil-site-scaled-1.webp',
  },
  contact: {
    cover: '/images/optimized/gallery/beautiful-mountain-forest-landscape.webp',
  },
} as const;
