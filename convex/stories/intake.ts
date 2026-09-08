import { v } from 'convex/values'
import { internal } from '../_generated/api'
import type { Doc } from '../_generated/dataModel'
import { action, internalMutation, mutation, query } from '../_generated/server'
import type { MutationCtx, QueryCtx } from '../_generated/server'
import { requireOwner } from '../auth/authorization'
import { parseStoryManifest } from './manifest'
import type { StoryManifest } from './manifestTypes'
import { isRegisteredSourceUrl } from '../sources/domains'

// These are official publishers for the three approved launch stories. Adding
// a publisher requires code review. A research manifest cannot register a host.
const PUBLISHERS: Partial<Record<string, { name: string; root: string; domains: string[]; jurisdiction: string }>> = {
  'louisiana-economic-development': { name: 'Louisiana Economic Development', root: 'https://www.opportunitylouisiana.gov/', domains: ['opportunitylouisiana.gov'], jurisdiction: 'louisiana' },
  'louisiana-public-service-commission': { name: 'Louisiana Public Service Commission', root: 'https://lpsc.louisiana.gov/', domains: ['lpsc.louisiana.gov', 'lpscpubvalence.lpsc.louisiana.gov'], jurisdiction: 'louisiana' },
  'louisiana-legislature': { name: 'Louisiana Legislature', root: 'https://www.legis.la.gov/', domains: ['legis.la.gov'], jurisdiction: 'louisiana' },
  'england-economic-industrial-development-district': { name: 'England Economic and Industrial Development District', root: 'https://englandairpark.org/', domains: ['englandairpark.org'], jurisdiction: 'rapides-parish' },
}

type Source = StoryManifest['sources'][number]
type ReadCtx = Pick<QueryCtx | MutationCtx, 'db'>
export async function registeredSource(ctx: ReadCtx, source: Source) {
  const body = await ctx.db.query('governmentBodies').withIndex('by_slug', q => q.eq('slug', source.bodyKey)).unique()
  if (!body || body.name !== source.bodyName) return null
  const registries = await ctx.db.query('sourceRegistries').withIndex('by_body_and_status', q => q.eq('governmentBodyId', body._id)).take(10)
  return registries.find(registry => [source.url, source.finalUrl].every(url => isRegisteredSourceUrl(url, registry.officialDomains, registry.seedUrls, registry.approvedDocumentHosts))) ?? null
}

async function latestSource(ctx: ReadCtx, source: Source, registry: Doc<'sourceRegistries'> | null) {
  return registry ? ctx.db.query('sourceSnapshots').withIndex('by_registry_and_canonical_url_and_version', q => q.eq('registryId', registry._id).eq('canonicalUrl', source.url)).order('desc').first() : null
}

function reusable(source: Source, snapshot: Doc<'sourceSnapshots'> | null): boolean {
  return Boolean(snapshot && !snapshot.truncation.truncated && snapshot.contentHashBasis === 'raw_artifact_v2' && (snapshot.contentHash === source.rawArtifact.sha256 || snapshot.retrievalTime >= Date.parse(source.retrieval.retrievedAt)))
}

async function retained(ctx: ReadCtx, snapshot: Doc<'sourceSnapshots'>) {
  const raw = await ctx.db.system.get(snapshot.rawStorageId)
  const normalized = await ctx.db.system.get(snapshot.normalizedStorageId)
  return raw?.size === snapshot.rawByteLength && normalized?.size === snapshot.normalizedByteLength
}

