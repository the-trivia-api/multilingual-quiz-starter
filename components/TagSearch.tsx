"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import { createTagSearch } from "@/lib/search";
import type { Tag } from "@/lib/types";
import { useI18n } from "./I18nProvider";

const PAGE_SIZE = 48;

export function TagSearch({ tags }: { tags: Tag[] }) {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [shown, setShown] = useState(PAGE_SIZE);
  const deferredQuery = useDeferredValue(query);

  const search = useMemo(() => createTagSearch(tags), [tags]);
  const searching = deferredQuery.trim().length > 0;
  // With no query, the tags are already sorted biggest first.
  const results = useMemo(
    () => (searching ? search(deferredQuery) : tags),
    [search, searching, deferredQuery, tags]
  );

  return (
    <section className="search">
      <label className="search__label" htmlFor="tag-search">
        {t("searchLabel")}
      </label>
      <input
        id="tag-search"
        className="search__input"
        type="search"
        autoComplete="off"
        spellCheck={false}
        placeholder={t("searchPlaceholder")}
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setShown(PAGE_SIZE);
        }}
        aria-describedby="tag-search-hint"
      />
      <p id="tag-search-hint" className="search__hint">
        {t("searchHint")}
      </p>

      <h2 className="search__heading" aria-live="polite">
        {searching ? t("matchingTopics", { count: results.length }) : t("popularTopics")}
      </h2>

      {searching && results.length === 0 ? (
        <p className="search__empty">{t("noMatches", { query: deferredQuery.trim() })}</p>
      ) : (
        <ul className="tags">
          {results.slice(0, shown).map((tag, index) => (
            <li key={tag.slug} className="tags__item" style={{ "--i": index % PAGE_SIZE } as React.CSSProperties}>
              <TagCard tag={tag} />
            </li>
          ))}
        </ul>
      )}

      {results.length > shown && (
        <button type="button" className="button search__more" onClick={() => setShown(shown + PAGE_SIZE)}>
          {t("showMore")}
        </button>
      )}
    </section>
  );
}

function TagCard({ tag }: { tag: Tag }) {
  const { t } = useI18n();
  const content = (
    <>
      <span className="tag__label">{tag.label}</span>
      {tag.description && <span className="tag__description">{tag.description}</span>}
      <span className="tag__count">
        {tag.count > 0 ? t("questionCount", { count: tag.count }) : t("noQuestionsYet")}
      </span>
    </>
  );

  // A tag with a few questions gives a short round, but a count of 0 never works.
  if (tag.count === 0) {
    return (
      <div className="tag tag--disabled" aria-disabled="true">
        {content}
      </div>
    );
  }

  return (
    // No prefetch: following the link fetches questions, which uses a credit.
    <Link className="tag" href={`/play?${new URLSearchParams({ tag: tag.slug })}`} prefetch={false}>
      {content}
    </Link>
  );
}
