/**
 * Site-wide user preferences, persisted to `localStorage` (client only) and
 * shared across the app via `useState`.
 *
 * Currently just the trophy-language preference: when enabled, the user picks a
 * primary + secondary language, and every API request carries a browser-style
 * `Accept-Language` header (`primary,secondary;q=0.9`) so the backend best-
 * matches trophy text to them. See the `$api` plugin + the settings drawer.
 */

/** Trophy-language preference. When `enabled`, both codes are required. */
export interface TrophyLangPref {
  enabled: boolean
  /** Primary language code (implicit q=1.0). */
  primary: string
  /** Fallback language code (q=0.9). */
  secondary: string
}

const STORAGE_KEY = 'prefs:trophy-lang'

function defaultTrophyLang(): TrophyLangPref {
  return { enabled: false, primary: '', secondary: '' }
}

export function usePreferences() {
  const trophyLang = useState<TrophyLangPref>('prefs:trophyLang', defaultTrophyLang)

  /**
   * Browser-style `Accept-Language` value for the current preference, or `''`
   * when disabled / incomplete. Two languages → `primary,secondary;q=0.9`.
   */
  const acceptLanguage = computed(() => {
    const { enabled, primary, secondary } = trophyLang.value
    if (!enabled || !primary || !secondary) return ''
    return `${primary},${secondary};q=0.9`
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

  return { trophyLang, acceptLanguage, load, saveTrophyLang }
}
