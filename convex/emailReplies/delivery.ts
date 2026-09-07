import { v } from 'convex/values'

import { env, internalMutation } from '../_generated/server'
import { hashAddress } from '../follows/secrets'
import { agentmail, updatesInboxId } from '../follows/agentmailClient'
import { currentStoryUpdate } from '../stories/updates'
import { hasCurrentStoryFollow } from './intake'
import { acceptedStorySpans } from '../stories/evidence'

export const completeAnswer = internalMutation({
  args: {
    eventId: v.id('emailReplyEvents'),
    attempt: v.number(),
    answerMessageId: v.string(),
    kind: v.union(v.literal('answer'), v.literal('not_found')),
    text: v.string(),
    evidenceIds: v.optional(v.array(v.string())),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId)
    if (
      !event ||
      event.state !== 'running' ||
      event.attempt !== args.attempt ||
      event.outboundId !== undefined
    ) {
      return null
    }
    const thread = event.replyThreadId ? await ctx.db.get(event.replyThreadId) : null
    if (thread?.scopeKind === 'story') {
      const delivery = await ctx.db.get(thread.notificationDeliveryId)
      const current = delivery?.storyUpdateId ? await currentStoryUpdate(ctx, delivery.storyUpdateId) : null
      const acceptedIds = new Set(current ? acceptedStorySpans(current.version).map(span => `story:${current.version._id}:${span.key}`) : [])
      const citationsCurrent = args.kind === 'not_found' || Boolean(args.evidenceIds?.length && args.evidenceIds.length <= 120 && args.evidenceIds.every(id => acceptedIds.has(id)))
      let currentSenderHash: string | undefined
      if (delivery?.ownerKind === 'google') {
        const id = ctx.db.normalizeId('users', delivery.ownerKey.slice(7))
        const user = id ? await ctx.db.get(id) : null
        if (user) currentSenderHash = await hashAddress(user.email)
      } else if (delivery?.ownerKind === 'email') {
        const id = ctx.db.normalizeId('emailSubscribers', delivery.ownerKey.slice(6))
        const subscriber = id ? await ctx.db.get(id) : null
        if (subscriber?.state === 'verified') currentSenderHash = subscriber.addressHash
      }
      if (!delivery || !citationsCurrent || !event.senderHash || currentSenderHash !== event.senderHash || event.inboundInboxId !== env.AGENTMAIL_UPDATES_INBOX_ID?.trim() || delivery.agentmailThreadId !== event.agentmailThreadId || thread.ownerKey !== delivery.ownerKey || !current || current.story.slug !== thread.scopeKey || !await hasCurrentStoryFollow(ctx, delivery, current.story.slug)) {
        await ctx.db.patch(event._id, { state: 'ignored', errorClass: 'story_reply_evidence_or_subscription_changed', completedAt: Date.now(), updatedAt: Date.now() })
        return null
      }
    }
    const outboundId = await agentmail.replyToMessage(
      ctx,
      updatesInboxId(),
      event.inboundMessageId,
      {
        text: args.text,
        labels: ['public-parish', 'grounded-reply'],
      },
    )
    await ctx.db.patch(event._id, {
      state: args.kind === 'answer' ? 'answered' : 'not_found',
      outboundId,
      answerMessageId: args.answerMessageId,
      errorClass: undefined,
      completedAt: Date.now(),
      updatedAt: Date.now(),
    })
    return null
  },
})
