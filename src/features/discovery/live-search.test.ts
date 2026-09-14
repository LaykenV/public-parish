import { describe, expect, it } from 'vitest'
import type { SearchEntry } from '../../../convex/resident/searchContracts'
import { toSearchEntry } from './live-search'
import { recommendExploreEntries } from './explore-recommendations'
import type { PublishedIssue } from './live-publications'

const record: SearchEntry = {
  key: 'decision:one',
  revision: 'version-one',
  kind: 'decision',
  href: '/decisions/one',
  title: 'Drainage agreement',
  summary: 'The council approved a drainage agreement.',
  bodyName: 'Pineville City Council',
  placeName: 'Rapides Parish',
  placeSlug: 'rapides-parish',
  mode: 'full',
  lifecycle: 'Decided',
  topics: ['Drainage'],
  date: '2026-09-08',
  dateAt: 1788825600000,
  checkedAt: 1788825600000,
}

describe('Explore card data', () => {
  it('retains accepted summaries, topics, dates and evidence on decisions', () => {
    expect(toSearchEntry(record)).toMatchObject({
      row: {
        summary: record.summary,
        topics: ['Drainage'],
        date: '2026-09-08',
        checked: '2026-09-08T00:00:00.000Z',
        sourceStatus: 'Evidence available',
        state: 'Decided',
      },
    })
  })
  it.each(['meeting', 'body'] as const)(
    '%s does not inherit a member decision status or evidence mode',
    (kind) => {
      const result = toSearchEntry({ ...record, kind })
      expect(result).toMatchObject({ row: { summary: record.summary } })
      if (result.kind === 'issue') throw new Error('Unexpected issue')
      expect(result.row.sourceStatus).toBeUndefined()
      expect(result.row.state).toBeUndefined()
      expect(result.row.checked).toBeUndefined()
    },
  )
  it('labels story review dates separately from meeting dates', () => {
    expect(toSearchEntry({ ...record, kind: 'story' })).toMatchObject({
      row: {
        body: undefined,
        state: undefined,
        date: undefined,
        reviewedThrough: '2026-09-08',
        summary: record.summary,
      },
    })
  })
  it('puts ranked issues ahead of recent rows and removes duplicates across loaded pages', () => {
    const issue: PublishedIssue = {
      acceptedAt: record.checkedAt,
      evidenceCheckedAt: record.checkedAt,
      bodyName: record.bodyName,
      placeName: record.placeName,
      placeSlug: record.placeSlug,
      mode: 'full',
      title: 'Drainage funding',
      summary: 'Accepted explanation',
      slug: 'drainage',
      revision: 'issue-version',
      lifecycleState: 'decided',
      topics: [],
      nextKnownAction: null,
      latestMeetingAt: record.date,
      decisionCount: 2,
      coverageStatus: 'supported',
      sourceChecksPaused: false,
      whyItMatters: null,
    }
    const raw = toSearchEntry(record)
    const duplicate = toSearchEntry({
      ...record,
      kind: 'issue',
      key: 'issue:drainage',
      href: '/issues/drainage',
    })
    const ranked = recommendExploreEntries([raw, duplicate, raw], [], [issue])
    expect(ranked).toHaveLength(2)
    expect(ranked[0]).toMatchObject({
      kind: 'issue',
      issue: {
        whyMatter: 'Accepted explanation',
        evidence: {
          note: expect.stringContaining('2 linked official decision records'),
        },
      },
    })
    expect(ranked[1]).toEqual(raw)
  })
})
