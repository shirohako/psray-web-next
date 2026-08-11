/**
 * The single source of truth for languages across the app.
 *
 * There are **two language axes**, they are not the same size, and they move
 * independently:
 *
 * 1. **UI locale** — the five languages the interface is translated into.
 *    Selected with the `?lang=` query param (Steam-style); the default (`ja`)
 *    is the bare URL with no param at all.
 * 2. **Trophy body language** — the ~25 languages PSN ships trophy text in.
 *    Selected with `?tlang=` on the trophy page, and defaulting to whatever
 *    the UI locale implies (see {@link PSN_LANG}).
 *
 * Separate params, because most PSN languages have no interface translation:
 * reading a set's French trophy names shouldn't drag a Chinese reader's whole
 * interface into Japanese. So `?tlang=fr-FR` swaps only the trophy text, and
 * `?lang=` stays in charge of the chrome.
 *
 * Both are visible to the server, so a rendered page stays a pure function of
 * (URL, cookie) — which is all indexing needs.
 *
 * Importable from `app/` and from Nitro alike via the `#shared` alias.
 */

export const UI_LOCALES = ['ja', 'zh-Hans', 'zh-Hant', 'en', 'ko'] as const

export type UiLocale = typeof UI_LOCALES[number]

/** Renders on the bare URL; `?lang=ja` is never written, only stripped. */
export const DEFAULT_LOCALE: UiLocale = 'ja'

/** Cookie remembering a manual switch. Read during SSR, so it can't desync hydration. */
export const LANG_COOKIE = 'psray_lang'

/** BCP-47 tag for `<html lang>` and `hreflang`. */
export const HTML_LANG: Record<UiLocale, string> = {
  'ja': 'ja-JP',
  'zh-Hans': 'zh-Hans',
  'zh-Hant': 'zh-Hant',
  'en': 'en-US',
  'ko': 'ko-KR',
}

/** `og:locale` wants `language_TERRITORY`, not a BCP-47 tag. */
export const OG_LOCALE: Record<UiLocale, string> = {
  'ja': 'ja_JP',
  'zh-Hans': 'zh_CN',
  'zh-Hant': 'zh_TW',
  'en': 'en_US',
  'ko': 'ko_KR',
}

/** UI locale → the PSN language code we ask the trophy API for by default. */
export const PSN_LANG: Record<UiLocale, string> = {
  'ja': 'ja-JP',
  'zh-Hans': 'zh-Hans',
  'zh-Hant': 'zh-Hant',
  'en': 'en-US',
  'ko': 'ko-KR',
}

/**
 * Incoming spellings that mean one of our UI locales. Keyed lowercase.
 * Collapsing these is what stops `/trophies/1?lang=ja-JP` and `/trophies/1`
 * being indexed as two copies of the same page.
 */
const ALIASES: Record<string, UiLocale> = {
  'ja': 'ja',
  'ja-jp': 'ja',
  'zh-hans': 'zh-Hans',
  'zh-cn': 'zh-Hans',
  'zh-sg': 'zh-Hans',
  'zh-hant': 'zh-Hant',
  'zh-tw': 'zh-Hant',
  'zh-hk': 'zh-Hant',
  'en': 'en',
  'en-us': 'en',
  'en-gb': 'en',
  'ko': 'ko',
  'ko-kr': 'ko',
}

/** A `?lang=` value can arrive as `string | string[] | undefined` from `route.query`. */
export type LangParam = string | (string | null)[] | null | undefined

const first = (raw: LangParam): string => {
  const value = Array.isArray(raw) ? raw[0] : raw
  return typeof value === 'string' ? value : ''
}

/**
 * Fold any `?lang=` value onto its canonical URL spelling.
 *
 * - Aliases of a UI locale collapse onto it (`ja-JP` → `ja`, `zh-CN` → `zh-Hans`).
 * - Any other well-formed language tag passes through as-is, preserving case —
 *   these are the ~20 PSN-only codes (`fr-FR`, `pt-BR`, `es-419`, …).
 * - Anything malformed returns `''`.
 */
export function canonicalLang(raw: LangParam): string {
  const value = first(raw)
  if (!value) return ''
  const alias = ALIASES[value.toLowerCase()]
  if (alias) return alias
  return /^[a-z]{2,3}(-[A-Za-z0-9]{2,4})?$/i.test(value) ? value : ''
}

/**
 * Validate a trophy-content language without folding it onto a UI locale.
 * API language codes are URL request values, so `en-US` must stay `en-US`
 * even though it corresponds to the English UI locale.
 */
export function canonicalContentLang(raw: LangParam): string {
  const value = first(raw)
  if (!value) return ''
  return /^[a-z]{2,3}(-[A-Za-z0-9]{2,4})?$/i.test(value) ? value : ''
}

/** Convert a PSN content language to a Google-supported hreflang value. */
export function contentHreflang(raw: LangParam): string {
  const code = canonicalContentLang(raw)
  if (!code) return ''
  // Google hreflang does not support the UN M49 `419` region.
  if (code.toLowerCase() === 'es-419') return 'es'
  return code
}

/**
 * Which of the five UI locales should render the chrome for this `?lang=` value,
 * or `''` when it names a language we have no interface for (callers then fall
 * back to the cookie, then {@link DEFAULT_LOCALE}).
 */
export function uiLocaleFor(raw: LangParam): UiLocale | '' {
  const code = canonicalLang(raw)
  return (UI_LOCALES as readonly string[]).includes(code) ? code as UiLocale : ''
}

/** Narrowing guard for values read back out of cookies, payloads, or the API. */
export function isUiLocale(value: unknown): value is UiLocale {
  return typeof value === 'string' && (UI_LOCALES as readonly string[]).includes(value)
}

/**
 * Resolve the UI locale from a request, in the project's fixed precedence:
 * `?lang=` → cookie → `ja`. Browser `Accept-Language` is deliberately *not*
 * consulted: a bare URL must render identically for every visitor and crawler.
 */
export function resolveUiLocale(langParam: LangParam, cookieValue: LangParam): UiLocale {
  return uiLocaleFor(langParam) || uiLocaleFor(cookieValue) || DEFAULT_LOCALE
}
