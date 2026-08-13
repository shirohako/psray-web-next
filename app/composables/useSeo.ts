import {
  DEFAULT_LOCALE,
  OG_LOCALE,
  UI_LOCALES,
  canonicalContentLang,
  canonicalLang,
  contentHreflang,
  isUiLocale,
  type UiLocale,
} from '#shared/locales'
import { resolveSeoLocalePolicy } from '~/utils/seoLocale'

/**
 * Per-page SEO head: title, description, Open Graph, Twitter card, canonical,
 * and `hreflang` alternates — from one call.
 *
 * The i18n module can't supply the alternates itself: under the `no_prefix`
 * strategy its `useLocaleHead()` emits none, and a trophy set's alternate set
 * is dynamic anyway (whatever PSN languages that particular set ships in).
 *
 * ## The URL contract
 *
 * Two params may appear in a canonical URL, and only these two:
 *
 * - **`?lang=`** — the interface language, one of the five UI locales. `ja`,
 *   the default, is spelled as *no param at all*.
 * - **`?tlang=`** — the body-content language, where a page has content in
 *   languages the interface isn't translated into (the trophy page, whose sets
 *   ship in up to 25 PSN languages). Omitted whenever the body is already in
 *   whatever the interface language implies.
 *
 * Keeping them separate is what lets a reader switch trophy text to French
 * without losing their Chinese interface. For indexing it means each
 * `hreflang` still maps to exactly one URL: the five UI locales are advertised
 * as `?lang=`, and any remaining content-only language as `?tlang=` at the
 * default interface language — no `lang × tlang` matrix is ever advertised.
 *
 * Any other param (`psnid`, `page`, …) is dropped from the canonical unless
 * named in `keepQuery`, so personalised permutations collapse onto the shared
 * public page.
 */

/** A value, or a getter for one — so callers can hang SEO off pending async data. */
type Source<T> = T | (() => T)
type SeoImageType = 'image/jpeg' | 'image/gif' | 'image/png' | 'image/webp' | 'image/avif'

const read = <T>(source: Source<T> | undefined): T | undefined =>
  typeof source === 'function' ? (source as () => T)() : source

function withSiteTitle(title: string, siteNameFirst = false): string {
  const pageTitle = title.replace(/\s*[|｜]\s*PSRay\s*$/i, '').trim()
  if (pageTitle === 'PSRay') return pageTitle
  return siteNameFirst ? `PSRay | ${pageTitle}` : `${pageTitle} | PSRay`
}

export interface SeoInput {
  title: Source<string>
  /** Places the site name before the page title. Reserved for the homepage. */
  siteNameFirst?: boolean
  /** Canonical pathname. Defaults to the current route path. */
  canonicalPath?: Source<string>
  description?: Source<string>
  /** Absolute image URL for `og:image` / `twitter:image`. */
  image?: Source<string | undefined>
  /** Accessible description for the social preview image. */
  imageAlt?: Source<string | undefined>
  /** Intrinsic social preview dimensions, when known. */
  imageWidth?: Source<number | undefined>
  imageHeight?: Source<number | undefined>
  /** MIME type for the social preview image, such as `image/png`. */
  imageType?: Source<SeoImageType | undefined>
  /** `lang` value for the canonical URL. Defaults to the active UI locale. */
  canonicalLang?: Source<string>
  /**
   * Body-content language to spell out as `?tlang=` in the canonical — pass it
   * only when the content isn't in whatever the interface language implies,
   * and pass what was *actually served* rather than what was requested, so a
   * language the API fell back on canonicalizes to the real one. Empty for the
   * common case where interface and content agree.
   */
  contentLang?: Source<string>
  /**
   * Every content language this page exists in, advertised as `?tlang=`
   * alternates — the trophy page passes the set's `available_languages` so each
   * PSN translation is discoverable. Entries that are already UI locales are
   * skipped: those are advertised as `?lang=` instead.
   */
  altContentLangs?: Source<string[]>
  /** Query params to preserve in the canonical besides `lang`. Default: none. */
  keepQuery?: string[]
  noindex?: Source<boolean>
  /**
   * Marks a page as having one fixed UI-language edition. Its canonical URL
   * never carries `?lang=`, no translated hreflang alternates are emitted,
   * and Open Graph uses this locale regardless of the surrounding UI chrome.
   */
  staticLocale?: UiLocale
}