export const sources = query({
  args: { importId: v.id('storyImports') },
  returns: v.array(v.object({ sourceKey: v.string(), bodyName: v.string(), url: v.string(), registered: v.boolean(), status: v.union(v.literal('ready'), v.literal('missing'), v.literal('artifact_missing'), v.literal('normalization_changed')),
    snapshotId: v.union(v.null(), v.id('sourceSnapshots')), rawHash: v.union(v.null(), v.string()), normalizedHash: v.union(v.null(), v.string()), normalizedUrl: v.union(v.null(), v.string()), attempts: v.number(), error: v.union(v.null(), v.string()) })),
  handler: async (ctx, args) => {
    await requireOwner(ctx)
    const imported = await ctx.db.get(args.importId)
    if (!imported) throw new Error('Unknown import')
    const rows = []
    for (const source of parseStoryManifest(imported.manifestJson).sources) {
      const registry = await registeredSource(ctx, source)
      const snapshot = await latestSource(ctx, source, registry)
      const receipt = await ctx.db.query('storySourceRetrievals').withIndex('by_import_and_source', q => q.eq('importId', imported._id).eq('sourceKey', source.sourceKey)).unique()
      const status = snapshot && !await retained(ctx, snapshot) ? 'artifact_missing' as const : reusable(source, snapshot) ? snapshot?.contentHash === source.rawArtifact.sha256 && snapshot.normalizedContentHash === source.normalizedArtifact.sha256 ? 'ready' as const : 'normalization_changed' as const : 'missing' as const
      rows.push({ sourceKey: source.sourceKey, bodyName: source.bodyName, url: source.url, registered: Boolean(registry), status, snapshotId: snapshot?._id ?? null, rawHash: snapshot?.contentHash ?? null, normalizedHash: snapshot?.normalizedContentHash ?? null,
        normalizedUrl: snapshot ? await ctx.storage.getUrl(snapshot.normalizedStorageId) : null, attempts: receipt?.attempts ?? 0, error: receipt?.error ?? null })
    }
    return rows
  },
})

export const registerPublishers = mutation({
  args: { importId: v.id('storyImports'), bundleHash: v.string() }, returns: v.null(),
  handler: async (ctx, args) => {
    await requireOwner(ctx)
    const imported = await ctx.db.get(args.importId)
    if (!imported || imported.bundleHash !== args.bundleHash) throw new Error('Registration inputs changed')
    const manifest = parseStoryManifest(imported.manifestJson)
    if (manifest.purpose !== 'research') throw new Error('A fixture cannot register sources')
    for (const source of manifest.sources) {
      if (await registeredSource(ctx, source)) continue
      const publisher = PUBLISHERS[source.bodyKey]
      if (!publisher || publisher.name !== source.bodyName || ![source.url, source.finalUrl, ...source.retrieval.redirectChain].every(url => isRegisteredSourceUrl(url, publisher.domains, [publisher.root]))) throw new Error('Publisher needs an explicit official identity review')
      let jurisdiction = await ctx.db.query('jurisdictions').withIndex('by_slug', q => q.eq('slug', publisher.jurisdiction)).unique()
      if (!jurisdiction) {
        if (publisher.jurisdiction !== 'louisiana') throw new Error('Expected existing parish identity')
        const id = await ctx.db.insert('jurisdictions', { name: 'Louisiana', slug: 'louisiana', type: 'state', state: 'LA', publicStatus: 'candidate' })
        jurisdiction = (await ctx.db.get(id))!
      }
      let body = await ctx.db.query('governmentBodies').withIndex('by_slug', q => q.eq('slug', source.bodyKey)).unique()
      if (body && (body.name !== publisher.name || body.jurisdictionId !== jurisdiction._id)) throw new Error('Existing publisher identity conflicts')
      if (!body) {
        const id = await ctx.db.insert('governmentBodies', { jurisdictionId: jurisdiction._id, name: publisher.name, slug: source.bodyKey, bodyType: 'other', officialUrl: publisher.root, publicStatus: 'candidate' })
        body = (await ctx.db.get(id))!
      }
      // Separate paused source registration leaves existing coverage policy and
      // schedules untouched. It does not enable discovery or monitoring.
      await ctx.db.insert('sourceRegistries', { governmentBodyId: body._id, officialDomains: publisher.domains, seedUrls: [publisher.root], sourceKinds: ['other'], expectedCadence: { kind: 'unknown' }, discoveryMode: 'dynamic', status: 'paused' })
    }
    return null
  },
})

