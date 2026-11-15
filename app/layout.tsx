import type { Metadata } from "next";
import { Baloo_2, Fredoka, Nunito } from "next/font/google";
import type { ReactNode } from "react";
import { I18nProvider } from "@/components/I18nProvider";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { createT } from "@/lib/i18n";
import { loadMessages } from "@/lib/messages";
import { getRequestLanguage } from "@/lib/request-language";
import "./globals.css";

// Fredoka is the rounded display face, but it has no Cyrillic or Devanagari.
// The browser falls back glyph by glyph: Nunito covers Russian and Baloo 2
// covers Hindi, both rounded enough to match.
const fredoka = Fredoka({ subsets: ["latin", "latin-ext"], variable: "--font-display" });
const nunito = Nunito({ subsets: ["latin", "latin-ext", "cyrillic"], variable: "--font-body" });
const baloo = Baloo_2({ subsets: ["latin", "devanagari"], variable: "--font-devanagari" });

export async function generateMetadata(): Promise<Metadata> {
  const language = await getRequestLanguage();
  const t = createT(language, await loadMessages(language));
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const language = await getRequestLanguage();
  const messages = await loadMessages(language);
  const t = createT(language, messages);

  return (
    <html lang={language} className={`${fredoka.variable} ${nunito.variable} ${baloo.variable}`}>
      <body>
        <I18nProvider language={language} messages={messages}>
          <header className="masthead">
            <a className="masthead__title" href="/">
              <span className="masthead__badge" aria-hidden="true">
                ?
              </span>
              {t("title")}
            </a>
            <LanguageSwitcher />
          </header>
          <main className="stage">{children}</main>
          <footer className="footer">
            <a href="https://the-trivia-api.com">{t("poweredBy")}</a>
          </footer>
        </I18nProvider>
      </body>
    </html>
  );
}
