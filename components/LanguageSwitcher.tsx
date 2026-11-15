"use client";

import { useEffect, useTransition } from "react";
import { setLanguage } from "@/app/actions";
import { LANGUAGE_COOKIE, LANGUAGE_NAMES, LANGUAGES, isLanguage } from "@/lib/languages";
import { useI18n } from "./I18nProvider";

export function LanguageSwitcher() {
  const { language, t } = useI18n();
  const [pending, startTransition] = useTransition();

  // The cookie decides the language. localStorage keeps a copy for any
  // client code that wants it without asking the server.
  useEffect(() => {
    localStorage.setItem(LANGUAGE_COOKIE, language);
  }, [language]);

  const change = (next: string) => {
    if (!isLanguage(next) || next === language) return;
    localStorage.setItem(LANGUAGE_COOKIE, next);
    startTransition(() => setLanguage(next));
  };

  return (
    <label className="switcher" data-pending={pending || undefined}>
      <span className="switcher__label">{t("languageLabel")}</span>
      <select
        className="switcher__select"
        value={language}
        onChange={(event) => change(event.target.value)}
        disabled={pending}
      >
        {LANGUAGES.map((code) => (
          <option key={code} value={code} lang={code}>
            {LANGUAGE_NAMES[code]}
          </option>
        ))}
      </select>
    </label>
  );
}
