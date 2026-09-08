/// <reference types="vite/client" />
import { convexTest } from 'convex-test'
import { afterEach, expect, test, vi } from 'vitest'
import { internal } from './_generated/api'
import { hashAccessToken } from './follows/secrets'
import { alertUnsubscribeUrl } from './follows/unsubscribeLink'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')
afterEach(() => vi.unstubAllEnvs())

test('an alert unsubscribe link requires confirmation and stops every email follow idempotently', async () => {
  vi.stubEnv('CONVEX_SITE_URL', 'https://www.publicparish.com')
  vi.stubEnv('EMAIL_ADDRESS_HMAC_KEY', btoa('alert-unsubscribe-test-key'))
  vi.stubEnv('EMAIL_ENCRYPTION_KEY', 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=')
  const t = convexTest(schema, modules)
  const fixture = await t.run(async ctx => {
    const subscriberId = await ctx.db.insert('emailSubscribers', {
      addressHash: 'alert-recipient', encryptedAddress: 'encrypted',
      encryptionVersion: 1, state: 'verified', createdAt: 1, updatedAt: 1,
    })
    for (const targetKind of ['story', 'issue'] as const) {
      const followId = await ctx.db.insert('follows', {
        ownerKind: 'email', ownerKey: `email:${subscriberId}`, emailSubscriberId: subscriberId,
        targetKind, targetKey: `${targetKind}-example`, targetTitle: 'Accepted update',
        targetDetail: 'Published evidence', createdAt: 1, updatedAt: 1,
      })
      await ctx.db.insert('notificationPreferences', { followId, cadence: 'both', createdAt: 1, updatedAt: 1 })
    }
    const noticeId = await ctx.db.insert('coverageNoticeSubscriptions', {
      subscriberId, placeKey: 'unknown:example', placeName: 'Example',
      state: 'waiting', createdAt: 1, updatedAt: 1,
    })
    return { subscriberId, noticeId, url: await alertUnsubscribeUrl(ctx, subscriberId) }
  })
  expect(await t.run(ctx => alertUnsubscribeUrl(ctx, fixture.subscriberId))).toBe(fixture.url)
  const url = new URL(fixture.url)
  expect(url.origin).toBe('https://www.publicparish.com')
  expect(url.pathname).toMatch(/^\/coverage\/unsubscribe\/[A-Za-z0-9_-]{32,100}$/)
  await t.run(async ctx => {
    const tokens = await ctx.db.query('emailAccessTokens').collect()
    expect(tokens).toHaveLength(1)
    expect(tokens[0]).toMatchObject({
      subscriberId: fixture.subscriberId, kind: 'unsubscribe',
      tokenHash: await hashAccessToken(url.pathname.split('/').at(-1) ?? ''),
    })
    expect(tokens[0].followId).toBeUndefined()
    expect(tokens[0].encryptedAlertToken).toMatch(/^v1\./)
    expect(JSON.stringify(tokens)).not.toContain(url.pathname.split('/').at(-1) ?? '')
  })
  const confirmation = await t.fetch(url.pathname)
  expect(confirmation.status).toBe(200)
  expect(await confirmation.text()).toContain('story alerts, issue alerts, weekly roundups')
  await t.run(async ctx => {
    expect((await ctx.db.get(fixture.subscriberId))?.state).toBe('verified')
    expect((await ctx.db.query('notificationPreferences').collect()).map(item => item.cadence)).toEqual(['both', 'both'])
    expect((await ctx.db.get(fixture.noticeId))?.state).toBe('waiting')
  })
  for (let attempt = 0; attempt < 2; attempt++) {
    const stopped = await t.fetch(url.pathname, { method: 'POST' })
    expect(stopped.status).toBe(200)
    expect(await stopped.text()).toContain('Email notices stopped')
  }
  await t.run(async ctx => {
    expect((await ctx.db.get(fixture.subscriberId))?.state).toBe('unsubscribed')
    expect((await ctx.db.query('notificationPreferences').collect()).map(item => item.cadence)).toEqual(['muted', 'muted'])
    expect((await ctx.db.get(fixture.noticeId))?.state).toBe('stopped')
  })
})


test('reverification revokes the cached alert token beyond the recent-token window', async () => {
  vi.stubEnv('CONVEX_SITE_URL', 'https://www.publicparish.com')
  vi.stubEnv('EMAIL_ADDRESS_HMAC_KEY', btoa('alert-unsubscribe-test-key'))
  vi.stubEnv('EMAIL_ENCRYPTION_KEY', 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=')
  const t = convexTest(schema, modules)
  const subscriberId = await t.run(ctx => ctx.db.insert('emailSubscribers', {
    addressHash: 'rotated-recipient', encryptedAddress: 'encrypted',
    encryptionVersion: 1, state: 'verified', createdAt: 1, updatedAt: 1,
  }))
  const original = await t.run(ctx => alertUnsubscribeUrl(ctx, subscriberId))
  await t.run(async ctx => {
    for (let index = 0; index < 12; index++) {
      await ctx.db.insert('emailAccessTokens', {
        subscriberId, kind: 'unsubscribe', tokenHash: `coverage-token-${index}`, createdAt: Date.now() + index + 1,
      })
    }
    await ctx.db.insert('emailVerificationChallenges', {
      subscriberId, challengeId: 'verified-again', codeHash: 'verified-code', purpose: 'create_follow',
      targetKind: 'topic', targetKey: 'public-money', cadence: 'immediate',
      expiresAt: Date.now() + 60_000, attempts: 0, createdAt: Date.now(),
    })
  })
  expect(await t.mutation(internal.follows.enrollment.consumeEmailFollowChallenge, {
    challengeId: 'verified-again', codeHash: 'verified-code',
    managementTokenHash: 'new-management', unsubscribeTokenHash: 'new-enrollment-unsubscribe',
  })).toMatchObject({ status: 'verified' })
  const replacement = await t.run(ctx => alertUnsubscribeUrl(ctx, subscriberId))
  expect(replacement).not.toBe(original)
  expect(await t.run(ctx => alertUnsubscribeUrl(ctx, subscriberId))).toBe(replacement)
  expect((await t.fetch(new URL(original).pathname, { method: 'POST' })).status).toBe(404)
  expect((await t.fetch(new URL(replacement).pathname, { method: 'POST' })).status).toBe(200)
  await t.run(async ctx => {
    expect((await ctx.db.query('emailAccessTokens').collect()).filter(token => token.encryptedAlertToken)).toHaveLength(2)
  })
})
