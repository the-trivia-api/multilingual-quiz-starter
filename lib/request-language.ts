import "server-only";
import { cookies, headers } from "next/headers";
import { LANGUAGE_COOKIE, pickLanguage } from "./languages";

/** The language for this request, read on the server so the first paint is right. */
export const getRequestLanguage = async () => {
  const [cookieStore, headerList] = await Promise.all([cookies(), headers()]);
  return pickLanguage(cookieStore.get(LANGUAGE_COOKIE)?.value, headerList.get("accept-language"));
};
