import type { Doc } from '../_generated/dataModel'
import type { QueryCtx } from '../_generated/server'

// Known official meeting dates allow the index to skip old meetings without
// discarding snapshots or treating unprocessed documents as complete.
export async function eligibleMonitoringDocuments(
  ctx: Pick<QueryCtx, 'db'>,
  policy: Doc<'sourceMonitoringPolicies'>,
  options: { limit: number; dueAt?: number; incompleteOnly?: boolean; failedOnly?: boolean },
) {
  const startsOn = new Date(policy.startsAt).toISOString().slice(0, 10)
  const undated = ctx.db.query('monitoredDocuments').withIndex('by_policy_discovery_meeting_date_and_next_check', q => q.eq('policyId', policy._id).eq('discoveryOnly', undefined).eq('sourceMeetingDate', undefined).lte('nextCheckAt', options.dueAt ?? Number.MAX_SAFE_INTEGER))
  const dated = ctx.db.query('monitoredDocuments').withIndex('by_policy_discovery_meeting_date_and_next_check', q => q.eq('policyId', policy._id).eq('discoveryOnly', undefined).gte('sourceMeetingDate', startsOn))
  const pages = await Promise.all([undated, dated].map(query => query.filter(q => q.and(
    q.lte(q.field('nextCheckAt'), options.dueAt ?? Number.MAX_SAFE_INTEGER),
    ...(options.incompleteOnly ? [q.eq(q.field('inventoryComplete'), false)] : []),
    ...(options.failedOnly ? [q.neq(q.field('errorClass'), undefined)] : []),
  )).take(options.limit)))
  return pages.flat().sort((a, b) => a.nextCheckAt - b.nextCheckAt || a._creationTime - b._creationTime).slice(0, options.limit)
}
