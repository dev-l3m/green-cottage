'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, Eye, EyeOff, Lock, XCircle } from 'lucide-react';
import { evaluatePassword } from '@/lib/password';

type PasswordFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  showChecks?: boolean;
};

export function PasswordField({
  id,
  label,
  value,
  onChange,
  required,
  placeholder,
  showChecks = false,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const checks = useMemo(() => evaluatePassword(value), [value]);

  const checkItems = [
    { ok: checks.hasLowercase, label: 'Une minuscule' },
    { ok: checks.hasUppercase, label: 'Une majuscule' },
    { ok: checks.hasDigit, label: 'Un chiffre' },
    { ok: checks.hasSpecialChar, label: 'Un caractère spécial' },
    { ok: checks.hasMinLength, label: '8 caractères minimum' },
  ];

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>
      <div className="relative">
        <Lock className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          className="w-full rounded-md border px-10 py-2 text-sm pr-24"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          placeholder={placeholder}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onChange('')}
            disabled={!value}
            aria-label="Effacer le mot de passe"
          >
            <XCircle className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setVisible((s) => !s)}
            aria-label={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          >
            {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {showChecks ? (
        <div className="rounded-md border p-3 bg-muted/30 space-y-1">
          {checkItems.map((item) => (
            <p
              key={item.label}
              className={`text-sm flex items-center gap-2 ${
                item.ok ? 'text-green-700' : 'text-muted-foreground'
              }`}
            >
              {item.ok ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
              {item.label}
            </p>
          ))}
        </div>
      ) : null}
    </div>
  );
}
