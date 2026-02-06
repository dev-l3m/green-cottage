'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

export default function ContactPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // TODO: Implement contact form submission
    setTimeout(() => {
      toast({
        title: 'Message envoyé',
        description: 'Nous vous répondrons dans les plus brefs délais.',
      });
      setFormData({ name: '', email: '', subject: '', message: '' });
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container py-12">
        <h1 className="font-heading text-4xl font-bold mb-8">Contactez-nous</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Informations de contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <strong>Email:</strong>
                <p className="text-muted-foreground">contact@green-cottage.com</p>
              </div>
              <div>
                <strong>Téléphone:</strong>
                <p className="text-muted-foreground">[TODO: Add phone]</p>
              </div>
              <div>
                <strong>Adresse:</strong>
                <p className="text-muted-foreground">[TODO: Add address]</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Envoyer un message</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nom</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="subject">Sujet</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="message">Message</Label>
                  <textarea
                    id="message"
                    className="w-full px-3 py-2 border rounded-md min-h-[120px]"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Envoi...' : 'Envoyer'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
