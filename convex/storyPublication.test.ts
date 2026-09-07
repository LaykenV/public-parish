import { hashStoryValue } from './stories/hashing'
/// <reference types="vite/client" />
import { convexTest } from 'convex-test'
import workflowTest from '@convex-dev/workflow/test'
import agentTest from '@convex-dev/agent/test'
import { afterEach, expect, test, vi } from 'vitest'
import example from '../docs/story-manifests/import-contract-v1.example.json'
import { api, internal } from './_generated/api'
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
  agentTest.register(t)
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
    const draftHash = await hashStoryValue(draft)
    const reviewHash = await hashStoryValue(review)
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
  await t.run(async ctx => {
    expect(await ctx.db.query('storyVersions').collect()).toHaveLength(0)
  })
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
    const hash = await hashStoryValue(review)
    await ctx.db.patch(buildId, { review, reviewHash: hash })
    return hash
  })
  await owner.mutation(api.stories.operations.approve, { ...args, reviewHash })
  await t.run(async ctx => {
    expect((await ctx.db.get(storyId))?.currentVersionId).toBeUndefined()
    expect((await ctx.db.query('storyVersions').first())?.mode).toBe('withheld')
  })
})

test('owner retry preserves a saved draft and enforces a finite retry count', async () => {
  vi.useFakeTimers()
  try {
    const { t, owner, args, buildId } = await setup()
    workflowTest.register(t)
    await t.run(async ctx => { await ctx.db.patch(buildId, { state: 'failed', review: undefined, reviewHash: undefined, reviewModel: undefined }) })
    await expect(t.mutation(api.stories.buildLedger.retry, { buildId, inputHash: args.inputHash })).rejects.toThrow('Sign in with Google')
    expect(await owner.mutation(api.stories.buildLedger.retry, { buildId, inputHash: args.inputHash })).toBe(buildId)
    await t.run(async ctx => {
      const build = (await ctx.db.get(buildId))!
      expect(build.draftHash).toBe(args.draftHash)
      expect(build.retryCount).toBe(1)
      expect(build.state).toBe('drafted')
      await ctx.db.patch(buildId, { state: 'failed' })
    })
    await expect(owner.mutation(api.stories.buildLedger.retry, { buildId, inputHash: args.inputHash })).rejects.toThrow('allowance exhausted')
  } finally { vi.useRealTimers() }
})

test('anonymous story Ask accepts only reviewed current spans and refuses another session', async () => {
  const { t, owner, args, storyId } = await setup()
  const versionId = await owner.mutation(api.stories.operations.approve, args)
  const token = 'story-ask-alice-000000000000000000000000000000'
  const otherToken = 'story-ask-bob-00000000000000000000000000000000'
  await t.mutation(api.ask.threads.createSession, { token })
  await t.mutation(api.ask.threads.createSession, { token: otherToken })
  const thread = await t.mutation(api.ask.threads.createThread, { token, scope: { kind: 'story', storySlug: 'applied-digital-boyce' } })
  const catalog = await t.query(api.ask.evidence.retrieveEvidence, { token, threadId: thread.threadId, question: 'What was proposed?' })
  expect(catalog.scope).toEqual({ kind: 'story', storySlug: 'applied-digital-boyce' })
  expect(catalog.records[0].targetKind).toBe('story')
  expect(catalog.records[0].summary).toBeNull()
  expect(catalog.evidence).toHaveLength(1)
  expect(catalog.evidence[0].evidenceId).toContain(`story:${versionId}:`)
  await expect(t.query(api.ask.evidence.retrieveEvidence, { token: otherToken, threadId: thread.threadId, question: 'What was proposed?' })).rejects.toThrow('Thread is unavailable')
  await t.run(async ctx => {
    const version = (await ctx.db.get(versionId))!
    await ctx.db.patch(versionId, { spans: [...version.spans, { ...version.spans[0], key: 'unused-research', excerpt: 'Unreviewed proposed excerpt' }] })
  })
  expect((await t.query(api.ask.evidence.retrieveEvidenceByIds, { token, threadId: thread.threadId, evidenceIds: [`story:${versionId}:unused-research`] })).kind).toBe('no_evidence')
  await owner.mutation(api.stories.operations.withdraw, { storyId, expectedGeneration: 1, reason: 'Review the source.' })
  expect((await t.query(api.ask.evidence.retrieveEvidenceByIds, { token, threadId: thread.threadId, evidenceIds: [catalog.evidence[0].evidenceId] })).kind).toBe('no_evidence')
  await expect(t.mutation(api.ask.threads.createThread, { token, scope: { kind: 'story', storySlug: 'applied-digital-boyce' } })).rejects.toThrow('Story evidence is unavailable')
})

