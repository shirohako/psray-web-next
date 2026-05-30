/**
 * Trophies service — the trophy-set detail page (`/trophies/:id`).
 *
 * Mirrors the `profile.ts` pattern: typed shapes for `GET /trophies/:id` plus a
 * thin `useTrophies()` built on `useApi()`. The page itself renders server-side,
 * so its setup calls `useApiFetch<TrophySetDetail>('/trophies/:id')` directly.
 */

export type TrophyType = 'platinum' | 'gold' | 'silver' | 'bronze'

export type Rarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'VERY RARE' | 'ULTRA RARE'

/** Trophy tier counts. */
export interface DefinedTrophies {
  bronze: number
  silver: number
  gold: number
  platinum: number
}

/** A single language's translation of one trophy. */
export interface TrophyTranslation {
  trophyName: string
  trophyDetail: string
}

/** One trophy within a group. */
export interface Trophy {
  /** Database primary key (matches `viewer_progress.earned_trophies` ids). */
  id: number
  /** PSN in-group index (0-based). */
  trophy_id: number
  trophy_type: TrophyType
  trophy_name: string
  trophy_detail: string
  trophy_icon_url: string
  /** 0/1 — hidden on PSN until earned. */
  trophy_hidden: number
  /** PSN official earn rate, %. */
  trophy_earned_rate: number
  /** Site-wide earn rate, %. */
  psray_rate: number
  rarity: Rarity
  /** Number of community guides/tips. */
  tips: number
  /** Per-language translations keyed by language code; `null` when missing. */
  translations: Record<string, TrophyTranslation | null>
  /** Present only when the request carried a `psnid`. */
  earned_by_viewer?: boolean
}

/** A language that has translations for this group + how many trophies it covers. */
export interface AvailableLanguage {
  language_code: string
  trophy_count: number
}

/** Translated group title/intro. */
export interface GroupLocalization {
  localized_title: string
  group_detail: string
}

/** A trophy group (base game, or a DLC). */
export interface TrophyGroup {
  id: number
  /** PSN internal group id, e.g. `default`. */
  trophy_group_id: string
  trophy_title_name: string
  trophy_title_detail: string
  trophy_title_icon_url: string
  defined_trophies: DefinedTrophies
  available_languages: AvailableLanguage[]
  /** Group name/intro translations keyed by language code. */
  localizations: Record<string, GroupLocalization>
  trophies: Trophy[]
}

/** Title-level metadata + aggregate stats for the whole set. */
export interface TrophySetDetailInfo {
  id: number
  np_communication_id: string
  trophy_title_name: string
  trophy_title_detail: string
  trophy_title_icon_url: string
  trophy_title_platform: string
  defined_trophies: DefinedTrophies
  owners: number
  /** Average completion across owners, 0–100. */
  average_progress: number
  completed_players: number
  platinum_achievers: number
}

/** A recent player of this title. */
export interface RecentPlayer {
  psnid: string
  avatar_url: string
  country: string
  /** Completion percent, 0–100. */
  progress: number
  earned_platinum: number
  /** Unix seconds. */
  last_updated_at: number
}

/** The queried user's progress on this set (only when `psnid` was passed). */
export interface ViewerProgress {
  psnid: string
  avatar_url: string
  progress: number
  earned_bronze: number
  earned_silver: number
  earned_gold: number
  earned_platinum: number
  /** Unix seconds. */
  first_earned_at: number
  /** Unix seconds. */
  last_updated_at: number
  /** Database ids of earned trophies (compare against `Trophy.id`). */
  earned_trophies: number[]
}

/** Full payload of `GET /trophies/:id`. */
export interface TrophySetDetail {
  trophy_set: TrophySetDetailInfo
  groups: TrophyGroup[]
  recent_players: RecentPlayer[]
  viewer_progress: ViewerProgress | null
}

export function useTrophies() {
  const { get } = useApi()

  return {
    /** Trophy-set detail. Pass `psnid` to embed a user's progress. */
    find: (id: number | string, query?: { psnid?: string; lang?: string }) =>
      get<TrophySetDetail>(`/trophies/${id}`, { query }),
  }
}
