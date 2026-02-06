import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container py-12">
        <h1 className="font-heading text-4xl font-bold mb-8">Politique de confidentialité</h1>
        <div className="max-w-3xl space-y-6">
          {/* TODO: Add real privacy policy content */}
          <p className="text-muted-foreground">
            La politique de confidentialité sera complétée selon les exigences GDPR.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