test('cross-story citations fail and a source change during generation prevents persistence', async () => {
  const { t, owner, args, storyId, snapshotId } = await setup()
  const versionId = await owner.mutation(api.stories.operations.approve, args)
  const token = 'story-race-session-000000000000000000000000000'
  await t.mutation(api.ask.threads.createSession, { token })
  const thread = await t.mutation(api.ask.threads.createThread, { token, scope: { kind: 'story', storySlug: 'applied-digital-boyce' } })
  const page = await t.query(internal.ask.evidence.retrieveCatalogPage, { token, threadId: thread.threadId, cursor: null })
  const evidenceId = page.catalog.evidence[0].evidenceId
  const otherVersionId = await t.run(async ctx => {
    const version = (await ctx.db.get(versionId))!
    const { _id: _versionId, _creationTime: _created, ...fields } = version
    const otherStoryId = await ctx.db.insert('stories', { storyKey: 'meta-richland', slug: 'meta-richland', rank: 0, state: 'active', generation: 1, createdAt: 1, updatedAt: 1 })
    const id = await ctx.db.insert('storyVersions', { ...fields, storyId: otherStoryId })
    await ctx.db.patch(otherStoryId, { currentVersionId: id })
    return id
  })
  expect((await t.query(api.ask.evidence.retrieveEvidenceByIds, { token, threadId: thread.threadId, evidenceIds: [evidenceId.replace(versionId, otherVersionId)] })).kind).toBe('no_evidence')
  const receiptId = await t.run(async ctx => {
    const mapping = (await ctx.db.query('askThreadAccess').withIndex('by_thread_id', q => q.eq('threadId', thread.threadId)).unique())!
    const id = await ctx.db.insert('askAnswerReceipts', { sessionId: mapping.sessionId, threadId: thread.threadId, questionMessageId: 'synthetic-question', state: 'running', attempt: 1, startedAt: Date.now(), corpusRevision: page.revision, selectorComplete: true, selectorEvidenceIds: [evidenceId] })
    const snapshot = (await ctx.db.get(snapshotId))!
    const { _id: _snapshotId, _creationTime: _created, ...fields } = snapshot
    await ctx.db.insert('sourceSnapshots', { ...fields, version: 2, previousSnapshotId: snapshotId })
    return id
  })
  await expect(t.mutation(internal.ask.ledger.persistAnswer, { receiptId, answerAttempt: 1, answer: { kind: 'answer', answer: 'A project was proposed.', evidenceIds: [evidenceId], followUps: [] } })).rejects.toThrow('Story evidence changed')
  expect((await owner.query(api.stories.operations.history, { storyId })).map(version => version._id)).toContain(versionId)
})

test('corpus Ask includes each shared story span once without broadening a local scope', async () => {
  const { t, owner, args } = await setup()
  const versionId = await owner.mutation(api.stories.operations.approve, args)
  await t.run(async ctx => {
    const version = (await ctx.db.get(versionId))!
    const { _id: _versionId, _creationTime: _created, ...fields } = version
    const storyId = await ctx.db.insert('stories', { storyKey: 'meta-richland', slug: 'meta-richland', rank: 0, state: 'active', generation: 1, createdAt: 1, updatedAt: 1 })
    const id = await ctx.db.insert('storyVersions', { ...fields, storyId })
    await ctx.db.patch(storyId, { currentVersionId: id })
    await ctx.db.insert('jurisdictions', { name: 'Lafayette Parish', slug: 'lafayette-parish', type: 'parish', state: 'LA', publicStatus: 'candidate' })
  })
  const token = 'story-corpus-session-00000000000000000000000000'
  await t.mutation(api.ask.threads.createSession, { token })
  const thread = await t.mutation(api.ask.threads.createThread, { token, scope: { kind: 'corpus' } })
  const page = await t.query(internal.ask.evidence.retrieveCatalogPage, { token, threadId: thread.threadId, cursor: null })
  expect(page.catalog.records.map(record => record.targetKind)).toEqual(['story'])
  expect(page.catalog.evidence).toHaveLength(1)
  const local = await t.mutation(api.ask.threads.createThread, { token, scope: { kind: 'corpus', areaKey: 'rapides-parish' } })
  expect((await t.query(api.ask.evidence.retrieveEvidence, { token, threadId: local.threadId, question: 'What was proposed?' })).evidence).toHaveLength(1)
  const unrelated = await t.mutation(api.ask.threads.createThread, { token, scope: { kind: 'corpus', areaKey: 'lafayette-parish' } })
  expect((await t.query(api.ask.evidence.retrieveEvidence, { token, threadId: unrelated.threadId, question: 'What was proposed?' })).evidence).toHaveLength(0)
  expect((await t.query(internal.ask.evidence.retrievePublishedDocumentRefs, { token, threadId: thread.threadId, evidenceIds: page.catalog.evidence.map(item => item.evidenceId) }))).toHaveLength(1)
})

