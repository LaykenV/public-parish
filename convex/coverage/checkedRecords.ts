import type { CoverageGoldSample } from './goldSet'

// Two additional resident records checked in the retained August minutes.
// These do not replace the agenda/minutes pair used for coverage certification.
export const LPSC_RESIDENT_RECORDS = ['U-37969', 'X-38036'] as const
export function checkedAdditionalTarget(bodyKey: string, sample: CoverageGoldSample | null, target?: string) {
  if (!target || bodyKey !== 'louisiana-public-service-commission' || sample?.url !== 'https://lpsc.louisiana.gov/docs/minutes/August_12_2026_Minutes.pdf' || !LPSC_RESIDENT_RECORDS.some(id => id === target)) return null
  return { targetRecordId: target, sourceRecordIdProvenance: 'source_printed' as const }
}