export const beginRetrieval = internalMutation({
  args: { importId: v.id('storyImports'), sourceKey: v.string(), bundleHash: v.string() },
  returns: v.object({ receiptId: v.union(v.null(), v.id('storySourceRetrievals')), registryId: v.id('sourceRegistries'), url: v.string(), reused: v.boolean(), attempt: v.number() }),
  handler: async (ctx, args) => {
    await requireOwner(ctx)
    const imported = await ctx.db.get(args.importId)
    if (!imported || imported.bundleHash !== args.bundleHash) throw new Error('Retrieval inputs changed')
    const source = parseStoryManifest(imported.manifestJson).sources.find(item => item.sourceKey === args.sourceKey)
    if (!source) throw new Error('Unknown source key')
    const registry = await registeredSource(ctx, source)
    if (!registry) throw new Error('Register the checked official publisher first')
    const snapshot = await latestSource(ctx, source, registry)
    if (snapshot && !await retained(ctx, snapshot)) throw new Error('Saved artifact is missing. Restore its exact retained bytes before new retrieval.')
    if (reusable(source, snapshot)) return { receiptId: null, registryId: registry._id, url: source.url, reused: true, attempt: 0 }
    const previous = await ctx.db.query('storySourceRetrievals').withIndex('by_import_and_source', q => q.eq('importId', imported._id).eq('sourceKey', source.sourceKey)).unique()
    if (previous?.state === 'running' && Date.now() - previous.startedAt < 10 * 60_000) throw new Error('Retrieval is already running')
    if ((previous?.attempts ?? 0) >= 2) throw new Error('Two retrieval attempts exhausted; inspect the recorded failure')
    const fields = { attempts: (previous?.attempts ?? 0) + 1, state: 'running' as const, startedAt: Date.now(), completedAt: undefined, error: undefined }
    const receiptId = previous?._id ?? await ctx.db.insert('storySourceRetrievals', { importId: imported._id, sourceKey: source.sourceKey, ...fields })
    if (previous) await ctx.db.patch(previous._id, fields)
    return { receiptId, registryId: registry._id, url: source.url, reused: false, attempt: fields.attempts }
  },
})

export const finishRetrieval = internalMutation({
  args: { receiptId: v.id('storySourceRetrievals'), attempt: v.number(), snapshotId: v.optional(v.id('sourceSnapshots')), error: v.optional(v.string()) }, returns: v.null(),
  handler: async (ctx, args) => {
    const receipt = await ctx.db.get(args.receiptId)
    if (!receipt || receipt.attempts !== args.attempt || receipt.state !== 'running') throw new Error('Retrieval attempt changed')
    await ctx.db.patch(args.receiptId, { state: args.snapshotId ? 'complete' : 'failed', snapshotId: args.snapshotId, error: args.error?.slice(0, 500), completedAt: Date.now() })
    return null
  },
})

export const retrieve = action({
  args: { importId: v.id('storyImports'), sourceKey: v.string(), bundleHash: v.string() }, returns: v.string(),
  handler: async (ctx, args): Promise<string> => {
    // prepare is an authenticated owner mutation in this same call context.
    const work = await ctx.runMutation(internal.stories.intake.beginRetrieval, args)
    if (work.reused || !work.receiptId) return 'Saved source reused. No retrieval call was made.'
    const result = await ctx.runAction(internal.operations.ingest.ingestRegistrySource, { registryId: work.registryId, urlOverride: work.url }).catch(async () => {
      await ctx.runMutation(internal.stories.intake.finishRetrieval, { receiptId: work.receiptId, attempt: work.attempt, error: 'Source retrieval action failed. Inspect the private pipeline receipt before retrying.' })
      throw new Error('Source retrieval failed. Inspect the private pipeline receipt before retrying.')
    })
    await ctx.runMutation(internal.stories.intake.finishRetrieval, { receiptId: work.receiptId, attempt: work.attempt, ...(result.outcome === 'failed' ? { error: result.errorClass } : { snapshotId: result.snapshotId }) })
    if (result.outcome === 'failed') throw new Error(`Source retrieval failed: ${result.errorClass}`)
    return 'Source saved. Compare its normalized hash and exact spans before drafting.'
  },
})

export const builds = query({
  args: { storyKey: v.string() }, returns: v.array(v.object({ id: v.id('storyBuilds'), state: v.string(), createdAt: v.number() })),
  handler: async (ctx, args) => {
    await requireOwner(ctx)
    const story = await ctx.db.query('stories').withIndex('by_slug', q => q.eq('slug', args.storyKey)).unique()
    if (!story) return []
    return (await ctx.db.query('storyBuilds').withIndex('by_story_id_and_created_at', q => q.eq('storyId', story._id)).order('desc').take(20)).map(build => ({ id: build._id, state: build.state, createdAt: build.createdAt }))
  },
})

export const identity = query({
  args: { storyId: v.id('stories') }, returns: v.union(v.null(), v.object({ generation: v.number(), state: v.string(), currentVersionId: v.union(v.null(), v.id('storyVersions')) })),
  handler: async (ctx, args) => { await requireOwner(ctx); const story = await ctx.db.get(args.storyId); return story ? { generation: story.generation, state: story.state, currentVersionId: story.currentVersionId ?? null } : null },
})