test('Google story follows are idempotent and withdrawal prevents new enrollment', async () => {
  const { t, owner, args, storyId } = await setup()
  const target = { targetKind: 'story' as const, targetKey: 'applied-digital-boyce', cadence: 'both' as const }
  await expect(owner.mutation(api.follows.enrollment.createGoogleFollow, target)).rejects.toThrow('unavailable')
  await owner.mutation(api.stories.operations.approve, args)
  await expect(t.mutation(api.follows.enrollment.createGoogleFollow, target)).rejects.toThrow('Sign in with Google')
  await owner.mutation(api.follows.enrollment.createGoogleFollow, target)
  await owner.mutation(api.follows.enrollment.createGoogleFollow, target)
  expect(await owner.query(api.follows.enrollment.currentGoogleFollows, {})).toMatchObject([{ targetKind: 'story', targetKey: target.targetKey, cadence: 'both' }])
  await t.run(async ctx => { expect(await ctx.db.query('follows').collect()).toHaveLength(1) })
  await owner.mutation(api.stories.operations.withdraw, { storyId, expectedGeneration: 1, reason: 'Source review required.' })
  await expect(owner.mutation(api.follows.enrollment.createGoogleFollow, target)).rejects.toThrow('unavailable')
  const [follow] = await owner.query(api.follows.enrollment.currentGoogleFollows, {})
  await owner.mutation(api.follows.enrollment.removeGoogleFollow, { followId: follow.id as import('./_generated/dataModel').Id<'follows'> })
  expect(await owner.query(api.follows.enrollment.currentGoogleFollows, {})).toEqual([])
})

test('verified-email story follows use existing management and unsubscribe records', async () => {
  const { t, owner, args } = await setup()
  await owner.mutation(api.stories.operations.approve, args)
  await t.run(async ctx => {
    const subscriberId = await ctx.db.insert('emailSubscribers', { addressHash: 'synthetic-story-address', encryptedAddress: 'synthetic-fixture', encryptionVersion: 1, state: 'pending', createdAt: Date.now(), updatedAt: Date.now() })
    await ctx.db.insert('emailVerificationChallenges', { subscriberId, challengeId: 'story-challenge', codeHash: 'synthetic-code-hash', purpose: 'create_follow', targetKind: 'story', targetKey: 'applied-digital-boyce', cadence: 'both', expiresAt: Date.now() + 60_000, attempts: 0, createdAt: Date.now() })
  })
  const input = { challengeId: 'story-challenge', codeHash: 'synthetic-code-hash', managementTokenHash: 'story-management', unsubscribeTokenHash: 'story-unsubscribe' }
  expect(await t.mutation(internal.follows.enrollment.consumeEmailFollowChallenge, input)).toMatchObject({ status: 'verified', created: true, follow: { targetKind: 'story' } })
  expect(await t.mutation(internal.follows.enrollment.consumeEmailFollowChallenge, input)).toEqual({ status: 'replayed' })
  await t.mutation(internal.follows.management.updateEmailFollowWithToken, { tokenHash: 'story-management', cadence: 'weekly' })
  expect(await t.query(internal.follows.management.readManagement, { tokenHash: 'story-management', now: Date.now() })).toMatchObject({ status: 'valid', follows: [{ targetKind: 'story', cadence: 'weekly' }] })
  expect(await t.mutation(internal.follows.management.unsubscribeEmailWithToken, { tokenHash: 'story-unsubscribe' })).toEqual({ unsubscribed: true })
  await t.run(async ctx => {
    expect((await ctx.db.query('notificationPreferences').first())?.cadence).toBe('muted')
    expect((await ctx.db.query('emailSubscribers').first())?.state).toBe('unsubscribed')
    expect(await ctx.db.query('notificationDeliveries').collect()).toHaveLength(0)
  })
})
