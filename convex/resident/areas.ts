import type { QueryCtx } from '../_generated/server'
import type { Id } from '../_generated/dataModel'
import { PUBLIC_BODY_LABELS, publicBodyLabel, resolvePublicBodyFilter } from '../coverage/labels'
import { AREA_SLUGS } from '../follows/contracts'

// Resolve a bounded resident area selection before applying publication limits.
// A body focus narrows the selected areas to the bodies carrying that public
// label; an unknown label yields no bodies rather than every body.
export async function selectedBodyIds(ctx: QueryCtx, areas?: string[], body?: string, city?: string) {
  const selectedAreas = areas?.length ? areas : body || city ? AREA_SLUGS : null
  if (!selectedAreas) return null
  if (selectedAreas.length > AREA_SLUGS.length) throw new Error('Too many selected areas.')
  if (body !== undefined && body.length > 120) throw new Error('Body focus exceeds its bounds.')
  if (city !== undefined && city.length > 80) throw new Error('City focus exceeds its bounds.')
  const label = body ? resolvePublicBodyFilter(body) : null
  const ids: Id<'governmentBodies'>[] = []
  for (const slug of new Set(selectedAreas)) {
    const jurisdictions = await ctx.db.query('jurisdictions')
      .withIndex('by_slug', q => q.eq('slug', slug)).take(2)
    if (jurisdictions.length !== 1) continue
    const bodies = await ctx.db.query('governmentBodies')
      .withIndex('by_jurisdiction_and_slug', q => q.eq('jurisdictionId', jurisdictions[0]._id)).take(26)
    if (bodies.length > 25) throw new Error('Selected area exceeds the body limit.')
    for (const candidate of bodies) {
      if (city && (candidate.municipality ?? PUBLIC_BODY_LABELS[candidate.slug]?.municipality)?.slug !== city) continue
      if (label === null || publicBodyLabel(candidate) === label) ids.push(candidate._id)
    }
  }
  return ids
}
