import Image from 'next/image';
import { HeroSearchForm } from '@/components/home/HeroSearchForm';
import { siteImages } from '@/lib/assets/images';
import cottagesData from '@/content/cottages.json';

type CottageFromJSON = { slug: string; name: string };

export function Hero() {
  const cottages = (cottagesData as { slug: string; name: string }[]).map(
    (c: CottageFromJSON) => ({ slug: c.slug, name: c.name })
  );

  return (
    <section className="relative h-[600px] md:h-[700px] overflow-hidden">
      {/* Hero Image */}
      <div className="absolute inset-0">
        <Image
          src={siteImages.home.hero}
          alt="Green Cottage - Vue panoramique"
          fill
          priority
          className="object-cover"
          sizes="100vw"
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container w-full">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-3 text-white drop-shadow-lg">
              Trouvez votre cottage idéal
            </h1>
            <p className="text-xl md:text-2xl text-gc-green font-semibold mb-2 drop-shadow-md">
              Découvrez votre prochaine escapade verte
            </p>
            <p className="text-base md:text-lg text-white/90 mb-8 drop-shadow-md">
              Des hébergements de charme pour des séjours inoubliables
            </p>

            <HeroSearchForm cottages={cottages} />
          </div>
        </div>
      </div>
    </section>
  );
}
