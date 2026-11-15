"use client";

import Link from "next/link";
import { useI18n } from "@/components/I18nProvider";

// A last resort for anything the pages don't catch themselves.
export default function Error({ reset }: { error: Error; reset: () => void }) {
  const { t } = useI18n();
  return (
    <section className="card card--error" role="alert">
      <p className="card__emoji" aria-hidden="true">
        🔔
      </p>
      <h2 className="card__title">{t("errorTitle")}</h2>
      <p>{t("errorQuestions")}</p>
      <div className="card__actions">
        <button type="button" className="button button--primary" onClick={reset}>
          {t("tryAgain")}
        </button>
        <Link className="button" href="/">
          {t("backToTopics")}
        </Link>
      </div>
    </section>
  );
}
