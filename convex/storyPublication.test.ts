import { hashStoryValue } from './stories/hashing'
/// <reference types="vite/client" />
import { convexTest } from 'convex-test'
import workflowTest from '@convex-dev/workflow/test'
import agentTest from '@convex-dev/agent/test'
import agentmailTest from '@agentmail/convex/test'
import { afterEach, expect, test, vi } from 'vitest'
import example from '../docs/story-manifests/import-contract-v1.example.json'
import { api, internal } from './_generated/api'
import schema from './schema'
import { sha256HexOfText } from './sources/hashing'
import type { StoryManifest } from './stories/manifestTypes'
import { proposedSpans } from './stories/evidence'
import type { StoryDraft, StoryReview } from './stories/contracts'
import { claimDeliveryChanges, validUpdateReference } from './follows/updateEvents'
import { currentStoryUpdate, hasIndependentStoryChange, storyEvidenceChangeKey } from './stories/updates'
import { storyAskCatalog } from './stories/askEvidence'
import { hashAddress } from './follows/secrets'

const modules = import.meta.glob('./**/*.ts')
afterEach(() => vi.unstubAllEnvs())

// Synthetic failure fixtures. No model or provider call is represented by them.
async function setup() {
  vi.stubEnv('ADMIN_EMAIL', 'owner@example.com')
  vi.stubEnv('CONVEX_CLOUD_URL', 'https://woozy-wren-227.convex.cloud')
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

test('controlled roundup refuses unauthenticated callers, production, and an unverified recipient', async () => {
  const { t, owner } = await setup()
  vi.stubEnv('EMAIL_ADDRESS_HMAC_KEY', '11'.repeat(32))
  vi.stubEnv('CONVEX_SITE_URL', 'https://woozy-wren-227.convex.site')
  vi.stubEnv('AGENTMAIL_UPDATES_INBOX_ID', 'public-parish-development@agentmail.to')
  vi.stubEnv('AGENTMAIL_REPORTS_INBOX_ID', 'public-parish-reports@agentmail.to')
  await expect(t.mutation(api.operations.developmentProof.collectControlledStoryRoundup, {})).rejects.toThrow()
  await expect(owner.mutation(api.operations.developmentProof.collectControlledStoryRoundup, {})).rejects.toThrow('not verified')
  vi.stubEnv('CONVEX_SITE_URL', 'https://befitting-flamingo-587.convex.site')
  await expect(owner.mutation(api.operations.developmentProof.collectControlledStoryRoundup, {})).rejects.toThrow('unavailable')
  expect(await t.run(ctx => ctx.db.query('roundupWindows').collect())).toHaveLength(0)
})

test('historical accepted replay remains inspectable after a related target no longer resolves', async () => {
  const { t, owner, args, buildId } = await setup()
  await owner.mutation(api.stories.operations.approve, args)
  const original = await t.run(async ctx => {
    const build = (await ctx.db.get(buildId))!
    const imported = (await ctx.db.get(build.importId))!
    const manifest = JSON.parse(imported.manifestJson) as StoryManifest
    // Simulate a historical hint whose record is no longer available. The
    // already accepted receipt must remain inspectable without another workflow.
    manifest.sources[0].existingPublicationReferences = [{ kind: 'decision', stableKey: 'historical-record', versionHash: 'b'.repeat(64), sourceHash: manifest.sources[0].rawArtifact.sha256, citationKeys: [], environmentHint: null, idHint: null }]
    await ctx.db.patch(imported._id, { manifestJson: JSON.stringify(manifest) })
    return build
  })
  const replay = { importId: original.importId, bindings: original.sourceBindings, media: original.media, notificationIntent: 'baseline' as const }
  expect(await owner.mutation(internal.stories.buildLedger.begin, replay)).toBe(buildId)
  // A changed target is new work and must resolve before any workflow starts.
  await expect(owner.mutation(internal.stories.buildLedger.begin, { ...replay, publicationMappings: [{ sourceKey: original.sourceBindings[0].sourceKey, originRecordKey: 'historical-record', targetRecordKey: 'new-target', targetPayloadHash: 'c'.repeat(64) }] })).rejects.toThrow('does not resolve')
  expect(await t.run(ctx => ctx.db.query('storyBuilds').collect())).toHaveLength(1)
})

test('publication mapping preview is owner-only and rejects an unknown target', async () => {
  const { t, owner, buildId } = await setup()
  const build = (await t.run(ctx => ctx.db.get(buildId)))!
  const args = { importId: build.importId, bindings: build.sourceBindings, sourceKey: build.sourceBindings[0].sourceKey, originRecordKey: 'origin', targetRecordKey: 'missing' }
  await expect(t.query(api.stories.buildLedger.previewPublicationMapping, args)).rejects.toThrow('Sign in with Google')
  await expect(owner.query(api.stories.buildLedger.previewPublicationMapping, args)).rejects.toThrow('not published')
})

test('retained draft promotion keeps writing but requires a fresh review and target approval', async () => {
  vi.useFakeTimers()
  try {
    const { t, owner, args, buildId } = await setup()
    workflowTest.register(t)
    vi.stubEnv('CONVEX_SITE_URL', 'https://woozy-wren-227.convex.site')
    vi.stubEnv('STORY_ARTIFACT_TRANSFER_KEY', '1'.repeat(64))
    const request = { storyKey: 'applied-digital-boyce' as const, targetSite: 'https://woozy-wren-227.convex.site' }
    await expect(owner.query(api.stories.retainedDraft.exportDraft, request)).rejects.toThrow('current accepted')
    await owner.mutation(api.stories.operations.approve, args)
    await expect(t.query(api.stories.retainedDraft.exportDraft, request)).rejects.toThrow()
    const retained = await owner.query(api.stories.retainedDraft.exportDraft, request)
    const original = (await t.run(ctx => ctx.db.get(buildId)))!
    const begin = { importId: original.importId, bindings: original.sourceBindings, media: null, retainedDraft: retained, notificationIntent: 'baseline' as const }
    await expect(owner.mutation(internal.stories.buildLedger.begin, { ...begin, retainedDraft: { ...retained, packet: { ...retained.packet, targetSite: 'https://befitting-flamingo-587.convex.site' } } })).rejects.toThrow('target')
    await expect(owner.mutation(internal.stories.buildLedger.begin, { ...begin, retainedDraft: { ...retained, packet: { ...retained.packet, draftModel: 'forged-model' } } })).rejects.toThrow('signature')
    const id = await owner.mutation(internal.stories.buildLedger.begin, begin)
    expect(await owner.mutation(internal.stories.buildLedger.begin, begin)).toBe(id)
    await t.action(internal.stories.build.draft, { buildId: id })
    await t.run(async ctx => {
      const build = (await ctx.db.get(id))!
      expect(build.draftHash).toBe(original.draftHash)
      expect(build.draft).toEqual(original.draft)
      expect(build.state).toBe('drafted')
      expect(build.review).toBeUndefined()
      expect(build.reviewHash).toBeUndefined()
      expect(build.versionId).toBeUndefined()
      expect(build.retainedDraftReceipt?.signature).toBe(retained.signature)
      expect(await ctx.db.query('storyVersions').collect()).toHaveLength(1)
      expect(await ctx.db.query('storyUpdateEvents').collect()).toHaveLength(0)
    })
  } finally { vi.useRealTimers() }
})

test('a production custom domain preserves source and retained-draft deployment checks', async () => {
  vi.useFakeTimers()
  try {
    const { t, owner, args, buildId, snapshotId } = await setup()
    workflowTest.register(t)
    vi.stubEnv('CONVEX_SITE_URL', 'https://woozy-wren-227.convex.site')
    vi.stubEnv('STORY_ARTIFACT_TRANSFER_KEY', '1'.repeat(64))
    await owner.mutation(api.stories.operations.approve, args)
    const build = (await t.run(ctx => ctx.db.get(buildId)))!
    const imported = (await t.run(ctx => ctx.db.get(build.importId)))!
    const snapshot = (await t.run(ctx => ctx.db.get(snapshotId)))!
    const targetSite = 'https://befitting-flamingo-587.convex.site'
    const exported = await owner.action(api.stories.transfer.exportSource, { storyKey: 'applied-digital-boyce', sourceKey: build.sourceBindings[0].sourceKey, targetSite })
    const retained = await owner.query(api.stories.retainedDraft.exportDraft, { storyKey: 'applied-digital-boyce', targetSite })
    vi.stubEnv('CONVEX_CLOUD_URL', 'https://befitting-flamingo-587.convex.cloud')
    vi.stubEnv('CONVEX_SITE_URL', 'https://www.publicparish.com')
    expect(await owner.action(api.stories.transfer.importSource, { importId: imported._id, bundleHash: imported.bundleHash, packet: exported.packet, signature: exported.signature, rawStorageId: snapshot.rawStorageId, normalizedStorageId: snapshot.normalizedStorageId })).toEqual({ snapshotId, reused: true })
    const id = await owner.mutation(internal.stories.buildLedger.begin, { importId: imported._id, bindings: build.sourceBindings, media: null, retainedDraft: retained, notificationIntent: 'baseline' })
    const candidate = (await t.run(ctx => ctx.db.get(id)))!
    expect(candidate.draftHash).toBe(build.draftHash)
    expect(candidate.state).toBe('drafted')
    expect(candidate.versionId).toBeUndefined()
    vi.stubEnv('CONVEX_CLOUD_URL', 'https://woozy-wren-227.convex.cloud')
    await expect(owner.mutation(internal.stories.buildLedger.begin, { importId: imported._id, bindings: build.sourceBindings, media: null, retainedDraft: retained })).rejects.toThrow('target')
  } finally { vi.useRealTimers() }
})

test('accepted artifact transfer refuses other owners and changed bytes, then replays without publication or mail', async () => {
  const { t, owner, args, buildId, snapshotId } = await setup()
  vi.stubEnv('CONVEX_SITE_URL', 'https://woozy-wren-227.convex.site')
  vi.stubEnv('STORY_ARTIFACT_TRANSFER_KEY', '1'.repeat(64))
  await owner.mutation(api.stories.operations.approve, args)
  const context = await t.run(async ctx => {
    const build = (await ctx.db.get(buildId))!
    const imported = (await ctx.db.get(build.importId))!
    const snapshot = (await ctx.db.get(snapshotId))!
    return { importId: imported._id, bundleHash: imported.bundleHash, sourceKey: build.sourceBindings[0].sourceKey, rawStorageId: snapshot.rawStorageId, normalizedStorageId: snapshot.normalizedStorageId }
  })
  const request = { storyKey: 'applied-digital-boyce', sourceKey: context.sourceKey, targetSite: 'https://woozy-wren-227.convex.site' }
  await expect(t.action(api.stories.transfer.exportSource, request)).rejects.toThrow()
  const exported = await owner.action(api.stories.transfer.exportSource, request)
  const transfer = { importId: context.importId, bundleHash: context.bundleHash, packet: exported.packet, signature: exported.signature, rawStorageId: context.rawStorageId, normalizedStorageId: context.normalizedStorageId }
  await expect(t.action(api.stories.transfer.importSource, transfer)).rejects.toThrow()
  const wrong = await t.run(ctx => ctx.storage.store(new Blob(['different bytes'])))
  await expect(owner.action(api.stories.transfer.importSource, { ...transfer, rawStorageId: wrong })).rejects.toThrow('Transfer artifact')
  expect(await owner.action(api.stories.transfer.importSource, transfer)).toEqual({ snapshotId, reused: true })
  // Simulate a target missing the official source, with its uploaded bytes retained.
  await t.run(ctx => ctx.db.delete(snapshotId))
  const adopted = await owner.action(api.stories.transfer.importSource, transfer)
  expect(adopted.reused).toBe(false)
  expect(adopted.snapshotId).not.toBe(snapshotId)
  expect(await owner.action(api.stories.transfer.importSource, transfer)).toEqual({ ...adopted, reused: true })
  await t.run(async ctx => {
    expect(await ctx.db.query('storyArtifactTransfers').collect()).toHaveLength(1)
    expect(await ctx.db.query('storyVersions').collect()).toHaveLength(1)
    expect(await ctx.db.query('storyUpdateEvents').collect()).toHaveLength(0)
    expect(await ctx.db.query('notificationDeliveries').collect()).toHaveLength(0)
    expect((await ctx.db.get(adopted.snapshotId))?.retrievalTime).toBe(1)
    await ctx.db.patch(adopted.snapshotId, { normalizedContentHash: 'f'.repeat(64) })
  })
  await expect(owner.action(api.stories.transfer.importSource, transfer)).rejects.toThrow('different source evidence')
})

test('import replay selects an accepted receipt after an earlier withheld review', async () => {
  const { t, owner, args, buildId } = await setup()
  const original = (await t.run(ctx => ctx.db.get(buildId)))!
  const failedReview = { ...original.review!, verdict: 'fail' as const }
  const failedHash = await hashStoryValue(failedReview)
  await t.run(ctx => ctx.db.patch(buildId, { review: failedReview, reviewHash: failedHash }))
  await owner.mutation(api.stories.operations.approve, { ...args, reviewHash: failedHash })
  const acceptedId = await t.run(ctx => {
    const { _id: _id, _creationTime: _created, ...fields } = original
    return ctx.db.insert('storyBuilds', { ...fields, inputHash: 'b'.repeat(64) })
  })
  await owner.mutation(api.stories.operations.approve, { ...args, buildId: acceptedId, inputHash: 'b'.repeat(64) })
  const replay = await owner.mutation(internal.stories.buildLedger.begin, { importId: original.importId, bindings: original.sourceBindings, media: original.media })
  expect(replay).toBe(acceptedId)
  await t.run(async ctx => {
    expect((await ctx.db.get(buildId))?.state).toBe('withheld')
    expect(await ctx.db.query('storyBuilds').collect()).toHaveLength(2)
    expect(await ctx.db.query('storyUpdateEvents').collect()).toHaveLength(0)
  })
})

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
    await expect(owner.mutation(api.stories.buildLedger.retry, { buildId, inputHash: 'changed' })).rejects.toThrow('Retry inputs changed')
    expect(await owner.mutation(api.stories.buildLedger.retry, { buildId, inputHash: args.inputHash })).toBe(buildId)
    await t.run(async ctx => {
      const build = (await ctx.db.get(buildId))!
      expect(build.draftHash).toBe(args.draftHash)
      expect(build.retryCount).toBe(2)
      expect(build.state).toBe('drafted')
      await ctx.db.patch(buildId, { state: 'failed' })
    })
    await expect(owner.mutation(api.stories.buildLedger.retry, { buildId, inputHash: args.inputHash })).rejects.toThrow('allowance exhausted')
  } finally { vi.useRealTimers() }
})

