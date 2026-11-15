import { createT } from "@/lib/i18n";
import { loadMessages } from "@/lib/messages";
import { getRequestLanguage } from "@/lib/request-language";

export default async function Loading() {
  const language = await getRequestLanguage();
  const t = createT(language, await loadMessages(language));
  return (
    <section className="card loading" role="status">
      <span className="loading__dots" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
      <p>{t("loadingQuiz")}</p>
    </section>
  );
}
