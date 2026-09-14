import type { StoryDraft, StorySpan } from './contracts'
import type { StoryManifest } from './manifestTypes'
import { STORY_REGISTRY } from './registry'

export const BALLOT_HEADINGS = ['Ballot question', 'What would change', 'Who it applies to', 'Effective date', 'Fiscal effect']

// Firecrawl preserves PDF italics as Markdown; remove presentation only.
export function ballotWording(excerpt: string) { return excerpt.replaceAll('*', '').replace(/\s+/g, ' ').trim() }

export function ballotQuestion(manifest: StoryManifest) {
  const entry = STORY_REGISTRY[manifest.story.storyKey]
  if (entry.kind !== 'ballot_measure') return null
  const claim = manifest.research.claims.find(c => c.claimKey === entry.ballotClaimKey)
  const support = claim?.supports.find(s => manifest.sources.some(source => source.sourceKey === s.sourceKey && source.bodyKey === 'louisiana-secretary-of-state'))
  if (!claim || !support || ballotWording(support.excerpt) !== ballotWording(claim.text) || !claim.text.startsWith('Do you support an amendment')) throw new Error('An exact Secretary of State ballot question is required')
  if (!manifest.sources.some(s => s.bodyKey === 'louisiana-legislature')) throw new Error('The enrolled Act is required')
  return { ...support, wording: ballotWording(support.excerpt) }
}

export function checkBallotDraft(manifest: StoryManifest, draft: StoryDraft, spans: StorySpan[]): string | null {
  const question = ballotQuestion(manifest)
  if (!question) return null
  const entry = STORY_REGISTRY[manifest.story.storyKey]
  if (entry.kind !== 'ballot_measure') return null
  const identity = manifest.research.claims.find(c => c.claimKey === 'measure-identity')?.supports.find(s => s.sourceKey === question.sourceKey && s.normalizedSha256 === question.normalizedSha256 && s.start <= question.start && s.end >= question.end)
  if (!identity || !identity.excerpt.startsWith(`Proposed Amendment No. ${entry.measureNumber}\n`) || identity.excerpt.slice(question.start - identity.start, question.end - identity.start) !== question.excerpt) return 'The Secretary of State section must bind this question to its amendment number'
  if (!draft.sections.length || draft.sections[0].heading !== 'Ballot question' || draft.sections[0].statements.length !== 1) return 'The first section must quote and cite the exact official ballot question'
  const statement = draft.sections[0].statements[0]
  const span = spans.find(s => s.sourceKey === question.sourceKey && s.start === question.start && s.end === question.end)
  if (statement.text !== question.wording || !span || !statement.evidenceKeys.includes(span.key)) return 'The first section must quote and cite the exact official ballot question'
  for (const heading of ['What would change', 'Who it applies to', 'Effective date']) {
    if (!draft.sections.some(s => s.heading === heading && s.statements.length)) return `Missing measure section: ${heading}`
  }
  return null
}
