import { v } from 'convex/values'
import { internal } from '../_generated/api'
import { action, internalQuery, internalMutation, env } from '../_generated/server'
import type { ActionCtx } from '../_generated/server'
import type { Id } from '../_generated/dataModel'
import schema from '../schema'
import { requireOwner } from '../auth/authorization'
import { sha256HexOfBytes } from '../sources/hashing'
import { isRegisteredSourceUrl } from '../sources/domains'
import { currentVersionEvidence, resolveSources } from './evidence'
import { parseStoryManifest } from './manifest'
import { registeredSource } from './intake'
import { artifactPacket, checkArtifactPacket, signArtifactPacket, verifyArtifactPacket } from './transferContract'
import type { ArtifactPacket } from './transferContract'

async function checkedBytes(ctx: ActionCtx, id: Id<'_storage'>, expectedHash: string, size: number) {
  const blob = await ctx.storage.get(id)
  if (!blob || blob.size !== size || size > 20_000_000) throw new Error('Transfer artifact is missing or has changed size')
  const bytes = new Uint8Array(await blob.arrayBuffer())
  if (await sha256HexOfBytes(bytes) !== expectedHash) throw new Error('Transfer artifact bytes do not match their signed hash')
  return bytes
}

export const exportContext = internalQuery({
  args: { storyKey: v.string(), sourceKey: v.string() },
  returns: v.object({ snapshot: schema.doc('sourceSnapshots'), sourceJson: v.string(), draftHash: v.string() }),
  handler: async (ctx, args) => {
    await requireOwner(ctx)
    const story = await ctx.db.query('stories').withIndex('by_slug', q => q.eq('slug', args.storyKey)).unique()
    const version = story?.currentVersionId ? await ctx.db.get(story.currentVersionId) : null
    if (story?.state !== 'active' || !version || version.mode === 'withheld' || !await currentVersionEvidence(ctx, version)) throw new Error('Only current accepted story evidence can be exported')
    const build = await ctx.db.get(version.buildId)
    const imported = build ? await ctx.db.get(build.importId) : null
    if (!build || !imported) throw new Error('Accepted transfer lineage is missing')
    const sources = await resolveSources(ctx, parseStoryManifest(imported.manifestJson), build.sourceBindings)
    const entry = sources.find(item => item.source.sourceKey === args.sourceKey)
    if (!entry) throw new Error('Source is outside the accepted story')
    return { snapshot: entry.snapshot, sourceJson: JSON.stringify(entry.source), draftHash: version.draftHash }
  },
})

export const exportSource = action({
  args: { storyKey: v.string(), sourceKey: v.string(), targetSite: v.string() },
  returns: v.object({ packet: artifactPacket, signature: v.string(), rawUrl: v.string(), normalizedUrl: v.string() }),
  handler: async (ctx, args): Promise<{ packet: ArtifactPacket; signature: string; rawUrl: string; normalizedUrl: string }> => {
    if (!['https://woozy-wren-227.convex.site', 'https://befitting-flamingo-587.convex.site'].includes(args.targetSite)) throw new Error('Choose the reviewed development or production transfer target')
    const context = await ctx.runQuery(internal.stories.transfer.exportContext, { storyKey: args.storyKey, sourceKey: args.sourceKey })
    const source = JSON.parse(context.sourceJson) as { bodyKey: string; bodyName: string; retrieval: unknown }
    const snapshot = context.snapshot
    if (!snapshot.normalizedContentHash || !env.CONVEX_SITE_URL) throw new Error('Transfer provenance is incomplete')
    await checkedBytes(ctx, snapshot.rawStorageId, snapshot.contentHash, snapshot.rawByteLength)
    await checkedBytes(ctx, snapshot.normalizedStorageId, snapshot.normalizedContentHash, snapshot.normalizedByteLength)
    const packet: ArtifactPacket = { contract: 'story-artifact-transfer-v1', originSite: env.CONVEX_SITE_URL, targetSite: args.targetSite, exportedAt: Date.now(),
      storyKey: args.storyKey, acceptedDraftHash: context.draftHash, sourceKey: args.sourceKey,
      bodyKey: source.bodyKey, bodyName: source.bodyName, canonicalUrl: snapshot.canonicalUrl, retrievedUrl: snapshot.retrievedUrl,
      rawHash: snapshot.contentHash, normalizedHash: snapshot.normalizedContentHash, rawBytes: snapshot.rawByteLength, normalizedBytes: snapshot.normalizedByteLength,
      rawContentType: snapshot.rawContentType, normalizedContentType: snapshot.normalizedContentType, retrievalTime: snapshot.retrievalTime,
      provenanceJson: JSON.stringify(source.retrieval), pageMap: snapshot.pageMap ?? [] }
    checkArtifactPacket(packet, args.targetSite, Date.now())
    // Recheck after storage reads. A changed or withdrawn source cannot obtain
    // a receipt merely because it was accepted when the action started.
    const latest = await ctx.runQuery(internal.stories.transfer.exportContext, { storyKey: args.storyKey, sourceKey: args.sourceKey })
    if (latest.snapshot._id !== snapshot._id || latest.draftHash !== context.draftHash) throw new Error('Accepted evidence changed during export')
    const rawUrl = await ctx.storage.getUrl(snapshot.rawStorageId)
    const normalizedUrl = await ctx.storage.getUrl(snapshot.normalizedStorageId)
    if (!rawUrl || !normalizedUrl) throw new Error('Retained transfer artifacts are unavailable')
    return { packet, signature: await signArtifactPacket(packet, env.STORY_ARTIFACT_TRANSFER_KEY), rawUrl, normalizedUrl }
  },
})

