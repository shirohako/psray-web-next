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

/**
 * English display names for PSN's trophy localization languages (the 25 codes
 * PSN ships trophy text in). Doubles as the catalogue for the global
 * trophy-language preference — see {@link TROPHY_LANGUAGE_CODES}.
 */
const LANG_NAME_EN: Record<string, string> = {
  'cs-CZ': 'Czech',
  'da-DK': 'Danish',
  'de-DE': 'German',
  'el-GR': 'Greek',
  'en-GB': 'English (UK)',
  'en-US': 'English (US)',
  'es-419': 'Spanish (Latin America)',
  'es-ES': 'Spanish',
  'fi-FI': 'Finnish',
  'fr-FR': 'French',
  'hu-HU': 'Hungarian',
  'it-IT': 'Italian',
  'ja-JP': 'Japanese',
  'ko-KR': 'Korean',
  'nb-NO': 'Norwegian',
  'nl-NL': 'Dutch',
  'pl-PL': 'Polish',
  'pt-BR': 'Portuguese (Brazil)',
  'pt-PT': 'Portuguese',
  'ru-RU': 'Russian',
  'sv-SE': 'Swedish',
  'th-TH': 'Thai',
  'tr-TR': 'Turkish',
  'zh-Hans': 'Chinese (Simplified)',
  'zh-Hant': 'Chinese (Traditional)',
}

/** Selectable trophy-language codes, ordered by English name (for preferences). */
export const TROPHY_LANGUAGE_CODES = Object.keys(LANG_NAME_EN)
  .sort((a, b) => LANG_NAME_EN[a]!.localeCompare(LANG_NAME_EN[b]!))

/**
 * English language name for a PSN language code, e.g. `zh-Hant → Chinese
 * (Traditional)`. Falls back to `Intl.DisplayNames`, then the raw code.
 */
export function langNameEn(code: string): string {
  if (LANG_NAME_EN[code]) return LANG_NAME_EN[code]
  try {
    return new Intl.DisplayNames(['en'], { type: 'language' }).of(code) ?? code
  } catch {
    return code
  }
}
