import Image from 'next/image';
import { Leaf, MapPin, ShieldCheck, Users } from 'lucide-react';

const ADVANTAGES = [
  {
    icon: MapPin,
    title: "Des hébergements d'exception soigneusement sélectionnés",
    description:
      "Chaque cottage et gîte de notre collection est choisi avec soin pour son authenticité, son charme unique et son niveau de confort. Nous privilégions les hébergements qui respectent l'environnement tout en offrant des équipements modernes.",
  },
  {
    icon: Users,
    title: 'Un accompagnement personnalisé tout au long de votre séjour',
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
    title: 'Une expérience écotouristique authentique',
    description:
      "Reconnectez-vous avec la nature dans nos hébergements éco-responsables. Chaque gîte est intégré harmonieusement dans son environnement naturel, vous offrant une expérience où confort rime avec respect de la nature.",
  },
] as const;

export function AboutSection() {
  return (
    <section id="about" className="bg-[#F3F5EE] py-20 lg:py-24" aria-labelledby="about-heading">
      <div className="container">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 lg:grid-cols-2 lg:gap-16">
          <div className="order-1 flex justify-center lg:order-1">
            <div className="relative w-full h-[700px] overflow-hidden rounded-lg shadow-lg">
              <Image
                src="/images/aprops.webp"
                alt="Paysage de nature et cottages Green Cottage - hébergements au cœur de l'environnement"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority={false}
              />
              <div className="absolute inset-0" aria-hidden />
            </div>
          </div>

          <div className="order-2 self-center lg:order-2">
            <h2
              id="about-heading"
              className="mb-8 max-w-2xl font-heading text-3xl font-bold leading-[1.12] text-gc-forest sm:text-4xl lg:text-[2rem]"
            >
              Pourquoi choisir Green Cottage pour vos vacances nature ?
            </h2>
            <div className="green-divider w-32 mb-12" />

            <ul className="space-y-10" role="list">
              {ADVANTAGES.map((item) => {
                const Icon = item.icon;

                return (
                  <li key={item.title} className="flex items-start gap-5 sm:gap-6">
                    <span
                      className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full border border-[#7db549] bg-[#7db549]/20 text-[#7db549] shadow-sm"
                      aria-hidden
                    >
                      <Icon className="h-6 w-6" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="mb-2 font-heading text-xl font-semibold leading-snug text-gc-forest">
                        {item.title}
                      </h3>
                      <p className="max-w-xl text-base leading-relaxed text-muted-foreground">
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
