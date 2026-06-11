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
  trophy_group_id: number
  type: TrophyType
  np_communication_id: string
  psn_group_id: string
  /** PSN in-group index (0-based). */
  psn_trophy_id: number
  name: string
  detail: string
  icon_url: string
  is_hidden: boolean
  /** PSN official earn rate, %. */
  psn_earned_rate: number | string
  /** Site-wide earn rate, %. */
  psray_rate: number
  earned_count: number
  rarity: Rarity
  /** Number of community guides/tips. */
  tip_count: number
  /** Per-language translations keyed by language code; `null` when missing. */
  translations?: Record<string, TrophyTranslation | null>
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
  psn_group_id: string
  name: string
  detail: string
  icon_url: string
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
  version: string
  platform: string
  name: string
  detail: string
  icon_url: string
  has_trophy_groups: boolean
  np_service_name: string
  defined_trophies: DefinedTrophies
  default_language: string | null
  owners: number
  recent_players: number
  /** Average completion across owners, 0–100. */
  average_progress: number
  completed_players: number
  platinum_achievers: number
  favorite_count: number
  wishlist_count: number
  review_count: number
  game_id: number | null
  region: string | null
  created_at: string
  updated_at: string
}

/**
 * A regional / cross-platform variant of the current set — the same game
 * published as a separate store entry. Icon, name and trophy counts are
 * (almost) identical across variants; what actually differs is `platform`,
 * `region` and `owners`, so the UI surfaces only those.
 */
export interface SimilarTrophySet {
  id: number
  np_communication_id: string
  name: string
  platform: string
  icon_url: string
  defined_trophies: DefinedTrophies
  default_language: string | null
  region: string | null
  owners: number
}

/** A recent player of this title. */
export interface RecentPlayer {
  rank?: number
  psnid: string
  avatar_url: string
  country: string
  /** Completion percent, 0–100. */
  progress: number
  earned_platinum: number
  earned_gold?: number
  earned_silver?: number
  earned_bronze?: number
  first_earned_at?: number | string | null
  last_updated_at: number | string
  duration?: number | null
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
  first_earned_at: number | string
  last_updated_at: number | string
  /** Database ids of earned trophies (compare against `Trophy.id`). */
  earned_trophies: number[]
}

/** Full payload of `GET /trophies/:id`. */
export interface TrophySetDetail {
  trophy_set: TrophySetDetailInfo
  groups: TrophyGroup[]
  recent_players: RecentPlayer[]
  similar_trophy_sets?: SimilarTrophySet[]
  viewer_progress: ViewerProgress | null
}

/** Player-ranking modes for `GET /trophies/:id/players`. */
export type PlayerRankType = 'recent' | 'progress' | 'speedrun'

/** A ranked player row from `GET /trophies/:id/players`. */
export interface PlayerRanking {
  rank: number
  psnid: string
  avatar_url: string
  country: string
  /** Completion percent, 0–100. */
  progress: number
  earned_platinum: number
  earned_gold: number
  earned_silver: number
  earned_bronze: number
  first_earned_at: number | string | null
  last_earned_at: number | string | null
  /** Completion time in seconds (last − first earned); `null` when unfinished. */
  duration: number | null
}

export interface PlayersMeta {
  page: number
  per_page: number
  total: number
  total_pages: number
}

/** A player who recently earned a specific trophy (`GET /trophies/trophy/:id/players`). */
export interface TrophyPlayer {
  psnid: string
  avatar_url: string
  country: string
  /** Unix seconds — when this player earned the trophy. */
  earned_at: number
}

/** Content format of a tip's body. */
export type TipContentType = 'html' | 'markdown'

/** Tip author — a subset of the full profile the tips endpoint embeds. */
export interface TipUser {
  id: number
  psnid: string
  country: string
  avatar_url: string
  /** PS Plus flag (0/1). */
  plus: number
  trophy_level: number
}

/** A community tip/guide for a trophy (`GET /trophies/trophy/:id/tips`). */
export interface TrophyTip {
  id: number
  trophy_id: number
  user_id: number
  /** BCP-47 language tag the tip was written in. */
  language: string
  /** 0/1 — content contains spoilers. */
  spoiler: number
  vote_up: number
  vote_down: number
  /** Raw HTML or Markdown source, per `content_type`. */
  content: string
  content_type: TipContentType
  /** Comma-separated tag list, e.g. `"guide,boss"`. */
  tags: string
  /** Unix seconds. */
  created_at: number
  /** Unix seconds. */
  updated_at: number
  user: TipUser
}

export function useTrophies() {
  const { get, raw } = useApi()

  return {
    /** Trophy-set detail. Pass `psnid` to embed a user's progress. */
    find: (id: number | string, query?: { psnid?: string; lang?: string }) =>
      get<TrophySetDetail>(`/trophies/${id}`, { query }),

    /** Ranked players for a set (paginated — returns the `{ data, meta }` envelope). */
    players: (id: number | string, query?: { type?: PlayerRankType; page?: number }) =>
      raw.get<PlayerRanking[], PlayersMeta>(`/trophies/${id}/players`, { query }),

    /**
     * Players who recently earned a single trophy (returns the `{ data, meta }` envelope).
     * `order`: `desc` = most recent first (default), `asc` = earliest first.
     */
    trophyPlayers: (trophyId: number | string, query?: { page?: number; order?: 'desc' | 'asc' }) =>
      raw.get<TrophyPlayer[], PlayersMeta>(`/trophies/trophy/${trophyId}/players`, { query }),

    /** Community tips/guides for a single trophy (returns the `{ data, meta }` envelope). */
    trophyTips: (trophyId: number | string, query?: { page?: number }) =>
      raw.get<TrophyTip[], PlayersMeta>(`/trophies/trophy/${trophyId}/tips`, { query }),
  }
}
