import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { siteImages } from '@/lib/assets/images';
import {
  CheckCircle2,
  Package,
  FileText,
  Calendar,
  MapPin,
  Sun,
  Key,
  MessageCircle,
} from 'lucide-react';

export const metadata = {
  title: 'Préparation au départ | L3M Green Cottage',
  description:
    'Checklist avant départ, à apporter et infos pratiques pour un séjour réussi aux Résidences Vertes.',
};

const CHECKLIST_ITEMS = [
  { text: "Confirmer votre heure d'arrivée avec l'équipe", icon: Calendar },
  { text: "Préparer vos documents d'identité", icon: FileText },
  { text: "Vérifier les équipements disponibles dans votre gîte", icon: Package },
  { text: "Consulter la météo locale pour la région", icon: Sun },
];

const TO_BRING = [
  { label: 'Fourni sur place', items: ['Linge de lit', 'Serviettes', 'Produits d\'accueil de base'] },
  {
    label: 'À prévoir',
    items: ['Produits de toilette personnels', 'Adaptateur si besoin', 'Vêtements adaptés à la saison'],
  },
];

export default function PreparationAuDepartPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section
          className="relative h-[320px] md:h-[400px] overflow-hidden"
          aria-labelledby="prepa-heading"
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
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/35 to-black/65" />
          </div>
          <div className="relative z-10 h-full flex flex-col justify-end container pb-10 md:pb-12">
            <h1 id="prepa-heading" className="font-heading text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
              Préparation au départ
            </h1>
            <p className="text-lg md:text-xl text-white/95 mt-2 max-w-xl drop-shadow">
              Tout ce qu&apos;il faut savoir avant votre départ pour un séjour réussi.
            </p>
          </div>
        </section>

        {/* Intro */}
        <section className="container py-10 md:py-12">
          <p className="max-w-2xl text-center mx-auto text-muted-foreground text-lg">
            Quelques étapes simples pour partir l&apos;esprit léger et bien préparé.
          </p>
        </section>

        {/* Checklist */}
        <section className="container py-8 md:py-10" aria-labelledby="checklist-heading">
          <h2 id="checklist-heading" className="font-heading text-2xl md:text-3xl font-bold mb-8 text-center">
            Checklist avant départ
          </h2>
          <div className="max-w-2xl mx-auto">
            <Card className="border-gc-forest/20 overflow-hidden">
              <CardContent className="p-6 md:p-8">
                <ul className="space-y-5 list-none p-0 m-0">
                  {CHECKLIST_ITEMS.map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <li key={i} className="flex gap-4 items-start">
                        <span className="flex-shrink-0 mt-0.5 text-gc-green" aria-hidden>
                          <CheckCircle2 className="h-6 w-6" />
                        </span>
                        <span className="text-foreground pt-0.5">{item.text}</span>
                        <span className="ml-auto flex-shrink-0 text-muted-foreground" aria-hidden>
                          <Icon className="h-5 w-5" />
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* À apporter */}
        <section className="py-12 md:py-14 bg-muted/50" aria-labelledby="apporter-heading">
          <div className="container">
            <h2 id="apporter-heading" className="font-heading text-2xl md:text-3xl font-bold mb-8 text-center">
              À apporter
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {TO_BRING.map((block, i) => (
                <Card key={i} className="border-gc-forest/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Package className="h-5 w-5 text-gc-green" />
                      {block.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 list-none p-0 m-0">
                      {block.items.map((item, j) => (
                        <li key={j} className="flex gap-2 items-center text-muted-foreground">
                          <span className="w-1.5 h-1.5 rounded-full bg-gc-green shrink-0" aria-hidden />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Documents & accès */}
        <section className="container py-12 md:py-14" aria-labelledby="documents-heading">
          <h2 id="documents-heading" className="font-heading text-2xl md:text-3xl font-bold mb-8 text-center">
            Documents & accès
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card className="border-gc-forest/20 flex flex-col">
              <CardContent className="p-6 flex-1 flex flex-col">
                <span className="inline-flex w-12 h-12 rounded-xl bg-gc-green/15 text-gc-green items-center justify-center mb-4" aria-hidden>
                  <Key className="h-6 w-6" />
                </span>
                <h3 className="font-heading font-semibold text-lg mb-2">Modalités d&apos;arrivée</h3>
                <p className="text-muted-foreground text-sm flex-1">
                  Les codes d&apos;accès et instructions détaillées vous sont envoyés par e-mail avant votre
                  séjour. Consultez aussi votre espace client.
                </p>
                <Link href="/account" className="mt-4">
                  <Button variant="outline" size="sm" className="rounded-lg">
                    Mon espace client
                  </Button>
                </Link>
              </CardContent>
            </Card>
            <Card className="border-gc-forest/20 flex flex-col">
              <CardContent className="p-6 flex-1 flex flex-col">
                <span className="inline-flex w-12 h-12 rounded-xl bg-gc-green/15 text-gc-green items-center justify-center mb-4" aria-hidden>
                  <MapPin className="h-6 w-6" />
                </span>
                <h3 className="font-heading font-semibold text-lg mb-2">Infos pratiques</h3>
                <p className="text-muted-foreground text-sm flex-1">
                  Adresse, accès, parkings et infos par gîte : tout est détaillé sur notre page dédiée.
                </p>
                <Link href="/infos-pratiques" className="mt-4">
                  <Button variant="outline" size="sm" className="rounded-lg">
                    Voir les infos pratiques
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 md:py-14 bg-muted/50">
          <div className="container text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gc-green/15 text-gc-green mb-4" aria-hidden>
              <MessageCircle className="h-6 w-6" />
            </div>
            <h2 className="font-heading text-2xl font-bold mb-2">Une question avant le départ ?</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Notre équipe est à votre écoute pour tout renseignement.
            </p>
            <Link href="/contact">
              <Button size="lg" className="rounded-lg">
                Nous contacter
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
