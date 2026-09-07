/// <reference types="vite/client" />
import { convexTest } from 'convex-test'
import { afterEach, expect, test, vi } from 'vitest'
import { v } from 'convex/values'
import { api, internal } from './_generated/api'
import type { ActionCtx } from './_generated/server'
import schema from './schema'
import { completeStructured } from './ai/provider'
import { reservationMicros } from './ai/spending'

const modules = import.meta.glob('./**/*.ts')
afterEach(() => vi.unstubAllEnvs())

async function fixture() {
  const t = convexTest(schema, modules)
  vi.stubEnv('ADMIN_EMAIL', 'owner@example.test')
  const userId = await t.run(ctx => ctx.db.insert('users', { email: 'owner@example.test', googleAccountId: 'owner', emailVerified: true, createdAt: 1, updatedAt: 1, lastSignedInAt: 1 }))
  return { t, owner: t.withIdentity({ subject: userId }) }
}

test('only the owner funds allowances and missing or expired allowances deny calls', async () => {
  const { t, owner } = await fixture()
  const config = { scope: 'sources' as const, allowanceUsd: 1, expiresAt: Date.now() + 60_000, enabled: true }
  await expect(t.mutation(api.ai.spendingLedger.configure, config)).rejects.toThrow()
  expect(await t.mutation(internal.ai.spendingLedger.reserve, { scope: 'sources', micros: 1 })).toBeNull()
  await owner.mutation(api.ai.spendingLedger.configure, config)
  await t.run(async ctx => { const row = await ctx.db.query('aiSpendingAllowances').first(); await ctx.db.patch(row!._id, { expiresAt: 0 }) })
  expect(await t.mutation(internal.ai.spendingLedger.reserve, { scope: 'sources', micros: 1 })).toBeNull()
})

test('reservations charge before work and settlement refunds only once', async () => {
  const { t, owner } = await fixture()
  await owner.mutation(api.ai.spendingLedger.configure, { scope: 'sources', allowanceUsd: 1, expiresAt: Date.now() + 60_000, enabled: true })
  const id = await t.mutation(internal.ai.spendingLedger.reserve, { scope: 'sources', micros: 800_000 })
  expect(id).not.toBeNull()
  expect(await t.mutation(internal.ai.spendingLedger.reserve, { scope: 'sources', micros: 300_000 })).toBeNull()
  await t.mutation(internal.ai.spendingLedger.settle, { reservationId: id!, actualMicros: 100_000 })
  await t.mutation(internal.ai.spendingLedger.settle, { reservationId: id!, actualMicros: 0 })
  expect(await owner.query(api.ai.spendingLedger.status, {})).toMatchObject([{ chargedUsd: 0.1 }])
  expect(await t.mutation(internal.ai.spendingLedger.reserve, { scope: 'ask', micros: 1 })).toBeNull()
})

test('unknown usage and lower limits retain charges without granting a new balance', async () => {
  const { t, owner } = await fixture()
  const config = { scope: 'sources' as const, allowanceUsd: 1, expiresAt: Date.now() + 60_000, enabled: true }
  await owner.mutation(api.ai.spendingLedger.configure, config)
  const id = await t.mutation(internal.ai.spendingLedger.reserve, { scope: 'sources', micros: 800_000 })
  await t.mutation(internal.ai.spendingLedger.settle, { reservationId: id!, actualMicros: null })
  await owner.mutation(api.ai.spendingLedger.configure, { ...config, allowanceUsd: 0.5 })
  expect(await owner.query(api.ai.spendingLedger.status, {})).toMatchObject([{ chargedUsd: 0.8, allowanceUsd: 0.5 }])
  expect(await t.mutation(internal.ai.spendingLedger.reserve, { scope: 'sources', micros: 1 })).toBeNull()
  await owner.mutation(api.ai.spendingLedger.configure, config)
  expect(await owner.query(api.ai.spendingLedger.status, {})).toMatchObject([{ chargedUsd: 0.8 }])
})

test('an exhausted allowance stops the structured provider before fetch', async () => {
  const { t } = await fixture()
  vi.stubEnv('AI_SPENDING_GUARD_ENABLED', 'true')
  vi.stubEnv('MODEL_FAST_ID', 'test-model')
  const fetchSpy = vi.spyOn(globalThis, 'fetch')
  const ctx = { runMutation: (reference: Parameters<typeof t.mutation>[0], args: Record<string, unknown>) => t.mutation(reference, args) } as unknown as ActionCtx
  try {
    await expect(completeStructured({ ctx, request: { role: 'MODEL_FAST', messages: [{ role: 'user', content: 'test' }], schemaName: 'test', jsonSchema: {}, reasoningEffort: 'low', maxCompletionTokens: 100 }, responseValidator: v.object({}), contractCheck: () => null })).rejects.toThrow('ai_spending_limit: Paid AI processing')
    expect(fetchSpy).not.toHaveBeenCalled()
  } finally { fetchSpy.mockRestore() }
})

test('reservation estimates include framing, Unicode bytes, and bounded output', () => {
  expect(reservationMicros('MODEL_STRONG', 'é', 100)).toBeGreaterThan(reservationMicros('MODEL_STRONG', 'e', 100))
  expect(() => reservationMicros('MODEL_FAST', '', Number.POSITIVE_INFINITY)).toThrow()
  expect(() => reservationMicros('MODEL_FAST', '', 32_001)).toThrow()
})
