import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export default function LegalPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container py-12">
        <h1 className="font-heading text-4xl font-bold mb-8">Mentions légales</h1>
        <div className="max-w-3xl space-y-6">
          {/* TODO: Add real legal content */}
          <p className="text-muted-foreground">
            Les mentions légales seront complétées avec les informations de l&apos;entreprise.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