test('owner correction creates one new unapproved candidate and preserves the original review', async () => {
  vi.useFakeTimers()
  try {
    const { t, owner, args, buildId } = await setup()
    workflowTest.register(t)
    const before = await t.run(ctx => ctx.db.get(buildId))
    const draft = { ...before!.draft!, title: { ...before!.draft!.title, text: 'The agency announced its proposal.' } }
    const correction = { parentBuildId: buildId, parentDraftHash: args.draftHash, expectedGeneration: 0, draft }
    await expect(t.mutation(api.stories.corrections.prepare, correction)).rejects.toThrow('Sign in with Google')
    const id = await owner.mutation(api.stories.corrections.prepare, correction)
    expect(await owner.mutation(api.stories.corrections.prepare, correction)).toBe(id)
    const corrected = await t.run(async ctx => {
      expect(await ctx.db.get(buildId)).toEqual(before)
      expect(await ctx.db.query('storyBuilds').collect()).toHaveLength(2)
      expect(await ctx.db.query('storyVersions').collect()).toHaveLength(0)
      expect(await ctx.db.query('storyUpdateEvents').collect()).toHaveLength(0)
      return (await ctx.db.get(id))!
    })
    expect(corrected.state).toBe('drafted')
    expect(corrected.reviewHash).toBeUndefined()
    expect(corrected.review).toBeUndefined()
    expect(corrected.draftProvenance).toEqual({ kind: 'owner_correction', parentBuildId: buildId, parentDraftHash: args.draftHash })
    await expect(owner.mutation(api.stories.operations.approve, { ...args, buildId: id, inputHash: corrected.inputHash, draftHash: corrected.draftHash! })).rejects.toThrow('Approval inputs changed')
  } finally { vi.useRealTimers() }
})

