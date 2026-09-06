import { expect, test } from 'vitest'

import {
  coverageGoldSetExpectations,
  coverageGoldSetSamples,
  coverageGoldSetVersion,
} from './goldSet'

test('the checked manifest names exact official artifacts and extraction targets', () => {
  expect(coverageGoldSetVersion()).toBe('launch-bodies-v4')
  expect(coverageGoldSetSamples('youngsville-city-council')).toHaveLength(4)
  expect(
    coverageGoldSetSamples('lafayette-city-council').map(
      (sample) => sample.url,
    ),
  ).toContain(
    'https://apps.lafayettela.gov/obcouncil/api/Document/2581071/',
  )
  expect(
    coverageGoldSetSamples('ebr-metropolitan-council').find(
      (sample) => sample.key === '2026-08-12-agenda',
    )?.extraction,
  ).toEqual({
    targetRecordId: 'EBR-2026-08-12-CORTANA-CITY-SALES-TAX-REBATE',
    sourceRecordIdProvenance: 'operator_assigned',
  })
  expect(coverageGoldSetExpectations('pineville-city-council')).toEqual([
    { sourceKind: 'agenda', cadence: 'meeting_cycle' },
    { sourceKind: 'minutes', cadence: 'meeting_cycle' },
  ])
})

test('an unlisted body cannot borrow another body gold set', () => {
  expect(() => coverageGoldSetSamples('invented-board')).toThrow(
    'has no body invented-board',
  )
})

test('each Lafayette planning body has its own agenda and recorded outcome pair', () => {
  const bodies = [
    'lafayette-city-planning-commission',
    'lafayette-parish-planning-commission',
    'lafayette-city-zoning-commission',
    'lafayette-board-of-zoning-adjustment',
    'lafayette-hearing-examiner',
  ]
  const pairedTargets = new Set<string>()
  for (const body of bodies) {
    const samples = coverageGoldSetSamples(body)
    const evidence = samples.filter(sample => sample.extraction)
    expect(evidence.map(sample => sample.sourceKind).sort()).toEqual([
      'agenda', 'minutes',
    ])
    const target = evidence[0].extraction!.targetRecordId
    expect(evidence[1].extraction!.targetRecordId).toBe(target)
    expect(pairedTargets.has(target)).toBe(false)
    pairedTargets.add(target)
    expect(samples.some(sample => sample.role === 'historical')).toBe(true)
    expect(samples.some(sample => sample.negativeTargetRecordId)).toBe(true)
    expect(coverageGoldSetExpectations(body)).toEqual([
      { sourceKind: 'agenda', cadence: 'meeting_cycle' },
      { sourceKind: 'minutes', cadence: 'meeting_cycle' },
    ])
  }
  // The retired combined body must not borrow either commission's decisions.
  expect(coverageGoldSetSamples('lafayette-planning-commission').every(
    sample => sample.sourceKind === 'calendar' && !sample.extraction,
  )).toBe(true)
})
