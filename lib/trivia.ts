import "server-only";
import { DEFAULT_LANGUAGE, type Language } from "./languages";
import { shuffle } from "./shuffle";
import type { QuizQuestion, Tag } from "./types";

const API_URL = "https://the-trivia-api.com/v2";

export const QUIZ_LENGTH = 10;

type LocalisedText = Record<Language, string>;

type RegistryTag = {
  slug: string;
  label: LocalisedText;
  description: LocalisedText;
  count: number;
};

type ApiQuestion = {
  id: string;
  type: string;
  question: { text: string };
  correctAnswer: string;
  incorrectAnswers: string[];
};

export class TriviaApiError extends Error {
  constructor(
    readonly status: number,
    message: string
  ) {
    super(message);
  }
}

/**
 * Every tag with its label and description in one language. We load this at
 * runtime because tags are added and their counts change: never copy it into
 * your code. Every tag has text in every language we support.
 */
export const fetchTags = async (language: Language): Promise<Tag[]> => {
  const response = await fetch(`${API_URL}/tag-registry?${new URLSearchParams({ language })}`, {
    next: { revalidate: 3600 },
  });
  if (!response.ok) {
    throw new TriviaApiError(response.status, await response.text());
  }

  const tags: RegistryTag[] = await response.json();
  return tags
    .map((tag) => ({
      slug: tag.slug,
      label: tag.label[language],
      description: tag.description[language],
      count: tag.count,
    }))
    .sort((a, b) => b.count - a.count);
};

/**
 * Up to QUIZ_LENGTH multiple choice questions with one tag, in one language.
 * This runs on the server only, so the API key never reaches the browser.
 */
export const fetchQuiz = async (tag: string, language: Language): Promise<QuizQuestion[]> => {
  const apiKey = process.env.TRIVIA_API_KEY;
  if (!apiKey) {
    throw new TriviaApiError(401, "TRIVIA_API_KEY is not set");
  }

  const params = new URLSearchParams({
    limit: String(QUIZ_LENGTH),
    types: "text_choice",
    tags: tag,
  });
  // English is the default, so we only send language for the other eight.
  if (language !== DEFAULT_LANGUAGE) params.set("language", language);
  const response = await fetch(`${API_URL}/questions?${params}`, {
    headers: { "X-API-Key": apiKey },
    cache: "no-store",
  });
  if (!response.ok) {
    throw new TriviaApiError(response.status, await response.text());
  }

  const questions: ApiQuestion[] = await response.json();
  return questions
    .filter((question) => question.type === "text_choice")
    .map((question) => ({
      id: question.id,
      question: question.question.text,
      answers: shuffle([question.correctAnswer, ...question.incorrectAnswers]),
      correctAnswer: question.correctAnswer,
    }));
};
