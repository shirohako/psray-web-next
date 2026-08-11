import type { TipLanguage, TipTrophy } from '~/types/tip'

/** Languages accepted by the Tip API, in a reader-friendly selection order. */
export const TIP_LANGUAGE_CODES: readonly TipLanguage[] = [
  'zh', 'en', 'ja', 'ko', 'es', 'pt', 'fr', 'de', 'it', 'ru', 'nl', 'fi',
  'sv', 'da', 'nb', 'pl', 'tr', 'ar', 'cs', 'hu', 'el', 'ro', 'th',
] as const

/** Convert a PSN/BCP-47 display language to the merged short code used by Tips. */
export function normalizeTipLanguage(value?: string | null): TipLanguage {
  const shortCode = String(value ?? '').trim().toLowerCase().split(/[-_]/, 1)[0]
  return TIP_LANGUAGE_CODES.includes(shortCode as TipLanguage)
    ? shortCode as TipLanguage
    : 'ja'
}

/** Profile endpoints may retain Tips whose related trophy was removed. */
export function hasTipTrophy<T extends { trophy: TipTrophy | null }>(tip: T): tip is T & { trophy: TipTrophy } {
  return tip.trophy !== null
}

/** Whether a Tip has been changed after its initial publication. */
export function isTipEdited(tip: { created_at: string; updated_at: string }): boolean {
  const created = Date.parse(tip.created_at)
  const updated = Date.parse(tip.updated_at)
  if (Number.isFinite(created) && Number.isFinite(updated)) return updated > created
  return tip.updated_at !== tip.created_at
}

/** Plain-text summary for compact profile cards; full views use RichContent. */
export function tipExcerpt(markdown: string, maxLength = 180): string {
  const plain = String(markdown ?? '')
    .replace(/^:{3,}.*$/gm, '')
    .replace(/!\[([^\]]*)\]\([^)]*\)(?:\{[^}]*\})?/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\{[^}]*\}/g, '$1')
    .replace(/\|\|([^|]+)\|\|/g, '$1')
    .replace(/[`*_~=>#>-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  return plain.length > maxLength ? `${plain.slice(0, maxLength).trimEnd()}…` : plain
}
