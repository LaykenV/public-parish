import { expect, test } from 'vitest'
import example from '../../docs/story-manifests/import-contract-v1.example.json'
import { parseStoryManifest, researchBlockers } from './manifest'

function changed(edit: (bundle: typeof example) => void) {
  const bundle = structuredClone(example)
  edit(bundle)
  return JSON.stringify(bundle)
}

test('the complete example is research and remains blocked from publication', () => {
  const manifest = parseStoryManifest(JSON.stringify(example))
  expect(researchBlockers(manifest)).toContain('Fixtures cannot be published.')
})

test('rejects forged approvals and unknown contract fields', () => {
  expect(() => parseStoryManifest(JSON.stringify({ ...example, ownerApproved: true }))).toThrow('unknown field')
  expect(() => parseStoryManifest(changed(b => { b.contractVersion = '2.0.0' })))).toThrow('unsupported value')
})

test('rejects wrong geography or promoted homepage placement', () => {
  expect(() => parseStoryManifest(changed(b => { b.story.geography[0].parish = 'Richland Parish' })))).toThrow('placement mismatch')
  expect(() => parseStoryManifest(changed(b => { b.story.rank = 0 })))).toThrow('placement mismatch')
})

test('rejects duplicate stable identities and unrelated evidence hashes', () => {
  expect(() => parseStoryManifest(changed(b => { b.sources.push(b.sources[0]) })))).toThrow('duplicate stable key')
  expect(() => parseStoryManifest(changed(b => { b.research.claims[0].supports[0].normalizedSha256 = 'a'.repeat(64) })))).toThrow('mismatched span hash')
})

test('rejects fabricated span bounds, unsupported pages and invalid dates', () => {
  expect(() => parseStoryManifest(changed(b => { b.research.claims[0].supports[0].end++ })))).toThrow('span bounds')
  const withPage = JSON.parse(JSON.stringify(example))
  withPage.research.claims[0].supports[0].page = 3
  expect(() => parseStoryManifest(JSON.stringify(withPage))).toThrow('page is not proven')
  expect(() => parseStoryManifest(changed(b => { b.research.reviewedThrough = '2026-02-30' })))).toThrow('Invalid calendar date')
})

test('rejects references to missing claims and credential-bearing source URLs', () => {
  expect(() => parseStoryManifest(changed(b => { b.research.supportedQuestions[0].claimKeys = ['unrelated'] })))).toThrow('Unknown claim')
  expect(() => parseStoryManifest(changed(b => { b.sources[0].url = 'https://secret@example.org/source' })))).toThrow('credentials')
})

test('enforces finite size and array bounds before source work', () => {
  expect(() => parseStoryManifest(' '.repeat(250001))).toThrow('exceeds')
  expect(() => parseStoryManifest(changed(b => { b.sources = Array(25).fill(b.sources[0]) })))).toThrow('too many entries')
})
