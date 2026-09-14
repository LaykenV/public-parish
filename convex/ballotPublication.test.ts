/// <reference types="vite/client" />
import { convexTest } from 'convex-test'
import type { TestConvex } from 'convex-test'
import type { FunctionReference } from 'convex/server'
import staticHostingTest from '@convex-dev/static-hosting/test'
import { afterEach, expect, test, vi } from 'vitest'
import schema from './schema'
import { api, components, internal } from './_generated/api'
import example from '../docs/story-manifests/import-contract-v1.example.json'
import type { StoryManifest } from './stories/manifestTypes'
import type { StoryDraft, StoryReview } from './stories/contracts'
import { reviewPaths } from './stories/contracts'
import { proposedSpans } from './stories/evidence'
import { hashStoryValue } from './stories/hashing'
import { sha256HexOfText } from './sources/hashing'
import { storyAskCatalog } from './stories/askEvidence'

const modules = import.meta.glob('./**/*.ts')
afterEach(() => vi.unstubAllEnvs())

// Synthetic publication failure cases. These fixtures never call a provider.
async function setupMeasure() {
  vi.stubEnv('ADMIN_EMAIL', 'owner@example.com')
  const t = convexTest(schema, modules)
  const question = 'Do you support an amendment to allow a one-time transfer?'
  const texts = [`Proposed Amendment No. 1\n${question}`, 'Synthetic Act. A one-time transfer would be permitted if approved.']
  const manifest = structuredClone(example) as StoryManifest
  manifest.contractVersion = '2.0.0'
  manifest.purpose = 'research'
  manifest.story = { ...manifest.story, storyKey: '2026-amendment-1', slug: '2026-amendment-1', rank: 101, placement: 'ballot', geography: [{ ...manifest.story.geography[0], parish: 'Louisiana' }] }
  manifest.media = []
  manifest.research.claims = []
  manifest.research.relationships = []
  manifest.research.timeline = []
  manifest.research.supportedQuestions = []
  manifest.sources = ['louisiana-secretary-of-state', 'louisiana-legislature'].map((bodyKey, i) => ({ ...structuredClone(manifest.sources[0]), sourceKey: i ? 'act' : 'sos', bodyKey, bodyName: bodyKey, existingPublicationReferences: [] }))
  const fixture = await t.run(async ctx => {
    const ownerId = await ctx.db.insert('users', { googleAccountId: 'owner', email: 'owner@example.com', emailVerified: true, createdAt: 1, updatedAt: 1, lastSignedInAt: 1 })
    const jurisdictionId = await ctx.db.insert('jurisdictions', { slug: 'louisiana', name: 'Louisiana', type: 'state', state: 'LA', publicStatus: 'candidate' })
    const sources = []
    for (const [i, source] of manifest.sources.entries()) {
      const text = texts[i]
      const hash = await sha256HexOfText(text)
      const bytes = new TextEncoder().encode(text).byteLength
      source.rawArtifact = { ...source.rawArtifact, sha256: hash, bytes }
      source.normalizedArtifact = { ...source.normalizedArtifact, sha256: hash, bytes }
      source.retrieval.pageMap = []
      const governmentBodyId = await ctx.db.insert('governmentBodies', { jurisdictionId, slug: source.bodyKey, name: source.bodyName, bodyType: 'other', publicStatus: 'candidate' })
      const registryId = await ctx.db.insert('sourceRegistries', { governmentBodyId, officialDomains: ['example.invalid'], seedUrls: [source.url], sourceKinds: ['other'], expectedCadence: { kind: 'unknown' }, discoveryMode: 'dynamic', status: 'candidate' })
      const storageId = await ctx.storage.store(new Blob([text]))
      const snapshotId = await ctx.db.insert('sourceSnapshots', { registryId, canonicalUrl: source.url, retrievedUrl: source.finalUrl, contentHash: hash, contentHashBasis: 'raw_artifact_v2', normalizedContentHash: hash, contentType: 'text/plain', retrievalTime: 1, version: 1, rawStorageId: storageId, normalizedStorageId: storageId, rawContentType: 'text/plain', normalizedContentType: 'text/plain', rawByteLength: bytes, normalizedByteLength: bytes, truncation: { truncated: false }, firecrawlMetadata: {} })
      const support = { sourceKey: source.sourceKey, normalizedSha256: hash, start: 0, end: text.length, excerpt: text, page: null, section: null }
      manifest.research.claims.push({ claimKey: i ? 'act' : 'measure-identity', text, supports: [support] })
      if (!i) manifest.research.claims.push({ claimKey: 'ballot-question', text: question, supports: [{ ...support, start: text.indexOf(question), excerpt: question }] })
      sources.push({ source, snapshot: (await ctx.db.get(snapshotId))! })
    }
    const spans = proposedSpans(manifest, sources)
    const statement = { text: question, evidenceKeys: [spans.find(s => s.excerpt === question)!.key] }
    const draft: StoryDraft = { title: statement, summary: statement, sections: ['Ballot question', 'What would change', 'Who it applies to', 'Effective date'].map(heading => ({ heading, statements: [statement] })), timeline: [], nextAction: null, limitations: [] }
    const review: StoryReview = { verdict: 'pass', limitations: [], checks: reviewPaths(draft, null).map(path => ({ path, assessment: 'supported', reason: 'Synthetic supported fixture.' })) }
    const draftHash = await hashStoryValue(draft), reviewHash = await hashStoryValue(review)
    const storyId = await ctx.db.insert('stories', { storyKey: '2026-amendment-1', slug: '2026-amendment-1', rank: 101, state: 'unpublished', generation: 0, createdAt: 1, updatedAt: 1 })
    const manifestJson = JSON.stringify(manifest)
    const importId = await ctx.db.insert('storyImports', { storyKey: '2026-amendment-1', bundleKey: manifest.bundleKey, bundleVersion: 1, contractVersion: '2.0.0', bundleHash: await sha256HexOfText(manifestJson), manifestJson, state: 'staged', blockers: [], stagedBy: ownerId, createdAt: 1 })
    const runId = await ctx.db.insert('pipelineRuns', { registryId: sources[0].snapshot.registryId, trigger: 'manual_story_build', state: 'succeeded', processorVersion: 'story-v1', startedAt: 1 })
    const buildId = await ctx.db.insert('storyBuilds', { importId, storyId, expectedGeneration: 0, inputHash: 'a'.repeat(64), sourceBindings: sources.map(s => ({ sourceKey: s.source.sourceKey, snapshotId: s.snapshot._id })), spans, relatedPublications: [], media: null, state: 'reviewed', draft, draftHash, draftModel: 'strong-fixture', review, reviewHash, reviewModel: 'fast-fixture', runId, notificationIntent: 'baseline', startedBy: ownerId, createdAt: 1 })
    return { storyId, ownerId, storageId: sources[0].snapshot.rawStorageId, args: { buildId, inputHash: 'a'.repeat(64), draftHash, reviewHash, expectedGeneration: 0 } }
  })
  return { t, owner: t.withIdentity({ subject: fixture.ownerId }), ...fixture }
}

