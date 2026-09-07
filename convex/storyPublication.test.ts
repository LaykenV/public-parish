/// <reference types="vite/client" />
import { convexTest } from 'convex-test'
import { afterEach, expect, test, vi } from 'vitest'
import example from '../docs/story-manifests/import-contract-v1.example.json'
import { api } from './_generated/api'
import schema from './schema'
import { sha256HexOfText } from './sources/hashing'
import type { StoryManifest } from './stories/manifestTypes'
import { proposedSpans } from './stories/evidence'
import type { StoryDraft, StoryReview } from './stories/contracts'

const modules = import.meta.glob('./**/*.ts')
afterEach(() => vi.unstubAllEnvs())

// Synthetic failure fixtures. No model or provider call is represented by them.
async function setup() {
  vi.stubEnv('ADMIN_EMAIL', 'owner@example.com')
  const t = convexTest(schema, modules)
  const manifest = structuredClone(example) as StoryManifest
  manifest.purpose = 'research'
  const text = 'EXAMPLE FIXTURE. The demonstration agency announced a proposed project.\n'
  const rawHash = await sha256HexOfText(text)
  const ids = await t.run(async ctx => {
    const ownerId = await ctx.db.insert('users', { googleAccountId: 'owner', email: 'owner@example.com', emailVerified: true, createdAt: 1, updatedAt: 1, lastSignedInAt: 1 })
    const jurisdictionId = await ctx.db.insert('jurisdictions', { name: 'Rapides Parish', slug: 'rapides-parish', type: 'parish', state: 'LA', publicStatus: 'candidate' })
    const governmentBodyId = await ctx.db.insert('governmentBodies', { jurisdictionId, name: manifest.sources[0].bodyName, slug: manifest.sources[0].bodyKey, bodyType: 'other', publicStatus: 'candidate' })
    const registryId = await ctx.db.insert('sourceRegistries', { governmentBodyId, officialDomains: ['example.invalid'], seedUrls: [manifest.sources[0].url], sourceKinds: ['other'], expectedCadence: { kind: 'unknown' }, discoveryMode: 'dynamic', status: 'candidate' })
    const rawStorageId = await ctx.storage.store(new Blob([text]))
    const normalizedStorageId = await ctx.storage.store(new Blob([text]))
    const snapshotId = await ctx.db.insert('sourceSnapshots', { registryId, canonicalUrl: manifest.sources[0].url, retrievedUrl: manifest.sources[0].finalUrl,
      contentHash: rawHash, contentHashBasis: 'raw_artifact_v2', normalizedContentHash: rawHash, contentType: 'text/plain', retrievalTime: 1, version: 1,
      rawStorageId, rawContentType: 'text/plain', rawByteLength: new TextEncoder().encode(text).byteLength,
      normalizedStorageId, normalizedContentType: 'text/plain', normalizedByteLength: new TextEncoder().encode(text).byteLength,
      truncation: { truncated: false }, firecrawlMetadata: {} })
    const snapshot = (await ctx.db.get(snapshotId))!
    const spans = proposedSpans(manifest, [{ source: manifest.sources[0], snapshot }])
    const statement = { text: 'The agency announced a proposed project.', evidenceKeys: [spans[0].key] }
    const draft: StoryDraft = { title: statement, summary: statement, sections: [], timeline: [], nextAction: null, limitations: [] }
    const review: StoryReview = { verdict: 'pass', limitations: [], checks: ['/title', '/summary', '/media/caption', '/media/alt'].map(path => ({ path, assessment: 'supported', reason: 'Synthetic supported fixture.' })) }
    const draftHash = await sha256HexOfText(JSON.stringify(draft))
    const reviewHash = await sha256HexOfText(JSON.stringify(review))
    const imageId = await ctx.storage.store(new Blob(['synthetic fixture image']))
    const media = { storageId: imageId, sha256: rawHash, originalUrl: 'https://example.invalid/image.png', credit: 'Fixture', license: 'Fixture', permissionEvidenceUrl: 'https://example.invalid/rights', kind: 'document_detail' as const, caption: 'Fixture document', alt: 'Fixture document', width: 100, height: 100, captionEvidenceKeys: [spans[0].key] }
    const storyId = await ctx.db.insert('stories', { storyKey: 'applied-digital-boyce', slug: 'applied-digital-boyce', rank: 2, state: 'unpublished', generation: 0, createdAt: 1, updatedAt: 1 })
    const manifestJson = JSON.stringify(manifest)
    const importId = await ctx.db.insert('storyImports', { storyKey: 'applied-digital-boyce', bundleKey: manifest.bundleKey, bundleVersion: 1, contractVersion: '1.0.0', bundleHash: await sha256HexOfText(manifestJson), manifestJson, state: 'staged', blockers: [], stagedBy: ownerId, createdAt: 1 })
    const runId = await ctx.db.insert('pipelineRuns', { registryId, trigger: 'manual_story_build', state: 'succeeded', processorVersion: 'story-v1', startedAt: 1 })
    const buildId = await ctx.db.insert('storyBuilds', { importId, storyId, expectedGeneration: 0, inputHash: 'a'.repeat(64), sourceBindings: [{ sourceKey: manifest.sources[0].sourceKey, snapshotId }], spans,
      relatedPublications: [], media, state: 'reviewed', draft, draftHash, draftModel: 'strong-fixture', review, reviewHash, reviewModel: 'fast-fixture', runId, startedBy: ownerId, createdAt: 1 })
    return { ownerId, storyId, buildId, snapshotId, registryId, rawStorageId, args: { buildId, inputHash: 'a'.repeat(64), draftHash, reviewHash, expectedGeneration: 0 } }
  })
  return { t, owner: t.withIdentity({ subject: ids.ownerId }), ...ids }
}

