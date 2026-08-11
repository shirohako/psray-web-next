import { describe, expect, it } from 'vitest'
import { hasTipTrophy, isTipEdited, normalizeTipLanguage, tipExcerpt } from '~/utils/tip'

describe('Tip utilities', () => {
  it('normalizes regional language tags to API short codes', () => {
    expect(normalizeTipLanguage('zh-Hant')).toBe('zh')
    expect(normalizeTipLanguage('pt_BR')).toBe('pt')
    expect(normalizeTipLanguage('JA-jp')).toBe('ja')
  })

  it('falls back to Japanese for an unsupported or missing language', () => {
    expect(normalizeTipLanguage('vi')).toBe('ja')
    expect(normalizeTipLanguage()).toBe('ja')
  })

  it('creates a readable compact excerpt from extended Markdown', () => {
    const markdown = `::: tip Hint
See **this** [guide](/docs/markdown), ||including spoilers||.
:::

![Map](/map.png){width=320}`

    expect(tipExcerpt(markdown)).toBe('See this guide, including spoilers. Map')
  })

  it('truncates long excerpts without exceeding the requested text length by more than the ellipsis', () => {
    expect(tipExcerpt('A'.repeat(20), 10)).toBe('AAAAAAAAAA…')
  })

  it('filters profile Tips whose related trophy is unavailable', () => {
    expect(hasTipTrophy({ trophy: null } as never)).toBe(false)
    expect(hasTipTrophy({ trophy: { id: 1 } } as never)).toBe(true)
  })

  it('detects Tips updated after publication', () => {
    expect(isTipEdited({ created_at: '2026-08-01T00:00:00Z', updated_at: '2026-08-02T00:00:00Z' })).toBe(true)
    expect(isTipEdited({ created_at: '2026-08-01T00:00:00Z', updated_at: '2026-08-01T00:00:00Z' })).toBe(false)
  })
})
