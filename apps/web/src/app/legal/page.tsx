import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import Link from 'next/link';

export const metadata = {
  title: 'Mentions légales | L3M Green Cottage',
  description: 'Mentions légales et informations sur l\'éditeur du site L3M Green Cottage, Sonnay, Isère.',
};

const SECTIONS = [
  {
    id: 'editeur',
    title: 'Éditeur du site',
    content: (
      <>
        <p className="mb-4">
          Le site <strong>green-cottage.fr</strong> (ou le domaine en vigueur) est édité par :
        </p>
        <ul className="list-none space-y-1 text-muted-foreground pl-0">
          <li><strong className="text-foreground">L3M Green Cottage</strong></li>
          <li>Forme juridique : [à compléter – ex. SAS, SARL, auto-entrepreneur]</li>
          <li>Siège social : Sonnay – Isère, France</li>
          <li>Contact : voir page <Link href="/contact" className="text-primary underline hover:no-underline">Contact</Link></li>
        </ul>
      </>
    ),
  },
  {
    id: 'hebergeur',
    title: 'Hébergement',
    content: (
      <>
        <p>
          Le site est hébergé par [nom de l’hébergeur – ex. Vercel Inc., OVH, etc.]. 
          L’adresse postale et les coordonnées de l’hébergeur sont disponibles sur demande ou 
          consultables dans les conditions générales d’utilisation de l’hébergeur.
        </p>
      </>
    ),
  },
  {
    id: 'propriete',
    title: 'Propriété intellectuelle',
    content: (
      <>
        <p className="mb-4">
          L’ensemble du contenu de ce site (textes, images, visuels, logos, structure) est protégé 
          par le droit d’auteur et les droits de propriété intellectuelle. Toute reproduction, 
          représentation ou exploitation non autorisée peut constituer une contrefaçon.
        </p>
        <p>
          Les marques et logos mentionnés sont la propriété de leurs titulaires respectifs.
        </p>
      </>
    ),
  },
  {
    id: 'responsabilite',
    title: 'Limitation de responsabilité',
    content: (
      <>
        <p className="mb-4">
          L’éditeur s’efforce d’assurer l’exactitude et la mise à jour des informations diffusées 
          sur ce site. Toutefois, il ne peut garantir l’absence d’erreur, d’omission ou d’interruption 
          de service. L’utilisation du site et des informations qu’il contient se fait sous la 
          responsabilité de l’utilisateur.
        </p>
        <p>
          Les liens éventuels vers des sites tiers n&apos;engagent pas la responsabilité de L3M Green Cottage.
        </p>
      </>
    ),
  },
  {
    id: 'donnees',
    title: 'Données personnelles',
    content: (
      <>
        <p>
          Les données personnelles collectées via le site sont traitées conformément au RGPD et 
          à notre politique de confidentialité. Vous disposez d’un droit d’accès, de rectification, 
          d’effacement et de portabilité de vos données.
        </p>
        <p className="mt-4">
          <Link href="/privacy" className="text-primary font-medium underline hover:no-underline">
            Consulter la politique de confidentialité
          </Link>
        </p>
      </>
    ),
  },
  {
    id: 'droit',
    title: 'Droit applicable',
    content: (
      <p>
        Les présentes mentions légales et l’utilisation du site sont régies par le droit français. 
        En cas de litige, les tribunaux français seront seuls compétents.
      </p>
    ),
  },
  {
    id: 'contact',
    title: 'Contact',
    content: (
      <p>
        Pour toute question relative aux mentions légales ou au site :{' '}
        <Link href="/contact" className="text-primary underline hover:no-underline">
          nous contacter
        </Link>.
      </p>
    ),
  },
];

export default function LegalPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="border-b bg-muted/30 py-10 md:py-14" aria-labelledby="legal-heading">
          <div className="container">
            <h1 id="legal-heading" className="font-heading text-3xl md:text-4xl font-bold mb-2">
              Mentions légales
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              Informations sur l’éditeur du site, l’hébergement et vos droits.
            </p>
          </div>
        </section>

        {/* Sommaire (style Airbnb) */}
        <nav className="container py-6 border-b" aria-label="Sommaire des mentions légales">
          <h2 className="sr-only">Sommaire</h2>
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="text-muted-foreground hover:text-foreground underline hover:no-underline"
                >
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Contenu par section */}
        <div className="container py-10 md:py-14">
          <div className="max-w-3xl space-y-12">
            {SECTIONS.map((section) => (
              <article
                key={section.id}
                id={section.id}
                className="scroll-mt-6"
              >
                <h2 className="font-heading text-xl font-semibold mb-4 text-foreground">
                  {section.title}
                </h2>
                <div className="text-muted-foreground leading-relaxed">
                  {section.content}
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
