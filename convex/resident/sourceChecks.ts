import { env } from '../_generated/server'
import type { Doc } from '../_generated/dataModel'
import type { QueryCtx } from '../_generated/server'

// Coverage certification and an enabled monitoring policy are separate facts.
export async function sourceChecksPaused(ctx: QueryCtx, body: Doc<'governmentBodies'>): Promise<boolean> {
  if (body.publicStatus === 'paused' || env.SOURCE_MONITORING_ENABLED !== 'true') return true
  const registries = await ctx.db.query('sourceRegistries')
    .withIndex('by_body_and_status', (q) => q.eq('governmentBodyId', body._id)).take(26)
  if (registries.length > 25) throw new Error('Source registry limit exceeded.')
  for (const registry of registries) {
    if (!['supported', 'degraded'].includes(registry.status)) continue
    const policy = await ctx.db.query('sourceMonitoringPolicies')
      .withIndex('by_registry_id', (q) => q.eq('registryId', registry._id)).unique()
    if (policy?.enabled) return false
  }
  return true
}
