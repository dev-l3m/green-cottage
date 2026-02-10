import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { siteImages } from '@/lib/assets/images';
import {
  Leaf,
  MapPin,
  Sparkles,
  TreePine,
  ArrowRight,
  Calendar,
  BookOpen,
} from 'lucide-react';

export const metadata = {
  title: 'Le journal des Résidences Vertes | Blog & actualités | L3M Green Cottage',
  description:
    'Tourisme durable, événements locaux, coulisses du domaine et astuces écologiques. Le blog des Résidences Vertes à Sonnay, Isère.',
};

const THEMES = [
  {
    id: 'durable',
    title: 'Tourisme durable',
    description: 'Nos engagements, bonnes pratiques et idées pour voyager responsable en Isère.',
    icon: Leaf,
  },
  {
    id: 'locaux',
    title: 'Événements locaux',
    description: 'Marchés, fêtes de village, randonnées et sorties nature à ne pas manquer.',
    icon: MapPin,
  },
  {
    id: 'coulisses',
    title: 'Coulisses du domaine',
    description: 'Portraits, chantiers, saisons et vie au quotidien aux Résidences Vertes.',
    icon: Sparkles,
  },
  {
    id: 'ecolo',
    title: 'Astuces écologiques',
    description: 'Conseils zéro déchet, économies d\'énergie et petits gestes pour la planète.',
    icon: TreePine,
  },
];

// Placeholders « à venir » pour créer l’envie et montrer la ligne éditoriale
const COMING_SOON = [
  {
    category: 'Tourisme durable',
    title: '5 idées pour un séjour écoresponsable en Isère',
    excerpt: 'Randonnée douce, circuits courts, hébergements verts… nos coups de cœur.',
  },
  {
    category: 'Événements',
    title: 'Agenda du printemps : marchés et fêtes autour de Sonnay',
    excerpt: 'Les rendez-vous à noter pour profiter de la région en toute saison.',
  },
  {
    category: 'Coulisses',
    title: 'Une journée aux Résidences Vertes',
    excerpt: 'De l’accueil des voyageurs au soin du jardin : immersion dans notre quotidien.',
  },
];

export default function BlogPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section
          className="relative h-[320px] md:h-[420px] overflow-hidden"
          aria-labelledby="blog-heading"
        >
          <div className="absolute inset-0">
            <Image
              src={siteImages.about.cover}
              alt=""
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/35 to-black/70" />
          </div>
          <div className="relative z-10 h-full flex flex-col justify-end container pb-10 md:pb-14">
            <h1 id="blog-heading" className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white drop-shadow-lg">
              Le journal des Résidences Vertes
            </h1>
            <p className="text-lg md:text-xl text-white/95 mt-3 max-w-2xl drop-shadow">
              Articles sur le tourisme durable, événements locaux, coulisses du domaine et astuces
              écologiques.
            </p>
          </div>
        </section>

        {/* Accroche + ce qu’on trouve ici */}
        <section className="container py-12 md:py-16">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <p className="text-lg text-muted-foreground">
              Un espace pour partager notre passion de la nature, de l’Isère et d’un tourisme plus
              respectueux. <strong className="text-foreground">Restez informés</strong> : les nouveaux
              articles arrivent bientôt.
            </p>
          </div>
          <h2 className="font-heading text-2xl md:text-3xl font-bold mb-8 text-center">
            Ce que vous trouverez ici
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {THEMES.map((theme) => {
              const Icon = theme.icon;
              return (
                <Card
                  key={theme.id}
                  className="border-gc-forest/20 hover:border-primary/40 hover:shadow-md transition-all"
                >
                  <CardContent className="p-6">
                    <span
                      className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/15 text-primary mb-4"
                      aria-hidden
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="font-heading font-semibold text-lg mb-2">{theme.title}</h3>
                    <p className="text-sm text-muted-foreground">{theme.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* À la une / Prochainement */}
        <section className="py-12 md:py-16 bg-muted/50" aria-labelledby="coming-soon-heading">
          <div className="container">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
              <div>
                <h2 id="coming-soon-heading" className="font-heading text-2xl md:text-3xl font-bold">
                  Prochainement au journal
                </h2>
                <p className="text-muted-foreground mt-1">
                  Quelques sujets en préparation pour vous.
                </p>
              </div>
              <Link href="/contact" className="shrink-0">
                <Button variant="outline" size="sm" className="gap-2 rounded-lg">
                  <BookOpen className="h-4 w-4" />
                  Proposer un sujet
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {COMING_SOON.map((item, i) => (
                <Card key={i} className="overflow-hidden border-gc-forest/20">
                  <CardContent className="p-6">
                    <span className="text-xs font-medium uppercase tracking-wide text-primary">
                      {item.category}
                    </span>
                    <h3 className="font-heading font-semibold text-lg mt-2 mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.excerpt}</p>
                    <span className="inline-flex items-center gap-1 text-sm text-muted-foreground mt-4">
                      <Calendar className="h-4 w-4" aria-hidden />
                      Bientôt en ligne
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA clientèle */}
        <section className="container py-12 md:py-16">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-heading text-2xl md:text-3xl font-bold mb-4">
              Envie de vivre l’aventure sur place ?
            </h2>
            <p className="text-muted-foreground mb-8">
              Réservez un séjour dans l’un de nos gîtes et découvrez l’Isère en mode nature et
              sérénité.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/cottages">
                <Button size="lg" className="gap-2 rounded-lg">
                  Explorer les gîtes
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="rounded-lg">
                  Nous contacter
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
