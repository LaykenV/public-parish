import { v } from 'convex/values'
import { internal } from '../_generated/api'
import type { Id } from '../_generated/dataModel'
import type { ActionCtx } from '../_generated/server'
import { env } from '../_generated/server'
import { estimateCostUsd, PermanentModelError } from './types'
import type { ModelRole, ModelUsage } from './types'

export const spendingScope = v.union(v.literal('sources'), v.literal('ask'))
export type SpendingScope = typeof spendingScope.type
const MICROS_PER_DOLLAR = 1_000_000
export const DEFAULT_MAX_COMPLETION_TOKENS = 16_000

export function reservationMicros(role: ModelRole, input: string, maxCompletionTokens: number): number {
  if (!Number.isSafeInteger(maxCompletionTokens) || maxCompletionTokens <= 0 || maxCompletionTokens > 32_000) throw new Error('Invalid model output bound.')
  // UTF-8 bytes overestimate ordinary text tokens. Include schema and message
  // framing, and do not assume a provider cache hit before the request runs.
  const promptTokens = new TextEncoder().encode(input).byteLength + 4096
  const cost = estimateCostUsd(role, { promptTokens, completionTokens: maxCompletionTokens, totalTokens: null, cachedTokens: 0, reasoningTokens: null })!
  return Math.max(1, Math.ceil(cost * MICROS_PER_DOLLAR))
}

export async function reserveModelSpend(ctx: ActionCtx, scope: SpendingScope, role: ModelRole, input: string, maxCompletionTokens: number): Promise<Id<'aiSpendingReservations'> | null> {
  if (env.AI_SPENDING_GUARD_ENABLED !== 'true') return null
  const reservationId = await ctx.runMutation(internal.ai.spendingLedger.reserve, { scope, micros: reservationMicros(role, input, maxCompletionTokens) })
  if (!reservationId) throw new PermanentModelError('ai_spending_limit', 'Paid AI processing is paused because its approved allowance is exhausted, expired, or disabled.')
  return reservationId
}

export async function settleModelSpend(ctx: ActionCtx, reservationId: Id<'aiSpendingReservations'> | null, role: ModelRole, usage: ModelUsage | null): Promise<void> {
  if (!reservationId) return
  const cost = usage && usage.promptTokens !== null && usage.completionTokens !== null ? estimateCostUsd(role, usage) : null
  await ctx.runMutation(internal.ai.spendingLedger.settle, { reservationId, actualMicros: cost === null ? null : Math.ceil(cost * MICROS_PER_DOLLAR) })
}
