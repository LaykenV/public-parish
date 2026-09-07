import { v } from 'convex/values'
import { mutation, query } from '../_generated/server'
import { requireOwner } from '../auth/authorization'
import schema from '../schema'
import { sha256HexOfText } from '../sources/hashing'
import { parseStoryManifest } from './manifest'
import { resolveSources } from './evidence'
import { checkDraft, checkReview } from './contracts'

export const preview = query({
  args: { buildId: v.id('storyBuilds') },
  returns: v.object({ build: schema.doc('storyBuilds'), previous: v.union(v.null(), schema.doc('storyVersions')) }),
  handler: async (ctx, args) => {
    await requireOwner(ctx)
    const build = await ctx.db.get(args.buildId)
    if (!build) throw new Error('Unknown story build')
    const story = await ctx.db.get(build.storyId)
    const previous = story?.currentVersionId ? await ctx.db.get(story.currentVersionId) : null
    return { build, previous }
  },
})

export const approve = mutation({
  args: { buildId: v.id('storyBuilds'), inputHash: v.string(), draftHash: v.string(), reviewHash: v.string(), expectedGeneration: v.number() },
  returns: v.id('storyVersions'),
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx)
    const build = await ctx.db.get(args.buildId)
    if (!build || build.inputHash !== args.inputHash || build.draftHash !== args.draftHash || build.reviewHash !== args.reviewHash || build.expectedGeneration !== args.expectedGeneration) throw new Error('Approval inputs changed')
    if (build.versionId) return build.versionId
    const story = await ctx.db.get(build.storyId)
    const imported = await ctx.db.get(build.importId)
    if (!story || !imported || story.generation !== args.expectedGeneration || build.state !== 'reviewed' || !build.draft || !build.review || !build.draftModel || !build.reviewModel || build.draftModel === build.reviewModel) throw new Error('Story draft is stale or lacks independent review')
    const manifest = parseStoryManifest(imported.manifestJson)
    const sources = await resolveSources(ctx, manifest, build.sourceBindings)
    for (const { snapshot } of sources) {
      const raw = await ctx.db.system.get('_storage', snapshot.rawStorageId)
      const normalized = await ctx.db.system.get('_storage', snapshot.normalizedStorageId)
      if (!raw || !normalized || raw.size !== snapshot.rawByteLength || normalized.size !== snapshot.normalizedByteLength) throw new Error('Evidence storage changed before approval')
    }
    if (build.media && !await ctx.db.system.get('_storage', build.media.storageId)) throw new Error('Image storage changed before approval')
    if (await sha256HexOfText(JSON.stringify(build.draft)) !== args.draftHash || await sha256HexOfText(JSON.stringify(build.review)) !== args.reviewHash) throw new Error('Draft or review hash mismatch')
    if (checkDraft(build.draft, build.spans) || checkReview(build.review, build.draft, build.media)) throw new Error('Deterministic story review failed')
    for (const reference of build.relatedPublications) {
      const record = await ctx.db.get(reference.recordId)
      const publication = await ctx.db.get(reference.publicationVersionId)
      if (record?.currentPublishedVersionId !== reference.publicationVersionId || publication?.payloadHash !== reference.payloadHash || publication.mode === 'withheld') throw new Error('Related evidence changed before approval')
    }
    const mode = build.review.verdict === 'fail' ? 'withheld' : build.review.verdict === 'limited' || manifest.research.knownUnknowns.length ? 'limited' : 'full'
    if (mode !== 'withheld' && !build.media) throw new Error('An approved image is required for launch publication')
    const latest = await ctx.db.query('storyVersions').withIndex('by_story_id_and_version', q => q.eq('storyId', story._id)).order('desc').first()
    const versionId = await ctx.db.insert('storyVersions', {
      storyId: story._id, buildId: build._id, version: (latest?.version ?? 0) + 1,
      mode, inputHash: args.inputHash, draftHash: args.draftHash, reviewHash: args.reviewHash,
      payload: build.draft, spans: build.spans, relatedPublications: build.relatedPublications,
      media: build.media, geography: manifest.story.geography.map(place => `${place.placeName}, ${place.parish}`),
      reviewedThrough: manifest.research.reviewedThrough, nextReviewAt: manifest.research.nextReviewAt,
      reviewResponsibility: manifest.research.reviewResponsibility, approvedBy: owner._id, approvedAt: Date.now(),
    })
    await ctx.db.patch(build._id, { versionId, state: mode === 'withheld' ? 'withheld' : 'published' })
    if (mode !== 'withheld') {
      await ctx.db.patch(story._id, { currentVersionId: versionId, generation: story.generation + 1, state: 'active', withdrawalReason: undefined, updatedAt: Date.now() })
      // Initial publication has no material event. S5 adds typed story events
      // in this transaction before mail or resident subscription is enabled.
    }
    return versionId
  },
})

export const withdraw = mutation({
  args: { storyId: v.id('stories'), expectedGeneration: v.number(), reason: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireOwner(ctx)
    const story = await ctx.db.get(args.storyId)
    if (!story || story.generation !== args.expectedGeneration) throw new Error('Story changed before withdrawal')
    if (!args.reason.trim() || args.reason.length > 600) throw new Error('Supply a short public withdrawal reason')
    await ctx.db.patch(story._id, { state: 'withdrawn', withdrawalReason: args.reason, generation: story.generation + 1, updatedAt: Date.now() })
    return null
  },
})

export const history = query({
  args: { storyId: v.id('stories') },
  returns: v.array(schema.doc('storyVersions')),
  handler: async (ctx, args) => {
    await requireOwner(ctx)
    return ctx.db.query('storyVersions').withIndex('by_story_id_and_version', q => q.eq('storyId', args.storyId)).order('desc').take(20)
  },
})

export const uploadImage = mutation({
  args: {}, returns: v.string(),
  handler: async ctx => { await requireOwner(ctx); return ctx.storage.generateUploadUrl() },
})
