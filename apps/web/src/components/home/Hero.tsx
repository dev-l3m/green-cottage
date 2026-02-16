'use client';

import Image from 'next/image';
import { HeroSearchForm } from '@/components/home/HeroSearchForm';
import { useHeaderUi } from '@/components/ui/header-scroll-context';
import { useMediaQuery } from '@/lib/use-media-query';
import { cn } from '@/lib/utils';

export function Hero() {
  const { isHeaderScrolled } = useHeaderUi();
  const isMobile = useMediaQuery(767);
  const hideHeroForm = isHeaderScrolled && !isMobile;

  return (
    <section className="relative h-[600px] md:h-[700px] overflow-hidden">
      {/* Hero Image */}
      <div className="absolute inset-0">
        <Image
          src="/images/optimized/hero/background.jpeg"
          alt="Green Cottage - Chalet dans une forêt brumeuse"
          fill
          priority
          className="object-cover"
          sizes="100vw"
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
        />
        {/* Gradient Overlay - template: dégradé clair du bas vers le haut */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-[#8a9d7a]/95 via-[#8a9d7a]/35 to-transparent"
          aria-hidden
        />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container w-full">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-3 text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.4)]">
              Trouvez votre cottage idéal
            </h1>
            <p className="text-xl md:text-2xl text-white font-semibold mb-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]">
              Découvrez votre prochaine escapade verte
            </p>
            <p className="text-base md:text-lg text-white/95 mb-8 drop-shadow-[0_2px_6px_rgba(0,0,0,0.3)]">
              Des hébergements de charme pour des séjours inoubliables
            </p>

            <div
              className={cn(
                'transition-all duration-500',
                hideHeroForm
                  ? 'opacity-0 translate-y-2 pointer-events-none invisible'
                  : 'opacity-100 translate-y-0'
              )}
            >
              <HeroSearchForm variant="hero" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
