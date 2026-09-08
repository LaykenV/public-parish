import type { Doc, Id } from '../_generated/dataModel'
import type { QueryCtx, MutationCtx } from '../_generated/server'
import { isRegisteredSourceUrl } from '../sources/domains'
import { hashStoryValue } from './hashing'
import type { StoryManifest } from './manifestTypes'
import type { StorySpan } from './contracts'
import { draftStatements } from './contracts'

type ReadCtx = Pick<QueryCtx | MutationCtx, 'db'>
export function acceptedStorySpans(version: Doc<'storyVersions'>) {
  const keys = new Set(draftStatements(version.payload).flatMap(statement => statement.evidenceKeys))
  return version.spans.filter(span => keys.has(span.key))
}
export async function resolveSources(ctx: ReadCtx, manifest: StoryManifest, bindings: Array<{ sourceKey: string, snapshotId: Id<'sourceSnapshots'> }>) {
  if (manifest.purpose !== 'research' || !manifest.sources.length || bindings.length !== manifest.sources.length ||
    new Set(bindings.map(binding => binding.sourceKey)).size !== bindings.length) throw new Error('Supply each real research source exactly once')
  const resolved: Array<{ source: StoryManifest['sources'][number], snapshot: Doc<'sourceSnapshots'> }> = []
  for (const source of manifest.sources) {
    const binding = bindings.find(item => item.sourceKey === source.sourceKey)
    const snapshot = binding ? await ctx.db.get(binding.snapshotId) : null
    const registry = snapshot ? await ctx.db.get(snapshot.registryId) : null
    const body = registry ? await ctx.db.get(registry.governmentBodyId) : null
    if (!snapshot || !registry || !body || body.slug !== source.bodyKey || body.name !== source.bodyName) throw new Error(`Source identity mismatch: ${source.sourceKey}`)
    if (source.retrieval.completeness !== 'complete' || snapshot.truncation.truncated || snapshot.contentHashBasis !== 'raw_artifact_v2' ||
      snapshot.contentHash !== source.rawArtifact.sha256 || snapshot.normalizedContentHash !== source.normalizedArtifact.sha256 ||
      snapshot.rawByteLength !== source.rawArtifact.bytes || snapshot.normalizedByteLength !== source.normalizedArtifact.bytes ||
      snapshot.canonicalUrl !== source.url || snapshot.retrievedUrl !== source.finalUrl) throw new Error(`Source bytes or completeness mismatch: ${source.sourceKey}`)
    for (const url of [source.url, source.finalUrl, ...source.retrieval.redirectChain]) {
      if (!url.startsWith('https://') || !isRegisteredSourceUrl(url, registry.officialDomains, registry.seedUrls, registry.approvedDocumentHosts)) throw new Error(`Unregistered official source: ${source.sourceKey}`)
    }
    const latest = await ctx.db.query('sourceSnapshots').withIndex('by_registry_and_canonical_url_and_version', q => q.eq('registryId', registry._id).eq('canonicalUrl', snapshot.canonicalUrl)).order('desc').first()
    if (latest?._id !== snapshot._id) throw new Error(`Source has a newer snapshot: ${source.sourceKey}`)
    resolved.push({ source, snapshot })
  }
  return resolved
}

export function proposedSpans(manifest: StoryManifest, sources: Array<{ source: StoryManifest['sources'][number], snapshot: Doc<'sourceSnapshots'> }>): StorySpan[] {
  const spans: StorySpan[] = []
  const add = (supports: StoryManifest['research']['claims'][number]['supports']) => {
    for (const span of supports) {
      const entry = sources.find(item => item.source.sourceKey === span.sourceKey)
      if (!entry) throw new Error('Unresolved source span')
      const { snapshot } = entry
      if (span.page !== null && !snapshot.pageMap?.some(page => page.page === span.page && page.startOffset <= span.start && page.endOffset >= span.end)) throw new Error('Stored page map does not prove citation page')
      if (spans.some(item => item.snapshotId === snapshot._id && item.start === span.start && item.end === span.end)) continue
      spans.push({ key: `${span.sourceKey}:${span.start}:${span.end}`, sourceKey: span.sourceKey,
        snapshotId: snapshot._id, rawHash: snapshot.contentHash, normalizedHash: span.normalizedSha256,
        officialUrl: snapshot.canonicalUrl, excerpt: span.excerpt, start: span.start, end: span.end, page: span.page, section: span.section })
    }
  }
  manifest.research.claims.forEach(claim => add(claim.supports))
  manifest.research.relationships.forEach(link => add(link.supports))
  if (!spans.length || spans.length > 120 || new TextEncoder().encode(JSON.stringify(spans)).byteLength > 180_000) throw new Error('Evidence needs 1 to 120 spans within 180000 bytes')
  return spans
}

// Stable identity is part of the digest; environment-specific IDs are excluded
// so the same reviewed artifact set can be revalidated during promotion.
export async function evidenceHash(spans: StorySpan[]) {
  return hashStoryValue(spans.map(({ snapshotId: _snapshotId, ...span }) => span))
}

export async function currentVersionEvidence(ctx: ReadCtx, version: Doc<'storyVersions'>): Promise<boolean> {
  const visited = new Set<string>()
  for (const span of version.spans) {
    if (visited.has(span.snapshotId)) continue
    visited.add(span.snapshotId)
    const snapshot = await ctx.db.get(span.snapshotId)
    if (!snapshot || snapshot.truncation.truncated || snapshot.contentHashBasis !== 'raw_artifact_v2' || snapshot.contentHash !== span.rawHash || snapshot.normalizedContentHash !== span.normalizedHash) return false
    const registry = await ctx.db.get(snapshot.registryId)
    if (!registry || ![snapshot.canonicalUrl, snapshot.retrievedUrl].every(url => url.startsWith('https://') && isRegisteredSourceUrl(url, registry.officialDomains, registry.seedUrls, registry.approvedDocumentHosts))) return false
    const raw = await ctx.db.system.get('_storage', snapshot.rawStorageId)
    const normalized = await ctx.db.system.get('_storage', snapshot.normalizedStorageId)
    if (!raw || !normalized || raw.size !== snapshot.rawByteLength || normalized.size !== snapshot.normalizedByteLength) return false
    const latest = await ctx.db.query('sourceSnapshots').withIndex('by_registry_and_canonical_url_and_version', q => q.eq('registryId', snapshot.registryId).eq('canonicalUrl', snapshot.canonicalUrl)).order('desc').first()
    if (latest?._id !== snapshot._id) return false
  }
  for (const reference of version.relatedPublications) {
    const record = await ctx.db.get(reference.recordId)
    const publication = await ctx.db.get(reference.publicationVersionId)
    if (record?.currentPublishedVersionId !== reference.publicationVersionId || !publication?.payload || publication.mode === 'withheld' || publication.payloadHash !== reference.payloadHash) return false
  }
  return true
}
