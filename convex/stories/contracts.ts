import { v } from 'convex/values'

export const storyKey = v.union(v.literal('meta-richland'), v.literal('spacex-pecan-island'), v.literal('applied-digital-boyce'))
export const storyMode = v.union(v.literal('full'), v.literal('limited'), v.literal('withheld'))
export const sourceBinding = v.object({ sourceKey: v.string(), snapshotId: v.id('sourceSnapshots') })
export const storySpan = v.object({
  key: v.string(), sourceKey: v.string(), snapshotId: v.id('sourceSnapshots'),
  rawHash: v.string(), normalizedHash: v.string(), officialUrl: v.string(),
  excerpt: v.string(), start: v.number(), end: v.number(),
  page: v.union(v.number(), v.null()), section: v.union(v.string(), v.null()),
})
export type StorySpan = typeof storySpan.type
export const storyStatement = v.object({ text: v.string(), evidenceKeys: v.array(v.string()) })
export const storyDraft = v.object({
  title: storyStatement,
  summary: storyStatement,
  sections: v.array(v.object({ heading: v.string(), statements: v.array(storyStatement) })),
  timeline: v.array(v.object({ date: v.union(v.string(), v.null()), statement: storyStatement })),
  nextAction: v.union(v.null(), storyStatement),
  limitations: v.array(v.string()),
})
export type StoryDraft = typeof storyDraft.type
export const storyReview = v.object({
  changeAssessment: v.optional(v.object({ kind: v.union(v.literal('baseline'), v.literal('cosmetic'), v.literal('material')), previousDraftHash: v.union(v.null(), v.string()), reason: v.string() })),
  verdict: v.union(v.literal('pass'), v.literal('limited'), v.literal('fail')),
  checks: v.array(v.object({ path: v.string(), assessment: v.union(v.literal('supported'), v.literal('unsupported')), reason: v.string() })),
  limitations: v.array(v.string()),
})
export type StoryReview = typeof storyReview.type
export const storyMedia = v.object({
  storageId: v.id('_storage'), sha256: v.string(), originalUrl: v.string(),
  credit: v.string(), license: v.string(), permissionEvidenceUrl: v.string(),
  kind: v.union(v.literal('photo'), v.literal('rendering'), v.literal('document_detail'), v.literal('diagram')),
  caption: v.string(), alt: v.string(), width: v.number(), height: v.number(),
  captionEvidenceKeys: v.array(v.string()),
})
export const relatedPublication = v.object({ recordId: v.id('decisionRecords'), publicationVersionId: v.id('publicationVersions'), payloadHash: v.string() })

const statementSchema = { type: 'object', additionalProperties: false, required: ['text', 'evidenceKeys'], properties: {
  text: { type: 'string' }, evidenceKeys: { type: 'array', items: { type: 'string' } },
} }
export const draftJsonSchema = {
  type: 'object', additionalProperties: false,
  required: ['title', 'summary', 'sections', 'timeline', 'nextAction', 'limitations'],
  properties: {
    title: statementSchema, summary: statementSchema,
    sections: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['heading', 'statements'], properties: { heading: { type: 'string', enum: ['What the records establish', 'Government actions', 'Project scope'] }, statements: { type: 'array', items: statementSchema } } } },
    timeline: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['date', 'statement'], properties: { date: { type: ['string', 'null'] }, statement: statementSchema } } },
    nextAction: { anyOf: [{ type: 'null' }, statementSchema] },
    limitations: { type: 'array', items: { type: 'string' } },
  },
}
export const reviewJsonSchema = {
  type: 'object', additionalProperties: false, required: ['verdict', 'checks', 'limitations', 'changeAssessment'], properties: {
    changeAssessment: { type: 'object', additionalProperties: false, required: ['kind', 'previousDraftHash', 'reason'], properties: { kind: { type: 'string', enum: ['baseline', 'cosmetic', 'material'] }, previousDraftHash: { type: ['string', 'null'] }, reason: { type: 'string' } } },
    verdict: { type: 'string', enum: ['pass', 'limited', 'fail'] },
    checks: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['path', 'assessment', 'reason'], properties: {
      path: { type: 'string' }, assessment: { type: 'string', enum: ['supported', 'unsupported'] }, reason: { type: 'string' },
    } } }, limitations: { type: 'array', items: { type: 'string' } },
  },
}

