'use node'

import { v } from 'convex/values'

import { api, internal } from '../_generated/api'
import { env, internalAction } from '../_generated/server'
import type { AskAnswerResult } from '../ask/contracts'
import { formatEmailReply, formatEmailReplyContent } from './formatting'
import { decryptPrivateText, deriveEmailReplyToken } from '../follows/secrets'

export const prepareInbound = internalAction({
  args: {
    eventId: v.id('emailReplyEvents'),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const preparation = await ctx.runMutation(
      internal.emailReplies.intake.getPreparation,
      { eventId: args.eventId },
    )
    if (preparation.kind === 'skip') return null
    if (preparation.kind === 'wait') {
      await ctx.runMutation(internal.emailReplies.intake.deferPreparation, args)
      return null
    }
    try {
      const token = await deriveEmailReplyToken(preparation.agentmailThreadId)
      const session = await ctx.runMutation(api.ask.threads.createSession, {
        token,
      })
      let askThreadId = preparation.askThreadId
      if (!askThreadId) {
        if (!preparation.ownsPreparation) {
          throw new Error('thread_preparation_in_progress')
        }
        const created = await ctx.runMutation(api.ask.threads.createThread, {
          token,
          scope: preparation.scope,
        })
        const attached = await ctx.runMutation(
          internal.emailReplies.intake.attachAskThread,
          {
            eventId: args.eventId,
            askThreadId: created.threadId,
            askExpiresAt: session.expiresAt,
          },
        )
        if (!attached) throw new Error('thread_preparation_lost')
        askThreadId = created.threadId
      }
      const receipt = await ctx.runMutation(api.ask.threads.appendQuestion, {
        token,
        threadId: askThreadId,
        question: await decryptPrivateText(preparation.encryptedQuestion),
        idempotencyKey: `email-reply-${args.eventId}`,
      })
      await ctx.runMutation(internal.emailReplies.intake.completePreparation, {
        eventId: args.eventId,
        askThreadId,
        questionMessageId: receipt.messageId,
      })
    } catch (error) {
      await ctx.runMutation(internal.emailReplies.intake.retryPreparation, {
        eventId: args.eventId,
        errorClass: classifyError(error),
      })
    }
    return null
  },
})

export const answerInbound = internalAction({
  args: { eventId: v.id('emailReplyEvents') },
  returns: v.null(),
  handler: async (ctx, args) => {
    const claim = await ctx.runMutation(
      internal.emailReplies.intake.claimAnswer,
      args,
    )
    if (claim.kind === 'skip') return null
    try {
      const answer: AskAnswerResult = await ctx.runAction(
        api.ask.answer.answerQuestion,
        {
          token: await deriveEmailReplyToken(claim.agentmailThreadId),
          threadId: claim.askThreadId,
          questionMessageId: claim.questionMessageId,
        },
      )
      await ctx.runMutation(internal.emailReplies.delivery.completeAnswer, {
        eventId: args.eventId,
        attempt: claim.attempt,
        answerMessageId: answer.messageId,
        kind: answer.kind,
        evidenceIds: answer.citations.map((citation) => citation.evidenceId),
        replyContent: formatEmailReplyContent(
          answer,
          claim.officialContactUrl,
          env.CONVEX_SITE_URL,
        ),
        text: formatEmailReply(
          answer,
          claim.officialContactUrl,
          env.CONVEX_SITE_URL,
        ),
      })
    } catch (error) {
      await ctx.runMutation(internal.emailReplies.intake.failAnswer, {
        eventId: args.eventId,
        attempt: claim.attempt,
        errorClass: classifyError(error),
      })
    }
    return null
  },
})

function classifyError(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message.slice(0, 100)
  }
  return 'answer_failed'
}
