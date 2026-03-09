import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { siteImages } from '@/lib/assets/images';
import { prisma } from '@/lib/prisma';
import { BLOG_SITE_CONTENT_KEY, parseBlogPostsValue } from '@/lib/blog';
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
export const dynamic = 'force-dynamic';

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

async function getPublishedPosts() {
  const row = await prisma.siteContent.findUnique({
    where: { key: BLOG_SITE_CONTENT_KEY },
    select: { value: true },
  });
  const posts = parseBlogPostsValue(row?.value).filter((post) => post.status === 'PUBLISHED');
  return posts.sort((a, b) => (b.publishedAt ?? b.updatedAt).localeCompare(a.publishedAt ?? a.updatedAt));
}

export default async function BlogPage() {
  const publishedPosts = await getPublishedPosts();
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
          <div className="space-y-10">
            <div className="max-w-5xl space-y-4">
              <h2 className="font-heading text-2xl md:text-3xl font-bold">
                Blog nature & tourisme durable en Isère
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Bienvenue sur le blog de L3M Green Cottage, un espace dédié à la découverte du
                territoire, aux initiatives locales et au tourisme durable en Isère. Situés à
                Sonnay près de Vienne, nos gîtes en pleine nature sont le point de départ idéal
                pour explorer la région tout en respectant l’environnement.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Sur ce blog, nous partageons régulièrement des idées d’activités nature autour de
                Vienne et de la vallée du Rhône : randonnées, balades en forêt, sorties en famille
                et lieux à découvrir pendant votre séjour dans nos gîtes. Vous y trouverez
                également une sélection d’événements locaux près de Sonnay, comme les marchés de
                producteurs, fêtes de village, animations culturelles et rendez-vous nature à ne
                pas manquer.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Parce que voyager peut aussi être plus responsable, nous proposons également des
                articles dédiés au tourisme durable et aux gestes écologiques du quotidien.
                Conseils zéro déchet, économies d’énergie, respect de la biodiversité ou idées
                simples pour réduire son impact pendant les vacances : découvrez comment profiter
                de la nature tout en la préservant.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Que vous prépariez votre séjour dans nos gîtes en Isère, que vous cherchiez quoi
                faire autour de Vienne, ou que vous souhaitiez adopter un mode de voyage plus
                respectueux de la planète, ce blog vous accompagne avec des idées, des conseils et
                des inspirations pour vivre une expérience authentique au cœur de la nature.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-heading text-xl md:text-2xl font-semibold">Nos thématiques</h3>
              <p className="text-sm text-muted-foreground">
                Des contenus utiles pour préparer votre séjour et découvrir l&apos;Isère autrement.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {THEMES.map((theme) => {
                const Icon = theme.icon;
                return (
                  <Card key={theme.id} className="border-gc-forest/20">
                    <CardContent className="p-6">
                      <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary mb-3">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h4 className="font-heading text-lg font-semibold mb-2">{theme.title}</h4>
                      <p className="text-sm text-muted-foreground">{theme.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Articles publiés */}
        <section className="py-12 md:py-16 bg-muted/50" aria-labelledby="published-posts-heading">
          <div className="container">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
              <div>
                <h2 id="published-posts-heading" className="font-heading text-2xl md:text-3xl font-bold">
                  Articles du journal
                </h2>
                <p className="text-muted-foreground mt-1">
                  Nos derniers contenus publiés.
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
              {publishedPosts.length === 0 ? (
                <Card className="md:col-span-3 border-gc-forest/20">
                  <CardContent className="p-6">
                    <p className="text-muted-foreground">
                      Aucun article publié pour le moment. Revenez bientôt.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                publishedPosts.map((item) => (
                <Card key={item.id} className="overflow-hidden border-gc-forest/20">
                  <CardContent className="p-6">
                    <span className="text-xs font-medium uppercase tracking-wide text-primary">
                      {item.keyword}
                    </span>
                    <h3 className="font-heading font-semibold text-lg mt-2 mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.excerpt}</p>
                    <span className="inline-flex items-center gap-1 text-sm text-muted-foreground mt-4">
                      <Calendar className="h-4 w-4" aria-hidden />
                      {new Date(item.publishedAt ?? item.updatedAt).toLocaleDateString('fr-FR')}
                    </span>
                  </CardContent>
                </Card>
              )))}
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
