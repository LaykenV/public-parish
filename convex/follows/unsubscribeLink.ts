import type { Id } from '../_generated/dataModel'
import { env } from '../_generated/server'
import type { MutationCtx } from '../_generated/server'
import { createOpaqueToken, decryptPrivateText, encryptPrivateText, hashAccessToken } from './secrets'

export async function alertUnsubscribeUrl(
  ctx: MutationCtx,
  subscriberId: Id<'emailSubscribers'>,
): Promise<string> {
  const subscriber = await ctx.db.get(subscriberId)
  if (!subscriber || subscriber.state !== 'verified') throw new Error('The subscriber is not verified')
  const cached = subscriber.alertUnsubscribeTokenId
    ? await ctx.db.get(subscriber.alertUnsubscribeTokenId)
    : null
  const reusable = cached?.subscriberId === subscriberId && cached.kind === 'unsubscribe' &&
    cached.revokedAt === undefined && cached.consumedAt === undefined ? cached : null
  if (reusable?.encryptedAlertToken) {
    return unsubscribeUrl(await decryptPrivateText(reusable.encryptedAlertToken))
  }
  const token = createOpaqueToken()
  const tokenId = await ctx.db.insert('emailAccessTokens', {
    subscriberId,
    kind: 'unsubscribe',
    tokenHash: await hashAccessToken(token),
    encryptedAlertToken: await encryptPrivateText(token),
    createdAt: Date.now(),
  })
  await ctx.db.patch(subscriberId, { alertUnsubscribeTokenId: tokenId })
  return unsubscribeUrl(token)
}

function unsubscribeUrl(token: string): string {
  return `${env.CONVEX_SITE_URL.replace(/\/$/, '')}/coverage/unsubscribe/${encodeURIComponent(token)}`
}
