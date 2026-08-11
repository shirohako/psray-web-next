import { describe, expect, it } from 'vitest'
import { canonicalContentLang, contentHreflang } from '../shared/locales'

describe('trophy content language SEO mapping', () => {
  it('preserves API language codes in trophy URLs', () => {
    expect(canonicalContentLang('en-US')).toBe('en-US')
    expect(canonicalContentLang('es-419')).toBe('es-419')
  })

  it('maps unsupported UN M49 regions to a supported hreflang', () => {
    expect(contentHreflang('es-419')).toBe('es')
    expect(contentHreflang('fr-FR')).toBe('fr-FR')
  })

  it('rejects malformed content-language params', () => {
    expect(canonicalContentLang('../en')).toBe('')
    expect(contentHreflang('en-US-extra')).toBe('')
  })
})