export function draftStatements(draft: StoryDraft) {
  const entries: Array<{ path: string, text: string, evidenceKeys: string[] }> = [
    { path: '/title', ...draft.title }, { path: '/summary', ...draft.summary },
  ]
  draft.sections.forEach((section, i) => section.statements.forEach((statement, j) => entries.push({ path: `/sections/${i}/${j}`, ...statement })))
  draft.timeline.forEach((event, i) => entries.push({ path: `/timeline/${i}`, text: `${event.date ?? 'Date unknown'}: ${event.statement.text}`, evidenceKeys: event.statement.evidenceKeys }))
  if (draft.nextAction) entries.push({ path: '/nextAction', ...draft.nextAction })
  return entries
}

export function checkDraft(draft: StoryDraft, spans: StorySpan[]): string | null {
  if (draft.timeline.some(event => event.date !== null && !validTimelineDate(event.date))) return 'Invalid timeline date'
  if (draft.title.text.length > 180 || draft.summary.text.length > 1400 || draft.sections.length > 6 || draft.timeline.length > 12 || draft.limitations.length > 12) return 'Story exceeds content bounds'
  if (draft.sections.some(section => !['What the records establish', 'Government actions', 'Project scope'].includes(section.heading) || section.statements.length > 8)) return 'Invalid section'
  if (draft.limitations.some(text => !text.trim() || text.length > 600)) return 'Invalid limitation'
  const keys = new Set(spans.map(span => span.key))
  const statements = draftStatements(draft)
  if (statements.length > 60) return 'Too many statements'
  for (const statement of statements) {
    if (!statement.text.trim() || statement.text.length > 2000 || statement.evidenceKeys.length < 1 || statement.evidenceKeys.length > 12 ||
      new Set(statement.evidenceKeys).size !== statement.evidenceKeys.length || statement.evidenceKeys.some(key => !keys.has(key))) return `Invalid or unsupported statement ${statement.path}`
  }
  return null
}

function validTimelineDate(value: string): boolean {
  if (!/^\d{4}(?:-\d{2}(?:-\d{2})?)?$/.test(value)) return false
  const day = value.length === 4 ? `${value}-01-01` : value.length === 7 ? `${value}-01` : value
  const parsed = new Date(`${day}T00:00:00Z`)
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === day
}

export function checkReview(review: StoryReview, draft: StoryDraft, media: typeof storyMedia.type | null): string | null {
  if (review.changeAssessment && (!review.changeAssessment.reason.trim() || review.changeAssessment.reason.length > 800 || (review.changeAssessment.previousDraftHash !== null && !/^[a-f0-9]{64}$/.test(review.changeAssessment.previousDraftHash)))) return 'Invalid change assessment'
  const expected = [...draftStatements(draft).map(item => item.path), ...draft.limitations.map((_, i) => `/limitations/${i}`)]
  if (media) expected.push('/media/caption', '/media/alt')
  if (review.checks.length !== expected.length || JSON.stringify(review.checks.map(check => check.path).sort()) !== JSON.stringify(expected.sort())) return 'Review must check every statement, limitation and image description exactly once'
  if (review.checks.some(check => !check.reason.trim() || check.reason.length > 800) || review.limitations.length > 12 || review.limitations.some(text => !text.trim() || text.length > 600)) return 'Invalid review findings'
  const failed = review.checks.some(check => check.assessment !== 'supported')
  if (failed && review.verdict !== 'fail') return 'Unsupported claims must be withheld'
  if (!failed && review.verdict === 'pass' && (review.limitations.length || draft.limitations.length)) return 'Known gaps require limited publication'
  return null
}
