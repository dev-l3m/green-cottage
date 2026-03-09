'use client';

import { useMemo, useState } from 'react';
import { Calendar, CheckCircle2, FileText, Package, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

type ChecklistIconKey = 'calendar' | 'fileText' | 'package' | 'sun';

export type ChecklistItem = {
  text: string;
  icon: ChecklistIconKey;
};

const ICON_MAP = {
  calendar: Calendar,
  fileText: FileText,
  package: Package,
  sun: Sun,
} as const;

export function DepartureChecklist({ items }: { items: ChecklistItem[] }) {
  const [checked, setChecked] = useState<boolean[]>(() => items.map(() => false));

  const completed = useMemo(
    () => checked.reduce((sum, value) => sum + (value ? 1 : 0), 0),
    [checked]
  );

  const progress = items.length === 0 ? 0 : Math.round((completed / items.length) * 100);

  const toggleItem = (index: number) => {
    setChecked((prev) => prev.map((value, i) => (i === index ? !value : value)));
  };

  const resetChecklist = () => setChecked(items.map(() => false));

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Progression: {completed}/{items.length}
          </span>
          <span className="font-medium text-gc-green">{progress}%</span>
        </div>
        <div className="h-2 rounded-full bg-muted">
          <div
            className="h-2 rounded-full bg-gc-green transition-all duration-300"
            style={{ width: `${progress}%` }}
            aria-hidden
          />
        </div>
      </div>

      <ul className="space-y-3 list-none p-0 m-0">
        {items.map((item, index) => {
          const Icon = ICON_MAP[item.icon];
          const isChecked = checked[index];

          return (
            <li key={`${item.text}-${index}`}>
              <button
                type="button"
                onClick={() => toggleItem(index)}
                className={`w-full rounded-xl border p-3 text-left transition ${
                  isChecked
                    ? 'border-gc-green/40 bg-gc-green/10'
                    : 'border-border hover:bg-muted/60'
                }`}
                aria-pressed={isChecked}
              >
                <span className="flex gap-4 items-start">
                  <span
                    className={`flex-shrink-0 mt-0.5 ${isChecked ? 'text-gc-green' : 'text-muted-foreground'}`}
                    aria-hidden
                  >
                    <CheckCircle2 className="h-6 w-6" />
                  </span>
                  <span className={`pt-0.5 ${isChecked ? 'text-foreground line-through' : 'text-foreground'}`}>
                    {item.text}
                  </span>
                  <span className="ml-auto flex-shrink-0 text-muted-foreground" aria-hidden>
                    <Icon className="h-5 w-5" />
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="flex justify-end">
        <Button type="button" variant="outline" size="sm" onClick={resetChecklist}>
          Reinitialiser la checklist
        </Button>
      </div>
    </div>
  );
}
