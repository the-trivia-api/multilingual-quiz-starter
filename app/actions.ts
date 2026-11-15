"use server";

import { cookies } from "next/headers";
import { isLanguage, LANGUAGE_COOKIE } from "@/lib/languages";

const ONE_YEAR = 60 * 60 * 24 * 365;

/**
 * Stores the player's language in a cookie, so the server renders the next
 * page in it straight away. Setting a cookie in a server action makes Next.js
 * render the current page again, in the new language.
 */
export async function setLanguage(language: string) {
  if (!isLanguage(language)) return;
  const cookieStore = await cookies();
  cookieStore.set(LANGUAGE_COOKIE, language, { path: "/", maxAge: ONE_YEAR, sameSite: "lax" });
}
