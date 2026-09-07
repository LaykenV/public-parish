/// <reference types="vite/client" />
import { convexTest } from 'convex-test'
import { afterEach, expect, test, vi } from 'vitest'
import example from '../../docs/story-manifests/import-contract-v1.example.json'
import { api } from '../_generated/api'
import schema from '../schema'
import { sha256HexOfText } from '../sources/hashing'

const modules = import.meta.glob('../**/*.ts')
afterEach(() => vi.unstubAllEnvs())
async function setup() {
  vi.stubEnv('ADMIN_EMAIL', 'owner@example.com')
  const t = convexTest(schema, modules)
  const ownerId = await t.run(ctx => ctx.db.insert('users', {
    googleAccountId: 'owner', email: 'owner@example.com', emailVerified: true,
    createdAt: 1, updatedAt: 1, lastSignedInAt: 1,
  }))
  const residentId = await t.run(ctx => ctx.db.insert('users', {
    googleAccountId: 'resident', email: 'resident@example.com', emailVerified: true,
    createdAt: 1, updatedAt: 1, lastSignedInAt: 1,
  }))
  const manifestJson = JSON.stringify(example)
  const args = { manifestJson, expectedBundleHash: await sha256HexOfText(manifestJson) }
  return { t, owner: t.withIdentity({ subject: ownerId }), resident: t.withIdentity({ subject: residentId }), args }
}

test('only the owner can stage or inspect research, even with a known import ID', async () => {
  const { t, owner, resident, args } = await setup()
  await expect(t.mutation(api.stories.imports.stage, args)).rejects.toThrow('Sign in with Google')
  await expect(resident.mutation(api.stories.imports.stage, args)).rejects.toThrow('Owner access')
  const imported = await owner.mutation(api.stories.imports.stage, args)
  await expect(resident.query(api.stories.imports.preview, { importId: imported.importId })).rejects.toThrow('Owner access')
  await expect(t.query(api.stories.imports.list, { paginationOpts: { numItems: 10, cursor: null } })).rejects.toThrow('Sign in with Google')
})

test('identical imports replay without publication, provider work or duplicate rows', async () => {
  const { t, owner, args } = await setup()
  const first = await owner.mutation(api.stories.imports.stage, args)
  const replay = await owner.mutation(api.stories.imports.stage, args)
  expect(replay).toEqual({ ...first, reused: true })
  const preview = await owner.query(api.stories.imports.preview, { importId: first.importId })
  expect(preview?.state).toBe('staged')
  await t.run(async ctx => {
    expect(await ctx.db.query('storyImports').collect()).toHaveLength(1)
    expect(await ctx.db.query('aiCalls').collect()).toHaveLength(0)
    expect(await ctx.db.query('publicationVersions').collect()).toHaveLength(0)
    expect(await ctx.db.query('notificationDeliveries').collect()).toHaveLength(0)
    expect(await ctx.db.query('governmentBodies').collect()).toHaveLength(0)
  })
})

test('changed bytes cannot reuse a bundle identity or bypass the expected hash', async () => {
  const { owner, args } = await setup()
  await owner.mutation(api.stories.imports.stage, args)
  const manifestJson = `${args.manifestJson}\n`
  await expect(owner.mutation(api.stories.imports.stage, { ...args, manifestJson })).rejects.toThrow('bytes changed')
  await expect(owner.mutation(api.stories.imports.stage, {
    manifestJson, expectedBundleHash: await sha256HexOfText(manifestJson),
  })).rejects.toThrow('different bytes')
})

test('revisions require an exact predecessor belonging to the same story', async () => {
  const { owner, args } = await setup()
  await owner.mutation(api.stories.imports.stage, args)
  const revised = { ...example, bundleVersion: 2, supersedesBundleSha256: args.expectedBundleHash }
  const manifestJson = JSON.stringify(revised)
  const result = await owner.mutation(api.stories.imports.stage, { manifestJson, expectedBundleHash: await sha256HexOfText(manifestJson) })
  expect(result.reused).toBe(false)
  revised.bundleVersion = 3
  revised.supersedesBundleSha256 = 'b'.repeat(64)
  const invalid = JSON.stringify(revised)
  await expect(owner.mutation(api.stories.imports.stage, { manifestJson: invalid, expectedBundleHash: await sha256HexOfText(invalid) })).rejects.toThrow('earlier bundle')
})
