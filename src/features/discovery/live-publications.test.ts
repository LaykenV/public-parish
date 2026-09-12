import { describe, expect, it } from 'vitest'

import type { PublishedDecision, PublishedIssue } from './live-publications'
import {
  issueEvidenceNote,
  localDay,
  toDecisionCard,
  toDecisionRow,
  toIssueCard,
  toIssueLifecycleState,
  toLifecycleState,
} from './live-publications'

const fullDecision: PublishedDecision = {
  bodyName: 'Lafayette City Council',
  lifecycleState: 'postponed',
  meetingAt: null,
  mode: 'full',
  placeName: 'Lafayette Parish',
  placeSlug: 'lafayette-parish',
  recordKey: 'record-key',
  source: {
    officialUrl: 'https://apps.lafayettela.gov/record.pdf',
    retrievedAt: 1_788_000_000_000,
    sourceKind: 'minutes',
  },
  sourceRecordId: 'CO-062-2026',
  summary: 'The council postponed the ordinance.',
  title: 'An ordinance concerning Hellen Street',
}

const fullIssue: PublishedIssue = {
  acceptedAt: 1_788_000_000_000,
  bodyName: 'Rapides Parish Police Jury',
  coverageStatus: 'supported',
  decisionCount: 2,
  evidenceCheckedAt: 1_788_000_000_000,
  latestMeetingAt: '2026-06-09T00:00:00.000Z',
  lifecycleState: 'decided',
  mode: 'full',
  nextKnownAction: null,
  placeName: 'Rapides Parish',
  placeSlug: 'rapides-parish',
  revision: 'issue-version-id',
  slug: '2026-millage-levy',
  summary: 'The police jury set the 2026 property-tax millage levy.',
  title: '2026 millage levy on the Rapides Parish tax roll',
  topics: ['Public money'],
  whyItMatters: {
    citationIds: ['citation-1'],
    factor: 'public_money',
    text: 'The levy sets the property-tax rate every parcel owner pays this year.',
  },
}

describe('live publication discovery adapter', () => {
  it('maps accepted fields without inventing an issue or consequence score', () => {
    expect(toDecisionCard(fullDecision)).toMatchObject({
      body: 'Lafayette City Council',
      evidence: { status: 'Evidence available' },
      href: '/decisions/record-key',
      place: 'Lafayette Parish',
      primaryActionLabel: 'View decision',
      showSecondaryActions: false,
      state: 'Postponed',
      topics: [],
      whyMatter: 'The council postponed the ordinance.',
    })
  })

  it('keeps a limited record visibly limited and omits unsupported details', () => {
    const card = toDecisionCard({
      ...fullDecision,
      lifecycleState: null,
      meetingAt: null,
      mode: 'limited',
      summary: null,
    })

    expect(card).toMatchObject({
      evidence: { status: 'Limited information' },
      state: 'Status not stated',
    })
    expect(card?.whyMatter).toBeUndefined()
  })

  it('labels Explore results as decision records with source status', () => {
    expect(toDecisionRow(fullDecision)).toMatchObject({
      href: '/decisions/record-key',
      id: 'CO-062-2026',
      kind: 'Decision record',
      sourceStatus: 'Evidence available',
      state: 'Postponed',
    })
  })

  it('maps every backend lifecycle into resident language', () => {
    expect(toLifecycleState('scheduled')).toBe('Scheduled')
    expect(toLifecycleState('implementing')).toBe('In progress')
    expect(toLifecycleState('decided')).toBe('Decided')
    expect(toLifecycleState(null)).toBe('Status not stated')
  })

  it('maps a published issue without dropping its linked-record context', () => {
    expect(toIssueCard(fullIssue)).toMatchObject({
      body: 'Rapides Parish Police Jury',
      evidence: {
        note: 'Built from 2 linked official decision records.',
        status: 'Evidence available',
      },
      href: '/issues/2026-millage-levy',
      latestOutcome: {
        date: '2026-06-09T00:00:00.000Z',
        label: 'Latest record',
      },
      place: 'Rapides Parish',
      state: 'Decided',
      whyMatter:
        'The levy sets the property-tax rate every parcel owner pays this year.',
    })
  })

  it('falls back to the cited summary when no consequence factor is supported', () => {
    expect(toIssueCard({ ...fullIssue, whyItMatters: null })?.whyMatter).toBe(
      'The police jury set the 2026 property-tax millage levy.',
    )
  })

  it('tells readers when source checks behind an issue are paused or incomplete', () => {
    expect(
      issueEvidenceNote({ decisionCount: 1, coverageStatus: 'paused' }),
    ).toBe(
      'Built from 1 linked official decision record. Source checks for this body are paused.',
    )
    expect(
      issueEvidenceNote({ decisionCount: 3, coverageStatus: 'degraded' }),
    ).toBe(
      'Built from 3 linked official decision records. Some source checks for this body are incomplete.',
    )
    expect(
      issueEvidenceNote({ decisionCount: 3, coverageStatus: 'candidate' }),
    ).toBe('Built from 3 linked official decision records.')
  })

  it('sends the reader’s calendar day, not a UTC day, for ranking', () => {
    expect(localDay(new Date(2026, 8, 12, 23, 30))).toBe('2026-09-12')
    expect(localDay(new Date(2026, 0, 3, 0, 5))).toBe('2026-01-03')
  })

  it('maps issue-specific lifecycle labels into resident language', () => {
    expect(toIssueLifecycleState('active')).toBe('In progress')
    expect(toIssueLifecycleState('complete')).toBe('Completed')
    expect(toIssueLifecycleState('unknown')).toBe('Status not stated')
  })
})
