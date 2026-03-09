'use client';

import { useState } from 'react';
import Image from 'next/image';

type ValueItem = {
  title: string;
  description: string;
};

type InteractiveValueCardsProps = {
  items: ValueItem[];
  frontImages: string[];
};

export function InteractiveValueCards({ items, frontImages }: InteractiveValueCardsProps) {
  const [flippedIndex, setFlippedIndex] = useState<number | null>(null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {items.slice(0, 3).map((item, index) => {
        const isFlipped = flippedIndex === index;
        const image = frontImages[index] ?? frontImages[0];

        return (
          <button
            key={item.title}
            type="button"
            onClick={() => setFlippedIndex(isFlipped ? null : index)}
            className="group text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gc-green focus-visible:ring-offset-2 rounded-2xl"
            aria-pressed={isFlipped}
            aria-label={`Afficher le detail de ${item.title}`}
          >
            <div className="[perspective:1200px]">
              <div
                className={`relative h-[320px] rounded-2xl transition-transform duration-500 [transform-style:preserve-3d] ${
                  isFlipped ? '[transform:rotateY(180deg)]' : ''
                }`}
              >
                <div className="absolute inset-0 rounded-2xl overflow-hidden border shadow-sm bg-card [backface-visibility:hidden]">
                  <Image
                    src={image}
                    alt={item.title}
                    fill
                    unoptimized
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-black/10 p-4">
                    <h3 className="font-heading text-lg font-semibold text-white">{item.title}</h3>
                    <p className="text-xs text-white/90 mt-1">Cliquer pour retourner</p>
                  </div>
                </div>

                <div className="absolute inset-0 rounded-2xl border shadow-sm bg-card p-5 [transform:rotateY(180deg)] [backface-visibility:hidden]">
                  <h3 className="font-heading text-lg font-semibold mb-3">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                  <p className="text-xs text-muted-foreground/80 mt-4">Cliquer pour revenir</p>
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
