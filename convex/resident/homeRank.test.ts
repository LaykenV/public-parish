import { describe, expect, it } from 'vitest'

import type { HomeIssueSignals } from './homeRank'
import {
  compareHomeIssues,
  documentedDay,
  homeEligible,
  homeRecencyPriority,
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

describe('homeRecencyPriority', () => {
  it('prioritizes upcoming dates only while they are not past', () => {
    const upcoming = signals({
      slug: 'a',
      importanceScore: 20,
      nextAt: '2026-09-12',
    })
    expect(homeRecencyPriority(upcoming, DAY)).toBe(2)
    expect(homeRecencyPriority({ ...upcoming, nextAt: '2026-09-11' }, DAY)).toBe(0)
  })

  it('gives recent meetings a lower tie priority than upcoming dates', () => {
    const recent = signals({
      slug: 'a',
      importanceScore: 20,
      latestMeetingAt: '2026-08-01',
    })
    expect(homeRecencyPriority(recent, DAY)).toBe(1)
    expect(
      homeRecencyPriority({ ...recent, latestMeetingAt: '2026-06-01' }, DAY),
    ).toBe(0)
  })

  it('treats every documented date as current when the client sends no day', () => {
    expect(
      homeRecencyPriority(signals({ slug: 'a', nextAt: '2020-01-01' }), null),
    ).toBe(2)
    expect(
      homeRecencyPriority(
        signals({ slug: 'b', latestMeetingAt: '2020-01-01' }),
        null,
      ),
    ).toBe(1)
  })

  it('ignores unparseable dates instead of failing the whole list', () => {
    expect(
      homeRecencyPriority(
        signals({ slug: 'a', importanceScore: 5, nextAt: 'TBD' }),
        DAY,
      ),
    ).toBe(0)
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
      homeRecencyPriority(
        signals({ slug: 'a', nextAt: 'September 29, 2026, at Noon' }),
        DAY,
      ),
    ).toBe(2)
  })
})

describe('rankHomeIssues', () => {
  it('orders by consequence, then date priority, newest acceptance and slug', () => {
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
      'b-slug',
      'newer-tie',
      'older-tie',
      'recent',
      'upcoming',
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


it('keeps a higher consequence above every recency bonus', () => {
  const ranked = rankHomeIssues([
    signals({ slug: 'roof-design', importanceScore: 20, latestMeetingAt: '2026-08-12' }),
    signals({ slug: 'rebate', importanceScore: 26, nextAt: 'August 26, 2026' }),
    signals({ slug: 'upcoming-routine', importanceScore: 5, nextAt: '2026-09-16' }),
  ], DAY)
  expect(ranked.map(issue => issue.slug)).toEqual(['rebate', 'roof-design', 'upcoming-routine'])
})

it('uses upcoming and recent dates only to break equal consequence scores', () => {
  const ranked = rankHomeIssues([
    signals({ slug: 'undated', importanceScore: 20, acceptedAt: 9000 }),
    signals({ slug: 'recent', importanceScore: 20, latestMeetingAt: '2026-09-01' }),
    signals({ slug: 'upcoming', importanceScore: 20, nextAt: '2026-09-16' }),
  ], DAY)
  expect(ranked.map(issue => issue.slug)).toEqual(['upcoming', 'recent', 'undated'])
  expect(homeRecencyPriority(signals({ slug: 'future-meeting', latestMeetingAt: '2026-10-01' }), DAY)).toBe(0)
})
