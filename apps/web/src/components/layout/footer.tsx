import Link from 'next/link';
import Image from 'next/image';

export function Footer() {
  return (
    <footer className="bg-[#244026]">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
          <Link
          href="/"
          className="flex items-center gap-2 flex-shrink-0"
        >
          <Image
            src="/logo_l3m.png"
            alt="L3M Logo"
            width={70}
            height={70}
            className="h-20 w-auto flex-shrink-0"
            priority
          />
        </Link>
            <p className="text-sm text-white/80">
              Votre destination pour des séjours inoubliables dans des cottages de charme.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-gc-green">Liens rapides</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/cottages" className="text-white/80 hover:text-white transition-colors">
                  Nos cottages
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-white/80 hover:text-white transition-colors">
                  À propos
                </Link>
              </li>
              <li>
                <Link href="/activities" className="text-white/80 hover:text-white transition-colors">
                  Activités
                </Link>
              </li>
              <li>
                <Link href="/reviews" className="text-white/80 hover:text-white transition-colors">
                  Avis clients
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-gc-green">Informations</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/contact" className="text-white/80 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/legal" className="text-white/80 hover:text-white transition-colors">
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-white/80 hover:text-white transition-colors">
                  Politique de confidentialité
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-gc-green">Contact</h4>
            <p className="text-sm text-white/80">
              Email: contact@green-cottage.com
              <br />
              Téléphone: 020 7388 5619
            </p>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/20 text-center text-sm text-white/80">
          <p>&copy; {new Date().getFullYear()} Green Cottage / L3M Holding. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
