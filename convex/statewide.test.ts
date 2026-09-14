/// <reference types="vite/client" />
import { convexTest } from 'convex-test'
import { expect, test } from 'vitest'
import schema from './schema'
import { statewideBodyIds } from './resident/areas'
import { api } from './_generated/api'

const modules = import.meta.glob('./**/*.ts')

test('statewide Home stays empty when a body lacks a promoted coverage generation', async () => {
  const t = convexTest(schema, modules)
  await t.run(async ctx => {
    const jurisdictionId = await ctx.db.insert('jurisdictions', { slug: 'louisiana', name: 'Louisiana', type: 'state', state: 'LA', publicStatus: 'supported' })
    await ctx.db.insert('governmentBodies', { jurisdictionId, slug: 'louisiana-public-service-commission', name: 'Louisiana Public Service Commission', bodyType: 'other', publicStatus: 'supported' })
    expect(await statewideBodyIds(ctx)).toEqual([])
  })
  expect(await t.query(api.resident.discovery.listPublishedDecisions, { statewide: true })).toEqual([])
  expect(await t.query(api.resident.evidence.listPublishedIssues, { statewide: true })).toEqual([])
})
