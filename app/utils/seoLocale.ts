import {
  DEFAULT_LOCALE,
  OG_LOCALE,
  UI_LOCALES,
  canonicalLang,
  type UiLocale,
} from '#shared/locales'

export interface SeoLocalePolicy {
  canonicalLang: string
  ogLocale: string
  uiAlternates: UiLocale[]
}

/** Pure locale policy shared by the Nuxt head composable and unit tests. */
export function resolveSeoLocalePolicy(
  staticLocale: UiLocale | undefined,
  requestedCanonicalLang: string | undefined,
  activeLocale: UiLocale,
): SeoLocalePolicy {
  if (staticLocale) {
    return {
      canonicalLang: DEFAULT_LOCALE,
      ogLocale: OG_LOCALE[staticLocale],
      uiAlternates: [],
    }
  }

  return {
    canonicalLang: canonicalLang(requestedCanonicalLang) || activeLocale,
    ogLocale: OG_LOCALE[activeLocale],
    uiAlternates: [...UI_LOCALES],
  }
}
