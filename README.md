# Multilingual Quiz

A game show style quiz built with Next.js and [The Trivia API](https://the-trivia-api.com). Players search for a topic in their own language, pick one and answer ten multiple choice questions in that language. The whole app, from the buttons to the questions, works in the nine languages the API supports: English, Spanish, Dutch, Hindi, Turkish, French, German, Russian and Portuguese.

**[Try the live demo](https://DEMO_URL_PLACEHOLDER)**

The [multilingual quiz tutorial](https://the-trivia-api.com/docs/tutorials/multilingual-quiz) walks through how it works.

## Running it

You'll need Node 20.19 or later, and an API key with a Complete subscription, which you need for questions in languages other than English.

```sh
cp .env.example .env.local   # then put your key in it
npm install
npm run dev
```

Then open http://localhost:3000.

Other scripts:

- `npm run build` builds the app, then `npm start` serves the build
- `npm run typecheck` runs `tsc`

## Environment

| Variable         | What it is                                                    |
| ---------------- | ------------------------------------------------------------- |
| `TRIVIA_API_KEY` | Your Trivia API key. Only the server reads it, never the browser. |

## How it works

### Choosing the language

The server picks the language before it renders anything, so the first paint is already in the right language. [`lib/languages.ts`](lib/languages.ts) checks the `quiz-language` cookie first. Without one, it takes the browser's most preferred `Accept-Language` entry that the API supports (`de-CH` counts as `de`), and falls back to English.

The language switcher calls a server action ([`app/actions.ts`](app/actions.ts)) that sets the cookie, and Next.js renders the page again in the new language. It writes the same value to `localStorage` too, for any client code that wants it. The cookie is what counts, because the server can't read `localStorage`.

### Interface text

Each language has a JSON file in [`messages/`](messages) with about 40 strings. [`lib/i18n.ts`](lib/i18n.ts) is a tiny `t()` that fills in `{placeholders}` and picks plural forms with `Intl.PluralRules`, so Russian gets "3 вопроса" and "5 вопросов". The server only sends the browser the file for the current language.

### Searching tags

The home page fetches the tag registry on the server (`GET /v2/tag-registry?language=fr`), in the player's language, and hands the tags to [`components/TagSearch.tsx`](components/TagSearch.tsx). The registry is loaded every time rather than copied into the code, because tags and their counts change.

[`lib/search.ts`](lib/search.ts) searches with [Fuse.js](https://www.fusejs.io), so typos still match. It looks at the label, the description and the words in the slug (`work:the-lord-of-the-rings`), and folds accents on both sides, so `geographie` finds "Géographie". Each tag shows its question count. Tags with a count of 0 are greyed out and can't be picked.

### Playing

Picking a tag opens `/play?tag=<slug>`. [`app/play/page.tsx`](app/play/page.tsx) asks the API for ten questions on the server, with the key in the `X-API-Key` header:

```
GET /v2/questions?limit=10&types=text_choice&tags=place:france&language=fr
```

English is the default, so `language` is only sent for the other eight. The answers are shuffled on the server, and [`components/Quiz.tsx`](components/Quiz.tsx) runs the game: one question at a time, a streak counter, confetti for right answers and a results screen. "Play again" asks the server for a new set on the same tag.

A tag's count covers every language, so a tag can have fewer translated questions than its count. If fewer than ten come back, the round is just shorter. If the API fails, the player sees a message in their language with a button to try again.

### Styling

Plain CSS in [`app/globals.css`](app/globals.css). The colours and shadows are custom properties at the top. Fredoka is the display font, with Nunito for Cyrillic and Baloo 2 for Devanagari, all loaded with `next/font`. Animations and confetti are switched off for players who prefer reduced motion.

## Licence

MIT
