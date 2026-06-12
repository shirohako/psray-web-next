/**
 * Profile service — the public PSN profile page (`/p/:psnid`).
 *
 * Mirrors the `users.ts` pattern: a typed `Profile` shape plus thin methods
 * built on `useApi()`. For the page itself we render server-side, so the page
 * setup calls `useApiFetch<Profile>('/profile/:psnid')` directly.
 */

import type { Rarity, TrophyType } from '~/services/trophies'

export type ApiDate = number | string

/** A PSN trophy profile as returned by `GET /profile/:psnid`. */
export interface Profile {
  id: number
  role: string
  psnid: string
  account_id: string
  status: number
  country: string
  language: string[]
  avatar_url: string
  about_me: string
  is_plus: boolean

  played_game_count: number
  completed_game_count: number
  abandoned_game_count: number

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

  favorite_game_count: number
  review_count: number
  follower_count: number
  following_count: number

  first_trophy_at: ApiDate | null
  last_trophy_at: ApiDate | null

  is_profile_public: boolean
  is_rankable: boolean

  star_piece: number
  rare_candy: number
  mira: number
  philosophers_stone: number
  tip_count: number
  tip_vote_count: number
  page_view_count: number

  sync_interval: number
  sync_next_at: ApiDate | null
  registered_at: ApiDate | null

  used_space: number
  total_space: number
  created_at: ApiDate | null
  updated_at: ApiDate | null

  /** Whether the current viewer can follow this profile (logged in & not self). */
  can_follow: boolean
  /** Whether the current viewer is following this profile. */
  is_following: boolean
  /** Whether this profile follows the current viewer. */
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
  version: string
  /** e.g. `['PS5']` or `['PS4', 'PS5']`. */
  platform: string[]
  name: string
  detail: string
  icon_url: string
  has_trophy_groups: boolean
  np_service_name: string
  /** Trophy-set region, a two-letter code, e.g. `HK` | `JP` | `EU`. */
  region: string | null
  defined_trophies: TrophyCounts
  default_language: string | null
  owners: number
  recent_players: number
  average_progress: number
  completed_players: number
  platinum_achievers: number
  favorite_count: number
  wishlist_count: number
  review_count: number
  game_id: number | null
  created_at: ApiDate | null
  updated_at: ApiDate | null
  /** Best-matched language for the current viewer/request. */
  display_language?: string | null
  /** Trophy-set title translated to `display_language`; falls back to `name`. */
  localized_name?: string | null
  /** Present in recently-played responses, currently not displayed. */
  available_languages?: TrophySetAvailableLanguage[]
}

/** One available title translation from `recently-played`. */
export interface TrophySetAvailableLanguage {
  language_code: string
  is_default: boolean
  source: string
  name: string
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
  duration: number | null
  is_hidden: boolean
  first_earned_at: ApiDate | null
  last_earned_at: ApiDate | null
  trophy_set: TrophySet
}

/**
 * One trophy the user has earned, as returned by `recent-trophies`. The nested
 * `trophy` carries enough metadata to render a row (it omits the per-language
 * translations the trophy-set page would need).
 */
export interface RecentTrophy {
  user_id: number
  trophy_set_id: number
  trophy_id: number
  earned_at: ApiDate
  trophy: {
    id: number
    trophy_group_id: number
    type: TrophyType
    np_communication_id: string
    psn_group_id: string
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
    tip_count: number
  }
}

/** Response of the follow/unfollow endpoints. */
export interface FollowResult {
  following: boolean
}

export function useProfiles() {
  const { get, post, delete: del, raw } = useApi()

  return {
    find: (psnid: string) => get<Profile>(`/profile/${psnid}`),

    /** Follow a user. Idempotent — re-following an already-followed user succeeds. */
    follow: (psnid: string) => post<FollowResult>(`/user/following/${psnid}`),

    /** Unfollow a user. Idempotent — unfollowing a non-followed user succeeds. */
    unfollow: (psnid: string) => del<FollowResult>(`/user/following/${psnid}`),

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
