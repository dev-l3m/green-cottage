'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';

type Choice = {
  id: string;
  label: string;
};

type Question = {
  title: string;
  choices: Choice[];
  correct: string;
  explain: string;
  comment: string;
};

const QUESTIONS: Question[] = [
  {
    title: '1) Quelle est la principale cause des feux de forêt en France ?',
    correct: 'c',
    choices: [
      { id: 'a', label: 'A) La foudre' },
      { id: 'b', label: 'B) Les mégots de cigarette' },
      { id: 'c', label: 'C) Les barbecues et activités humaines' },
      { id: 'd', label: 'D) La lave des volcans' },
    ],
    explain:
      'La majorité des incendies en France sont liés aux activités humaines : barbecues, travaux, imprudences.',
    comment: "Bien vu ! Prévenir, c'est avant tout surveiller nos gestes du quotidien.",
  },
  {
    title: '2) Combien d’hectares de forêt partent en fumée chaque année en France en moyenne ?',
    correct: 'c',
    choices: [
      { id: 'a', label: 'A) 100' },
      { id: 'b', label: 'B) 1 000' },
      { id: 'c', label: 'C) 10 000' },
      { id: 'd', label: 'D) 100 000' },
    ],
    explain: 'Chaque année, environ 10 000 hectares sont détruits par les flammes en France.',
    comment: 'Exact ! Cela équivaut à plus de 14 000 terrains de football.',
  },
  {
    title: '3) Combien d’animaux sauvages périssent chaque année dans les incendies en France ?',
    correct: 'c',
    choices: [
      { id: 'a', label: 'A) Quelques centaines' },
      { id: 'b', label: 'B) Quelques milliers' },
      { id: 'c', label: 'C) Plusieurs centaines de milliers' },
      { id: 'd', label: 'D) Aucun, ils fuient tous' },
    ],
    explain: 'Les incendies détruisent des habitats et piégent de nombreux animaux.',
    comment: 'Tu as raison : la biodiversité est la première victime invisible du feu.',
  },
  {
    title: '4) Pourquoi les mégots jetés dehors sont-ils si dangereux ?',
    correct: 'b',
    choices: [
      { id: 'a', label: 'A) Ils polluent les sols' },
      { id: 'b', label: 'B) Ils restent incandescents plusieurs minutes' },
      { id: 'c', label: 'C) Ils sentent mauvais' },
      { id: 'd', label: 'D) Ils attirent les fourmis' },
    ],
    explain: 'Un mégot peut couver et allumer un feu même longtemps après avoir été jeté.',
    comment: 'Exact ! Un mégot peut mettre le feu à tout un massif forestier.',
  },
  {
    title: '5) Quelle plante fragile met plus de 20 ans à repousser après un incendie ?',
    correct: 'c',
    choices: [
      { id: 'a', label: 'A) La fougère' },
      { id: 'b', label: 'B) Le pin maritime' },
      { id: 'c', label: 'C) Le chêne-liège' },
      { id: 'd', label: 'D) Le pissenlit' },
    ],
    explain: 'Le chêne-liège met plusieurs décennies à se régénérer après les flammes.',
    comment: "Bravo ! Le chêne-liège protège aussi les sols de l'érosion.",
  },
  {
    title: '6) Quelle alternative est autorisée et sécurisée en été ?',
    correct: 'c',
    choices: [
      { id: 'a', label: 'A) Barbecue au charbon' },
      { id: 'b', label: 'B) Brasero' },
      { id: 'c', label: 'C) Plancha électrique' },
      { id: 'd', label: 'D) Feu de camp' },
    ],
    explain: 'En période estivale, seules les alternatives sans flammes sont autorisées.',
    comment: 'Correct ! La plancha électrique permet de profiter sans danger.',
  },
  {
    title: '7) En plus des arbres, quel est l’impact majeur des feux de forêt ?',
    correct: 'b',
    choices: [
      { id: 'a', label: "A) Ils réduisent l'oxygène" },
      { id: 'b', label: 'B) Ils détruisent les habitats des espèces' },
      { id: 'c', label: 'C) Ils attirent des moustiques' },
      { id: 'd', label: 'D) Ils font baisser la température' },
    ],
    explain: 'Les incendies menacent directement la faune et détruisent les écosystèmes entiers.',
    comment: 'Exact ! Les animaux perdent refuge et nourriture.',
  },
];

export function EcoFireQuiz() {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showFinal, setShowFinal] = useState(false);

  const totalSlides = QUESTIONS.length + 1;
  const progress = Math.round((current / (totalSlides - 1)) * 100);
  const activeQuestion = QUESTIONS[current];
  const selected = answers[current];

  const score = useMemo(
    () =>
      QUESTIONS.reduce((sum, q, idx) => {
        return sum + (answers[idx] === q.correct ? 1 : 0);
      }, 0),
    [answers]
  );

  const goNext = () => setCurrent((v) => Math.min(QUESTIONS.length - 1, v + 1));
  const goPrev = () => setCurrent((v) => Math.max(0, v - 1));

  const finishQuiz = () => {
    setShowFinal(true);
    setCurrent(QUESTIONS.length);
  };

  const restartQuiz = () => {
    setAnswers({});
    setShowFinal(false);
    setCurrent(0);
  };

  return (
    <div className="rounded-2xl border p-4 md:p-6 bg-white">
      <h2 className="font-heading text-2xl font-bold text-gc-forest uppercase mb-2">
        Quiz de la Sentinelle Ecofire
      </h2>
      <p className="text-sm text-muted-foreground mb-3">
        Repondez aux questions pour devenir un vrai gardien de la foret.
      </p>

      <div className="h-2 rounded-full bg-muted overflow-hidden mb-5">
        <span
          className="block h-full bg-gc-green transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {showFinal ? (
        <div className="rounded-xl bg-green-50 border border-green-200 p-4 space-y-4">
          <h3 className="font-semibold text-lg">Bravo, Sentinelle Ecofire !</h3>
          <p className="text-sm text-green-900">
            Score : {score}/{QUESTIONS.length}
          </p>
          <Button type="button" variant="outline" onClick={restartQuiz}>
            Recommencer
          </Button>
        </div>
      ) : (
        <div className="rounded-xl bg-[#C3B408] p-4 md:p-5">
          <h3 className="font-semibold text-sm mb-3">{activeQuestion.title}</h3>
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
                    name={`q-${current}`}
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
            <span className="text-xs text-gray-800">
              {current + 1}/{QUESTIONS.length}
            </span>
            {current === QUESTIONS.length - 1 ? (
              <Button type="button" onClick={finishQuiz}>
                Corriger
              </Button>
            ) : (
              <Button type="button" onClick={goNext}>
                Suivant
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
