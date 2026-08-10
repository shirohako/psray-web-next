import { Coins, Globe2, HeartHandshake, Share2, type IconNode } from 'lucide'
import type { ApiSuccess } from '~/types/api'
import type { LeaderboardColumn } from '~/components/leaderboard/Table.vue'
import { useLeaderboard, type LeaderboardRow, type LeaderboardMeta } from '~/services/leaderboard'

/** Current value of the page-level filters, handed to a board's fetcher. */
export interface LeaderboardCtx {
  page: number
  registeredOnly: boolean
  region: string
}

/**
 * One ranking board. A board fully describes itself: how it looks in the nav
 * (`labelKey` + `icon`), which filters it supports (`region` / `registered`),
 * which columns it renders, and how to fetch its data. Adding a new board is a
 * single entry here — the page nav, filters and table all adapt.
 */
export interface LeaderboardBoard {
  key: string
  /** Message key for the nav label; resolved at render so it follows the locale. */
  labelKey: string
  /** Message key for the one-line subtitle shown in the board header. */
  descriptionKey: string
  icon: IconNode
  columns: LeaderboardColumn[]
  /** Show the region picker and pass `region` to `fetch`. */
  region?: boolean
  /** Show the registered-only toggle and pass `registeredOnly` to `fetch`. */
  registered?: boolean
  fetch: (ctx: LeaderboardCtx) => Promise<ApiSuccess<LeaderboardRow[], LeaderboardMeta>>
}

/**
 * The registry of available boards. Built inside a composable so each board's
 * `fetch` can close over the API instance. The page renders these in order.
 */
export function useRankingBoards(): LeaderboardBoard[] {
  const api = useLeaderboard()

  return [
    {
      key: 'points',
      labelKey: 'leaderboard.board.points.label',
      descriptionKey: 'leaderboard.board.points.description',
      icon: Coins,
      columns: ['rank', 'user', 'level', 'platinum', 'gold', 'silver', 'bronze', 'points'],
      registered: true,
      fetch: ({ page, registeredOnly }) => api.points({ page, registered_only: registeredOnly }),
    },
    {
      key: 'points-region',
      labelKey: 'leaderboard.board.pointsRegion.label',
      descriptionKey: 'leaderboard.board.pointsRegion.description',
      icon: Globe2,
      columns: ['rank', 'user', 'level', 'platinum', 'gold', 'silver', 'bronze', 'points'],
      region: true,
      registered: true,
      fetch: ({ page, registeredOnly, region }) =>
        api.pointsByRegion(region, { page, registered_only: registeredOnly }),
    },
    {
      key: 'tips',
      labelKey: 'leaderboard.board.tips.label',
      descriptionKey: 'leaderboard.board.tips.description',
      icon: HeartHandshake,
      columns: ['rank', 'user', 'tipCount', 'voteUp'],
      fetch: ({ page }) => api.tips({ page }),
    },
    {
      key: 'contribution',
      labelKey: 'leaderboard.board.contribution.label',
      descriptionKey: 'leaderboard.board.contribution.description',
      icon: Share2,
      columns: ['rank', 'user', 'contribution'],
      fetch: ({ page }) => api.contribution({ page }),
    },
  ]
}
