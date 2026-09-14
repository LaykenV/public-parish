import { expect, test } from 'vitest'
import { ballotQuestion, ballotWording, checkBallotDraft } from './ballot'
import { parseStoryManifest } from './manifest'
import { LAUNCH_STORIES, STORY_REGISTRY, storyPath } from './registry'
import type { StoryManifest } from './manifestTypes'
import type { Id } from '../_generated/dataModel'
import type { StoryDraft, StorySpan } from './contracts'
import example from '../../docs/story-manifests/import-contract-v1.example.json'

test('ballot routes never add a fourth featured story or change existing addresses', () => {
  expect(Object.keys(LAUNCH_STORIES)).toHaveLength(3)
  expect(Object.values(STORY_REGISTRY).filter(s => s.kind === 'ballot_measure')).toHaveLength(10)
  expect(storyPath('meta-richland')).toBe('/stories/meta-richland')
  expect(storyPath('2026-amendment-10')).toBe('/ballot/2026-amendment-10')
  expect(parseStoryManifest(JSON.stringify(example)).contractVersion).toBe('1.0.0')
})

test('ballot typography normalization preserves words, numbers and qualifiers', () => {
  expect(ballotWording('*Do you support*  a one-time\ntransfer?')).toBe('Do you support a one-time transfer?')
  expect(ballotWording('at least sixty-five')).not.toBe(ballotWording('over sixty-five'))
})

test('measure publication rejects a paraphrased or uncited ballot question', () => {
  const manifest = structuredClone(example) as StoryManifest
  manifest.story.storyKey = '2026-amendment-1'
  manifest.sources[0].bodyKey = 'louisiana-secretary-of-state'
  manifest.sources.push({ ...manifest.sources[0], sourceKey: 'act', bodyKey: 'louisiana-legislature' })
  const support = { ...manifest.research.claims[0].supports[0], excerpt: 'Do you support an amendment to allow a *one-time* transfer?' }
  manifest.research.claims = [{ claimKey: 'ballot-question', text: ballotWording(support.excerpt), supports: [support] }]
  const prefix = 'Proposed Amendment No. 1\n'
  support.start = prefix.length
  support.end = prefix.length + support.excerpt.length
  manifest.research.claims.push({ claimKey: 'measure-identity', text: prefix + support.excerpt, supports: [{ ...support, start: 0, excerpt: prefix + support.excerpt }] })
  const span: StorySpan = { ...support, key: 'question', snapshotId: 'fixture' as Id<'sourceSnapshots'>, rawHash: 'a'.repeat(64), normalizedHash: support.normalizedSha256, officialUrl: manifest.sources[0].url }
  const statement = { text: ballotWording(support.excerpt), evidenceKeys: ['question'] }
  const draft: StoryDraft = { title: statement, summary: statement, sections: ['Ballot question', 'What would change', 'Who it applies to', 'Effective date'].map(heading => ({ heading, statements: [{ ...statement }] })), timeline: [], nextAction: null, limitations: [] }
  expect(checkBallotDraft(manifest, draft, [span])).toBeNull()
  draft.sections[0].statements[0].text = statement.text.replace('one-time', 'unlimited')
  expect(checkBallotDraft(manifest, draft, [span])).toContain('exact official ballot question')
  draft.sections[0].statements[0] = { ...statement, evidenceKeys: ['act'] }
  expect(checkBallotDraft(manifest, draft, [span])).toContain('exact official ballot question')
  manifest.story.storyKey = '2026-amendment-2'
  expect(checkBallotDraft(manifest, draft, [span])).toContain('amendment number')
  manifest.story.storyKey = '2026-amendment-1'
  manifest.sources = manifest.sources.filter(s => s.bodyKey !== 'louisiana-legislature')
  expect(() => ballotQuestion(manifest)).toThrow('enrolled Act')
})

test('all ten versioned measure manifests bind the right official question and preserve their lineage', async () => {
  const manifests = import.meta.glob('../../docs/story-manifests/2026-amendment-*.json', { eager: true, import: 'default' })
  const keys = new Set<string>()
  for (const raw of Object.values(manifests)) {
    const parsed = parseStoryManifest(JSON.stringify(raw))
    expect(ballotQuestion(parsed)?.wording).toContain('Do you support an amendment')
    keys.add(parsed.story.storyKey)
  }
  expect(keys.size).toBe(10)
})
