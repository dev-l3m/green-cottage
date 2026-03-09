'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

type WifiPasswordFieldProps = {
  password: string;
  canReveal: boolean;
};

export function WifiPasswordField({ password, canReveal }: WifiPasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  if (!canReveal) {
    return (
      <div>
        <div className="font-mono tracking-wider">••••••••••••</div>
        <p className="text-xs text-muted-foreground mt-1">
          Connectez-vous avec un compte ayant une reservation active pour afficher le mot de passe.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="font-mono tracking-wider">{visible ? password : '••••••••••••'}</div>
      <Button type="button" variant="outline" size="sm" onClick={() => setVisible((v) => !v)}>
        {visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
      </Button>
    </div>
  );
}
