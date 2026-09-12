import { v } from 'convex/values'

import type { Doc, Id } from '../_generated/dataModel'
import type { QueryCtx } from '../_generated/server'
import { query } from '../_generated/server'
import { lifecycleStates } from '../extraction/contractV1'
import { AREA_SLUGS, areaSlug } from '../follows/contracts'
import { sourceKindUnion } from '../pipeline/state'
import { selectedBodyIds } from './areas'
import { PUBLIC_BODY_LABELS, publicBodyLabel } from '../coverage/labels'

const acceptedMode = v.union(v.literal('full'), v.literal('limited'))

const residentDecision = v.object({
  recordKey: v.string(),
  sourceRecordId: v.string(),
  placeName: v.string(),
  placeSlug: v.string(),
  bodyName: v.string(),
  mode: acceptedMode,
  title: v.string(),
  summary: v.union(v.string(), v.null()),
  lifecycleState: v.union(lifecycleStates, v.null()),
  meetingAt: v.union(v.string(), v.null()),
  source: v.object({
    officialUrl: v.string(),
    retrievedAt: v.number(),
    sourceKind: sourceKindUnion,
  }),
})

type ResidentDecision = typeof residentDecision.type

const coverageArea = v.object({
  slug: areaSlug,
  status: v.union(v.literal('available'), v.literal('limited'), v.literal('validating')),
})

type CoverageArea = typeof coverageArea.type

const coverageBody = v.object({
  slug: v.string(),
  label: v.string(),
  placeSlug: areaSlug,
  municipality: v.union(v.object({ slug: v.string(), name: v.string() }), v.null()),
  published: v.boolean(),
})

type CoverageBody = typeof coverageBody.type

async function areaJurisdiction(ctx: QueryCtx, slug: string) {
  const jurisdictions = await ctx.db
    .query('jurisdictions')
    .withIndex('by_slug', (index) => index.eq('slug', slug))
    .take(2)
  return jurisdictions.length === 1 ? jurisdictions[0] : null
}

async function areaBodies(ctx: QueryCtx, jurisdictionId: Id<'jurisdictions'>) {
  return await ctx.db.query('governmentBodies')
    .withIndex('by_jurisdiction_and_slug', q => q.eq('jurisdictionId', jurisdictionId)).take(25)
}

async function hasAcceptedPublication(ctx: QueryCtx, bodyId: Id<'governmentBodies'>) {
  for (const mode of ['full', 'limited'] as const) {
    const record = await ctx.db.query('decisionRecords')
      .withIndex('by_government_body_and_current_mode_and_updated_at', q =>
        q.eq('governmentBodyId', bodyId).eq('currentMode', mode))
      .order('desc').first()
    const version = record?.currentPublishedVersionId
      ? await ctx.db.get(record.currentPublishedVersionId) : null
    if (version?.recordId === record?._id && version?.mode === mode && version.payload?.kind === mode) {
      return true
    }
  }
  return false
}

export const listCoverageAreas = query({
  args: {},
  returns: v.array(coverageArea),
  handler: async (ctx): Promise<CoverageArea[]> => {
    return await Promise.all(
      AREA_SLUGS.map(async (slug) => {
        const jurisdiction = await areaJurisdiction(ctx, slug)
        if (!jurisdiction) return { slug, status: 'validating' as const }
        if (jurisdiction.publicStatus === 'supported') return { slug, status: 'available' as const }
        for (const body of await areaBodies(ctx, jurisdiction._id)) {
          if (await hasAcceptedPublication(ctx, body._id)) return { slug, status: 'limited' as const }
        }
        return { slug, status: 'validating' as const }
      }),
    )
  },
})

// Bodies a resident can focus on within a launch area, with their public
// labels. Publication status is read from accepted records, never assumed.
export const listCoverageBodies = query({
  args: {},
  returns: v.array(coverageBody),
  handler: async (ctx): Promise<CoverageBody[]> => {
    const groups = await Promise.all(
      AREA_SLUGS.map(async (placeSlug): Promise<CoverageBody[]> => {
        const jurisdiction = await areaJurisdiction(ctx, placeSlug)
        if (!jurisdiction) return []
        const bodies = await areaBodies(ctx, jurisdiction._id)
        return await Promise.all(
          bodies.map(async (body) => ({
            slug: body.slug,
            label: publicBodyLabel(body),
            placeSlug,
            municipality: body.municipality ?? PUBLIC_BODY_LABELS[body.slug]?.municipality ?? null,
            published: await hasAcceptedPublication(ctx, body._id),
          })),
        )
      }),
    )
    return groups.flat().sort((left, right) => left.label.localeCompare(right.label))
  },
})

export const listPublishedDecisions = query({
  args: { areas: v.optional(v.array(areaSlug)), body: v.optional(v.string()) },
  returns: v.array(residentDecision),
  handler: async (ctx, args): Promise<ResidentDecision[]> => {
    const bodyIds = await selectedBodyIds(ctx, args.areas, args.body)
    const groups = await Promise.all(
      (['full', 'limited'] as const).flatMap(mode => bodyIds === null
        ? [ctx.db.query('decisionRecords')
            .withIndex('by_current_mode_and_updated_at', q => q.eq('currentMode', mode))
            .order('desc').take(50)]
        : bodyIds.map(bodyId => ctx.db.query('decisionRecords')
            .withIndex('by_government_body_and_current_mode_and_updated_at', q =>
              q.eq('governmentBodyId', bodyId).eq('currentMode', mode))
            .order('desc').take(50))),
    )
    const records = groups.flat()
      .sort((left, right) => right.updatedAt - left.updatedAt)
      .slice(0, 50)

    const decisions = await Promise.all(
      records.map((record) => project(record)),
    )
    return decisions.filter(
      (decision): decision is ResidentDecision => decision !== null,
    )

    async function project(
      record: Doc<'decisionRecords'>,
    ): Promise<ResidentDecision | null> {
      if (!record.currentPublishedVersionId || !record.currentMode) return null

      const version = await ctx.db.get(record.currentPublishedVersionId)
      if (
        !version ||
        version.recordId !== record._id ||
        version.mode !== record.currentMode ||
        version.payload === null ||
        version.payload.kind !== record.currentMode
      ) {
        return null
      }

      const body = await ctx.db.get(record.governmentBodyId)
      if (!body) return null
      const jurisdiction = await ctx.db.get(body.jurisdictionId)
      if (!jurisdiction) return null

      return {
        recordKey: record.recordKey,
        sourceRecordId: record.sourceRecordId,
        placeName: jurisdiction.name,
        placeSlug: jurisdiction.slug,
        bodyName: publicBodyLabel(body),
        mode: version.payload.kind,
        title: version.payload.title,
        summary:
          version.payload.kind === 'full'
            ? version.payload.plainLanguageSummary
            : null,
        lifecycleState:
          version.payload.kind === 'full'
            ? version.payload.lifecycleState
            : null,
        meetingAt:
          version.payload.kind === 'full' ? version.payload.meetingAt : null,
        source: {
          officialUrl: version.payload.source.officialUrl,
          retrievedAt: version.payload.source.retrievedAt,
          sourceKind: version.payload.source.sourceKind,
        },
      }
    }
  },
})
