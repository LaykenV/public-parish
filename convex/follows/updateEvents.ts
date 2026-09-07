import type { Doc, Id } from '../_generated/dataModel'
import type { MutationCtx } from '../_generated/server'
import { currentStoryUpdate } from '../stories/updates'

export type UpdateReference = { materialChangeId?: Id<'materialChanges'>; storyUpdateId?: Id<'storyUpdateEvents'> }

export function validUpdateReference(value: UpdateReference): boolean {
  return Boolean(value.materialChangeId) !== Boolean(value.storyUpdateId)
}

export async function updateChangeKeys(ctx: Pick<MutationCtx, 'db'>, reference: UpdateReference): Promise<string[]> {
  if (!validUpdateReference(reference)) return []
  if (reference.storyUpdateId) return (await currentStoryUpdate(ctx, reference.storyUpdateId))?.event.changeKeys ?? []
  const change = reference.materialChangeId ? await ctx.db.get(reference.materialChangeId) : null
  const record = change ? await ctx.db.get(change.recordId) : null
  if (!change?.material || change.notificationEligible === false || record?.currentPublishedVersionId !== change.currentPublicationVersionId) return []
  return [`decision:${change._id}`]
}

// This is a delivery deduplication ledger, not a subscriber or message store.
// A story and a local follow can claim the same underlying approved change.
export async function claimDeliveryChanges(ctx: MutationCtx, delivery: Doc<'notificationDeliveries'>, keys: string[]): Promise<boolean> {
  const cadenceKey = delivery.kind === 'immediate' ? 'immediate' : `weekly:${delivery.roundupWindowId}`
  let ownsChange = false
  for (const changeKey of new Set(keys)) {
    const existing = await ctx.db.query('notificationChangeClaims').withIndex('by_owner_change_and_cadence', q => q.eq('ownerKey', delivery.ownerKey).eq('changeKey', changeKey).eq('cadenceKey', cadenceKey)).unique()
    if (existing) {
      if (existing.deliveryId === delivery._id) ownsChange = true
      continue
    }
    await ctx.db.insert('notificationChangeClaims', { ownerKey: delivery.ownerKey, changeKey, cadenceKey, deliveryId: delivery._id, createdAt: Date.now() })
    ownsChange = true
  }
  return ownsChange
}
