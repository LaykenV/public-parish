import { internal } from '../_generated/api'
import type { Id } from '../_generated/dataModel'
import type { ActionCtx } from '../_generated/server'

export function isProviderRateLimit(error: unknown): boolean {
  return /rate limit exceeded|too many requests|\b429\b/i.test(String(error))
}

export async function reserveMonitoringRetrieval(ctx: ActionCtx, runId: Id<'sourceMonitoringRuns'>) {
  const waitMs = await ctx.runMutation(internal.monitoring.ledger.reserveRetrievalSlot, { runId })
  // This short wait preserves the first PDF download while pacing its required
  // verification scrape. A long wait returns to the durable monitoring workflow.
  if (waitMs > 0) await new Promise(resolve => setTimeout(resolve, waitMs))
  if (!await ctx.runMutation(internal.monitoring.ledger.reserve, { runId, units: 1 })) throw new Error('monitoring_daily_limit')
}