test('a measure requires exact owner approval, stays separate from featured stories, and loses Ask and follows on withdrawal', async () => {
  const { t, owner, args, storyId } = await setupMeasure()
  await expect(t.mutation(api.stories.operations.approve, args)).rejects.toThrow('Sign in with Google')
  await expect(owner.mutation(api.stories.operations.approve, { ...args, draftHash: 'b'.repeat(64) })).rejects.toThrow('inputs changed')
  expect(await t.query(api.stories.resident.ballotMeasures, {})).toEqual([])
  await owner.mutation(api.stories.operations.approve, args)
  expect(await t.query(api.stories.resident.ballotMeasures, {})).toHaveLength(1)
  expect(await t.query(api.stories.resident.featured, {})).toEqual([])
  const catalog = await t.run(ctx => storyAskCatalog(ctx, { kind: 'story', storySlug: '2026-amendment-1' }))
  expect(catalog.sources.length).toBeGreaterThan(0)
  expect(catalog.sources.every(s => s.evidence.sourceHref.startsWith('/ballot/2026-amendment-1#'))).toBe(true)
  const target = { targetKind: 'story' as const, targetKey: '2026-amendment-1', cadence: 'both' as const }
  await owner.mutation(api.follows.enrollment.createGoogleFollow, target)
  await owner.mutation(api.follows.enrollment.createGoogleFollow, target)
  const follows = await owner.query(api.follows.enrollment.currentGoogleFollows, {})
  expect(follows).toHaveLength(1)
  await owner.mutation(api.stories.operations.withdraw, { storyId, expectedGeneration: 1, reason: 'Synthetic evidence correction.' })
  expect(await t.query(api.stories.resident.ballotMeasures, {})).toEqual([])
  expect((await t.run(ctx => storyAskCatalog(ctx, { kind: 'story', storySlug: '2026-amendment-1' }))).sources).toEqual([])
  await expect(owner.mutation(api.follows.enrollment.createGoogleFollow, target)).rejects.toThrow('unavailable')
  await owner.mutation(api.follows.enrollment.removeGoogleFollow, { followId: follows[0].id })
  expect(await owner.query(api.follows.enrollment.currentGoogleFollows, {})).toEqual([])
  expect(await t.run(ctx => ctx.db.query('notificationDeliveries').collect())).toEqual([])
})

