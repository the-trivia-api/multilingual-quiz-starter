import type { Language } from "./languages";
import en from "@/messages/en.json";

export type Messages = typeof en;

type Values = Record<string, string | number>;

/**
 * Builds a t() for one language. Keys ending in _one, _few, _many or _other
 * are plural forms: t("questionCount", { count: 3 }) picks the right one with
 * Intl.PluralRules. {name} placeholders are filled in from values.
 */
export const createT = (language: Language, messages: Messages) => {
  const table = messages as Record<string, string>;
  const plurals = new Intl.PluralRules(language);
  const numbers = new Intl.NumberFormat(language);

  return (key: string, values: Values = {}) => {
    let template = table[key];
    if (template === undefined && typeof values.count === "number") {
      template = table[`${key}_${plurals.select(values.count)}`] ?? table[`${key}_other`];
    }
    if (template === undefined) return key;

    return template.replace(/\{(\w+)\}/g, (match, name: string) => {
      const value = values[name];
      if (value === undefined) return match;
      return typeof value === "number" ? numbers.format(value) : value;
    });
  };
};

export type T = ReturnType<typeof createT>;
