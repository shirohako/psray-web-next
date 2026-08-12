import { describe, expect, it } from 'vitest'
import { resolveSeoLocalePolicy } from '../app/utils/seoLocale'

describe('SEO locale policy', () => {
  it('uses a bare canonical URL and no hreflang editions for fixed Japanese pages', () => {
    expect(resolveSeoLocalePolicy('ja', undefined, 'en')).toEqual({
      canonicalLang: 'ja',
      ogLocale: 'ja_JP',
      uiAlternates: [],
    })
  })

  it('preserves the existing translated-page locale behavior', () => {
    expect(resolveSeoLocalePolicy(undefined, undefined, 'ko')).toEqual({
      canonicalLang: 'ko',
      ogLocale: 'ko_KR',
      uiAlternates: ['ja', 'zh-Hans', 'zh-Hant', 'en', 'ko'],
    })
  })

  it('honors an explicit canonical language on translated pages', () => {
    expect(resolveSeoLocalePolicy(undefined, 'en-US', 'ja').canonicalLang).toBe('en')
  })
})