test('owner approval freezes a version; replay creates no version or baseline mail', async () => {
  const { t, owner, args, storyId } = await setup()
  const version = await owner.mutation(api.stories.operations.approve, args)
  expect(await owner.mutation(api.stories.operations.approve, args)).toBe(version)
  await t.run(async ctx => {
    expect(await ctx.db.query('storyVersions').collect()).toHaveLength(1)
    expect((await ctx.db.get(storyId))?.currentVersionId).toBe(version)
    expect(await ctx.db.query('notificationDeliveries').collect()).toHaveLength(0)
    expect((await ctx.db.query('governmentBodies').first())?.publicStatus).toBe('candidate')
  })
})

test('unauthenticated and changed-hash approvals fail before publication', async () => {
  const { t, owner, args } = await setup()
  await expect(t.mutation(api.stories.operations.approve, args)).rejects.toThrow('Sign in with Google')
  await expect(owner.mutation(api.stories.operations.approve, { ...args, draftHash: 'b'.repeat(64) })).rejects.toThrow('Approval inputs changed')
  await t.run(async ctx => expect(await ctx.db.query('storyVersions').collect()).toHaveLength(0))
})

test('a newer source or deleted artifact invalidates exact-version approval', async () => {
  const { t, owner, args, snapshotId } = await setup()
  await t.run(async ctx => {
    const old = (await ctx.db.get(snapshotId))!
    const { _id: _id, _creationTime: _creationTime, ...fields } = old
    await ctx.db.insert('sourceSnapshots', { ...fields, version: 2, previousSnapshotId: snapshotId })
  })
  await expect(owner.mutation(api.stories.operations.approve, args)).rejects.toThrow('newer snapshot')
  const other = await setup()
  await other.t.run(ctx => ctx.storage.delete(other.rawStorageId))
  await expect(other.owner.mutation(api.stories.operations.approve, other.args)).rejects.toThrow('storage changed')
})

test('withdrawal preserves history and prevents a competing generation approval', async () => {
  const { owner, t, args, storyId, buildId } = await setup()
  await owner.mutation(api.stories.operations.approve, args)
  const competing = await t.run(async ctx => {
    const old = (await ctx.db.get(buildId))!
    const { _id: _id, _creationTime: _creationTime, versionId: _versionId, ...fields } = old
    return ctx.db.insert('storyBuilds', { ...fields, expectedGeneration: 1, state: 'reviewed', inputHash: 'c'.repeat(64) })
  })
  await owner.mutation(api.stories.operations.withdraw, { storyId, expectedGeneration: 1, reason: 'Source review required.' })
  await expect(owner.mutation(api.stories.operations.approve, { ...args, buildId: competing, inputHash: 'c'.repeat(64), expectedGeneration: 1 })).rejects.toThrow('stale')
  expect(await owner.query(api.stories.operations.history, { storyId })).toHaveLength(1)
})

test('unsupported review produces an immutable withheld version with no public pointer', async () => {
  const { t, owner, args, buildId, storyId } = await setup()
  const reviewHash = await t.run(async ctx => {
    const build = (await ctx.db.get(buildId))!
    const review: StoryReview = { ...build.review!, verdict: 'fail', checks: build.review!.checks.map(check => ({ ...check, assessment: 'unsupported' })) }
    const hash = await sha256HexOfText(JSON.stringify(review))
    await ctx.db.patch(buildId, { review, reviewHash: hash })
    return hash
  })
  await owner.mutation(api.stories.operations.approve, { ...args, reviewHash })
  await t.run(async ctx => {
    expect((await ctx.db.get(storyId))?.currentVersionId).toBeUndefined()
    expect((await ctx.db.query('storyVersions').first())?.mode).toBe('withheld')
  })
})
