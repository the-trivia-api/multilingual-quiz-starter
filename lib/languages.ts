// The languages The Trivia API can return questions and tag labels in.
// None of them are written right to left, so the layout never needs to flip.
export const LANGUAGES = ["en", "es", "nl", "hi", "tr", "fr", "de", "ru", "pt"] as const;

export type Language = (typeof LANGUAGES)[number];

export const DEFAULT_LANGUAGE: Language = "en";

export const LANGUAGE_COOKIE = "quiz-language";

// Each language's name in that language, for the switcher.
export const LANGUAGE_NAMES: Record<Language, string> = {
  en: "English",
  es: "Español",
  nl: "Nederlands",
  hi: "हिन्दी",
  tr: "Türkçe",
  fr: "Français",
  de: "Deutsch",
  ru: "Русский",
  pt: "Português",
};

export const isLanguage = (value: unknown): value is Language =>
  typeof value === "string" && (LANGUAGES as readonly string[]).includes(value);

/**
 * Turns an Accept-Language header into language codes, most preferred first.
 * "de-CH,de;q=0.9,en;q=0.8" gives ["de", "de", "en"].
 */
const parseAcceptLanguage = (header: string) =>
  header
    .split(",")
    .map((part, index) => {
      const [range, ...params] = part.trim().split(";");
      const q = params.find((param) => param.trim().startsWith("q="));
      const quality = q ? Number(q.trim().slice(2)) : 1;
      return { code: range.split("-")[0].toLowerCase(), quality: Number.isNaN(quality) ? 0 : quality, index };
    })
    .filter((entry) => entry.code && entry.quality > 0)
    .sort((a, b) => b.quality - a.quality || a.index - b.index)
    .map((entry) => entry.code);

/**
 * The cookie wins if it holds a supported language. Otherwise we take the
 * browser's most preferred language that we support, and fall back to English.
 */
export const pickLanguage = (cookie: string | undefined, acceptLanguage: string | null): Language => {
  if (isLanguage(cookie)) return cookie;
  const preferred = parseAcceptLanguage(acceptLanguage ?? "").find(isLanguage);
  return preferred ?? DEFAULT_LANGUAGE;
};
