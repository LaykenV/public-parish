/// <reference types="vite/client" />

import agentTest from '@convex-dev/agent/test'
import rateLimiterTest from '@convex-dev/rate-limiter/test'
import { convexTest } from 'convex-test'
import { afterEach, expect, test, vi } from 'vitest'
import { api } from './_generated/api'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')
const NOW = Date.UTC(2026, 8, 14, 12)
const tokenFor = (index: number) => `write-admission-session-${index}-000000000000000000000000`

function setup() {
  const t = convexTest(schema, modules)
  agentTest.register(t)
  rateLimiterTest.register(t)
  return t
}

afterEach(() => vi.restoreAllMocks())

test('rotated session tokens share admission while existing chats remain usable', async () => {
  vi.spyOn(Date, 'now').mockReturnValue(NOW)
  const t = setup()
  const first = await t.mutation(api.ask.threads.createSession, { token: tokenFor(0) })
  for (let index = 1; index < 120; index++) {
    await t.mutation(api.ask.threads.createSession, { token: tokenFor(index) })
  }
  await expect(t.mutation(api.ask.threads.createSession, { token: tokenFor(120) }))
    .rejects.toThrow('ask_global_request_limited')
  await expect(t.mutation(api.ask.threads.createSession, { token: tokenFor(0) }))
    .resolves.toEqual(first)
  const thread = await t.mutation(api.ask.threads.createThread, {
    token: tokenFor(0), scope: { kind: 'corpus' },
  })
  await expect(t.mutation(api.ask.threads.appendQuestion, {
    token: tokenFor(0), threadId: thread.threadId,
    question: 'Which decisions have updates?', idempotencyKey: 'existing-chat-question',
  })).resolves.toMatchObject({ replayed: false })
  await t.run(async ctx => {
    expect(await ctx.db.query('anonymousSessions').take(121)).toHaveLength(120)
  })
})

test('new minute windows do not reset the daily anonymous session ceiling', async () => {
  let now = NOW
  vi.spyOn(Date, 'now').mockImplementation(() => now)
  const t = setup()
  for (let index = 0; index < 1_000; index++) {
    now = NOW + Math.floor(index / 100) * 60_000
    await t.mutation(api.ask.threads.createSession, { token: tokenFor(index) })
  }
  now += 60_000
  await expect(t.mutation(api.ask.threads.createSession, { token: tokenFor(1_000) }))
    .rejects.toThrow('ask_global_daily_limited')
  await expect(t.mutation(api.ask.threads.createSession, { token: tokenFor(0) }))
    .resolves.toMatchObject({ expiresAt: NOW + 86_400_000 })
})

test('thread admission is global across sessions before Agent storage is written', async () => {
  vi.spyOn(Date, 'now').mockReturnValue(NOW)
  const t = setup()
  for (let index = 0; index < 13; index++) {
    await t.mutation(api.ask.threads.createSession, { token: tokenFor(index) })
  }
  for (let index = 0; index < 240; index++) {
    await t.mutation(api.ask.threads.createThread, {
      token: tokenFor(Math.floor(index / 20)), scope: { kind: 'corpus' },
    })
  }
  await expect(t.mutation(api.ask.threads.createThread, {
    token: tokenFor(12), scope: { kind: 'corpus' },
  })).rejects.toThrow('ask_global_request_limited')
  await t.run(async ctx => {
    expect(await ctx.db.query('askThreadAccess').take(241)).toHaveLength(240)
  })
})

test('question admission counts unanswered writes across sessions and preserves replays', async () => {
  let now = NOW
  vi.spyOn(Date, 'now').mockImplementation(() => now)
  const t = setup()
  const threads: string[] = []
  for (let index = 0; index < 4; index++) {
    await t.mutation(api.ask.threads.createSession, { token: tokenFor(index) })
    threads.push((await t.mutation(api.ask.threads.createThread, {
      token: tokenFor(index), scope: { kind: 'corpus' },
    })).threadId)
  }
  const question = (index: number) => ({
    token: tokenFor(Math.floor(index / 30)), threadId: threads[Math.floor(index / 30)],
    question: 'Which decisions have updates?', idempotencyKey: `unanswered-question-${index}`,
  })
  const first = await t.mutation(api.ask.threads.appendQuestion, question(0))
  for (let index = 1; index < 120; index++) {
    await t.mutation(api.ask.threads.appendQuestion, question(index))
  }
  const next = { ...question(0), idempotencyKey: 'unanswered-question-next' }
  await expect(t.mutation(api.ask.threads.appendQuestion, next))
    .rejects.toThrow('ask_global_request_limited')
  await expect(t.mutation(api.ask.threads.appendQuestion, question(0)))
    .resolves.toEqual({ ...first, replayed: true })
  await t.run(async ctx => {
    expect(await ctx.db.query('askQuestionReceipts').take(121)).toHaveLength(120)
  })
  now += 60_000
  await expect(t.mutation(api.ask.threads.appendQuestion, next))
    .resolves.toMatchObject({ replayed: false })
})
