import type { QueryCtx, MutationCtx } from '../_generated/server'
import type { Doc } from '../_generated/dataModel'
import type { StoryManifest } from './manifestTypes'

import type { PublicationMapping } from './contracts'

// A target mapping is a new owner proposal, not portable publication approval.
// Frozen research and retained writing stay byte-identical across deployments.

export async function resolvePublicationReferences(
  ctx: Pick<QueryCtx | MutationCtx, 'db'>,
  sources: Array<{ source: StoryManifest['sources'][number]; snapshot: Doc<'sourceSnapshots'> }>,
  mappings: PublicationMapping[],
) {
  if (mappings.length > 24 || new Set(mappings.map(item => JSON.stringify([item.sourceKey, item.originRecordKey]))).size !== mappings.length) throw new Error('Duplicate or excessive publication mappings')
  const remaining = new Set(mappings)
  const related: Doc<'storyBuilds'>['relatedPublications'] = []
  for (const { source, snapshot } of sources) {
    for (const hint of source.existingPublicationReferences) {
      if (hint.kind !== 'decision') continue
      const mapping = mappings.find(item => item.sourceKey === source.sourceKey && item.originRecordKey === hint.stableKey)
      if (mapping) remaining.delete(mapping)
      const record = await ctx.db.query('decisionRecords').withIndex('by_record_key', q => q.eq('recordKey', mapping?.targetRecordKey ?? hint.stableKey)).unique()
      const publication = record?.currentPublishedVersionId ? await ctx.db.get(record.currentPublishedVersionId) : null
      if (!record || !publication?.payload || publication.recordId !== record._id || publication.payloadHash !== (mapping?.targetPayloadHash ?? hint.versionHash) ||
        record.registryId !== snapshot.registryId || publication.snapshotId !== snapshot._id || publication.mode === 'withheld') throw new Error('Accepted publication hint does not resolve to current evidence')
      if (!related.some(item => item.recordId === record._id)) related.push({ recordId: record._id, publicationVersionId: publication._id, payloadHash: publication.payloadHash })
    }
  }
  if (remaining.size) throw new Error('Publication mapping is outside the manifest references')
  if (related.length > 24) throw new Error('Too many related records')
  return related
}
