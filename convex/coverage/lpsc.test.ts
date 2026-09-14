import { checkedAdditionalTarget } from './checkedRecords'
import { expect, test } from 'vitest'
import { resolveRootManifest } from './roots'
import { coverageGoldSetSamples } from './goldSet'
import { withinDiscoveryScope } from './candidates'

test('LPSC intake excludes pre-July sessions, transcripts and docket exhibits', () => {
  const root = resolveRootManifest('louisiana-public-service-commission', 'v1')!
  expect(root.jurisdictionSlug).toBe('louisiana')
  expect(withinDiscoveryScope(root, 'https://lpsc.louisiana.gov/docs/agenda/Aug_12_2026_Agenda.pdf')).toBe(true)
  expect(withinDiscoveryScope(root, 'https://lpsc.louisiana.gov/docs/agenda/June_17_2026_Agenda.pdf')).toBe(false)
  expect(withinDiscoveryScope(root, 'https://lpsc.louisiana.gov/docs/transcripts/August_12_2026.pdf')).toBe(false)
  expect(withinDiscoveryScope(root, 'https://lpsc.louisiana.gov/docs/agenda/undated.pdf')).toBe(false)
  const samples = coverageGoldSetSamples(root.bodyKey)
  expect(samples.every(s => withinDiscoveryScope(root, s.url))).toBe(true)
  expect(samples.filter(s => s.meetingDate === '2026-08-12').map(s => s.sourceKind).sort()).toEqual(['agenda', 'minutes'])
  expect(samples.filter(s => s.meetingDate === '2026-08-12').every(s => s.extraction?.targetRecordId === 'U-37775')).toBe(true)
})


test('additional resident extraction is restricted to two checked docket IDs in the August minutes', () => {
  const samples = coverageGoldSetSamples('louisiana-public-service-commission')
  const minutes = samples.find(s => s.sourceKind === 'minutes')!
  expect(checkedAdditionalTarget('louisiana-public-service-commission', minutes, 'X-38036')).toEqual({ targetRecordId: 'X-38036', sourceRecordIdProvenance: 'source_printed' })
  expect(checkedAdditionalTarget('louisiana-public-service-commission', minutes, 'U-99999')).toBeNull()
  expect(checkedAdditionalTarget('louisiana-public-service-commission', samples.find(s => s.sourceKind === 'agenda')!, 'X-38036')).toBeNull()
  expect(checkedAdditionalTarget('different-body', minutes, 'X-38036')).toBeNull()
})
