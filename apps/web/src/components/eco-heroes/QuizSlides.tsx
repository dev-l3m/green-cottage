'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import type { QuizPack } from '@/components/eco-heroes/quiz-data';

export function QuizSlides({ pack }: { pack: QuizPack }) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showFinal, setShowFinal] = useState(false);

  const totalSlides = pack.questions.length + 1;
  const progress = Math.round((current / (totalSlides - 1)) * 100);
  const activeQuestion = pack.questions[current];
  const selected = answers[current];

  const score = useMemo(
    () =>
      pack.questions.reduce((sum, q, idx) => {
        return sum + (answers[idx] === q.correct ? 1 : 0);
      }, 0),
    [answers, pack.questions]
  );

  const goNext = () => setCurrent((v) => Math.min(pack.questions.length - 1, v + 1));
  const goPrev = () => setCurrent((v) => Math.max(0, v - 1));

  const finishQuiz = () => {
    setShowFinal(true);
    setCurrent(pack.questions.length);
  };

  const restartQuiz = () => {
    setAnswers({});
    setShowFinal(false);
    setCurrent(0);
  };

  return (
    <div className="rounded-2xl border bg-white p-4 md:p-6 shadow-sm">
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <span className="inline-flex rounded-full bg-gc-green/10 px-2.5 py-1 text-xs font-medium text-gc-forest">
          {pack.badge}
        </span>
        <span className="text-xs text-muted-foreground">
          {showFinal ? 'Resultat final' : `Question ${current + 1}/${pack.questions.length}`}
        </span>
      </div>

      <h3 className="font-heading text-xl md:text-2xl font-bold text-gc-forest uppercase mb-1">
        {pack.title}
      </h3>
      <p className="text-sm text-muted-foreground mb-3">{pack.subtitle}</p>

      <div className="h-2 rounded-full bg-muted overflow-hidden mb-5">
        <span
          className="block h-full bg-gc-green transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {showFinal ? (
        <div className="rounded-xl bg-green-50 border border-green-200 p-4 space-y-4">
          <h4 className="font-semibold text-lg">Bravo !</h4>
          <p className="text-sm text-green-900">
            Score : {score}/{pack.questions.length}
          </p>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={restartQuiz}>
              Recommencer
            </Button>
          </div>
        </div>
      ) : (
        <div className="rounded-xl bg-[#C3B408] p-4 md:p-5">
          <h4 className="font-semibold text-sm mb-3">{activeQuestion.title}</h4>
          <div className="grid gap-2.5">
            {activeQuestion.choices.map((choice) => {
              const isSelected = selected === choice.id;
              const isCorrect = choice.id === activeQuestion.correct;

              return (
                <label
                  key={choice.id}
                  className={`flex items-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm cursor-pointer ${
                    isSelected && isCorrect
                      ? 'border-green-500'
                      : isSelected
                        ? 'border-red-500'
                        : 'border-border'
                  }`}
                >
                  <input
                    type="radio"
                    name={`${pack.id}-q-${current}`}
                    checked={isSelected}
                    onChange={() => setAnswers((prev) => ({ ...prev, [current]: choice.id }))}
                  />
                  {choice.label}
                </label>
              );
            })}
          </div>

          {selected && (
            <div className="mt-3 space-y-2">
              <p className="text-xs text-gray-700">{activeQuestion.explain}</p>
              {selected === activeQuestion.correct && (
                <p className="text-xs rounded-md border border-green-200 bg-green-50 text-green-900 px-2 py-1">
                  {activeQuestion.comment}
                </p>
              )}
            </div>
          )}

          <div className="mt-4 flex items-center justify-between gap-3">
            <Button type="button" variant="outline" onClick={goPrev} disabled={current === 0}>
              Precedent
            </Button>

            {current === pack.questions.length - 1 ? (
              <Button type="button" onClick={finishQuiz}>
                Corriger
              </Button>
            ) : (
              <Button type="button" onClick={goNext} disabled={!selected}>
                Suivant
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
