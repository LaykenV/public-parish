import { describe, expect, it } from 'vitest'

import type { Id } from '../../../convex/_generated/dataModel'
import type { PublishedIssue } from './live-evidence'
import {
  toDecisionFixture,
  toMeetingFixture,
  toIssueFixture,
} from './live-evidence'

const citationId = (value: string) => value as Id<'citations'>

const citation = {
  bodyName: 'Rapides Parish Police Jury',
  documentTitle: 'Regular meeting minutes',
  excerpt: 'The jury adopted the millage levy.',
  fieldPath: '/title',
  id: 'citation-dated',
  officialUrl: 'https://www.rapidesparish.gov/minutes.pdf',
  page: 3,
  retrievedAt: 1_788_000_000_000,
  section: null,
  sourceKind: 'minutes' as const,
}

const publishedIssue: PublishedIssue = {
  acceptedAt: 1_788_000_000_000,
  bodyName: 'Rapides Parish Police Jury',
  changes: [],
  citations: [citation, { ...citation, id: 'citation-undated' }],
  claimCitationIds: {
    lifecycleState: [],
    nextAt: [],
    nextDescription: [],
    summary: ['citation-dated'],
    title: ['citation-dated'],
  },
  factors: [],
  importanceScore: 0,
  lifecycleState: 'decided',
  links: [
    {
      citationIds: [citationId('citation-undated')],
      lifecycleState: null,
      meetingAt: null,
      reason: 'The minutes name the same millage levy.',
      recordKey: 'record-undated',
      relationship: 'same_government_action',
      summary: null,
      title: 'A limited record with no published meeting date',
    },
    {
      citationIds: [citationId('citation-dated')],
      lifecycleState: 'decided',
      meetingAt: '2026-02-09T00:00:00.000Z',
      reason: 'The minutes record the adoption.',
      recordKey: 'record-dated',
      relationship: 'same_government_action',
      summary: 'The jury adopted the levy.',
      title: 'A full record with a published meeting date',
    },
  ],
  mode: 'full',
  nextKnownAction: null,
  placeName: 'Rapides Parish',
  placeSlug: 'rapides-parish',
  publicActions: [],
  revision: 'issue-version-1',
  slug: 'millage-levy',
  summary: 'The jury set the 2026 millage levy.',
  title: '2026 millage levy',
  topics: ['Taxes'],
  versions: [],
}

describe('published issue timeline', () => {
  it('leaves an undated link undated instead of showing the retrieval date', () => {
    const fixture = toIssueFixture(publishedIssue)
    const undated = fixture?.issue.timeline.find(
      (entry) => entry.recordKey === 'record-undated',
    )

    expect(undated?.date).toBeUndefined()
  })

  it('keeps undated links after the dated ones', () => {
    const fixture = toIssueFixture(publishedIssue)

    expect(fixture?.issue.timeline.map((entry) => entry.recordKey)).toEqual([
      'record-dated',
      'record-undated',
    ])
  })
})

it('keeps accepted evidence and citations when current coverage degrades', () => {
  const fixture = toIssueFixture({
    ...publishedIssue,
    coverageStatus: 'degraded',
  })
  expect(fixture?.issue.title).toBe(publishedIssue.title)
  expect(fixture?.issue.coverageNote).toContain(
    'newer decisions may be missing',
  )
  expect(fixture?.citations['citation-dated']?.excerpt.quote).toBe(
    citation.excerpt,
  )
  expect(fixture?.citations['citation-dated']?.warning).toContain('incomplete')
})

const publishedDecision: Parameters<typeof toDecisionFixture>[0] = {
  recordKey: 'statewide-record',
  sourceRecordId: 'U-37969',
  placeName: 'Louisiana',
  placeSlug: 'louisiana',
  bodyName: 'Louisiana Public Service Commission',
  coverageStatus: 'supported',
  mode: 'full',
  title: 'Utility rate application',
  recordType: 'other',
  lifecycleState: 'scheduled',
  summary: 'Discussion of the application.',
  meetingAt: '2026-09-16T09:00:00-05:00',
  meetingKey: 'statewide-meeting',
  affectedPlaces: [],
  amounts: [],
  publicActions: [],
  citations: [citation],
  versions: [],
  changes: [],
  issue: null,
}

const publishedMeeting: Parameters<typeof toMeetingFixture>[0] = {
  id: 'statewide-meeting',
  placeName: 'Louisiana',
  placeSlug: 'louisiana',
  bodyName: publishedDecision.bodyName,
  coverageStatus: 'supported',
  meetingAt: publishedDecision.meetingAt!,
  decisions: [publishedDecision],
  citations: [citation],
}

it('opens statewide decisions and preserves their source and meeting links', () => {
  const fixture = toDecisionFixture(publishedDecision)
  expect(fixture?.decision.title).toBe(publishedDecision.title)
  expect(fixture?.decision.meeting?.id).toBe(publishedMeeting.id)
  expect(fixture?.citations[citation.id]?.excerpt.quote).toBe(citation.excerpt)
})

it('opens statewide meeting records and keeps their individual decisions', () => {
  const data = toMeetingFixture(publishedMeeting)
  expect(data?.fixture.meeting.placeSlug).toBe('louisiana')
  expect(data?.fixture.meeting.decisions[0].recordKey).toBe(
    publishedDecision.recordKey,
  )
})

it('opens accepted statewide issue timelines', () => {
  const fixture = toIssueFixture({
    ...publishedIssue,
    placeSlug: 'louisiana',
    placeName: 'Louisiana',
  })
  expect(fixture?.issue.placeSlug).toBe('louisiana')
  expect(fixture?.issue.timeline).toHaveLength(2)
})

it('still rejects unknown places across all evidence readers', () => {
  expect(
    toDecisionFixture({ ...publishedDecision, placeSlug: 'unknown' }),
  ).toBeNull()
  expect(
    toMeetingFixture({ ...publishedMeeting, placeSlug: 'unknown' }),
  ).toBeNull()
  expect(toIssueFixture({ ...publishedIssue, placeSlug: 'unknown' })).toBeNull()
})
