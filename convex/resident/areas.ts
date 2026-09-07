import type { QueryCtx } from '../_generated/server'
import type { Id } from '../_generated/dataModel'
import { AREA_SLUGS } from '../follows/contracts'

// Resolve a bounded resident area selection before applying publication limits.
export async function selectedBodyIds(ctx: QueryCtx, areas?: string[]) {
  if (!areas?.length) return null
  if (areas.length > AREA_SLUGS.length) throw new Error('Too many selected areas.')
  const ids: Id<'governmentBodies'>[] = []
  for (const slug of new Set(areas)) {
    const jurisdictions = await ctx.db.query('jurisdictions')
      .withIndex('by_slug', q => q.eq('slug', slug)).take(2)
    if (jurisdictions.length !== 1) continue
    const bodies = await ctx.db.query('governmentBodies')
      .withIndex('by_jurisdiction_and_slug', q => q.eq('jurisdictionId', jurisdictions[0]._id)).take(26)
    if (bodies.length > 25) throw new Error('Selected area exceeds the body limit.')
    ids.push(...bodies.map(body => body._id))
  }
  return ids
}
