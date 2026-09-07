import { v } from 'convex/values'
import { internal } from '../_generated/api'
import type { Doc } from '../_generated/dataModel'
import { internalMutation, internalQuery, mutation, query } from '../_generated/server'
import { requireOwner } from '../auth/authorization'
import { issueWorkflowManager } from '../pipeline/workflowManager'
import schema from '../schema'
import { hashStoryValue, canonicalStoryJson } from './hashing'
import { parseStoryManifest, LAUNCH_STORIES } from './manifest'
import { sourceBinding, storyDraft, storyReview, storyMedia, checkDraft, checkReview } from './contracts'
import { evidenceHash, proposedSpans, resolveSources } from './evidence'
import { aiRoutes, modelRoles } from '../ai/types'

export const prepare = query({
  args: { importId: v.id('storyImports'), bindings: v.array(sourceBinding) },
  returns: v.object({ imported: schema.doc('storyImports'), snapshots: v.array(schema.doc('sourceSnapshots')) }),
  handler: async (ctx, args) => {
    await requireOwner(ctx)
    const imported = await ctx.db.get(args.importId)
    if (!imported) throw new Error('Unknown import')
    const manifest = parseStoryManifest(imported.manifestJson)
    const sources = await resolveSources(ctx, manifest, args.bindings)
    return { imported, snapshots: sources.map(source => source.snapshot) }
  },
})

export const begin = internalMutation({
  args: { importId: v.id('storyImports'), bindings: v.array(sourceBinding), media: v.union(v.null(), storyMedia), notificationIntent: v.optional(v.union(v.literal('baseline'), v.literal('update'))) },
  returns: v.id('storyBuilds'),
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx)
    const imported = await ctx.db.get(args.importId)
    if (!imported) throw new Error('Unknown import')
    const manifest = parseStoryManifest(imported.manifestJson)
    const sources = await resolveSources(ctx, manifest, args.bindings)
    const spans = proposedSpans(manifest, sources)
    const media = args.media
    if (media && media.captionEvidenceKeys.some(key => !spans.some(span => span.key === key))) throw new Error('Image caption cites unknown evidence')
    let story = await ctx.db.query('stories').withIndex('by_story_key', q => q.eq('storyKey', manifest.story.storyKey)).unique()
    if (!story) {
      const id = await ctx.db.insert('stories', { storyKey: manifest.story.storyKey, slug: manifest.story.slug, rank: LAUNCH_STORIES[manifest.story.storyKey].rank, state: 'unpublished', generation: 0, createdAt: Date.now(), updatedAt: Date.now() })
      story = (await ctx.db.get(id))!
    }
    const mediaIdentity = media ? { ...media, storageId: undefined } : null
    const notificationIntent = args.notificationIntent ?? (story.currentVersionId ? 'update' : 'baseline')
    const inputHash = await hashStoryValue({ contract: 'story-build-2', bundleHash: imported.bundleHash, evidenceHash: await evidenceHash(spans), media: mediaIdentity, expectedGeneration: story.generation, notificationIntent })
    const existing = await ctx.db.query('storyBuilds').withIndex('by_input_hash', q => q.eq('inputHash', inputHash)).unique()
    if (existing) return existing._id
    // Replaying a historical accepted bundle returns its receipt, never a new
    // candidate or a change to the current publication. New review requires a
    // new versioned bundle. Bound alternate image attempts for one import.
    const priorBuilds = await ctx.db.query('storyBuilds').withIndex('by_import_id', q => q.eq('importId', imported._id)).take(101)
    if (priorBuilds.length > 100) throw new Error('Import build history exceeds the replay bound')
    const publishedReplay = priorBuilds.find(build => build.versionId && canonicalStoryJson(build.media ? { ...build.media, storageId: undefined } : null) === canonicalStoryJson(mediaIdentity))
    if (publishedReplay) return publishedReplay._id
    const relatedPublications: Doc<'storyBuilds'>['relatedPublications'] = []
    for (const source of sources) {
      for (const hint of source.source.existingPublicationReferences) {
        if (hint.kind !== 'decision') continue
        const record = await ctx.db.query('decisionRecords').withIndex('by_record_key', q => q.eq('recordKey', hint.stableKey)).unique()
        const publication = record?.currentPublishedVersionId ? await ctx.db.get(record.currentPublishedVersionId) : null
        if (!record || !publication || publication.payloadHash !== hint.versionHash || publication.snapshotId !== source.snapshot._id || publication.mode === 'withheld') throw new Error('Accepted publication hint does not resolve to current evidence')
        if (!relatedPublications.some(item => item.recordId === record._id)) relatedPublications.push({ recordId: record._id, publicationVersionId: publication._id, payloadHash: publication.payloadHash })
      }
    }
    if (relatedPublications.length > 24) throw new Error('Too many related records')
    const runId = await ctx.db.insert('pipelineRuns', { registryId: sources[0].snapshot.registryId, trigger: 'manual_story_build', state: 'queued', processorVersion: 'story-v1', suppressNotifications: true, startedAt: Date.now() })
    const buildId = await ctx.db.insert('storyBuilds', { importId: imported._id, storyId: story._id, expectedGeneration: story.generation, inputHash, sourceBindings: args.bindings, spans, relatedPublications, media,
      state: 'queued', notificationIntent, runId, startedBy: owner._id, createdAt: Date.now() })
    const workflowId = await issueWorkflowManager.start(ctx, internal.stories.workflow.buildStory, { buildId })
    await ctx.db.patch(buildId, { workflowId })
    return buildId
  },
})

