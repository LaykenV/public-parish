import { v } from 'convex/values'
import { internal } from '../_generated/api'
import type { Doc, Id } from '../_generated/dataModel'
import { internalMutation } from '../_generated/server'
import type { MutationCtx } from '../_generated/server'
import { acceptedStorySpans, currentVersionEvidence } from './evidence'
import { hashStoryValue } from './hashing'

export async function storyFactHash(version: Doc<'storyVersions'>) {
  // Formatting, images, captions, featured order and rewording alone do not
  // announce a factual change. Evidence changes require exact owner approval.
  return hashStoryValue(acceptedStorySpans(version).map(span => `${span.sourceKey}:${span.excerpt}`).sort())
}

export async function recordStoryUpdate(ctx: MutationCtx, previousVersionId: Id<'storyVersions'> | undefined, currentVersionId: Id<'storyVersions'>, intent: 'baseline' | 'update', reviewedMaterial: boolean) {
  if (!previousVersionId || intent === 'baseline' || !reviewedMaterial) return
  const previous = await ctx.db.get(previousVersionId)
  const current = await ctx.db.get(currentVersionId)
  if (!previous || !current || current.mode === 'withheld') return
  if (await storyFactHash(previous) === await storyFactHash(current) && previous.draftHash === current.draftHash) return
  const changeKeys: string[] = []
  for (const reference of current.relatedPublications) {
    if (previous.relatedPublications.some(old => old.publicationVersionId === reference.publicationVersionId)) continue
    const change = await ctx.db.query('materialChanges').withIndex('by_current_publication', q => q.eq('currentPublicationVersionId', reference.publicationVersionId)).unique()
    if (change?.material && change.notificationEligible !== false) changeKeys.push(`decision:${change._id}`)
  }
  if (!changeKeys.length) changeKeys.push(`story-facts:${current.storyId}:${previous.draftHash}:${current.draftHash}:${await storyFactHash(current)}`)
  const existing = await ctx.db.query('storyUpdateEvents').withIndex('by_current_version', q => q.eq('currentVersionId', currentVersionId)).unique()
  if (existing) return
  const now = Date.now()
  const storyUpdateId = await ctx.db.insert('storyUpdateEvents', { storyId: current.storyId, previousVersionId, currentVersionId, changeKeys, createdAt: now })
  const fanoutId = await ctx.db.insert('notificationFanouts', { storyUpdateId, phase: 'story', targetIndex: 0, state: 'pending', matchesCreated: 0, createdAt: now, updatedAt: now })
  await ctx.scheduler.runAfter(0, internal.stories.updates.matchPage, { fanoutId, cursor: null })
}

export async function currentStoryUpdate(ctx: Pick<MutationCtx, 'db'>, id: Id<'storyUpdateEvents'>) {
  const event = await ctx.db.get(id)
  const story = event ? await ctx.db.get(event.storyId) : null
  const eventVersion = event ? await ctx.db.get(event.currentVersionId) : null
  const version = story?.currentVersionId ? await ctx.db.get(story.currentVersionId) : null
  if (!event || !story || story.state !== 'active' || !eventVersion || !version || version.mode === 'withheld' || !await currentVersionEvidence(ctx, version)) return null
  if (version._id !== eventVersion._id) {
    // A later image or copy edit must not discard a pending material roundup.
    // Any intervening substantive revision, including a suppressed baseline,
    // makes the older event ineligible. Bound historical inspection explicitly.
    const revisions = await ctx.db.query('storyVersions').withIndex('by_story_id_and_version', q => q.eq('storyId', story._id).gt('version', eventVersion.version).lte('version', version.version)).take(21)
    if (revisions.length > 20 || revisions.length !== version.version - eventVersion.version) return null
    for (const revision of revisions) {
      const build = await ctx.db.get(revision.buildId)
      if (revision.mode === 'withheld' || build?.review?.changeAssessment?.kind !== 'cosmetic') return null
    }
  }
  return { event, story, version }
}

export const matchPage = internalMutation({
  args: { fanoutId: v.id('notificationFanouts'), cursor: v.union(v.null(), v.string()) }, returns: v.null(),
  handler: async (ctx, args) => {
    const fanout = await ctx.db.get(args.fanoutId)
    if (!fanout?.storyUpdateId || fanout.state === 'complete') return null
    const current = await currentStoryUpdate(ctx, fanout.storyUpdateId)
    if (!current) { await ctx.db.patch(fanout._id, { state: 'complete', updatedAt: Date.now() }); return null }
    const page = await ctx.db.query('follows').withIndex('by_target_kind_and_target_key_and_owner_kind', q => q.eq('targetKind', 'story').eq('targetKey', current.story.slug)).paginate({ cursor: args.cursor, numItems: 50 })
    let created = 0
    for (const follow of page.page) {
      if (follow.createdAt > current.event.createdAt) continue
      const preference = await ctx.db.query('notificationPreferences').withIndex('by_follow_id', q => q.eq('followId', follow._id)).unique()
      if (!preference || preference.cadence === 'muted') continue
      if (follow.ownerKind === 'email' ? (await ctx.db.get(follow.emailSubscriberId))?.state !== 'verified' : !await ctx.db.get(follow.userId)) continue
      const existing = await ctx.db.query('notificationMatches').withIndex('by_follow_and_story_update', q => q.eq('followId', follow._id).eq('storyUpdateId', current.event._id)).unique()
      if (!existing) {
        await ctx.db.insert('notificationMatches', { followId: follow._id, storyUpdateId: current.event._id, ownerKind: follow.ownerKind, ownerKey: follow.ownerKey, targetKind: 'story', targetKey: follow.targetKey, cadenceAtMatch: preference.cadence, matchedAt: Date.now() })
        created++
      }
      if (preference.cadence === 'immediate' || preference.cadence === 'both') await ctx.scheduler.runAfter(0, internal.follows.agentmailClient.reserveImmediateDelivery, { storyUpdateId: current.event._id, ownerKey: follow.ownerKey })
    }
    await ctx.db.patch(fanout._id, { state: page.isDone ? 'complete' : 'pending', cursor: page.isDone ? undefined : page.continueCursor, matchesCreated: fanout.matchesCreated + created, updatedAt: Date.now() })
    if (!page.isDone) await ctx.scheduler.runAfter(0, internal.stories.updates.matchPage, { fanoutId: fanout._id, cursor: page.continueCursor })
    return null
  },
})
