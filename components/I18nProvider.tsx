"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { createT, type Messages, type T } from "@/lib/i18n";
import type { Language } from "@/lib/languages";

type I18n = { language: Language; t: T };

const I18nContext = createContext<I18n | null>(null);

export function I18nProvider({
  language,
  messages,
  children,
}: {
  language: Language;
  messages: Messages;
  children: ReactNode;
}) {
  const value = useMemo(() => ({ language, t: createT(language, messages) }), [language, messages]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export const useI18n = () => {
  const i18n = useContext(I18nContext);
  if (!i18n) throw new Error("useI18n must be used inside I18nProvider");
  return i18n;
};
