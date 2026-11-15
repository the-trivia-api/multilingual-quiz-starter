import { ErrorCard } from "@/components/ErrorCard";
import { TagSearch } from "@/components/TagSearch";
import { createT } from "@/lib/i18n";
import { loadMessages } from "@/lib/messages";
import { getRequestLanguage } from "@/lib/request-language";
import { fetchTags } from "@/lib/trivia";
import type { Tag } from "@/lib/types";

export default async function HomePage() {
  const language = await getRequestLanguage();
  const t = createT(language, await loadMessages(language));

  let tags: Tag[] | null = null;
  try {
    tags = await fetchTags(language);
  } catch (error) {
    console.error("Could not load the tag registry", error);
  }

  return (
    <>
      <section className="hero">
        <h1 className="hero__title">{t("title")}</h1>
        <p className="hero__tagline">{t("tagline")}</p>
      </section>
      {tags ? <TagSearch tags={tags} /> : <ErrorCard t={t} message={t("errorTopics")} retryHref="/" />}
    </>
  );
}
