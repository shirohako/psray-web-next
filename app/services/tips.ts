import type {
  OwnTrophyTip,
  ProfileTip,
  SaveTrophyTipPayload,
  TipPageMeta,
  TipVote,
  TrophyTip,
  TrophyTipPageMeta,
} from '~/types/tip'

/** Public reads and authenticated mutations for trophy Tips. */
export function useTips() {
  const { $api, get, post, raw } = useApi()

  return {
    /** Newest Tips for one trophy. */
    forTrophy: (trophyId: number | string, query?: { page?: number }) =>
      raw.get<TrophyTip[], TrophyTipPageMeta>(`/trophies/trophy/${trophyId}/tips`, { query }),

    /** A user's Tips, newest update first. */
    forProfile: (psnid: string, query?: { page?: number }) =>
      raw.get<ProfileTip[], TipPageMeta>(`/profile/${psnid}/tips`, { query }),

    /** The signed-in user's Tip for a trophy, used to populate edit mode. */
    mine: (trophyId: number | string) =>
      get<OwnTrophyTip>(`/trophies/${trophyId}/tip`),

    /** Create or completely replace the signed-in user's Tip for a trophy. */
    save: (trophyId: number | string, payload: SaveTrophyTipPayload) =>
      post<OwnTrophyTip>(`/trophies/${trophyId}/tip`, payload),

    /** Delete the signed-in user's Tip for a trophy (204, no response body). */
    remove: (trophyId: number | string) =>
      $api<void>(`/trophies/${trophyId}/tip`, { method: 'DELETE' }),

    /** Set or switch a helpfulness vote (204, no response body). */
    vote: (tipId: number | string, vote: TipVote) =>
      $api<void>(`/tips/${tipId}/vote`, { method: 'PUT', body: { vote } }),

    /** Remove the signed-in user's vote (204, no response body). */
    removeVote: (tipId: number | string) =>
      $api<void>(`/tips/${tipId}/vote`, { method: 'DELETE' }),
  }
}
