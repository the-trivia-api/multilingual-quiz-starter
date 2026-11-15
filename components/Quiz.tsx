"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import type { QuizQuestion } from "@/lib/types";
import { Confetti } from "./Confetti";
import { useI18n } from "./I18nProvider";

const LETTERS = ["A", "B", "C", "D"];

type Props = {
  topic: string;
  questions: QuizQuestion[];
  isShort: boolean;
};

export function Quiz({ topic, questions, isShort }: Props) {
  const { t } = useI18n();
  const router = useRouter();
  const [refreshing, startRefresh] = useTransition();
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [finished, setFinished] = useState(false);
  const nextButton = useRef<HTMLButtonElement>(null);

  const question = questions[index];
  const isLast = index === questions.length - 1;
  const answeredCorrectly = chosen !== null && chosen === question?.correctAnswer;

  const answer = useCallback(
    (choice: string) => {
      if (chosen !== null || !question) return;
      setChosen(choice);
      if (choice === question.correctAnswer) {
        setScore(score + 1);
        setStreak(streak + 1);
        setBestStreak(Math.max(bestStreak, streak + 1));
      } else {
        setStreak(0);
      }
    },
    [chosen, question, score, streak, bestStreak]
  );

  const next = () => {
    if (isLast) {
      setFinished(true);
      return;
    }
    setIndex(index + 1);
    setChosen(null);
  };

  // Move focus to "Next" once the player answers, so Enter carries on.
  useEffect(() => {
    if (chosen !== null) nextButton.current?.focus();
  }, [chosen]);

  // Keys 1 to 4 pick an answer.
  useEffect(() => {
    if (finished || chosen !== null || !question) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      const position = Number(event.key) - 1;
      if (position >= 0 && position < question.answers.length) answer(question.answers[position]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [finished, chosen, question, answer]);

  // Asks the server for a fresh set of questions on the same tag.
  const playAgain = () => startRefresh(() => router.refresh());

  if (finished) {
    const total = questions.length;
    const verdict = score === total ? "resultsPerfect" : score >= total / 2 ? "resultsGood" : "resultsLow";
    return (
      <section className="card results" aria-labelledby="results-title">
        {score === total && <Confetti />}
        <p className="results__topic">{topic}</p>
        <h2 id="results-title" className="card__title results__title">
          {t("resultsTitle")}
        </h2>
        <p className="results__score">
          <span className="results__number">{score}</span>
          <span className="results__out-of">/ {total}</span>
        </p>
        <p className="results__summary">{t("resultsScore", { score, total })}</p>
        <p className="results__streak">🔥 {t("bestStreak", { count: bestStreak })}</p>
        <p className="results__verdict">{t(verdict)}</p>
        <div className="card__actions">
          <button type="button" className="button button--primary" onClick={playAgain} disabled={refreshing}>
            {refreshing ? t("loadingQuiz") : t("playAgain")}
          </button>
          <Link className="button" href="/">
            {t("pickAnother")}
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="quiz" aria-labelledby="question-text">
      <div className="scoreboard">
        <span className="scoreboard__topic">{topic}</span>
        <span className="scoreboard__stat">
          {t("questionProgress", { current: index + 1, total: questions.length })}
        </span>
        <span className="scoreboard__stat">
          {t("score")} <strong>{score}</strong>
        </span>
        <span className="scoreboard__stat scoreboard__streak" data-hot={streak >= 3 || undefined}>
          🔥 {t("streak")} <strong key={streak}>{streak}</strong>
        </span>
      </div>
      <div
        className="progress"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={questions.length}
        aria-valuenow={index + (chosen ? 1 : 0)}
      >
        <span style={{ width: `${((index + (chosen ? 1 : 0)) / questions.length) * 100}%` }} />
      </div>

      {isShort && index === 0 && <p className="notice">{t("shortQuiz")}</p>}

      <div className="card question" key={question.id}>
        {answeredCorrectly && <Confetti />}
        <h2 id="question-text" className="question__text">
          {question.question}
        </h2>
        <ul className="answers" aria-label={t("answersLabel")}>
          {question.answers.map((choice, position) => {
            const state =
              chosen === null
                ? undefined
                : choice === question.correctAnswer
                  ? "correct"
                  : choice === chosen
                    ? "wrong"
                    : "faded";
            return (
              <li key={choice}>
                <button
                  type="button"
                  className="answer"
                  data-colour={position}
                  data-state={state}
                  onClick={() => answer(choice)}
                  aria-disabled={chosen !== null}
                  aria-pressed={chosen === choice}
                >
                  <span className="answer__letter" aria-hidden="true">
                    {LETTERS[position]}
                  </span>
                  <span className="answer__text">{choice}</span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="feedback" aria-live="assertive">
          {chosen !== null && (
            <>
              <p className="feedback__verdict" data-correct={answeredCorrectly}>
                {answeredCorrectly ? t("correct") : t("incorrect")}
              </p>
              {!answeredCorrectly && (
                <p className="feedback__answer">{t("answerWas", { answer: question.correctAnswer })}</p>
              )}
            </>
          )}
        </div>

        <div className="question__footer">
          {chosen === null ? (
            <p className="question__hint">{t("keyboardHint")}</p>
          ) : (
            <button ref={nextButton} type="button" className="button button--primary" onClick={next}>
              {isLast ? t("seeResults") : t("nextQuestion")}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
