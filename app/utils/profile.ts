import type { Profile } from '~/services/profile'
import { REGIONS } from '~/utils/regions'

/**
 * Shared, framework-free helpers for the profile page and its components.
 * Files under `app/utils/` are auto-imported by Nuxt, so just call e.g.
 * `fmt(n)` or `trophyKinds` from any component without importing.
 */

const nf = new Intl.NumberFormat('en-US')

/** Thousands-separated number, or「—」for null/undefined. */
export const fmt = (n: number | null | undefined) => (n == null ? '—' : nf.format(n))

type DateLike = number | string | null | undefined

function toDate(value: DateLike) {
  if (value == null || value === '') return null
  const date = typeof value === 'number' ? new Date(value * 1000) : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

/** Date only, e.g.「2026年5月29日」. */
export function fmtDate(value: DateLike) {
  const date = toDate(value)
  if (!date) return '—'
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

/** Absolute date down to the minute, e.g.「2026/05/29 14:30」. */
export function fmtDateTime(value: DateLike) {
  const date = toDate(value)
  if (!date) return '—'
  return date.toLocaleString('zh-CN', {
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

/**
 * Gap between two consecutively earned trophies, in English units spaced for
 * readability, e.g.「18 h 12 m 15 s」「1 d 3 h」「5 s」. Lists every non-zero
 * unit (d/h/m/s).「< 1 s」for sub-second gaps;「null」when there's no previous
 * trophy to compare against.
 */
export function fmtEarnGap(sec: number | null | undefined) {
  if (sec == null) return null
  if (sec < 1) return '< 1 s'
  const d = Math.floor(sec / 86_400)
  const h = Math.floor((sec % 86_400) / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = Math.floor(sec % 60)
  const parts: string[] = []
  if (d) parts.push(`${d} d`)
  if (h) parts.push(`${h} h`)
  if (m) parts.push(`${m} m`)
  if (s) parts.push(`${s} s`)
  return parts.join(' ')
}

/** Coarse relative time, e.g.「3 天前」. */
export function fromNow(value: DateLike) {
  const date = toDate(value)
  if (!date) return '—'
  const diff = Date.now() - date.getTime()
  const day = 86_400_000
  if (diff < day) return '今天'
  if (diff < 2 * day) return '昨天'
  if (diff < 30 * day) return `${Math.floor(diff / day)} 天前`
  if (diff < 365 * day) return `${Math.floor(diff / (30 * day))} 个月前`
  return `${Math.floor(diff / (365 * day))} 年前`
}

const REGION_NAMES = Object.fromEntries(REGIONS.map(r => [r.code, r.name]))

// English country names derived from our stable region list first. Intl is only
// a fallback because Node and browsers can ship different ICU display names.
const regionNames = new Intl.DisplayNames(['en'], { type: 'region' })
/** Country code → English country name (falls back to the raw code). */
export function regionName(c: string) {
  if (!/^[A-Za-z]{2}$/.test(c)) return c
  const code = c.toUpperCase()
  if (REGION_NAMES[code]) return REGION_NAMES[code]
  try {
    return regionNames.of(code) ?? c
  }
  catch {
    return c
  }
}

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

export type PlatformValue = string | string[] | null | undefined

/** Normalize legacy single-platform strings and current platform arrays. */
export function platformList(platform: PlatformValue): string[] {
  if (Array.isArray(platform)) return platform.filter(Boolean)
  return platform ? [platform] : []
}

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
