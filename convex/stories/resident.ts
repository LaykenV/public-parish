import { v } from 'convex/values'
import { query } from '../_generated/server'
import type { QueryCtx, MutationCtx } from '../_generated/server'
import type { Doc } from '../_generated/dataModel'
import { storyDraft, storySpan } from './contracts'
import { acceptedStorySpans, currentVersionEvidence } from './evidence'

export const publicStory = v.object({
  id: v.id('stories'), slug: v.string(), rank: v.number(), revision: v.id('storyVersions'),
  mode: v.union(v.literal('full'), v.literal('limited')), payload: storyDraft,
  evidence: v.array(storySpan.extend({ snapshotUrl: v.union(v.null(), v.string()) })), geography: v.array(v.string()),
  reviewedThrough: v.string(), nextReviewAt: v.string(),
  media: v.union(v.null(), v.object({ url: v.string(), caption: v.string(), alt: v.string(), credit: v.string(), originalUrl: v.string(), license: v.string(), kind: v.string(), width: v.number(), height: v.number() })),
  relatedRecords: v.array(v.object({ key: v.string(), title: v.string() })),
})
export type PublicStory = typeof publicStory.type

export async function resolvePublicStory(ctx: QueryCtx | MutationCtx, story: Doc<'stories'>): Promise<PublicStory | null> {
  const version = story.state === 'active' && story.currentVersionId ? await ctx.db.get(story.currentVersionId) : null
  if (!version || version.mode === 'withheld' || !await currentVersionEvidence(ctx, version)) return null
  const relatedRecords = []
  for (const reference of version.relatedPublications) {
    const record = await ctx.db.get(reference.recordId)
    const publication = await ctx.db.get(reference.publicationVersionId)
    if (record && publication?.payload) relatedRecords.push({ key: record.recordKey, title: publication.payload.title })
  }
  const snapshotUrls = new Map<string, string | null>()
  for (const span of version.spans) {
    if (snapshotUrls.has(span.snapshotId)) continue
    const snapshot = await ctx.db.get(span.snapshotId)
    snapshotUrls.set(span.snapshotId, snapshot ? await ctx.storage.getUrl(snapshot.rawStorageId) : null)
  }
  const evidence = acceptedStorySpans(version).map(span => ({ ...span, snapshotUrl: snapshotUrls.get(span.snapshotId) ?? null }))
  const url = version.media ? await ctx.storage.getUrl(version.media.storageId) : null
  const media = url && version.media ? { url, caption: version.media.caption, alt: version.media.alt, credit: version.media.credit, originalUrl: version.media.originalUrl,
    license: version.media.license, kind: version.media.kind, width: version.media.width, height: version.media.height } : null
  return { id: story._id, slug: story.slug, rank: story.rank, revision: version._id, mode: version.mode, payload: version.payload, evidence,
    geography: version.geography, reviewedThrough: version.reviewedThrough, nextReviewAt: version.nextReviewAt, media, relatedRecords }
}

export const get = query({
  args: { slug: v.string() },
  returns: v.object({ state: v.union(v.literal('active'), v.literal('unavailable'), v.literal('withdrawn'), v.literal('needs_review')), story: v.union(v.null(), publicStory), reason: v.union(v.string(), v.null()) }),
  handler: async (ctx, args) => {
    const record = await ctx.db.query('stories').withIndex('by_slug', q => q.eq('slug', args.slug)).unique()
    if (!record || record.state === 'unpublished') return { state: 'unavailable' as const, story: null, reason: 'No published story is available at this address.' }
    if (record.state === 'withdrawn') return { state: 'withdrawn' as const, story: null, reason: record.withdrawalReason ?? 'This story has been withdrawn for review.' }
    const story = await resolvePublicStory(ctx, record)
    if (!story) return { state: 'needs_review' as const, story: null, reason: 'Source evidence changed. This story needs review before its claims can be shown.' }
    return { state: 'active' as const, story, reason: null }
  },
})

export const featured = query({
  args: {}, returns: v.array(publicStory),
  handler: async ctx => {
    const records = await ctx.db.query('stories').withIndex('by_state_and_rank', q => q.eq('state', 'active')).take(3)
    const stories = []
    for (const record of records) { const story = await resolvePublicStory(ctx, record); if (story) stories.push(story) }
    return stories
  },
})
