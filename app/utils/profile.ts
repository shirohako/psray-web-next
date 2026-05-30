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

/**
 * A duration in seconds → compact zh label, e.g.「3天14小时」.「—」for null.
 * Always shows two units (天小时 / 小时分 / 分秒) unless it's under a minute.
 */
export function formatDuration(sec: number | null | undefined) {
  if (sec == null) return '—'
  const d = Math.floor(sec / 86_400)
  const h = Math.floor((sec % 86_400) / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = Math.floor(sec % 60)
  if (d > 0) return `${d}天${h}小时`
  if (h > 0) return `${h}小时${m}分`
  if (m > 0) return `${m}分${s}秒`
  return `${s}秒`
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

/**
 * Tailwind classes for a platform badge (filled, white text). Cohesive palette:
 * PS5 stays near-black (brand), the rest are distinct same-weight hues.
 */
export function platformBadgeClass(platform: string): string {
  switch (platform) {
    case 'PS5': return 'bg-slate-900 text-white'
    case 'PS4': return 'bg-sky-600 text-white'
    case 'PS3': return 'bg-teal-600 text-white'
    case 'PSVITA': return 'bg-rose-500 text-white'
    case 'PSP': return 'bg-amber-600 text-white'
    default: return 'bg-slate-600 text-white'
  }
}

export type TrophyKey = 'platinum' | 'gold' | 'silver' | 'bronze'

/** Display metadata for the four trophy tiers (order = platinum → bronze). */
export const trophyKinds: { key: TrophyKey; label: string; dot: string; text: string }[] = [
  { key: 'platinum', label: '白金', dot: 'bg-cyan-400', text: 'text-cyan-600' },
  { key: 'gold', label: '黄金', dot: 'bg-amber-400', text: 'text-amber-600' },
  { key: 'silver', label: '白银', dot: 'bg-slate-400', text: 'text-slate-500' },
  { key: 'bronze', label: '青铜', dot: 'bg-orange-400', text: 'text-orange-600' },
]
