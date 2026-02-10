import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-heading font-bold text-lg mb-4 text-gc-forest">Green Cottage</h3>
            <p className="text-sm text-muted-foreground">
              Votre destination pour des séjours inoubliables dans des cottages de charme.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-foreground">Liens rapides</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/cottages" className="text-muted-foreground hover:text-gc-green transition-colors">
                  Nos cottages
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-gc-green transition-colors">
                  À propos
                </Link>
              </li>
              <li>
                <Link href="/activities" className="text-muted-foreground hover:text-gc-green transition-colors">
                  Activités
                </Link>
              </li>
              <li>
                <Link href="/reviews" className="text-muted-foreground hover:text-gc-green transition-colors">
                  Avis clients
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-foreground">Informations</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-gc-green transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/legal" className="text-muted-foreground hover:text-gc-green transition-colors">
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-gc-green transition-colors">
                  Politique de confidentialité
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-foreground">Contact</h4>
            <p className="text-sm text-muted-foreground">
              Email: contact@green-cottage.com
              <br />
              Téléphone: 020 7388 5619
            </p>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Green Cottage / L3M Holding. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
