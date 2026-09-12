import { describe, expect, it } from 'vitest'

import type { HomeIssueSignals } from './homeRank'
import {
  compareHomeIssues,
  documentedDay,
  homeEligible,
  homeRankPoints,
  parseHomeDay,
  rankHomeIssues,
} from './homeRank'

const DAY = Date.parse('2026-09-12')

function signals(
  overrides: Partial<HomeIssueSignals> & { slug: string },
): HomeIssueSignals {
  return {
    importanceScore: 0,
    nextAt: null,
    latestMeetingAt: null,
    acceptedAt: 1_000,
    hasSupportedFactor: true,
    ...overrides,
  }
}

describe('parseHomeDay', () => {
  it('accepts only a calendar day and otherwise reports no clock', () => {
    expect(parseHomeDay('2026-09-12')).toBe(DAY)
    expect(parseHomeDay(undefined)).toBeNull()
    expect(parseHomeDay('')).toBeNull()
    expect(parseHomeDay('2026-09-12T10:00:00Z')).toBeNull()
    expect(parseHomeDay('not a day')).toBeNull()
    expect(parseHomeDay('2026-13-45')).toBeNull()
  })
})

describe('homeEligible', () => {
  it('keeps an issue that has a cited consequence or a documented next date', () => {
    expect(homeEligible(signals({ slug: 'a' }))).toBe(true)
    expect(
      homeEligible(
        signals({ slug: 'b', hasSupportedFactor: false, nextAt: '2026-10-01' }),
      ),
    ).toBe(true)
  })

  it('leaves an issue with neither for Explore', () => {
    expect(
      homeEligible(signals({ slug: 'c', hasSupportedFactor: false })),
    ).toBe(false)
  })
})

describe('homeRankPoints', () => {
  it('adds upcoming points only while the next date is not past', () => {
    const upcoming = signals({
      slug: 'a',
      importanceScore: 20,
      nextAt: '2026-09-12',
    })
    expect(homeRankPoints(upcoming, DAY)).toBe(45)
    expect(homeRankPoints({ ...upcoming, nextAt: '2026-09-11' }, DAY)).toBe(20)
  })

  it('adds a smaller bonus for an outcome inside the last sixty days', () => {
    const recent = signals({
      slug: 'a',
      importanceScore: 20,
      latestMeetingAt: '2026-08-01',
    })
    expect(homeRankPoints(recent, DAY)).toBe(30)
    expect(
      homeRankPoints({ ...recent, latestMeetingAt: '2026-06-01' }, DAY),
    ).toBe(20)
  })

  it('treats every documented date as current when the client sends no day', () => {
    expect(
      homeRankPoints(signals({ slug: 'a', nextAt: '2020-01-01' }), null),
    ).toBe(25)
    expect(
      homeRankPoints(
        signals({ slug: 'b', latestMeetingAt: '2020-01-01' }),
        null,
      ),
    ).toBe(10)
  })

  it('ignores unparseable dates instead of failing the whole list', () => {
    expect(
      homeRankPoints(
        signals({ slug: 'a', importanceScore: 5, nextAt: 'TBD' }),
        DAY,
      ),
    ).toBe(5)
  })

  it('reads the day out of source-worded next actions', () => {
    expect(documentedDay('September 29, 2026, at Noon')).toBe(
      Date.parse('2026-09-29'),
    )
    expect(documentedDay('August 26, 2026')).toBe(Date.parse('2026-08-26'))
    expect(documentedDay('2026-08-10T00:00:00.000Z')).toBe(
      Date.parse('2026-08-10'),
    )
    expect(documentedDay('the next regular meeting')).toBeNaN()
    expect(documentedDay(null)).toBeNaN()
    expect(
      homeRankPoints(
        signals({ slug: 'a', nextAt: 'September 29, 2026, at Noon' }),
        DAY,
      ),
    ).toBe(25)
  })
})

describe('rankHomeIssues', () => {
  it('orders by points, then newest acceptance, then slug', () => {
    const ranked = rankHomeIssues(
      [
        signals({ slug: 'older-tie', importanceScore: 30, acceptedAt: 1 }),
        signals({
          slug: 'upcoming',
          importanceScore: 10,
          nextAt: '2026-09-20',
        }),
        signals({ slug: 'excluded', hasSupportedFactor: false }),
        signals({ slug: 'newer-tie', importanceScore: 30, acceptedAt: 2 }),
        signals({ slug: 'b-slug', importanceScore: 30, acceptedAt: 2 }),
        signals({
          slug: 'recent',
          importanceScore: 15,
          latestMeetingAt: '2026-09-01',
        }),
      ],
      DAY,
    ).map((issue) => issue.slug)

    expect(ranked).toEqual([
      'upcoming',
      'b-slug',
      'newer-tie',
      'older-tie',
      'recent',
    ])
  })

  it('is a stable comparator regardless of input order', () => {
    const items = [
      signals({ slug: 'z', importanceScore: 10 }),
      signals({ slug: 'a', importanceScore: 10 }),
    ]
    expect(
      [...items].sort(compareHomeIssues(DAY)).map((item) => item.slug),
    ).toEqual(['a', 'z'])
    expect(
      [...items]
        .reverse()
        .sort(compareHomeIssues(DAY))
        .map((item) => item.slug),
    ).toEqual(['a', 'z'])
  })
})