export const load = internalQuery({
  args: { buildId: v.id('storyBuilds') },
  returns: v.object({ build: schema.doc('storyBuilds'), imported: schema.doc('storyImports'), previous: v.union(v.null(), schema.doc('storyVersions')) }),
  handler: async (ctx, args) => {
    const build = await ctx.db.get(args.buildId)
    const imported = build ? await ctx.db.get(build.importId) : null
    if (!build || !imported) throw new Error('Unknown story build')
    const story = await ctx.db.get(build.storyId)
    if (!story || story.generation !== build.expectedGeneration) throw new Error('Story generation changed')
    await resolveSources(ctx, parseStoryManifest(imported.manifestJson), build.sourceBindings)
    return { build, imported, previous: story.currentVersionId ? await ctx.db.get(story.currentVersionId) : null }
  },
})

export const retry = mutation({
  args: { buildId: v.id('storyBuilds'), inputHash: v.string() }, returns: v.id('storyBuilds'),
  handler: async (ctx, args) => {
    await requireOwner(ctx)
    const build = await ctx.db.get(args.buildId)
    if (!build || build.inputHash !== args.inputHash) throw new Error('Retry inputs changed')
    if (build.state !== 'failed') throw new Error('Only a failed story build can retry')
    if ((build.retryCount ?? 0) >= 1) throw new Error('Story retry allowance exhausted')
    const story = await ctx.db.get(build.storyId)
    const imported = await ctx.db.get(build.importId)
    if (!story || !imported || build.versionId || story.generation !== build.expectedGeneration) throw new Error('Story retry is stale')
    await resolveSources(ctx, parseStoryManifest(imported.manifestJson), build.sourceBindings)
    await ctx.db.patch(build._id, { retryCount: (build.retryCount ?? 0) + 1, state: build.draft ? 'drafted' : 'queued', error: undefined })
    await ctx.db.patch(build.runId, { state: 'queued', completedAt: undefined })
    const workflowId = await issueWorkflowManager.start(ctx, internal.stories.workflow.buildStory, { buildId: build._id })
    await ctx.db.patch(build._id, { workflowId })
    return build._id
  },
})

export const saveDraft = internalMutation({
  args: { buildId: v.id('storyBuilds'), inputHash: v.string(), draft: storyDraft, model: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const build = await ctx.db.get(args.buildId)
    if (!build || build.inputHash !== args.inputHash) throw new Error('Draft inputs changed')
    const error = checkDraft(args.draft, build.spans)
    if (error) throw new Error(error)
    const draftHash = await hashStoryValue(args.draft)
    if (build.draftHash) {
      if (build.draftHash !== draftHash) throw new Error('Immutable draft changed')
      return null
    }
    if (build.state !== 'queued') throw new Error('Build is not awaiting a draft')
    await ctx.db.patch(build._id, { state: 'drafted', draft: args.draft, draftHash, draftModel: args.model })
    return null
  },
})

export const saveReview = internalMutation({
  args: { buildId: v.id('storyBuilds'), inputHash: v.string(), draftHash: v.string(), review: storyReview, model: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const build = await ctx.db.get(args.buildId)
    if (!build || build.inputHash !== args.inputHash || !build.draft || build.draftHash !== args.draftHash || build.draftModel === args.model) throw new Error('Review inputs changed or reviewer is not independent')
    const error = checkReview(args.review, build.draft, build.media)
    if (error) throw new Error(error)
    const story = await ctx.db.get(build.storyId)
    const previous = story?.currentVersionId ? await ctx.db.get(story.currentVersionId) : null
    if (story?.generation !== build.expectedGeneration || !args.review.changeAssessment || args.review.changeAssessment.previousDraftHash !== (previous?.draftHash ?? null)) throw new Error('Review comparison changed')
    const reviewHash = await hashStoryValue(args.review)
    if (build.reviewHash) {
      if (build.reviewHash !== reviewHash) throw new Error('Immutable review changed')
      return null
    }
    if (build.state !== 'drafted') throw new Error('Build is not awaiting review')
    await ctx.db.patch(build._id, { state: 'reviewed', review: args.review, reviewHash, reviewModel: args.model })
    await ctx.db.patch(build.runId, { state: 'succeeded', completedAt: Date.now() })
    return null
  },
})

export const fail = internalMutation({
  args: { buildId: v.id('storyBuilds'), error: v.string() }, returns: v.null(),
  handler: async (ctx, args) => {
    const build = await ctx.db.get(args.buildId)
    if (build && !build.versionId && build.state !== 'reviewed') {
      await ctx.db.patch(build._id, { state: 'failed', error: args.error.slice(0, 500) })
      await ctx.db.patch(build.runId, { state: 'failed_terminal', completedAt: Date.now() })
    }
    return null
  },
})

export const recordAttempt = internalMutation({
  args: { buildId: v.id('storyBuilds'), role: modelRoles, route: aiRoutes, model: v.string(), status: v.string(), latencyMs: v.number(), promptTokens: v.optional(v.number()), completionTokens: v.optional(v.number()) },
  returns: v.null(),
  handler: async (ctx, args) => {
    const build = await ctx.db.get(args.buildId)
    if (!build) throw new Error('Unknown build')
    await ctx.db.insert('aiCalls', { runId: build.runId, modelRole: args.role, route: args.route, modelId: args.model,
      promptVersion: 'story-v1', schemaVersion: 'story-v1', attempt: (build.retryCount ?? 0) + 1, status: args.status, latencyMs: args.latencyMs,
      promptTokens: args.promptTokens, completionTokens: args.completionTokens, createdAt: Date.now() })
    return null
  },
})
