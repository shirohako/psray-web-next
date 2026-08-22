import { describe, expect, it } from 'vitest'
import { formatHourInterval } from '~/utils/profile'

const compact = (value: string | null) => value?.replace(/\s/g, '')

describe('profile formatting', () => {
  it('formats hour-based sync intervals without rounding', () => {
    expect(compact(formatHourInterval(1, 'ja-JP'))).toBe('1時間')
    expect(compact(formatHourInterval(24, 'ja-JP'))).toBe('1日')
    expect(compact(formatHourInterval(168, 'ja-JP'))).toBe('1週間')
    expect(compact(formatHourInterval(720, 'ja-JP'))).toBe('30日')
    expect(compact(formatHourInterval(8760, 'ja-JP'))).toBe('1年')
  })

  it('treats non-positive or missing intervals as unscheduled', () => {
    expect(formatHourInterval(0, 'ja-JP')).toBeNull()
    expect(formatHourInterval(null, 'ja-JP')).toBeNull()
  })
})
