import { ErrorCard } from "@/components/ErrorCard";
import { Quiz } from "@/components/Quiz";
import { createT } from "@/lib/i18n";
import { loadMessages } from "@/lib/messages";
import { getRequestLanguage } from "@/lib/request-language";
import { fetchQuiz, fetchTags, QUIZ_LENGTH } from "@/lib/trivia";
import type { QuizQuestion } from "@/lib/types";

type Props = { searchParams: Promise<{ tag?: string | string[] }> };

export default async function PlayPage({ searchParams }: Props) {
  const { tag } = await searchParams;
  const language = await getRequestLanguage();
  const t = createT(language, await loadMessages(language));

  // One tag per quiz: several tags would mean questions with any of them.
  if (typeof tag !== "string" || !/^[a-z]+:[a-z0-9-]+$/.test(tag)) {
    return <ErrorCard t={t} message={t("emptyQuiz")} />;
  }

  const retryHref = `/play?${new URLSearchParams({ tag })}`;
  let questions: QuizQuestion[];
  try {
    questions = await fetchQuiz(tag, language);
  } catch (error) {
    console.error(`Could not load questions for ${tag}`, error);
    return <ErrorCard t={t} message={t("errorQuestions")} retryHref={retryHref} />;
  }

  if (questions.length === 0) {
    return <ErrorCard t={t} message={t("emptyQuiz")} />;
  }

  // The label is only for show, so a failed registry request falls back to the slug.
  const topic = await fetchTags(language)
    .then((tags) => tags.find((entry) => entry.slug === tag)?.label)
    .catch(() => undefined);

  return (
    <Quiz
      key={questions.map((question) => question.id).join()}
      topic={topic ?? tag}
      questions={questions}
      isShort={questions.length < QUIZ_LENGTH}
    />
  );
}