const importArgs = { importId: v.id('storyImports'), bundleHash: v.string(), packet: artifactPacket, signature: v.string(), rawStorageId: v.id('_storage'), normalizedStorageId: v.id('_storage') }

export const commitSource = internalMutation({
  args: importArgs, returns: v.object({ snapshotId: v.id('sourceSnapshots'), reused: v.boolean() }),
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx)
    const packet = args.packet
    checkArtifactPacket(packet, env.CONVEX_SITE_URL, Date.now())
    await verifyArtifactPacket(packet, args.signature, env.STORY_ARTIFACT_TRANSFER_KEY)
    const imported = await ctx.db.get(args.importId)
    if (!imported || imported.bundleHash !== args.bundleHash || imported.storyKey !== packet.storyKey) throw new Error('Transfer import inputs changed')
    const manifest = parseStoryManifest(imported.manifestJson)
    const source = manifest.sources.find(item => item.sourceKey === packet.sourceKey)
    if (manifest.purpose !== 'research' || !source || source.retrieval.completeness !== 'complete' || source.bodyKey !== packet.bodyKey || source.bodyName !== packet.bodyName ||
      source.url !== packet.canonicalUrl || source.finalUrl !== packet.retrievedUrl || source.rawArtifact.sha256 !== packet.rawHash || source.normalizedArtifact.sha256 !== packet.normalizedHash ||
      source.rawArtifact.bytes !== packet.rawBytes || source.normalizedArtifact.bytes !== packet.normalizedBytes) throw new Error('Signed artifact does not match the staged source')
    const registry = await registeredSource(ctx, source)
    if (!registry || ![source.url, source.finalUrl, ...source.retrieval.redirectChain].every(url => isRegisteredSourceUrl(url, registry.officialDomains, registry.seedUrls, registry.approvedDocumentHosts))) throw new Error('Transfer requires the checked official publisher')
    for (const [id, size] of [[args.rawStorageId, packet.rawBytes], [args.normalizedStorageId, packet.normalizedBytes]] as const) {
      const stored = await ctx.db.system.get('_storage', id)
      if (!stored || stored.size !== size) throw new Error('Transfer storage changed before commit')
    }
    const latest = await ctx.db.query('sourceSnapshots').withIndex('by_registry_and_canonical_url_and_version', q => q.eq('registryId', registry._id).eq('canonicalUrl', source.url)).order('desc').first()
    if (latest) {
      if (latest.contentHash !== packet.rawHash || latest.normalizedContentHash !== packet.normalizedHash || latest.truncation.truncated || latest.contentHashBasis !== 'raw_artifact_v2' || latest.retrievedUrl !== packet.retrievedUrl) throw new Error('Target already has different source evidence; review it before promotion')
      const raw = await ctx.db.system.get('_storage', latest.rawStorageId)
      const normalized = await ctx.db.system.get('_storage', latest.normalizedStorageId)
      if (!raw || !normalized || raw.size !== packet.rawBytes || normalized.size !== packet.normalizedBytes) throw new Error('Restore existing target evidence before promotion')
      return { snapshotId: latest._id, reused: true }
    }
    // Preserve original retrieval time. Transfer is not a fresh crawl, a new
    // government decision, or a reason to schedule broad source monitoring.
    const snapshotId = await ctx.db.insert('sourceSnapshots', { registryId: registry._id, canonicalUrl: packet.canonicalUrl, retrievedUrl: packet.retrievedUrl,
      contentHash: packet.rawHash, contentHashBasis: 'raw_artifact_v2', normalizedContentHash: packet.normalizedHash, contentType: packet.rawContentType,
      retrievalTime: packet.retrievalTime, version: 1, rawStorageId: args.rawStorageId, normalizedStorageId: args.normalizedStorageId,
      rawContentType: packet.rawContentType, normalizedContentType: packet.normalizedContentType, rawByteLength: packet.rawBytes, normalizedByteLength: packet.normalizedBytes,
      pageMap: packet.pageMap.length ? packet.pageMap : undefined, truncation: { truncated: false }, firecrawlMetadata: {} })
    await ctx.db.insert('storyArtifactTransfers', { snapshotId, importId: imported._id, sourceKey: packet.sourceKey, packetJson: JSON.stringify(packet), signature: args.signature, importedBy: owner._id, createdAt: Date.now() })
    return { snapshotId, reused: false }
  },
})

export const importSource = action({
  args: importArgs, returns: v.object({ snapshotId: v.id('sourceSnapshots'), reused: v.boolean() }),
  handler: async (ctx, args): Promise<{ snapshotId: Id<'sourceSnapshots'>; reused: boolean }> => {
    // Owner authorization precedes reading caller-selected stored files.
    await ctx.runQuery(internal.stories.transfer.requireTransferOwner, {})
    checkArtifactPacket(args.packet, env.CONVEX_SITE_URL, Date.now())
    await verifyArtifactPacket(args.packet, args.signature, env.STORY_ARTIFACT_TRANSFER_KEY)
    await checkedBytes(ctx, args.rawStorageId, args.packet.rawHash, args.packet.rawBytes)
    await checkedBytes(ctx, args.normalizedStorageId, args.packet.normalizedHash, args.packet.normalizedBytes)
    return ctx.runMutation(internal.stories.transfer.commitSource, args)
  },
})

export const requireTransferOwner = internalQuery({ args: {}, returns: v.null(), handler: async ctx => { await requireOwner(ctx); return null } })
