import { internal } from '../_generated/api'
import type { Id } from '../_generated/dataModel'
import type { ActionCtx } from '../_generated/server'

export function isProviderRateLimit(error: unknown): boolean {
  // The component reports the Firecrawl API status in this exact prefix.
  // A source URL, document identifier, or target-site status is not that status.
  return /Firecrawl \/v2\/scrape failed \(429\):/i.test(String(error))
}

export function isProviderCreditExhausted(error: unknown): boolean {
  // Firecrawl answers 402 when the shared team runs out of credits. That is a
  // provider budget pause, not a failure of the government source.
  return /Firecrawl \/v2\/scrape failed \(402\):/i.test(String(error))
}

/** Maps a Firecrawl account limit to the monitoring pause it should cause. */
export function providerPause(error: unknown): 'monitoring_provider_rate_limit' | 'monitoring_provider_credits' | null {
  return isProviderRateLimit(error) ? 'monitoring_provider_rate_limit' : isProviderCreditExhausted(error) ? 'monitoring_provider_credits' : null
}

export async function reserveMonitoringRetrieval(ctx: ActionCtx, runId: Id<'sourceMonitoringRuns'>) {
  const waitMs = await ctx.runMutation(internal.monitoring.ledger.reserveRetrievalSlot, { runId })
  // This short wait preserves the first PDF download while pacing its required
  // verification scrape. A long wait returns to the durable monitoring workflow.
  if (waitMs > 0) await new Promise(resolve => setTimeout(resolve, waitMs))
  if (!await ctx.runMutation(internal.monitoring.ledger.reserve, { runId, units: 1 })) throw new Error('monitoring_daily_limit')
}
