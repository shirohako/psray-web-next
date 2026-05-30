/**
 * Profile service — the public PSN profile page (`/p/:psnid`).
 *
 * Mirrors the `users.ts` pattern: a typed `Profile` shape plus thin methods
 * built on `useApi()`. For the page itself we render server-side, so the page
 * setup calls `useApiFetch<Profile>('/profile/:psnid')` directly.
 */

import type { Rarity, TrophyType } from '~/services/trophies'

/** A PSN trophy profile as returned by `GET /profile/:psnid`. */
export interface Profile {
  id: number
  psnid: string
  account_id: string
  status: number
  country: string
  language: string[]
  avatar_url: string
  about_me: string
  /** PS Plus flag (0/1). */
  plus: number

  games_played: number
  completed_games: number
  abandoned_games: number

  trophy_level: number
  /** Progress toward the next trophy level, 0–100. */
  progress: number
  platinum: number
  gold: number
  silver: number
  bronze: number
  points: number

  rank: number | null
  server_rank: number | null

  favorite_games: number
  game_reviews: number
  followers: number
  following: number

  /** Unix seconds. */
  first_trophy_at: number | null
  /** Unix seconds. */
  last_trophy_at: number | null

  is_profile_public: boolean
  is_rankable: boolean
  is_banned: boolean

  star_piece: number
  rare_candy: number
  mira: number
  philosophers_stone: number
  trophy_tip: number
  admin_level: number
  page_views: number

  sync_interval: number
  /** Unix seconds. */
  sync_next_at: number | null
  /** Unix seconds. */
  joined_at: number | null

  used_space: number
  total_space: number
  /** Unix seconds. */
  updated_at: number | null

  is_following: boolean
  is_follower: boolean

  milestones: unknown | null
  calendar?: CalendarDay[] | null
  social_account: unknown | null
}

/** Trophy activity for one calendar day. */
export interface CalendarDay {
  /** Local calendar date in `YYYY-MM-DD` format. */
  date: string
  count: number
}

/** One trophy-count or platinum-count milestone. */
export interface ProfileMilestone {
  type: 'trophy' | 'platinum'
  /** Milestone number, returned as a numeric string by the API. */
  index: string
  trophy_set_id: number
  trophy_id: number
  /** Unix seconds. */
  earned_at: number
  trophyName: string
  trophyIconUrl: string
  trophySetName: string
}

/** Trophy tier counts. */
export interface TrophyCounts {
  bronze: number
  silver: number
  gold: number
  platinum: number
}

/** A game's trophy set (title metadata + aggregate stats). */
export interface TrophySet {
  id: number
  np_communication_id: string
  trophy_set_version: string
  /** e.g. `PS5` | `PS4` | `PS3` | `PSVITA`. */
  trophy_title_platform: string
  trophy_title_name: string
  trophy_title_detail: string
  trophy_title_icon_url: string
  has_trophy_groups: number
  np_service_name: string
  defined_trophies: TrophyCounts
}

/** One of a user's played titles, as returned by `recently-played`. */
export interface PlayedTrophySet {
  id: number
  user_id: number
  trophy_set_id: number
  /** Completion percent, 0–100. */
  progress: number
  earned_bronze: number
  earned_silver: number
  earned_gold: number
  earned_platinum: number
  gap: number
  hidden_flag: number
  /** Unix seconds. */
  first_earned_at: number | null
  /** Unix seconds. */
  last_updated_at: number | null
  trophy_set: TrophySet
}

/**
 * One trophy the user has earned, as returned by `recent-trophies`. The nested
 * `trophy` carries enough metadata to render a row (it omits the per-language
 * translations the trophy-set page would need).
 */
export interface RecentTrophy {
  id: number
  trophy_set_id: number
  trophy_id: number
  /** Unix seconds. */
  earned_at: number
  trophy: {
    id: number
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
  }
}

export function useProfiles() {
  const { get, raw } = useApi()

  return {
    find: (psnid: string) => get<Profile>(`/profile/${psnid}`),

    /** Recently played titles (paginated — returns the `{ data, meta }` envelope). */
    recentlyPlayed: (psnid: string, query?: Record<string, unknown>) =>
      raw.get<PlayedTrophySet[]>(`/profile/${psnid}/recently-played`, { query }),

    /** Recently earned trophies (paginated — returns the `{ data, meta }` envelope). */
    recentTrophies: (psnid: string, query?: Record<string, unknown>) =>
      raw.get<RecentTrophy[]>(`/profile/${psnid}/recent-trophies`, { query }),

    milestones: (psnid: string) =>
      get<ProfileMilestone[]>(`/profile/${psnid}/milestones`),
  }
}
