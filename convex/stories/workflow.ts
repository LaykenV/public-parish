import { v } from 'convex/values'
import { internal } from '../_generated/api'
import { internalQuery } from '../_generated/server'
import { issueWorkflowManager } from '../pipeline/workflowManager'
import schema from '../schema'

export const snapshot = internalQuery({
  args: { snapshotId: v.id('sourceSnapshots') }, returns: v.union(v.null(), schema.doc('sourceSnapshots')),
  handler: (ctx, args) => ctx.db.get(args.snapshotId),
})

export const buildStory = issueWorkflowManager.define({ args: { buildId: v.id('storyBuilds') }, returns: v.null() })
  .handler(async (step, args): Promise<null> => {
    try {
      await step.runAction(internal.stories.build.draft, args, { name: 'story-draft-v1', retry: false })
      await step.runAction(internal.stories.build.review, args, { name: 'story-review-v1', retry: false })
    } catch (error) {
      await step.runMutation(internal.stories.buildLedger.fail, { buildId: args.buildId, error: error instanceof Error ? error.message : 'Story build failed' })
    }
    return null
  })
