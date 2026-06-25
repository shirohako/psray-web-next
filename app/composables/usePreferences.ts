/**
 * Site-wide user preferences, persisted to `localStorage` (client only) and
 * shared across the app via `useState`.
 *
 * Currently just the trophy-language preference: when enabled, the user picks a
 * primary + secondary language, and every API request carries a browser-style
 * `Accept-Language` header (`primary,secondary;q=0.9`) so the backend best-
 * matches trophy text to them. When it's off, we fall back to the user's own
 * browser languages, so requests always carry an `Accept-Language`. See the
 * `$api` plugin + the settings drawer.
 */

/** Trophy-language preference. When `enabled`, both codes are required. */
export interface TrophyLangPref {
  enabled: boolean
  /** Primary language code (implicit q=1.0). */
  primary: string
  /** Fallback language code (q=0.9). */
  secondary: string
}

/** Which earn rate to surface as the headline figure on trophy lists. */
export type RateBasis = 'psn' | 'psray'

const STORAGE_KEY = 'prefs:trophy-lang'
const RATE_BASIS_KEY = 'prefs:rate-basis'

function defaultTrophyLang(): TrophyLangPref {
  return { enabled: false, primary: '', secondary: '' }
}

function defaultRateBasis(): RateBasis {
  return 'psn'
}

/** Build a browser-style Accept-Language value from an ordered language list. */
function toAcceptLanguage(langs: readonly string[]): string {
  const unique = [...new Set(langs.filter(Boolean))]
  return unique
    .map((lang, i) => (i === 0 ? lang : `${lang};q=${Math.max(0.1, (10 - i) / 10)}`))
    .join(',')
}

/**
 * The user's own language preference, independent of our setting: from
 * `navigator.languages` on the client, or the incoming page request's
 * `Accept-Language` during SSR.
 */
function browserAcceptLanguage(): string {
  if (import.meta.client) {
    const langs = navigator.languages?.length
      ? navigator.languages
      : navigator.language
        ? [navigator.language]
        : []
    return toAcceptLanguage(langs)
  }
  return useRequestHeaders(['accept-language'])['accept-language'] ?? ''
}

export function usePreferences() {
  const trophyLang = useState<TrophyLangPref>('prefs:trophyLang', defaultTrophyLang)

  // Seeded from a cookie so SSR renders the chosen basis (it's shown on every
  // trophy row, so a client-only load would flash on hydration). `useState`
  // keeps it shared + reactive, so saving in the drawer updates the page live.
  const rateBasis = useState<RateBasis>('prefs:rateBasis', () => {
    const stored = useCookie<RateBasis>(RATE_BASIS_KEY).value
    return stored === 'psn' || stored === 'psray' ? stored : defaultRateBasis()
  })

  /**
   * Effective `Accept-Language` for API requests:
   * - the trophy-language preference (`primary,secondary;q=0.9`) when enabled,
   * - otherwise the user's browser languages, so a header is always sent.
   */
  const acceptLanguage = computed(() => {
    const { enabled, primary, secondary } = trophyLang.value
    if (enabled && primary && secondary) return `${primary},${secondary};q=0.9`
    return browserAcceptLanguage()
  })

  /** Hydrate state from localStorage (call once on the client at startup). */
  function load() {
    if (!import.meta.client) return
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) trophyLang.value = { ...defaultTrophyLang(), ...JSON.parse(raw) }
    } catch {
      // Corrupt/blocked storage — fall back to defaults.
    }
  }

  /** Commit a new trophy-language preference to state + localStorage. */
  function saveTrophyLang(pref: TrophyLangPref) {
    trophyLang.value = { ...pref }
    if (import.meta.client) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(trophyLang.value))
      } catch {
        // Ignore storage failures (private mode, quota, …).
      }
    }
  }

  /** Commit the earn-rate basis to shared state + its persisting cookie. */
  function saveRateBasis(basis: RateBasis) {
    rateBasis.value = basis
    useCookie<RateBasis>(RATE_BASIS_KEY, {
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
    }).value = basis
  }

  return { trophyLang, rateBasis, acceptLanguage, load, saveTrophyLang, saveRateBasis }
}
