import { expect, test } from 'vitest'
import { chooseSearchWindow } from './searchWindow'
import { compactSearchCatalog } from './search'

test('explicit calendars and publication questions use different dates', () => {
  expect(chooseSearchWindow('What meetings are scheduled this week?', '2026-09-15')).toMatchObject({ field: 'meetingDate', fromDate: '2026-09-14', toDate: '2026-09-20' })
  expect(chooseSearchWindow('Which records were published yesterday?', '2026-09-15')).toEqual({ field: 'publishedAt', fromDate: '2026-09-14', toDate: '2026-09-14', from: Date.parse('2026-09-14T05:00:00Z'), to: Date.parse('2026-09-15T05:00:00Z') })
  expect(chooseSearchWindow('Which records were published today?', '2026-11-01')).toMatchObject({ from: Date.parse('2026-11-01T05:00:00Z'), to: Date.parse('2026-11-02T06:00:00Z') })
  expect(chooseSearchWindow('Which records were published today?', '2026-03-08')).toMatchObject({ from: Date.parse('2026-03-08T06:00:00Z'), to: Date.parse('2026-03-09T05:00:00Z') })
})

test.each(['What decisions changed this week?', 'Compare meetings this week and last week', 'Which meetings happened before this week?', 'Which decisions were approved this week?', 'What meetings were scheduled this week for next year?', 'Which records published this week mention earlier meetings?'])('ambiguous dates keep complete retrieval: %s', question => {
  expect(chooseSearchWindow(question, '2026-09-15')).toBeUndefined()
})

test('follow-ups keep history available', () => {
  expect(chooseSearchWindow('Which records were published today?', '2026-09-15', true)).toBeUndefined()
})

test('compaction preserves distinct details and relationships without repeating text', () => {
  const record = { targetKind: 'decision' as const, title: 'Vote', summary: '', place: 'Lafayette Parish', body: 'Council', meetingDate: null, publishedAt: Date.parse('2026-09-15T02:00:00Z') }
  const catalog = { scope: { kind: 'corpus' as const }, records: [
    { ...record, recordKey: 'a', searchText: 'The vote passed.\nThe vote passed.\nOnly if funded.' },
    { ...record, recordKey: 'b', searchText: 'The vote passed.\nThe vote was postponed.' },
  ] }
  const compact = compactSearchCatalog(catalog)
  expect(compact.records[0].publicationDate).toBe('2026-09-14')
  expect(compact.texts).toEqual(['The vote passed.', 'Only if funded.', 'The vote was postponed.'])
  expect(compact.records.map(row => row.textRefs.map(index => compact.texts[index]))).toEqual([['The vote passed.', 'Only if funded.'], ['The vote passed.', 'The vote was postponed.']])
})
