/// <reference types="vite/client" />

import { convexTest } from 'convex-test'
import { expect, test } from 'vitest'

import { internal } from './_generated/api'
import schema from './schema'

const modules = import.meta.glob('./**/*.ts')

test('the launch seed applies public labels without touching identity names', async () => {
  const t = convexTest(schema, modules)

  const first = await t.mutation(
    internal.operations.seed.seedLaunchCoverage,
    {},
  )
  expect(first.labeledBodies).toBe(0)

  await t.run(async (ctx) => {
    const body = await ctx.db
      .query('governmentBodies')
      .withIndex('by_slug', (q) => q.eq('slug', 'ebr-metropolitan-council'))
      .unique()
    expect(body).toMatchObject({
      name: 'Metropolitan Council of the Parish of East Baton Rouge and the City of Baton Rouge',
      displayName: 'Baton Rouge Metropolitan Council',
      municipality: { slug: 'baton-rouge', name: 'Baton Rouge' },
    })
    await ctx.db.patch(body!._id, {
      displayName: undefined,
      municipality: undefined,
    })
  })

  const second = await t.mutation(
    internal.operations.seed.seedLaunchCoverage,
    {},
  )
  expect(second.labeledBodies).toBe(1)
  const third = await t.mutation(
    internal.operations.seed.seedLaunchCoverage,
    {},
  )
  expect(third.labeledBodies).toBe(0)
})
