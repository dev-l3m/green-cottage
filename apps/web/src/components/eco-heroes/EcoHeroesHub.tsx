'use client';

import { useState } from 'react';
import { QuizSlides } from '@/components/eco-heroes/QuizSlides';
import { QUIZ_PACKS } from '@/components/eco-heroes/quiz-data';

export function EcoHeroesHub() {
  const [activeQuizId, setActiveQuizId] = useState(QUIZ_PACKS[0].id);
  const activePack = QUIZ_PACKS.find((pack) => pack.id === activeQuizId) ?? QUIZ_PACKS[0];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {QUIZ_PACKS.map((pack) => {
          const active = activePack.id === pack.id;
          return (
            <button
              key={pack.id}
              type="button"
              onClick={() => setActiveQuizId(pack.id)}
              className={`rounded-full px-4 py-2 text-sm font-medium border transition ${
                active
                  ? 'bg-gc-green text-white border-gc-green'
                  : 'bg-white text-foreground border-border hover:bg-muted'
              }`}
            >
              {pack.title}
            </button>
          );
        })}
      </div>

      <QuizSlides key={activePack.id} pack={activePack} />
    </div>
  );
}
