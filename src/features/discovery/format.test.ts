import { describe, expect, it } from 'vitest'

import { formatDate, formatDay, formatTime } from './format'

describe('discovery date formatting', () => {
  it('keeps a date-only record on its Chicago calendar day abroad', () => {
    const previousTimezone = process.env.TZ

    try {
      process.env.TZ = 'Asia/Singapore'
      expect(formatDate('2026-09-15')).toBe('Sep 15, 2026')
      expect(formatDay('2026-09-15')).toBe('Sep 15')
    } finally {
      process.env.TZ = previousTimezone
    }
  })

  it.each([formatDate, formatDay, formatTime])('preserves printed date wording without crashing', (formatter) => {
    expect(formatter('September 29, 2026, at Noon')).toBe('September 29, 2026, at Noon')
    expect(formatter('Date to be announced')).toBe('Date to be announced')
    expect(formatter('2026-09-29Tnot-a-time')).toBe('2026-09-29Tnot-a-time')
    expect(formatter('')).toBe('Date not stated')
  })
})
