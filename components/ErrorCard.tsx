import Link from "next/link";
import type { T } from "@/lib/i18n";

type Props = {
  t: T;
  message: string;
  retryHref?: string;
};

export function ErrorCard({ t, message, retryHref }: Props) {
  return (
    <section className="card card--error" role="alert">
      <p className="card__emoji" aria-hidden="true">
        🔔
      </p>
      <h2 className="card__title">{t("errorTitle")}</h2>
      <p>{message}</p>
      <div className="card__actions">
        {retryHref && (
          <a className="button button--primary" href={retryHref}>
            {t("tryAgain")}
          </a>
        )}
        <Link className="button" href="/">
          {t("backToTopics")}
        </Link>
      </div>
    </section>
  );
}
