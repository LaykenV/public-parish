import { expect, test } from 'vitest'
import { checkDraft, checkReview } from './contracts'
import type { StoryDraft, StoryReview, StorySpan } from './contracts'

const draft: StoryDraft = {
  title: { text: 'Agency announces a proposed project', evidenceKeys: ['source:0:50'] },
  summary: { text: 'The agency announced a proposal.', evidenceKeys: ['source:0:50'] },
  sections: [], timeline: [], nextAction: null, limitations: [],
}
const spans = [{ key: 'source:0:50' }] as StorySpan[]
const review: StoryReview = { verdict: 'pass', checks: [
  { path: '/title', assessment: 'supported', reason: 'The source attributes an announcement.' },
  { path: '/summary', assessment: 'supported', reason: 'The proposal is attributed.' },
], limitations: [] }

test('a draft cannot cite unrelated or duplicate evidence', () => {
  expect(checkDraft(draft, spans)).toBeNull()
  expect(checkDraft({ ...draft, title: { text: draft.title.text, evidenceKeys: ['unrelated'] } }, spans)).toContain('unsupported')
  expect(checkDraft({ ...draft, title: { text: draft.title.text, evidenceKeys: ['source:0:50', 'source:0:50'] } }, spans)).toContain('unsupported')
})

test('independent review must cover each fact and cannot pass unsupported claims', () => {
  expect(checkReview(review, draft, null)).toBeNull()
  expect(checkReview({ ...review, checks: [review.checks[0], review.checks[0]] }, draft, null)).toContain('exactly once')
  expect(checkReview({ ...review, checks: [{ ...review.checks[0], assessment: 'unsupported' }, review.checks[1]] }, draft, null)).toContain('withheld')
})

test('known gaps cannot produce full publication and must receive review', () => {
  const limited = { ...draft, limitations: ['No executed agreement is included.'] }
  expect(checkReview(review, limited, null)).toContain('exactly once')
  const checked = { ...review, checks: [...review.checks, { path: '/limitations/0', assessment: 'supported' as const, reason: 'Only an announcement is supplied.' }] }
  expect(checkReview(checked, limited, null)).toContain('limited publication')
  expect(checkReview({ ...checked, verdict: 'limited' }, limited, null)).toBeNull()
})

test('a timeline date is part of the reviewed statement', () => {
  const withDate = { ...draft, timeline: [{ date: '2026-01-01', statement: draft.summary }] }
  expect(checkReview(review, withDate, null)).toContain('exactly once')
  for (const date of ['2026', '2026-09', '2024-02-29']) expect(checkDraft({ ...draft, timeline: [{ date, statement: draft.summary }] }, spans)).toBeNull()
  for (const date of ['2026-02-29', 'tomorrow', '2026-13', '2026-09-07'.repeat(100)]) expect(checkDraft({ ...draft, timeline: [{ date, statement: draft.summary }] }, spans)).toBe('Invalid timeline date')
})
