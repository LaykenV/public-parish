import { describe, expect, it } from 'vitest'
import type { HomeIssueSignals } from './homeRank'
import { compareHomeIssues, homeEligible, rankHomeIssues } from './homeRank'

function signals(overrides: Partial<HomeIssueSignals> & { slug: string }): HomeIssueSignals {
  return { importanceScore: 0, nextAt: null, acceptedAt: 1000, hasSupportedFactor: true, ...overrides }
}

describe('Home issue selection', () => {
  it('keeps cited consequences and documented dates while leaving unsupported issues in Explore', () => {
    expect(homeEligible(signals({ slug: 'cited' }))).toBe(true)
    expect(homeEligible(signals({ slug: 'dated', hasSupportedFactor: false, nextAt: '2026-10-01' }))).toBe(true)
    expect(homeEligible(signals({ slug: 'unsupported', hasSupportedFactor: false }))).toBe(false)
  })

  it('keeps higher consequences above more recent routine work and upcoming dates', () => {
    const ranked = rankHomeIssues([
      signals({ slug: 'roof-design', importanceScore: 20, acceptedAt: 3000 }),
      signals({ slug: 'rebate', importanceScore: 26, acceptedAt: 1, nextAt: 'August 26, 2026' }),
      signals({ slug: 'upcoming-routine', importanceScore: 5, acceptedAt: 4000, nextAt: '2026-09-16' }),
    ])
    expect(ranked.map(issue => issue.slug)).toEqual(['rebate', 'roof-design', 'upcoming-routine'])
  })

  it('breaks equal scores by accepted-version recency, then descending slug like the index', () => {
    const ranked = rankHomeIssues([
      signals({ slug: 'old', importanceScore: 20, acceptedAt: 1 }),
      signals({ slug: 'a', importanceScore: 20, acceptedAt: 2 }),
      signals({ slug: 'z', importanceScore: 20, acceptedAt: 2 }),
      signals({ slug: 'unsupported', importanceScore: 100, hasSupportedFactor: false }),
    ])
    expect(ranked.map(issue => issue.slug)).toEqual(['z', 'a', 'old'])
  })

  it('has the same stable order regardless of input order', () => {
    const issues = ['a', 'a-b', 'ab', 'z'].map(slug => signals({ slug, importanceScore: 20 }))
    const expected = ['z', 'ab', 'a-b', 'a']
    expect([...issues].sort(compareHomeIssues).map(issue => issue.slug)).toEqual(expected)
    expect([...issues].reverse().sort(compareHomeIssues).map(issue => issue.slug)).toEqual(expected)
  })
})
