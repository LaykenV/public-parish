import type { QueryCtx } from '../_generated/server'
import type { AskEvidence, AskRecordContext, AskScope } from '../ask/contracts'
import type { Id } from '../_generated/dataModel'
import { acceptedStorySpans, currentVersionEvidence } from './evidence'
import { LAUNCH_STORIES } from './manifest'
import { normalizeForMatch } from '../extraction/textMatch'

type StoryEvidence = { evidence: AskEvidence; snapshotId: Id<'sourceSnapshots'> }
export type StoryCatalog = { records: AskRecordContext[]; sources: StoryEvidence[] }

export async function currentAtomicExcerpts(ctx: Pick<QueryCtx, 'db'>, snapshotId: Id<'sourceSnapshots'>, areaKey?: string) {
  const citations = await ctx.db.query('citations').withIndex('by_snapshot', q => q.eq('snapshotId', snapshotId)).take(501)
  if (citations.length > 500) throw new Error('Shared source citation set exceeds the Ask bound')
  const excerpts = new Set<string>()
  const eligible = new Map<Id<'publicationVersions'>, boolean>()
  for (const citation of citations) {
    let included = eligible.get(citation.publicationVersionId)
    if (included === undefined) {
      const publication = await ctx.db.get(citation.publicationVersionId)
      const record = publication ? await ctx.db.get(publication.recordId) : null
      const body = record ? await ctx.db.get(record.governmentBodyId) : null
      const place = body ? await ctx.db.get(body.jurisdictionId) : null
      included = Boolean(publication?.payload && publication.mode !== 'withheld' && publication.snapshotId === snapshotId && publication.payload.source.snapshotId === snapshotId && record?.currentPublishedVersionId === publication._id && record.currentMode === publication.mode && place && (!areaKey || place.slug === areaKey))
      eligible.set(citation.publicationVersionId, included)
    }
    if (included) excerpts.add(normalizeForMatch(citation.excerpt))
  }
  return excerpts
}

// Story prose labels the catalog. Only reviewed exact source spans are evidence.
// IDs bind citations to the immutable version, so a revision cannot reuse them.
export async function storyAskCatalog(ctx: Pick<QueryCtx, 'db'>, scope: AskScope): Promise<StoryCatalog> {
  if (scope.kind !== 'story' && scope.kind !== 'corpus') return { records: [], sources: [] }
  const candidates = scope.kind === 'story'
    ? [await ctx.db.query('stories').withIndex('by_slug', q => q.eq('slug', scope.storySlug)).unique()]
    : await ctx.db.query('stories').withIndex('by_state_and_rank', q => q.eq('state', 'active')).take(3)
  const records: AskRecordContext[] = []
  const sources: StoryEvidence[] = []
  const seen = new Set<string>()
  const atomicBySnapshot = new Map<Id<'sourceSnapshots'>, Set<string>>()
  for (const story of candidates) {
    if (!story || story.state !== 'active' || !story.currentVersionId) continue
    const parish = LAUNCH_STORIES[story.storyKey].parish
    const placeSlug = parish.toLowerCase().replaceAll(' ', '-')
    if (scope.kind === 'corpus' && scope.areaKey && scope.areaKey !== placeSlug) continue
    const version = await ctx.db.get(story.currentVersionId)
    if (!version || version.mode === 'withheld' || !await currentVersionEvidence(ctx, version)) continue
    const evidenceIds: string[] = []
    for (const [spanIndex, span] of acceptedStorySpans(version).entries()) {
      const identity = `${span.snapshotId}:${span.start}:${span.end}`
      if (seen.has(identity)) continue
      const snapshot = await ctx.db.get(span.snapshotId)
      const registry = snapshot ? await ctx.db.get(snapshot.registryId) : null
      const body = registry ? await ctx.db.get(registry.governmentBodyId) : null
      if (!snapshot || !body) continue
      // Atomic locators use normalized matching offsets; story locators use
      // exact document offsets. Compare the accepted excerpt, not those offsets.
      if (scope.kind === 'corpus') {
        let atomic = atomicBySnapshot.get(snapshot._id)
        if (!atomic) {
          atomic = await currentAtomicExcerpts(ctx, snapshot._id, scope.areaKey)
          atomicBySnapshot.set(snapshot._id, atomic)
        }
        if (atomic.has(normalizeForMatch(span.excerpt))) continue
      }
      const evidenceId = `story:${version._id}:${span.key}`
      sources.push({ snapshotId: snapshot._id, evidence: { evidenceId, recordKey: story.slug, fieldPath: span.key,
        documentTitle: snapshot.canonicalUrl.split('/').pop() || 'Official source', bodyName: body.name, sourceKind: 'other',
        officialUrl: span.officialUrl, excerpt: span.excerpt, page: span.page, section: span.section, retrievedAt: snapshot.retrievalTime,
        sourceHref: `/stories/${story.slug}#story-source-${spanIndex}` } })
      seen.add(identity)
      evidenceIds.push(evidenceId)
    }
    if (evidenceIds.length) records.push({ targetKind: 'story', recordKey: story.slug, sourceRecordId: story.storyKey,
      placeName: parish, placeSlug, bodyName: 'Official sources linked in this story', mode: version.mode,
      title: version.payload.title.text, recordType: 'reviewed_story', lifecycleState: null, summary: null,
      meetingAt: null, meetingKey: null, affectedPlaces: version.geography, amounts: [], publicActions: [], issue: null,
      versions: [], changes: [], evidenceIds })
  }
  return { records, sources }
}
