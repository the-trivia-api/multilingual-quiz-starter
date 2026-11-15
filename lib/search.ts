import Fuse, { type FuseOptionKey, type IFuseOptions } from "fuse.js";
import type { Tag } from "./types";

/**
 * Lowercases and strips accents, so "cafe" matches "Café" and "geographie"
 * matches "Géographie". Only Latin combining accents are removed: Devanagari
 * vowel signs are marks too, and Hindi needs them.
 */
export const fold = (text: string) =>
  text
    .toLocaleLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ı/g, "i")
    .replace(/ß/g, "ss")
    .normalize("NFC");

export type SearchableTag = Tag & { slugWords: string };

// "work:the-lord-of-the-rings" gives "work the lord of the rings", so English
// names still match when the labels are in another language.
const slugWords = (slug: string) => slug.replace(/[:-]/g, " ");

const keys: FuseOptionKey<SearchableTag>[] = [
  { name: "label", weight: 3 },
  { name: "slugWords", weight: 1.5 },
  { name: "description", weight: 1 },
];

const options: IFuseOptions<SearchableTag> = {
  keys,
  threshold: 0.35,
  ignoreLocation: true,
  // Fold the text we search as well as the query. Every key is a string.
  getFn: (tag, path) => fold(String(Fuse.config.getFn(tag, path) ?? "")),
};

export const createTagSearch = (tags: Tag[]) => {
  const fuse = new Fuse(
    tags.map((tag) => ({ ...tag, slugWords: slugWords(tag.slug) })),
    options
  );
  return (query: string): Tag[] => fuse.search(fold(query.trim())).map((result) => result.item);
};
