import "server-only";
import type { Language } from "./languages";
import type { Messages } from "./i18n";

// Only the chosen language is loaded and sent to the browser.
const loaders: Record<Language, () => Promise<{ default: Messages }>> = {
  en: () => import("@/messages/en.json"),
  es: () => import("@/messages/es.json"),
  nl: () => import("@/messages/nl.json"),
  hi: () => import("@/messages/hi.json"),
  tr: () => import("@/messages/tr.json"),
  fr: () => import("@/messages/fr.json"),
  de: () => import("@/messages/de.json"),
  ru: () => import("@/messages/ru.json"),
  pt: () => import("@/messages/pt.json"),
};

export const loadMessages = async (language: Language) => (await loaders[language]()).default;
