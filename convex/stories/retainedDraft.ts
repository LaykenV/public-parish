import { v } from 'convex/values'
import { env, query } from '../_generated/server'
import { requireOwner } from '../auth/authorization'
import { storyDraft, checkDraft } from './contracts'
import type { StorySpan } from './contracts'
import { currentVersionEvidence } from './evidence'
import { hashStoryValue, canonicalStoryJson } from './hashing'
import { signArtifactPacket, verifyArtifactPacket, transferDeploymentSite } from './transferContract'

const packet = v.object({ contract: v.literal('story-retained-draft-v1'), originSite: v.string(), targetSite: v.string(), exportedAt: v.number(),
  storyKey: v.string(), bundleHash: v.string(), draftHash: v.string(), draftModel: v.string(), draft: storyDraft })
export const retainedDraft = v.object({ packet, signature: v.string() })
export type RetainedDraft = typeof retainedDraft.type

export async function checkRetainedDraft(value: RetainedDraft, storyKey: string, bundleHash: string, spans: StorySpan[]) {
  const p = value.packet
  if (p.originSite !== 'https://woozy-wren-227.convex.site' || p.targetSite !== transferDeploymentSite(env.CONVEX_CLOUD_URL) ||
    !Number.isFinite(p.exportedAt) || p.exportedAt > Date.now() + 60_000 || Date.now() - p.exportedAt > 7 * 86_400_000) throw new Error('Retained draft target or receipt time is invalid')
  if (p.storyKey !== storyKey || p.bundleHash !== bundleHash || !p.draftModel || canonicalStoryJson(p).length > 250_000 || await hashStoryValue(p.draft) !== p.draftHash) throw new Error('Retained draft inputs changed')
  await verifyArtifactPacket(p, value.signature, env.STORY_ARTIFACT_TRANSFER_KEY)
  const error = checkDraft(p.draft, spans)
  if (error) throw new Error(error)
}

export const exportDraft = query({
  args: { storyKey: v.union(v.literal('meta-richland'), v.literal('spacex-pecan-island'), v.literal('applied-digital-boyce')), targetSite: v.string() }, returns: retainedDraft,
  handler: async (ctx, args) => {
    await requireOwner(ctx)
    if (transferDeploymentSite(env.CONVEX_CLOUD_URL) !== 'https://woozy-wren-227.convex.site' || !['https://woozy-wren-227.convex.site', 'https://befitting-flamingo-587.convex.site'].includes(args.targetSite)) throw new Error('Choose the reviewed transfer deployment')
    const story = await ctx.db.query('stories').withIndex('by_story_key', q => q.eq('storyKey', args.storyKey)).unique()
    const version = story?.currentVersionId ? await ctx.db.get(story.currentVersionId) : null
    if (story?.state !== 'active' || !version || version.mode === 'withheld' || !await currentVersionEvidence(ctx, version)) throw new Error('Only a current accepted draft can be retained')
    const build = await ctx.db.get(version.buildId)
    const imported = build ? await ctx.db.get(build.importId) : null
    if (!build?.draftModel || !imported || await hashStoryValue(version.payload) !== version.draftHash) throw new Error('Accepted draft lineage is missing')
    const value = { contract: 'story-retained-draft-v1' as const, originSite: transferDeploymentSite(env.CONVEX_CLOUD_URL), targetSite: args.targetSite, exportedAt: Date.now(),
      storyKey: story.storyKey, bundleHash: imported.bundleHash, draftHash: version.draftHash, draftModel: build.draftModel, draft: version.payload }
    return { packet: value, signature: await signArtifactPacket(value, env.STORY_ARTIFACT_TRANSFER_KEY) }
  },
})
