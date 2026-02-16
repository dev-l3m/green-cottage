import Image from 'next/image';
import { MapPin, Users, ShieldCheck, Leaf } from 'lucide-react';
import { siteImages } from '@/lib/assets/images';

const ADVANTAGES = [
  {
    icon: MapPin,
    title: "Des hébergements d'exception soigneusement sélectionnés",
    description:
      "Chaque cottage et gîte de notre collection est choisi avec soin pour son authenticité, son charme unique et son niveau de confort. Nous privilégions les hébergements qui respectent l'environnement tout en offrant des équipements modernes.",
  },
  {
    icon: Users,
    title: "Un accompagnement personnalisé tout au long de votre séjour",
    description:
      "Notre équipe dédiée vous accompagne de la réservation jusqu'à votre départ. Conseils personnalisés, conciergerie sur place, et attention aux détails : nous mettons tout en œuvre pour que votre expérience soit mémorable.",
  },
  {
    icon: ShieldCheck,
    title: 'Réservation en ligne simple et 100% sécurisée',
    description:
      "Réservez votre cottage en toute confiance grâce à notre système de paiement sécurisé. Confirmation immédiate par email, modification flexible et service client réactif : votre tranquillité d'esprit est notre priorité.",
  },
  {
    icon: Leaf,
    title: "Une expérience écotouristique authentique",
    description:
      "Reconnectez-vous avec la nature dans nos hébergements éco-responsables. Chaque gîte est intégré harmonieusement dans son environnement naturel, vous offrant une expérience où confort rime avec respect de la nature.",
  },
] as const;

export function AboutSection() {
  return (
    <section
      id="about"
      className="py-20 bg-[#FAFAF7]"
      aria-labelledby="about-heading"
    >
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Bloc image (gauche) */}
          <div className="order-2 lg:order-1">
            <div className="rounded-3xl overflow-hidden shadow-lg border border-border">
              <div className="relative w-full h-[320px] sm:h-[400px] lg:h-[520px]">
                <Image
                 src="/images/aprops.webp"
                  alt="Paysage de nature et cottages Green Cottage - hébergements au cœur de l'environnement"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority={false}
                />
              </div>
            </div>
          </div>

          {/* Bloc texte (droite) */}
          <div className="order-1 lg:order-2">
            <h2
              id="about-heading"
              className="font-heading text-3xl sm:text-4xl lg:text-[2.5rem] font-bold text-gc-forest leading-tight mb-6"
            >
              Pourquoi choisir Green Cottage
              <br />
              pour vos vacances nature ?
            </h2>
            <div
              className="w-16 h-1 rounded-full bg-gc-green/40 mb-10"
              aria-hidden
            />

            <ul className="space-y-10" role="list">
              {ADVANTAGES.map((item, index) => {
                const Icon = item.icon;
                return (
                  <li key={index} className="flex gap-4 sm:gap-5">
                    <span
                      className="flex-shrink-0 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-gc-green/15 text-gc-green"
                      aria-hidden
                    >
                      <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-heading font-semibold text-lg mb-2 text-foreground">
                        {item.title}
                      </h3>
                      <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-xl">
                        {item.description}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
