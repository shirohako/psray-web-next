/**
 * Site-wide user preferences, persisted locally and shared across the app via
 * `useState`.
 *
 * Language preferences are mirrored to a cookie so SSR API requests and client
 * navigation use the same Accept-Language value. localStorage is retained as a
 * migration fallback for visitors who saved the preference before the cookie
 * was introduced. Visual preferences also use cookies so their first render is
 * stable across server and client.
 */

/** Trophy-language preference. When `enabled`, `primary` is required; `secondary` is optional. */
export interface TrophyLangPref {
  enabled: boolean
  /** Primary language code (implicit q=1.0). */
  primary: string
  /** Optional fallback language code (q=0.9); empty string when unset. */
  secondary: string
}

/** Which earn rate to surface as the headline figure on trophy lists. */
export type RateBasis = 'psn' | 'psray'

/** Row spacing presets shared by profile games and trophy lists. */
export type DisplayDensity = 'dense' | 'compact' | 'standard'

const STORAGE_KEY = 'prefs:trophy-lang'
const RATE_BASIS_KEY = 'prefs:rate-basis'
const PROFILE_GAME_DENSITY_KEY = 'prefs:profile-game-density'
const TROPHY_DENSITY_KEY = 'prefs:trophy-density'

function defaultTrophyLang(): TrophyLangPref {
  return { enabled: false, primary: '', secondary: '' }
}

function normalizeTrophyLang(value: unknown): TrophyLangPref {
  if (!value || typeof value !== 'object') return defaultTrophyLang()
  const stored = value as Partial<TrophyLangPref>
  const primary = typeof stored.primary === 'string' ? stored.primary : ''
  const secondary = typeof stored.secondary === 'string' ? stored.secondary : ''
  return stored.enabled === true && primary
    ? { enabled: true, primary, secondary: secondary === primary ? '' : secondary }
    : defaultTrophyLang()
}

function defaultRateBasis(): RateBasis {
  return 'psn'
}

function readDensity(key: string): DisplayDensity {
  const stored = useCookie<DisplayDensity>(key).value
  return stored === 'dense' || stored === 'standard'
    ? stored
    : 'compact'
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
  const trophyLangCookie = useCookie<TrophyLangPref | null>(STORAGE_KEY, {
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  })
  const trophyLang = useState<TrophyLangPref>(
    'prefs:trophyLang',
    () => normalizeTrophyLang(trophyLangCookie.value),
  )

  // Seeded from a cookie so SSR renders the chosen basis (it's shown on every
  // trophy row, so a client-only load would flash on hydration). `useState`
  // keeps it shared + reactive, so saving in the drawer updates the page live.
  const rateBasis = useState<RateBasis>('prefs:rateBasis', () => {
    const stored = useCookie<RateBasis>(RATE_BASIS_KEY).value
    return stored === 'psn' || stored === 'psray' ? stored : defaultRateBasis()
  })

  const profileGameDensity = useState<DisplayDensity>(
    'prefs:profileGameDensity',
    () => readDensity(PROFILE_GAME_DENSITY_KEY),
  )
  const trophyDensity = useState<DisplayDensity>(
    'prefs:trophyDensity',
    () => readDensity(TROPHY_DENSITY_KEY),
  )

  /**
   * Effective `Accept-Language` for API requests:
   * - the trophy-language preference when enabled — `primary` alone, or
   *   `primary,secondary;q=0.9` when a secondary is set,
   * - otherwise the user's browser languages, so a header is always sent.
   */
  const acceptLanguage = computed(() => {
    const { enabled, primary, secondary } = trophyLang.value
    if (enabled && primary) return toAcceptLanguage([primary, secondary])
    return browserAcceptLanguage()
  })

  /** Hydrate from the cookie, or migrate legacy localStorage. Returns true when SSR must be replayed. */
  function load() {
    if (!import.meta.client) return false
    if (trophyLangCookie.value != null) {
      trophyLang.value = normalizeTrophyLang(trophyLangCookie.value)
      return false
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        trophyLang.value = normalizeTrophyLang(JSON.parse(raw))
        trophyLangCookie.value = { ...trophyLang.value }
        // The page currently displayed was rendered before the server could
        // see this legacy preference. Ask the startup plugin for one reload so
        // its profile/trophy API calls are immediately rendered consistently.
        return true
      }
    } catch {
      // Corrupt/blocked storage — fall back to defaults.
    }
    return false
  }

  /** Commit a new trophy-language preference for both SSR and the browser. */
  function saveTrophyLang(pref: TrophyLangPref) {
    trophyLang.value = normalizeTrophyLang(pref)
    trophyLangCookie.value = { ...trophyLang.value }
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

  function saveDensity(kind: 'profileGame' | 'trophy', density: DisplayDensity) {
    const state = kind === 'profileGame' ? profileGameDensity : trophyDensity
    const key = kind === 'profileGame' ? PROFILE_GAME_DENSITY_KEY : TROPHY_DENSITY_KEY
    state.value = density
    useCookie<DisplayDensity>(key, {
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
    }).value = density
  }

  return {
    trophyLang,
    rateBasis,
    profileGameDensity,
    trophyDensity,
    acceptLanguage,
    load,
    saveTrophyLang,
    saveRateBasis,
    saveDensity,
  }
}
