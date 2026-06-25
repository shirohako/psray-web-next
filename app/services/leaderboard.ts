/**
 * Leaderboard service — the raw HTTP calls for each ranking board under
 * `/leaderboard/*`. Boards differ in endpoint, params and returned fields, so
 * this file only owns the typed shapes + thin fetchers; which board is shown
 * and which columns it renders is decided in `useRankingBoards()`.
 *
 * Every board returns the paginated `{ data, meta }` envelope, so methods use
 * `raw.get`.
 */

/** Fields every leaderboard row shares (identity + trophy tiers). */
export interface LeaderboardRowBase {
  rank: number
  user_id: number
  psnid: string
  avatar_url: string
  country: string
  trophy_level: number
  platinum: number
  gold: number
  silver: number
  bronze: number
}

/**
 * The row type the table consumes. Metric fields are optional because each
 * board only returns its own — the points boards send `points` (+ trophy
 * tiers), while the tips board sends `tip_count` / `tip_vote_count` and omits the
 * trophy fields. Add new metric fields here as boards are introduced.
 */
export interface LeaderboardRow extends LeaderboardRowBase {
  points?: number
  /** Number of trophy tips the user has contributed. */
  tip_count?: number
  /** Total up-votes those tips received. */
  tip_vote_count?: number
  /** Legacy alias for total up-votes. */
  tip_vote_up?: number
  /** Aggregate contribution score (the contribution board's primary metric). */
  contribution_points?: number
}

/** Pagination plus an echo of the request flags. */
export interface LeaderboardMeta {
  registered_only?: boolean
  page: number
  per_page: number
  total: number
  total_pages: number
}

/** Query shared by boards that support these filters. */
export interface LeaderboardQuery {
  page?: number
  /** Restrict to registered users only (Laravel-truthy; sent as `1`). */
  registered_only?: boolean
}

// Map our flags onto the query the API expects. `registered_only` is only sent
// when true, keeping the URL clean for the default (all users).
function toQuery(q?: LeaderboardQuery) {
  return {
    page: q?.page,
    registered_only: q?.registered_only ? 1 : undefined,
  }
}

export function useLeaderboard() {
  const { raw } = useApi()

  return {
    /** Global points board (all users, or registered-only via the flag). */
    points: (query?: LeaderboardQuery) =>
      raw.get<LeaderboardRow[], LeaderboardMeta>('/leaderboard/points', { query: toQuery(query) }),

    /** Region points board. `country` is an ISO 3166-1 alpha-2 code, e.g. `HK`. */
    pointsByRegion: (country: string, query?: LeaderboardQuery) =>
      raw.get<LeaderboardRow[], LeaderboardMeta>(`/leaderboard/points/region/${country}`, { query: toQuery(query) }),

    /** Helpfulness board — ranks users by trophy tips contributed + up-votes. */
    tips: (query?: LeaderboardQuery) =>
      raw.get<LeaderboardRow[], LeaderboardMeta>('/leaderboard/tips', { query: toQuery(query) }),

    /** Contribution board — ranks users by aggregate contribution points. */
    contribution: (query?: LeaderboardQuery) =>
      raw.get<LeaderboardRow[], LeaderboardMeta>('/leaderboard/contribution', { query: toQuery(query) }),
  }
}