test('measure email follows reuse verification, management and unsubscribe without sending a baseline alert', async () => {
  const { t, owner, args } = await setupMeasure()
  await owner.mutation(api.stories.operations.approve, args)
  await t.run(async ctx => {
    const subscriberId = await ctx.db.insert('emailSubscribers', { addressHash: 'synthetic-address', encryptedAddress: 'synthetic-fixture', encryptionVersion: 1, state: 'pending', createdAt: Date.now(), updatedAt: Date.now() })
    await ctx.db.insert('emailVerificationChallenges', { subscriberId, challengeId: 'measure-challenge', codeHash: 'synthetic-code', purpose: 'create_follow', targetKind: 'story', targetKey: '2026-amendment-1', cadence: 'both', expiresAt: Date.now() + 60_000, attempts: 0, createdAt: Date.now() })
  })
  expect(await t.mutation(internal.follows.enrollment.consumeEmailFollowChallenge, { challengeId: 'measure-challenge', codeHash: 'synthetic-code', managementTokenHash: 'measure-management', unsubscribeTokenHash: 'measure-unsubscribe' })).toMatchObject({ status: 'verified', created: true })
  await t.mutation(internal.follows.management.updateEmailFollowWithToken, { tokenHash: 'measure-management', cadence: 'weekly' })
  expect(await t.query(internal.follows.management.readManagement, { tokenHash: 'measure-management', now: Date.now() })).toMatchObject({ status: 'valid', follows: [{ targetKind: 'story', cadence: 'weekly' }] })
  expect(await t.mutation(internal.follows.management.unsubscribeEmailWithToken, { tokenHash: 'measure-unsubscribe' })).toEqual({ unsubscribed: true })
  expect(await t.run(ctx => ctx.db.query('notificationDeliveries').collect())).toEqual([])
})


const appShell = '<html><head><title>Generic Home</title><meta name="description" content="Generic Home"><meta property="og:image" content="/old-image.png"><script type="module" src="/assets/app.js"></script></head><body><div id="root"></div></body></html>'

async function installShareShell(t: TestConvex<typeof schema>) {
  staticHostingTest.register(t)
  await t.run(async ctx => {
    const storageId = await ctx.storage.store(new Blob([appShell], { type: 'text/html' }))
    // The component keeps upload mutations out of its app-facing API. Tests
    // seed its real asset table through the installed internal mutation.
    const recordAsset = (components.staticHosting.lib as unknown as { recordAsset: FunctionReference<'mutation'> }).recordAsset
    await ctx.runMutation(recordAsset, { path: '/index.html', storageId, contentType: 'text/html', deploymentId: 'sharing-test' })
  })
}

for (const origin of ['https://www.publicparish.com', 'https://befitting-flamingo-587.convex.site']) {
  test(`ballot HTTP guide metadata and canonical redirects at ${origin}`, async () => {
    vi.stubEnv('CONVEX_SITE_URL', origin)
    const t = convexTest(schema, modules)
    await installShareShell(t)
    const slash = await t.fetch('/ballot/?source=launch')
    expect(slash.status).toBe(302)
    expect(slash.headers.get('Location')).toBe(`${origin}/ballot?source=launch`)
    expect(slash.headers.get('Cache-Control')).toBe('no-store')
    const response = await t.fetch('/ballot?source=launch', { headers: { 'User-Agent': 'facebookexternalhit/1.1' } })
    expect(response.status).toBe(200)
    const html = await response.text()
    expect(html).toContain('<title>Louisiana ballot guide, November 3, 2026 | Public Parish</title>')
    expect(html).toContain('property="og:title" content="Louisiana ballot guide, November 3, 2026"')
    expect(html).toContain(`rel="canonical" href="${origin}/ballot"`)
    expect(html).toContain(`property="og:image" content="${origin}/brand/share.png"`)
    expect(html).toContain('official ballot questions and source documents')
    expect(html).toContain('/assets/app.js')
    expect(html).toContain('<div id="root">')
    expect(html).not.toContain('Generic Home')
    expect(html).not.toContain('/old-image.png')
    expect((await t.fetch('/ballot', { headers: { 'If-None-Match': response.headers.get('ETag')! } })).status).toBe(304)
  })
}

test('ballot detail redirects preserve publication checks and query strings', async () => {
  const { t, owner, args, storyId, storageId } = await setupMeasure()
  vi.stubEnv('CONVEX_SITE_URL', 'https://www.publicparish.com')
  await installShareShell(t)
  await owner.mutation(api.stories.operations.approve, args)
  for (const path of ['/ballot/2026-amendment-1/', '/stories/2026-amendment-1/', '/share/stories/2026-amendment-1/']) {
    const response = await t.fetch(`${path}?source=launch`)
    expect(response.status).toBe(302)
    expect(response.headers.get('Location')).toBe('https://www.publicparish.com/ballot/2026-amendment-1?source=launch')
  }
  const accepted = await t.fetch('/ballot/2026-amendment-1')
  expect(accepted.status).toBe(200)
  expect(await accepted.text()).toContain('Do you support an amendment to allow a one-time transfer?')
  for (const path of ['/ballot/missing/', '/ballot/%ZZ/', '/ballot/2026-amendment-1//']) {
    const missing = await t.fetch(path)
    expect(missing.status).toBe(404)
    expect(missing.headers.get('Cache-Control')).toBe('no-store')
  }
  await t.run(ctx => ctx.storage.delete(storageId))
  expect((await t.fetch('/ballot/2026-amendment-1/')).status).toBe(503)
  await owner.mutation(api.stories.operations.withdraw, { storyId, expectedGeneration: 1, reason: 'Synthetic withdrawal.' })
  const withdrawn = await t.fetch('/ballot/2026-amendment-1/')
  expect(withdrawn.status).toBe(410)
  expect(withdrawn.headers.get('Location')).toBeNull()
})
