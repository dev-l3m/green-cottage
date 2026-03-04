'use client';

import Image from 'next/image';
import type { ComponentType } from 'react';
import { Globe2, Leaf, Map, ShieldCheck, Users } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

type ReasonCard = {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
  opensMapDialog?: boolean;
};

const REASONS: ReasonCard[] = [
  {
    icon: Leaf,
    title: "Un écotourisme au cœur de la nature",
    description:
      "Découvrez la richesse naturelle de l'Auvergne-Rhône-Alpes : volcans, forêts, lacs et biodiversité exceptionnelle. Nos gîtes vous invitent à observer la faune locale et explorer les paysages préservés.",
  },
  {
    icon: Users,
    title: 'Des gîtes pensés pour les familles',
    description:
      "Voyagez sereinement avec vos enfants. Nous proposons sur demande de nombreux équipements : chaises hautes, lits bébé, bassines et jeux adaptés.",
  },
  {
    icon: Globe2,
    title: "Sensibiliser les enfants à l'écologie",
    description:
      "Livrets pédagogiques, jeux autour de la nature et activités d'observation permettent aux enfants de découvrir l'écologie en s'amusant.",
  },
  {
    icon: Map,
    title: 'Une découverte unique de la région',
    description:
      "Profitez de notre cartographie exclusive des lieux à visiter : balades secrètes, points de vue, producteurs locaux et activités familiales.",
    opensMapDialog: true,
  },
  {
    icon: ShieldCheck,
    title: 'Un accompagnement personnalisé',
    description:
      "Notre service client reste disponible avant, pendant et après votre séjour pour vous accompagner et répondre rapidement à vos besoins.",
  },
];

export function AboutSection() {
  return (
    <section
      id="about"
      className="py-14 md:py-16 bg-gradient-to-b from-[#f7faf4] via-[#f3f7ef] to-[#eef4e8]"
      aria-labelledby="about-heading"
    >
      <div className="container">
        <div className="mx-auto max-w-6xl">
          <h2
            id="about-heading"
            className="text-center font-heading text-2xl font-bold leading-tight text-gc-forest sm:text-3xl md:text-4xl"
          >
            5 bonnes raisons de choisir Green Cottage pour vos vacances en Auvergne-Rhône-Alpes
          </h2>
          <div className="green-divider w-28 mx-auto mt-4 mb-8 md:mb-10" />

          <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5" role="list">
            {REASONS.map((item) => {
              const Icon = item.icon;
              const cardContent = (
                <>
                  <span
                    className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-full border border-gc-green/25 bg-gc-green/10 text-gc-green"
                    aria-hidden
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="font-heading text-lg font-semibold leading-snug text-gc-forest">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground line-clamp-4">
                    {item.description}
                  </p>
                  {item.opensMapDialog && (
                    <span className="mt-3 inline-flex text-sm font-medium text-gc-green">
                      Voir la carte detaillee
                    </span>
                  )}
                </>
              );

              if (item.opensMapDialog) {
                return (
                  <li key={item.title}>
                    <Dialog>
                      <DialogTrigger asChild>
                        <button
                          type="button"
                          className="w-full text-left rounded-xl border border-border/60 bg-white p-4 md:p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gc-green focus-visible:ring-offset-2"
                        >
                          {cardContent}
                        </button>
                      </DialogTrigger>
                      <DialogContent className="w-[55vw] max-w-[1200px] p-0 overflow-hidden max-h-[92vh] flex flex-col">
                        <div className="bg-gradient-to-r from-gc-green/10 via-white to-gc-green/5 p-4 md:p-6 border-b shrink-0">
                          <DialogHeader className="space-y-2">
                            <DialogTitle className="text-xl md:text-2xl text-gc-forest">
                              Carte des découvertes en Auvergne-Rhône-Alpes
                            </DialogTitle>
                            <DialogDescription className="text-sm md:text-base">
                              Retrouvez les lieux emblématiques et activités familiales pour organiser votre séjour Green Cottage.
                            </DialogDescription>
                          </DialogHeader>
                        </div>
                        <div className="p-3 md:p-5 bg-[#f8faf6] overflow-y-auto">
                          <div className="overflow-hidden rounded-xl border bg-white shadow-sm mx-auto max-w-[1500px]">
                            <Image
                              src="/images/carte.png"
                              alt="Carte des activités et lieux à visiter en Auvergne-Rhône-Alpes"
                              width={1024}
                              height={721}
                              className="h-auto w-full object-contain"
                              sizes="(max-width: 768px) 94vw, (max-width: 1280px) 92vw, 1400px"
                              priority={false}
                            />
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </li>
                );
              }

              return (
                <li
                  key={item.title}
                  className="rounded-xl border border-border/60 bg-white p-4 md:p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                >
                  {cardContent}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
