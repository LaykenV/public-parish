import { placeIsSupported } from '../coverage/publicHealth'
import type { QueryCtx } from '../_generated/server'
import type { Id } from '../_generated/dataModel'
import { PUBLIC_BODY_LABELS, publicBodyLabel, resolvePublicBodyFilter } from '../coverage/labels'
import { AREA_SLUGS } from '../follows/contracts'

// Resolve a bounded resident area selection before applying publication limits.
// A body focus narrows the selected areas to the bodies carrying that public
// label; an unknown label yields no bodies rather than every body.
export async function selectedBodyIds(ctx: QueryCtx, areas?: readonly string[], body?: string, city?: string, bodies?: string[]) {
  const selected = bodies ?? (body ? [body] : [])
  if (selected.length > 25 || selected.some(label => label.length > 120)) throw new Error('Body focus exceeds its bounds.')
  const labels = new Set(selected.map(resolvePublicBodyFilter))
  const selectedAreas = areas?.length ? areas : selected.length || city ? AREA_SLUGS : null
  if (!selectedAreas) return null
  if (selectedAreas.length > AREA_SLUGS.length) throw new Error('Too many selected areas.')
  if (body !== undefined && body.length > 120) throw new Error('Body focus exceeds its bounds.')
  if (city !== undefined && city.length > 80) throw new Error('City focus exceeds its bounds.')
  const ids: Id<'governmentBodies'>[] = []
  for (const slug of new Set(selectedAreas)) {
    const jurisdictions = await ctx.db.query('jurisdictions')
      .withIndex('by_slug', q => q.eq('slug', slug)).take(2)
    if (jurisdictions.length !== 1) continue
    const candidates = await ctx.db.query('governmentBodies')
      .withIndex('by_jurisdiction_and_slug', q => q.eq('jurisdictionId', jurisdictions[0]._id)).take(26)
    if (candidates.length > 25) throw new Error('Selected area exceeds the body limit.')
    for (const candidate of candidates) {
      if (city && (candidate.municipality ?? PUBLIC_BODY_LABELS[candidate.slug]?.municipality)?.slug !== city) continue
      if (labels.size === 0 || labels.has(publicBodyLabel(candidate))) ids.push(candidate._id)
    }
  }
  return ids
}

export async function statewideBodyIds(ctx: QueryCtx) {
  if (!await placeIsSupported(ctx, 'louisiana')) return []
  const place = await ctx.db.query('jurisdictions').withIndex('by_slug', q => q.eq('slug', 'louisiana')).unique()
  if (!place) return []
  return (await ctx.db.query('governmentBodies').withIndex('by_jurisdiction_and_slug', q => q.eq('jurisdictionId', place._id)).take(25)).filter(body => body.publicStatus === 'supported').map(body => body._id)
}
