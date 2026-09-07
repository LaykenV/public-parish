import { expect, test } from 'vitest'
import { changedDraftFields } from './story-operations-page.data'
import type { StoryDraft } from '../../../convex/stories/contracts'

test('owner revision comparison identifies changed facts and limitations', () => {
  const draft: StoryDraft = { title: { text: 'Proposal', evidenceKeys: ['a'] }, summary: { text: 'Proposed', evidenceKeys: ['a'] }, sections: [], timeline: [], nextAction: null, limitations: [] }
  expect(changedDraftFields(draft, { ...draft, limitations: ['No executed agreement is supplied.'] })).toEqual(['limitations'])
  expect(changedDraftFields(draft, { ...draft, timeline: [{ date: '2026-09-07', statement: draft.summary }] })).toEqual(['timeline'])
  expect(changedDraftFields(draft, structuredClone(draft))).toEqual([])
})
