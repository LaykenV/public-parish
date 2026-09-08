import { v } from 'convex/values'
import { internal } from '../_generated/api'
import { mutation } from '../_generated/server'
import { requireOwner } from '../auth/authorization'
import { issueWorkflowManager } from '../pipeline/workflowManager'
import { storyDraft, checkDraft } from './contracts'
import { parseStoryManifest } from './manifest'
import { resolveSources, evidenceHash } from './evidence'
import { hashStoryValue } from './hashing'
import { approvedOwnerMedia } from './ownerMedia'

export const prepare = mutation({
  args: { parentBuildId: v.id('storyBuilds'), parentDraftHash: v.string(), expectedGeneration: v.number(), draft: storyDraft, replacementImageId: v.optional(v.id('_storage')),
    notificationIntent: v.optional(v.union(v.literal('baseline'), v.literal('update'))) },
  returns: v.id('storyBuilds'),
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx)
    const parent = await ctx.db.get(args.parentBuildId)
    if (!parent?.draft || !parent.draftModel || parent.draftHash !== args.parentDraftHash) throw new Error('Correction draft inputs changed')
    if (parent.state === 'queued' || parent.state === 'drafted') throw new Error('Wait for the current build to finish')
    const story = await ctx.db.get(parent.storyId)
    const imported = await ctx.db.get(parent.importId)
    if (!story || !imported) throw new Error('Correction story is unavailable')
    const sources = await resolveSources(ctx, parseStoryManifest(imported.manifestJson), parent.sourceBindings)
    for (const reference of parent.relatedPublications) {
      const record = await ctx.db.get(reference.recordId)
      const publication = await ctx.db.get(reference.publicationVersionId)
      if (record?.currentPublishedVersionId !== reference.publicationVersionId || publication?.payloadHash !== reference.payloadHash || publication.mode === 'withheld') throw new Error('Related correction evidence changed')
    }
    const error = checkDraft(args.draft, parent.spans)
    if (error) throw new Error(error)
    const draftHash = await hashStoryValue(args.draft)
    let media = parent.media
    if (args.replacementImageId) {
      if (draftHash !== parent.draftHash) throw new Error('An image-only revision must retain the exact accepted draft')
      media = approvedOwnerMedia(story.storyKey, args.replacementImageId, await ctx.db.system.get('_storage', args.replacementImageId))
    } else if (draftHash === parent.draftHash) throw new Error('The corrected draft must change')
    const inputHash = await hashStoryValue({ contract: 'story-owner-correction-v1', parentBuildId: parent._id, parentDraftHash: parent.draftHash,
      draftHash, evidenceHash: await evidenceHash(parent.spans), expectedGeneration: args.expectedGeneration, notificationIntent: args.notificationIntent,
      media: media ? { ...media, storageId: undefined } : null })
    const existing = await ctx.db.query('storyBuilds').withIndex('by_input_hash', q => q.eq('inputHash', inputHash)).unique()
    if (existing) return existing._id
    if (args.replacementImageId && (story.state !== 'active' || !parent.versionId || story.currentVersionId !== parent.versionId)) throw new Error('Image revision requires the current accepted story')
    if (story.generation !== args.expectedGeneration) throw new Error('Correction generation changed')
    const builds = await ctx.db.query('storyBuilds').withIndex('by_import_id', q => q.eq('importId', parent.importId)).take(100)
    if (builds.length >= 100) throw new Error('Import correction history exceeds its bound')
    const runId = await ctx.db.insert('pipelineRuns', { registryId: sources[0].snapshot.registryId, trigger: 'manual_story_build',
      state: 'queued', processorVersion: 'story-v1', suppressNotifications: true, startedAt: Date.now() })
    const buildId = await ctx.db.insert('storyBuilds', { importId: parent.importId, storyId: parent.storyId, expectedGeneration: story.generation,
      inputHash, sourceBindings: parent.sourceBindings, spans: parent.spans, relatedPublications: parent.relatedPublications, media,
      publicationMappings: parent.publicationMappings,
      state: 'drafted', draft: args.draft, draftHash, draftModel: parent.draftModel,
      draftProvenance: { kind: args.replacementImageId ? 'owner_media_revision' : 'owner_correction', parentBuildId: parent._id, parentDraftHash: parent.draftHash },
      notificationIntent: args.notificationIntent ?? (story.currentVersionId ? 'update' : 'baseline'), runId, startedBy: owner._id, createdAt: Date.now() })
    // The workflow retains this saved draft and always starts a fresh independent
    // review. No prior approval or review is copied into the new candidate.
    const workflowId = await issueWorkflowManager.start(ctx, internal.stories.workflow.buildStory, { buildId })
    await ctx.db.patch(buildId, { workflowId })
    return buildId
  },
})