export function useSeo(input: SeoInput) {
  const route = useRoute()
  const { locale } = useI18n()
  const siteUrl = useRuntimeConfig().public.siteUrl.replace(/\/+$/, '')

  /**
   * Absolute URL for this page in `lang`, optionally with its body in
   * `contentLang`. Params are appended in a fixed order so the same state
   * always spells the same URL.
   */
  const urlFor = (lang: string, contentLang = '') => {
    const params = new URLSearchParams()
    for (const key of input.keepQuery ?? []) {
      const value = route.query[key]
      if (typeof value === 'string' && value) params.set(key, value)
    }
    if (lang && lang !== DEFAULT_LOCALE) params.set('lang', lang)
    if (contentLang) params.set('tlang', contentLang)
    const search = params.toString()
    const path = read(input.canonicalPath) || route.path
    return `${siteUrl}${path}${search ? `?${search}` : ''}`
  }

  const activeLocale = computed<UiLocale>(() =>
    isUiLocale(locale.value) ? locale.value : DEFAULT_LOCALE)

  const localePolicy = computed(() => resolveSeoLocalePolicy(
    input.staticLocale,
    read(input.canonicalLang),
    activeLocale.value,
  ))

  const currentLang = computed(() => localePolicy.value.canonicalLang)
  const title = computed(() => withSiteTitle(read(input.title)!, input.siteNameFirst))

  const canonical = computed(() =>
    input.staticLocale
      ? urlFor(DEFAULT_LOCALE)
      : urlFor(currentLang.value, canonicalContentLang(read(input.contentLang))))

  const alternates = computed(() => {
    if (input.staticLocale) return []

    const links = [
      { rel: 'alternate' as const, hreflang: 'x-default', href: urlFor(DEFAULT_LOCALE) },
      ...localePolicy.value.uiAlternates.map(code => ({
        rel: 'alternate' as const,
        hreflang: code,
        href: urlFor(code),
      })),
    ]

    // Languages we have content in but no interface for: advertised at the
    // default interface language with only the body swapped.
    const seen = new Set<string>(UI_LOCALES)
    for (const code of read(input.altContentLangs) ?? []) {
      const contentCode = canonicalContentLang(code)
      const hreflang = contentHreflang(code)
      const uiEquivalent = canonicalLang(code)
      if (!contentCode || !hreflang || seen.has(hreflang) || seen.has(uiEquivalent)) continue
      seen.add(hreflang)
      links.push({
        rel: 'alternate' as const,
        hreflang,
        href: urlFor(DEFAULT_LOCALE, contentCode),
      })
    }

    return links
  })

  useSeoMeta({
    title: () => title.value,
    description: () => read(input.description),
    ogType: 'website',
    ogSiteName: 'PSRay',
    ogTitle: () => title.value,
    ogDescription: () => read(input.description),
    ogImage: () => read(input.image),
    ogImageAlt: () => read(input.imageAlt),
    ogImageWidth: () => read(input.imageWidth),
    ogImageHeight: () => read(input.imageHeight),
    ogImageType: () => read(input.imageType),
    ogUrl: () => canonical.value,
    ogLocale: () => localePolicy.value.ogLocale,
    ogLocaleAlternate: () => input.staticLocale
      ? undefined
      : UI_LOCALES.filter(code => code !== activeLocale.value).map(code => OG_LOCALE[code]),
    twitterCard: () => (read(input.image) ? 'summary_large_image' : 'summary'),
    twitterSite: '@shionari_',
    twitterCreator: '@shionari_',
    twitterTitle: () => title.value,
    twitterDescription: () => read(input.description),
    twitterImage: () => read(input.image),
    twitterImageAlt: () => read(input.imageAlt),
    twitterImageWidth: () => read(input.imageWidth),
    twitterImageHeight: () => read(input.imageHeight),
    // `follow` even when noindex: these pages still link on to indexable ones.
    robots: () => (read(input.noindex) ? 'noindex, follow' : undefined),
  })

  useHead(() => ({
    link: [{ rel: 'canonical', href: canonical.value }, ...alternates.value],
  }))
}