test('historical correction intent is explicit, immutable and separate from material update review', async () => {
  vi.useFakeTimers()
  try {
    const { t, owner, args, buildId } = await setup()
    workflowTest.register(t)
    await owner.mutation(api.stories.operations.approve, args)
    const parent = await t.run(ctx => ctx.db.get(buildId))
    const draft = { ...parent!.draft!, title: { ...parent!.draft!.title, text: 'Historical agency announcement.' } }
    const request = { parentBuildId: buildId, parentDraftHash: args.draftHash, expectedGeneration: 1, draft }
    const baseline = await owner.mutation(api.stories.corrections.prepare, { ...request, notificationIntent: 'baseline' })
    expect(await owner.mutation(api.stories.corrections.prepare, { ...request, notificationIntent: 'baseline' })).toBe(baseline)
    const update = await owner.mutation(api.stories.corrections.prepare, request)
    const rows = await t.run(async ctx => ({ baseline: await ctx.db.get(baseline), update: await ctx.db.get(update) }))
    expect(rows.baseline?.notificationIntent).toBe('baseline')
    expect(rows.update?.notificationIntent).toBe('update')
    expect(rows.baseline?.inputHash).not.toBe(rows.update?.inputHash)
    expect(rows.baseline?.review).toBeUndefined()
  } finally { vi.useRealTimers() }
})

