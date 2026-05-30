import type { DefinedTrophies, Rarity, TrophyType } from '~/services/trophies'

/**
 * Framework-free helpers for the trophy-set page and its components.
 * Files under `app/utils/` are auto-imported by Nuxt, so call e.g.
 * `rarityMeta(r)` or `langLabel(code)` from any component without importing.
 *
 * Trophy-tier display (dot/label/text colours) reuses `trophyKinds` from
 * `utils/profile.ts`; this file only adds trophy-detail-specific bits.
 */

/** Total trophies across all four tiers. */
export const totalDefined = (d: DefinedTrophies) =>
  d.bronze + d.silver + d.gold + d.platinum

/**
 * Tier accent colour (text class) for a trophy icon/badge. Matches the dot
 * palette in `trophyKinds` (platinum→cyan, gold→amber, silver→slate, bronze→orange).
 */
const TIER_TEXT: Record<TrophyType, string> = {
  platinum: 'text-cyan-500',
  gold: 'text-amber-500',
  silver: 'text-slate-400',
  bronze: 'text-orange-500',
}
export const trophyTierColor = (t: TrophyType) => TIER_TEXT[t]

/** Localized rarity label + a soft pill colour scheme. */
const RARITY: Record<Rarity, { label: string; pill: string }> = {
  COMMON: { label: '普通', pill: 'bg-slate-100 text-slate-600' },
  UNCOMMON: { label: '罕见', pill: 'bg-emerald-50 text-emerald-600' },
  RARE: { label: '稀有', pill: 'bg-sky-50 text-sky-600' },
  'VERY RARE': { label: '非常稀有', pill: 'bg-violet-50 text-violet-600' },
  'ULTRA RARE': { label: '极为稀有', pill: 'bg-amber-50 text-amber-600' },
}
/** Falls back to a neutral pill for any unknown rarity string. */
export const rarityMeta = (r: Rarity) =>
  RARITY[r] ?? { label: r, pill: 'bg-slate-100 text-slate-600' }

/** Human-readable language name from a BCP-47 code, e.g. `zh-Hant → 繁体中文`. */
export function langLabel(code: string): string {
  try {
    const dn = new Intl.DisplayNames(['zh-CN'], { type: 'language' })
    return dn.of(code) ?? code
  } catch {
    return code
  }
}
