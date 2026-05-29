import type { Profile } from '~/services/profile'

/**
 * Shared, framework-free helpers for the profile page and its components.
 * Files under `app/utils/` are auto-imported by Nuxt, so just call e.g.
 * `fmt(n)` or `trophyKinds` from any component without importing.
 */

const nf = new Intl.NumberFormat('en-US')

/** Thousands-separated number, or「—」for null/undefined. */
export const fmt = (n: number | null | undefined) => (n == null ? '—' : nf.format(n))

/** Date only, e.g.「2026年5月29日」. */
export function fmtDate(unix: number | null | undefined) {
  if (!unix) return '—'
  return new Date(unix * 1000).toLocaleDateString('zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

/** Absolute date down to the minute, e.g.「2026/05/29 14:30」. */
export function fmtDateTime(unix: number | null | undefined) {
  if (!unix) return '—'
  return new Date(unix * 1000).toLocaleString('zh-CN', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  })
}

/** Coarse relative time, e.g.「3 天前」. */
export function fromNow(unix: number | null | undefined) {
  if (!unix) return '—'
  const diff = Date.now() - unix * 1000
  const day = 86_400_000
  if (diff < day) return '今天'
  if (diff < 2 * day) return '昨天'
  if (diff < 30 * day) return `${Math.floor(diff / day)} 天前`
  if (diff < 365 * day) return `${Math.floor(diff / (30 * day))} 个月前`
  return `${Math.floor(diff / (365 * day))} 年前`
}

const REGION: Record<string, string> = {
  HK: '🇭🇰 香港', JP: '🇯🇵 日本', US: '🇺🇸 美国', CN: '🇨🇳 中国',
  TW: '🇹🇼 台湾', KR: '🇰🇷 韩国', GB: '🇬🇧 英国',
}
/** Country code → flag + localized name (falls back to the raw code). */
export const formatRegion = (c: string) => REGION[c] ?? c

const LANG: Record<string, string> = {
  'zh-CN': '简体中文', 'zh-TW': '繁体中文', 'ja': '日本語', 'en': 'English',
  'ko': '한국어',
}
/** Language tag → localized label (falls back to the raw tag). */
export const formatLang = (l: string) => LANG[l] ?? l

/** A rank value:「#1,234」or「暂无排名」when the user isn't ranked yet. */
export const rankText = (r: number | null | undefined) => (r == null ? '暂无排名' : `#${fmt(r)}`)

/** Sum of all four trophy tiers. */
export const sumTrophies = (p: Profile) => p.platinum + p.gold + p.silver + p.bronze

export type TrophyKey = 'platinum' | 'gold' | 'silver' | 'bronze'

/** Display metadata for the four trophy tiers (order = platinum → bronze). */
export const trophyKinds: { key: TrophyKey; label: string; dot: string; text: string }[] = [
  { key: 'platinum', label: '白金', dot: 'bg-cyan-400', text: 'text-cyan-600' },
  { key: 'gold', label: '黄金', dot: 'bg-amber-400', text: 'text-amber-600' },
  { key: 'silver', label: '白银', dot: 'bg-slate-400', text: 'text-slate-500' },
  { key: 'bronze', label: '青铜', dot: 'bg-orange-400', text: 'text-orange-600' },
]
