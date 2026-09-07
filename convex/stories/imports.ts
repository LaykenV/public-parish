import { paginationOptsValidator, paginationResultValidator } from 'convex/server'
import { v } from 'convex/values'
import { mutation, query } from '../_generated/server'
import { requireOwner } from '../auth/authorization'
import schema from '../schema'
import { sha256HexOfText } from '../sources/hashing'
import { parseStoryManifest, researchBlockers } from './manifest'

export const stage = mutation({
  args: { manifestJson: v.string(), expectedBundleHash: v.string() },
  returns: v.object({ importId: v.id('storyImports'), bundleHash: v.string(), reused: v.boolean() }),
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx)
    const manifest = parseStoryManifest(args.manifestJson)
    const bundleHash = await sha256HexOfText(args.manifestJson)
    if (bundleHash !== args.expectedBundleHash) throw new Error('Bundle bytes changed before staging')
    const existing = await ctx.db.query('storyImports')
      .withIndex('by_bundle_hash', q => q.eq('bundleHash', bundleHash)).unique()
    if (existing) return { importId: existing._id, bundleHash, reused: true }
    const collision = await ctx.db.query('storyImports')
      .withIndex('by_bundle_key_and_bundle_version', q => q.eq('bundleKey', manifest.bundleKey).eq('bundleVersion', manifest.bundleVersion)).unique()
    if (collision) throw new Error('Bundle identity already exists with different bytes; increment bundleVersion')
    if (manifest.supersedesBundleSha256) {
      const previous = await ctx.db.query('storyImports')
        .withIndex('by_bundle_hash', q => q.eq('bundleHash', manifest.supersedesBundleSha256!)).unique()
      if (!previous || previous.storyKey !== manifest.story.storyKey || previous.bundleKey !== manifest.bundleKey ||
        previous.bundleVersion >= manifest.bundleVersion) throw new Error('Revision must name an earlier bundle of this story and bundle key')
    } else if (manifest.bundleVersion !== 1) {
      throw new Error('Later bundle versions require an exact predecessor hash')
    }
    const importId = await ctx.db.insert('storyImports', {
      storyKey: manifest.story.storyKey,
      bundleKey: manifest.bundleKey,
      bundleVersion: manifest.bundleVersion,
      contractVersion: manifest.contractVersion,
      bundleHash,
      manifestJson: args.manifestJson,
      state: 'staged',
      blockers: researchBlockers(manifest),
      stagedBy: owner._id,
      createdAt: Date.now(),
    })
    return { importId, bundleHash, reused: false }
  },
})

export const preview = query({
  args: { importId: v.id('storyImports') },
  returns: v.union(v.null(), schema.doc('storyImports')),
  handler: async (ctx, args) => {
    await requireOwner(ctx)
    return ctx.db.get('storyImports', args.importId)
  },
})

export const list = query({
  args: { paginationOpts: paginationOptsValidator },
  returns: paginationResultValidator(schema.doc('storyImports')),
  handler: async (ctx, args) => {
    await requireOwner(ctx)
    if (args.paginationOpts.numItems > 20) throw new Error('Use at most 20 imports per page')
    return ctx.db.query('storyImports').withIndex('by_created_at').order('desc').paginate(args.paginationOpts)
  },
})
