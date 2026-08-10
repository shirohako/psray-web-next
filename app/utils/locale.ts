import { DEFAULT_LOCALE, HTML_LANG, isUiLocale } from '#shared/locales'

/**
 * Locale access for the plain formatting helpers in `utils/`.
 *
 * `utils/profile.ts` and `utils/trophy.ts` are auto-imported functions called
 * from ~60 template sites; threading a locale argument through all of them
 * would be churn for no benefit. They call {@link currentLocale} / {@link tr}
 * instead.
 *
 * Both resolve through `useNuxtApp()`, so they stay request-scoped on the
 * server. Never hoist an `Intl.*` instance built from them to module scope —
 * that would leak one request's locale into the next.
 */

/**
 * The active UI locale, as a BCP-47 tag suitable for `Intl.*`.
 *
 * Safe to call during render on both server and client. Falls back to the
 * default locale outside a Nuxt context — e.g. in a unit test.
 */
export function currentLocale(): string {
  try {
    const locale = unref(useNuxtApp().$i18n.locale)
    return isUiLocale(locale) ? HTML_LANG[locale] : HTML_LANG[DEFAULT_LOCALE]
  }
  catch {
    return HTML_LANG[DEFAULT_LOCALE]
  }
}

/** `$t` for the plain helpers in `utils/`. Returns the key outside a Nuxt context. */
export function tr(key: string, named?: Record<string, unknown>): string {
  try {
    const { t } = useNuxtApp().$i18n
    return named ? t(key, named) : t(key)
  }
  catch {
    return key
  }
}

/** Join items the way the active language does, e.g. `A, B and C` / `A、B、C`. */
export function formatList(items: string[]): string {
  if (items.length === 0) return ''
  try {
    return new Intl.ListFormat(currentLocale(), { style: 'short', type: 'conjunction' })
      .format(items)
  }
  catch {
    return items.join(', ')
  }
}