test('draft corrections refuse changed parents, cross-story citations and version races', async () => {
  const { t, owner, args, buildId, storyId } = await setup()
  const parent = await t.run(ctx => ctx.db.get(buildId))
  const draft = { ...parent!.draft!, title: { ...parent!.draft!.title, text: 'A corrected proposal title' } }
  const correction = { parentBuildId: buildId, parentDraftHash: args.draftHash, expectedGeneration: 0, draft }
  await expect(owner.mutation(api.stories.corrections.prepare, { ...correction, parentDraftHash: 'changed' })).rejects.toThrow('inputs changed')
  await expect(owner.mutation(api.stories.corrections.prepare, { ...correction, draft: { ...draft, title: { ...draft.title, evidenceKeys: ['other-story:0:1'] } } })).rejects.toThrow('unsupported')
  await t.run(ctx => ctx.db.patch(storyId, { generation: 1 }))
  await expect(owner.mutation(api.stories.corrections.prepare, correction)).rejects.toThrow('generation changed')
  expect(await t.run(ctx => ctx.db.query('storyBuilds').collect())).toHaveLength(1)
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
  await owner.mutation(api.follows.enrollment.removeGoogleFollow, { followId: follow.id })
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

async function revision(fixture: Awaited<ReturnType<typeof setup>>, kind: 'material' | 'cosmetic', intent: 'baseline' | 'update') {
  const args = await fixture.t.run(async ctx => {
    const story = (await ctx.db.get(fixture.storyId))!
    const previous = (await ctx.db.get(story.currentVersionId!))!
    const original = (await ctx.db.get(fixture.buildId))!
    const { _id: _buildId, _creationTime: _created, versionId: _versionId, ...fields } = original
    const draft = { ...original.draft!, summary: { ...original.draft!.summary, text: `Synthetic reviewed revision ${story.generation}.` } }
    const draftHash = await hashStoryValue(draft)
    const review: StoryReview = { ...original.review!, changeAssessment: { kind, previousDraftHash: previous.draftHash, reason: 'Synthetic classification for notification regression.' } }
    const reviewHash = await hashStoryValue(review)
    const inputHash = await hashStoryValue({ generation: story.generation, draftHash, reviewHash, intent })
    const buildId = await ctx.db.insert('storyBuilds', { ...fields, state: 'reviewed', expectedGeneration: story.generation, notificationIntent: intent, draft, draftHash, review, reviewHash, inputHash })
    return { buildId, inputHash, draftHash, reviewHash, expectedGeneration: story.generation }
  })
  return { args, versionId: await fixture.owner.mutation(api.stories.operations.approve, args) }
}

test('approved story updates are atomic and baseline, cosmetic and replay do not flood follows', async () => {
  vi.useFakeTimers()
  try {
    const fixture = await setup()
    await fixture.owner.mutation(api.stories.operations.approve, fixture.args)
    await revision(fixture, 'cosmetic', 'update')
    await revision(fixture, 'material', 'baseline')
    await fixture.t.run(async ctx => { expect(await ctx.db.query('storyUpdateEvents').collect()).toHaveLength(0) })
    const material = await revision(fixture, 'material', 'update')
    expect(await fixture.owner.mutation(api.stories.operations.approve, material.args)).toBe(material.versionId)
    await fixture.t.run(async ctx => {
      const events = await ctx.db.query('storyUpdateEvents').collect()
      expect(events).toHaveLength(1)
      expect(events[0].currentVersionId).toBe(material.versionId)
      expect((await ctx.db.get(fixture.storyId))?.currentVersionId).toBe(material.versionId)
      expect((await ctx.db.query('notificationFanouts').first())?.phase).toBe('story')
      expect(await ctx.db.query('materialChanges').collect()).toHaveLength(0)
      expect(await ctx.db.query('notificationDeliveries').collect()).toHaveLength(0)
    })
  } finally { vi.useRealTimers() }
})

test('overlapping notification claims deduplicate per owner and cadence', async () => {
  const { t } = await setup()
  await t.run(async ctx => {
    const fields = { ownerKind: 'google' as const, ownerKey: 'google:synthetic-owner', kind: 'immediate' as const, state: 'reserved' as const, enqueueAttempts: 0, reconcileAttempts: 0, createdAt: 1, updatedAt: 1 }
    const first = (await ctx.db.get(await ctx.db.insert('notificationDeliveries', fields)))!
    const second = (await ctx.db.get(await ctx.db.insert('notificationDeliveries', fields)))!
    const other = (await ctx.db.get(await ctx.db.insert('notificationDeliveries', { ...fields, ownerKey: 'google:another-owner' })))!
    expect(await claimDeliveryChanges(ctx, first, ['same-underlying-approved-change'])).toBe(true)
    expect(await claimDeliveryChanges(ctx, first, ['same-underlying-approved-change'])).toBe(true)
    expect(await claimDeliveryChanges(ctx, second, ['same-underlying-approved-change'])).toBe(false)
    expect(await claimDeliveryChanges(ctx, other, ['same-underlying-approved-change'])).toBe(true)
    expect(await ctx.db.query('notificationChangeClaims').collect()).toHaveLength(2)
  })
  expect(validUpdateReference({})).toBe(false)
})

test('cosmetic revisions retain pending material delivery and a later baseline invalidates it', async () => {
  vi.useFakeTimers()
  try {
    const fixture = await setup()
    await fixture.owner.mutation(api.stories.operations.approve, fixture.args)
    await revision(fixture, 'material', 'update')
    const eventId = await fixture.t.run(async ctx => (await ctx.db.query('storyUpdateEvents').first())!._id)
    const cosmetic = await revision(fixture, 'cosmetic', 'update')
    await fixture.t.run(async ctx => {
      expect((await currentStoryUpdate(ctx, eventId))?.version._id).toBe(cosmetic.versionId)
      expect(await ctx.db.query('storyUpdateEvents').collect()).toHaveLength(1)
    })
    await revision(fixture, 'material', 'baseline')
    await fixture.t.run(async ctx => { expect(await currentStoryUpdate(ctx, eventId)).toBeNull() })
  } finally { vi.useRealTimers() }
})

test('owner intake reuses saved artifacts and exposes normalization changes without retrieval', async () => {
  const { t, owner, buildId, snapshotId } = await setup()
  const imported = await t.run(async ctx => {
    const build = (await ctx.db.get(buildId))!
    return (await ctx.db.get(build.importId))!
  })
  await expect(t.query(api.stories.intake.sources, { importId: imported._id })).rejects.toThrow('Sign in with Google')
  expect((await owner.query(api.stories.intake.sources, { importId: imported._id }))[0].status).toBe('ready')
  const sourceKey = JSON.parse(imported.manifestJson).sources[0].sourceKey as string
  expect(await owner.action(api.stories.intake.retrieve, { importId: imported._id, bundleHash: imported.bundleHash, sourceKey })).toContain('No retrieval call')
  await t.run(async ctx => { await ctx.db.patch(snapshotId, { normalizedContentHash: 'f'.repeat(64) }) })
  expect((await owner.query(api.stories.intake.sources, { importId: imported._id }))[0].status).toBe('normalization_changed')
  await t.run(async ctx => { expect(await ctx.db.query('storySourceRetrievals').collect()).toHaveLength(0) })
})

test('source retrieval has two attempts and rejects stale completion', async () => {
  const { t, owner, buildId, snapshotId } = await setup()
  const input = await t.run(async ctx => {
    const build = (await ctx.db.get(buildId))!
    const imported = (await ctx.db.get(build.importId))!
    await ctx.db.patch(snapshotId, { truncation: { truncated: true } })
    return { importId: imported._id, sourceKey: JSON.parse(imported.manifestJson).sources[0].sourceKey as string, bundleHash: imported.bundleHash }
  })
  const first = await owner.mutation(internal.stories.intake.beginRetrieval, input)
  await expect(owner.mutation(internal.stories.intake.beginRetrieval, input)).rejects.toThrow('already running')
  await t.mutation(internal.stories.intake.finishRetrieval, { receiptId: first.receiptId!, attempt: first.attempt, error: 'Synthetic retrieval failure' })
  const second = await owner.mutation(internal.stories.intake.beginRetrieval, input)
  await expect(t.mutation(internal.stories.intake.finishRetrieval, { receiptId: first.receiptId!, attempt: first.attempt, snapshotId })).rejects.toThrow('attempt changed')
  await t.mutation(internal.stories.intake.finishRetrieval, { receiptId: second.receiptId!, attempt: second.attempt, error: 'Synthetic second failure' })
  await expect(owner.mutation(internal.stories.intake.beginRetrieval, input)).rejects.toThrow('attempts exhausted')
})

test('a missing retained artifact blocks paid retrieval instead of claiming reuse', async () => {
  const { t, owner, buildId, rawStorageId } = await setup()
  const input = await t.run(async ctx => {
    const build = (await ctx.db.get(buildId))!
    const imported = (await ctx.db.get(build.importId))!
    await ctx.storage.delete(rawStorageId)
    return { importId: imported._id, sourceKey: JSON.parse(imported.manifestJson).sources[0].sourceKey as string, bundleHash: imported.bundleHash }
  })
  expect((await owner.query(api.stories.intake.sources, { importId: input.importId }))[0].status).toBe('artifact_missing')
  await expect(owner.action(api.stories.intake.retrieve, input)).rejects.toThrow('Saved artifact is missing')
  await t.run(async ctx => { expect(await ctx.db.query('storySourceRetrievals').collect()).toHaveLength(0) })
})

async function storyReplyFixture() {
  const fixture = await setup()
  vi.stubEnv('CONVEX_SITE_URL', 'https://example.convex.site')
  vi.stubEnv('AGENTMAIL_API_KEY', 'synthetic-agentmail-key')
  vi.stubEnv('AGENTMAIL_UPDATES_INBOX_ID', 'updates-test')
  vi.stubEnv('EMAIL_ADDRESS_HMAC_KEY', 'dGVzdC1obWFjLWtleQ==')
  vi.stubEnv('EMAIL_ENCRYPTION_KEY', 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=')
  agentmailTest.register(fixture.t)
  await fixture.owner.mutation(api.stories.operations.approve, fixture.args)
  await fixture.owner.mutation(api.follows.enrollment.createGoogleFollow, { targetKind: 'story', targetKey: 'applied-digital-boyce', cadence: 'both' })
  await revision(fixture, 'material', 'update')
  const ids = await fixture.t.run(async ctx => {
    const update = (await ctx.db.query('storyUpdateEvents').first())!
    const ownerKey = `google:${fixture.ownerId}`
    const deliveryId = await ctx.db.insert('notificationDeliveries', { ownerKind: 'google', ownerKey, kind: 'immediate', storyUpdateId: update._id, state: 'delivered', agentmailThreadId: 'synthetic-story-provider-thread', enqueueAttempts: 1, reconcileAttempts: 1, createdAt: 1, updatedAt: 1 })
    const replyThreadId = await ctx.db.insert('emailReplyThreads', { agentmailThreadId: 'synthetic-story-provider-thread', notificationDeliveryId: deliveryId, scopeKind: 'story', scopeKey: 'applied-digital-boyce', ownerKind: 'google', ownerKey, createdAt: 1, updatedAt: 1 })
    const eventId = await ctx.db.insert('emailReplyEvents', { providerEventId: 'synthetic-running-story-reply', agentmailThreadId: 'synthetic-story-provider-thread', inboundMessageId: 'synthetic-inbound-story-message', inboundInboxId: 'updates-test', senderHash: await hashAddress('owner@example.com'), replyThreadId, state: 'running', preparationAttempts: 1, attempt: 1, startedAt: Date.now(), createdAt: 1, updatedAt: 1 })
    const catalog = await storyAskCatalog(ctx, { kind: 'story', storySlug: 'applied-digital-boyce' })
    return { eventId, deliveryId, replyThreadId, evidenceIds: catalog.sources.map(source => source.evidence.evidenceId) }
  })
  return { ...fixture, ...ids }
}

test('story reply enqueue accepts actual Ask citation IDs and rejects replay', async () => {
  vi.useFakeTimers()
  try {
    const fixture = await storyReplyFixture()
    const args = { eventId: fixture.eventId, attempt: 1, answerMessageId: 'synthetic-answer', kind: 'answer' as const, text: 'Synthetic grounded answer for the component enqueue test.', evidenceIds: fixture.evidenceIds }
    expect(args.evidenceIds).not.toHaveLength(0)
    await fixture.t.mutation(internal.emailReplies.delivery.completeAnswer, args)
    const first = await fixture.t.run(ctx => ctx.db.get(fixture.eventId))
    expect(first?.state).toBe('answered')
    expect(first?.outboundId).toBeDefined()
    await fixture.t.mutation(internal.emailReplies.delivery.completeAnswer, args)
    expect((await fixture.t.run(ctx => ctx.db.get(fixture.eventId)))?.outboundId).toBe(first?.outboundId)
  } finally { vi.useRealTimers() }
})

test.each(['wrong citation', 'changed sender', 'withdrawn story', 'unfollowed'] as const)('story reply enqueue refuses %s', async reason => {
  vi.useFakeTimers()
  try {
    const fixture = await storyReplyFixture()
    if (reason === 'changed sender') await fixture.t.run(async ctx => { await ctx.db.patch(fixture.ownerId, { email: 'changed@example.com' }) })
    if (reason === 'withdrawn story') await fixture.owner.mutation(api.stories.operations.withdraw, { storyId: fixture.storyId, expectedGeneration: 2, reason: 'Synthetic withdrawal regression.' })
    if (reason === 'unfollowed') {
      const [follow] = await fixture.owner.query(api.follows.enrollment.currentGoogleFollows, {})
      await fixture.owner.mutation(api.follows.enrollment.removeGoogleFollow, { followId: follow.id })
    }
    await fixture.t.mutation(internal.emailReplies.delivery.completeAnswer, { eventId: fixture.eventId, attempt: 1, answerMessageId: 'synthetic-refused-answer', kind: 'answer', text: 'Must never be queued.', evidenceIds: reason === 'wrong citation' ? ['story:another-version:another-span'] : fixture.evidenceIds })
    const event = await fixture.t.run(ctx => ctx.db.get(fixture.eventId))
    expect(event?.state).toBe('ignored')
    expect(event?.outboundId).toBeUndefined()
  } finally { vi.useRealTimers() }
})

test('a reused provider thread binds to the latest delivery without duplicating an inbound message', async () => {
  vi.useFakeTimers()
  try {
    const fixture = await storyReplyFixture()
    const latestDeliveryId = await fixture.t.run(async ctx => {
      const old = (await ctx.db.get(fixture.deliveryId))!
      const { _id: _deliveryId, _creationTime: _created, ...fields } = old
      return ctx.db.insert('notificationDeliveries', { ...fields, createdAt: Date.now() })
    })
    const message = { inbox_id: 'updates-test', thread_id: 'synthetic-story-provider-thread', message_id: 'synthetic-new-provider-message', from: 'owner@example.com', extracted_text: 'What did the official source announce?' }
    await fixture.t.mutation(internal.emailReplies.intake.onMessageReceived, { eventId: 'synthetic-provider-callback-1', message })
    await fixture.t.mutation(internal.emailReplies.intake.onMessageReceived, { eventId: 'synthetic-provider-callback-2', message })
    await fixture.t.run(async ctx => {
      expect((await ctx.db.get(fixture.replyThreadId))?.notificationDeliveryId).toBe(latestDeliveryId)
      const rows = await ctx.db.query('emailReplyEvents').withIndex('by_inbox_and_message', q => q.eq('inboundInboxId', 'updates-test').eq('inboundMessageId', message.message_id)).collect()
      expect(rows).toHaveLength(1)
      expect(rows[0].state).toBe('queued')
    })
  } finally { vi.useRealTimers() }
})

test('interrupted story matching resumes only stale pages and retains its cursor', async () => {
  vi.useFakeTimers()
  try {
    const fixture = await setup()
    await fixture.owner.mutation(api.stories.operations.approve, fixture.args)
    await revision(fixture, 'material', 'update')
    expect(await fixture.t.mutation(internal.stories.updates.recover, {})).toBe(0)
    const fanoutId = await fixture.t.run(async ctx => {
      const fanout = (await ctx.db.query('notificationFanouts').first())!
      await ctx.db.patch(fanout._id, { updatedAt: Date.now() - 6 * 60_000, cursor: 'synthetic-resume-cursor' })
      return fanout._id
    })
    expect(await fixture.t.mutation(internal.stories.updates.recover, {})).toBe(1)
    expect(await fixture.t.mutation(internal.stories.updates.recover, {})).toBe(0)
    await fixture.t.run(async ctx => {
      expect((await ctx.db.get(fanoutId))?.cursor).toBe('synthetic-resume-cursor')
      expect(await ctx.db.query('storyUpdateEvents').collect()).toHaveLength(1)
      expect(await ctx.db.query('notificationDeliveries').collect()).toHaveLength(0)
    })
  } finally { vi.useRealTimers() }
})


test('replaying an older accepted import preserves the latest story without model work', async () => {
  const fixture = await setup()
  await fixture.owner.mutation(api.stories.operations.approve, fixture.args)
  const latest = await revision(fixture, 'cosmetic', 'baseline')
  const replayArgs = await fixture.t.run(async ctx => {
    const original = (await ctx.db.get(fixture.buildId))!
    const imported = (await ctx.db.get(original.importId))!
    const { _id: _importId, _creationTime: _created, ...fields } = imported
    const laterImportId = await ctx.db.insert('storyImports', { ...fields, bundleVersion: 2, bundleHash: 'f'.repeat(64) })
    await ctx.db.patch(latest.args.buildId, { importId: laterImportId })
    return { importId: original.importId, bindings: original.sourceBindings, media: original.media, notificationIntent: 'baseline' as const }
  })
  const before = await fixture.t.run(async ctx => ({ builds: (await ctx.db.query('storyBuilds').collect()).length, runs: (await ctx.db.query('pipelineRuns').collect()).length }))
  expect(await fixture.owner.mutation(internal.stories.buildLedger.begin, replayArgs)).toBe(fixture.buildId)
  await fixture.t.run(async ctx => {
    expect((await ctx.db.get(fixture.storyId))?.currentVersionId).toBe(latest.versionId)
    expect(await ctx.db.query('storyBuilds').collect()).toHaveLength(before.builds)
    expect(await ctx.db.query('pipelineRuns').collect()).toHaveLength(before.runs)
    expect(await ctx.db.query('storyUpdateEvents').collect()).toHaveLength(0)
    expect(await ctx.db.query('notificationDeliveries').collect()).toHaveLength(0)
  })
})


test('a local notification only covers a story revision when every changed excerpt is shared', async () => {
  const fixture = await setup()
  const versionId = await fixture.owner.mutation(api.stories.operations.approve, fixture.args)
  await fixture.t.run(async ctx => {
    const previous = (await ctx.db.get(versionId))!
    const shared = { ...previous.spans[0], key: 'shared-new-evidence', excerpt: 'A new official decision.' }
    const independent = { ...previous.spans[0], key: 'story-only-evidence', excerpt: 'A separate project fact.' }
    const updated = { ...previous, draftHash: 'b'.repeat(64), spans: [shared], payload: { ...previous.payload, summary: { text: 'The decision changed.', evidenceKeys: [shared.key] }, title: { text: 'Decision update', evidenceKeys: [shared.key] } } }
    const covered = new Set([storyEvidenceChangeKey(previous.spans[0].snapshotId, previous.spans[0].excerpt), storyEvidenceChangeKey(shared.snapshotId, 'A  new official decision.')])
    expect(hasIndependentStoryChange(previous, updated, covered)).toBe(false)
    const mixed = { ...updated, spans: [shared, independent], payload: { ...updated.payload, sections: [{ heading: 'Government actions', statements: [{ text: 'A separate fact changed.', evidenceKeys: [independent.key] }] }] } }
    expect(hasIndependentStoryChange(previous, mixed, covered)).toBe(true)
    expect(hasIndependentStoryChange(previous, { ...previous, draftHash: 'c'.repeat(64) }, covered)).toBe(true)
  })
})
