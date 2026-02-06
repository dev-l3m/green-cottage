'use client';

import { useState } from 'react';
import Image from 'next/image';
import { siteImages } from '@/lib/assets/images';

interface GalleryProps {
  images?: string[];
  title?: string;
}

export function Gallery({ images, title = 'Galerie' }: GalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Use provided images or fallback to default gallery
  const galleryImages = images && images.length > 0 
    ? images 
    : siteImages.cottages.defaultGallery;

  const mainImage = galleryImages[selectedIndex] || galleryImages[0];
  const thumbnails = galleryImages.slice(0, 5);

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-[16/9] md:aspect-[3/2] rounded-lg overflow-hidden bg-muted">
        <Image
          src={mainImage}
          alt={`${title} - Image ${selectedIndex + 1}`}
          fill
          priority={selectedIndex === 0}
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 80vw"
        />
      </div>

      {/* Thumbnails */}
      {thumbnails.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {thumbnails.map((img, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={`relative aspect-square rounded-md overflow-hidden border-2 transition-all ${
                selectedIndex === index
                  ? 'border-primary ring-2 ring-primary ring-offset-2'
                  : 'border-transparent hover:border-primary/50'
              }`}
            >
              <Image
                src={img}
                alt={`${title} - Miniature ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 20vw, 15vw"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
