import type { Id } from '../_generated/dataModel'
import { env } from '../_generated/server'
import type { MutationCtx } from '../_generated/server'
import { createOpaqueToken, hashAccessToken } from './secrets'

export async function alertUnsubscribeUrl(
  ctx: MutationCtx,
  subscriberId: Id<'emailSubscribers'>,
): Promise<string> {
  const token = createOpaqueToken()
  await ctx.db.insert('emailAccessTokens', {
    subscriberId,
    kind: 'unsubscribe',
    tokenHash: await hashAccessToken(token),
    createdAt: Date.now(),
  })
  return `${env.CONVEX_SITE_URL.replace(/\/$/, '')}/coverage/unsubscribe/${encodeURIComponent(token)}`
}
