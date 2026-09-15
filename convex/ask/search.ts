import { ConvexError, v } from 'convex/values'
import { internalQuery } from '../_generated/server'
import { askScope, storedScope } from './contracts'
import { authorizeThreadRead } from './threads'
import { storyAskCatalog } from '../stories/askEvidence'

// This catalog is for retrieval only. Answers still load and validate exact
// citations from the current publication after target selection.
export const searchRecord = v.object({
  recordKey: v.string(), targetKind: v.union(v.literal('decision'), v.literal('story')),
  title: v.string(), summary: v.string(), place: v.string(), body: v.string(),
  meetingDate: v.union(v.string(), v.null()), publishedAt: v.number(),
  searchText: v.string(),
})
export const searchWindow = v.object({ field: v.union(v.literal('meetingDate'), v.literal('publishedAt')), from: v.number(), to: v.number(), fromDate: v.string(), toDate: v.string() })
export const searchCatalog = v.object({ scope: askScope, records: v.array(searchRecord), window: v.optional(searchWindow) })
export type SearchCatalog = typeof searchCatalog.type

export const retrievePage = internalQuery({
  args: { token: v.string(), threadId: v.string(), cursor: v.union(v.string(), v.null()), revision: v.number(), window: v.optional(searchWindow) },
  returns: v.union(v.null(), v.object({ catalog: searchCatalog, cursor: v.string(), isDone: v.boolean(), revision: v.number() })),
  handler: async (ctx, args) => {
    const access = await authorizeThreadRead(ctx, args.token, args.threadId)
    const scope = storedScope(access.mapping.scopeKind, access.mapping.scopeKey)
    const corpus = await ctx.db.query('publicCorpusState').withIndex('by_key', q => q.eq('key', 'published')).unique()
    if ((corpus?.revision ?? 0) !== args.revision) throw new ConvexError({ code: 'ask_evidence_changed', message: 'Published evidence changed. Retry the question.' })
    if (scope.kind !== 'corpus' || !corpus?.askIndexReady) return null
    const window = args.window
    const area = scope.areaKey
    const continuation: { undated: boolean; cursor: string | null } = window && args.cursor ? JSON.parse(args.cursor) : { undated: false, cursor: args.cursor }
    const undated = window && continuation.undated
    const query = window?.field === 'publishedAt'
      ? area
        ? ctx.db.query('publishedSearchEntries').withIndex('by_kind_and_place_slug_and_published_at', q => undated ? q.eq('kind', 'decision').eq('placeSlug', area).eq('publishedAt', undefined) : q.eq('kind', 'decision').eq('placeSlug', area).gte('publishedAt', window.from).lt('publishedAt', window.to))
        : ctx.db.query('publishedSearchEntries').withIndex('by_kind_and_published_at', q => undated ? q.eq('kind', 'decision').eq('publishedAt', undefined) : q.eq('kind', 'decision').gte('publishedAt', window.from).lt('publishedAt', window.to))
      : area
        ? ctx.db.query('publishedSearchEntries').withIndex('by_kind_and_place_slug_and_date', q => {
          const range = q.eq('kind', 'decision').eq('placeSlug', area)
          return undated ? range.eq('dateAt', 0) : window ? range.gte('dateAt', window.from).lt('dateAt', window.to) : range
        })
        : ctx.db.query('publishedSearchEntries').withIndex('by_kind_and_date', q => {
          const range = q.eq('kind', 'decision')
          return undated ? range.eq('dateAt', 0) : window ? range.gte('dateAt', window.from).lt('dateAt', window.to) : range
        })
    const page = await query.paginate({ numItems: 100, cursor: continuation.cursor, maximumBytesRead: 400_000 })
    const records: SearchCatalog['records'] = []
    for (const row of page.page) {
      const id = ctx.db.normalizeId('publicationVersions', row.revision)
      const version = id ? await ctx.db.get(id) : null
      const record = version ? await ctx.db.get(version.recordId) : null
      if (!version?.payload || version.mode === 'withheld' || record?.currentPublishedVersionId !== version._id || record.currentMode !== version.mode) continue
      records.push({ recordKey: row.key, targetKind: 'decision', title: row.title, summary: row.summary,
        place: row.placeName, body: row.bodyName, meetingDate: row.date, publishedAt: version.createdAt, searchText: row.searchText })
    }
    if (args.cursor === null) {
      const stories = await storyAskCatalog(ctx, scope)
      for (const record of stories.records) records.push({ recordKey: record.recordKey, targetKind: 'story',
        title: record.title, summary: record.summary ?? '', place: record.placeName, body: record.bodyName,
        meetingDate: null, publishedAt: 0, searchText: stories.sources.filter(source => source.evidence.recordKey === record.recordKey).map(source => source.evidence.excerpt).join('\n') })
    }
    const nextUndated = !!window && !undated && page.isDone
    const cursor = window ? JSON.stringify({ undated: !!undated || nextUndated, cursor: nextUndated ? null : page.continueCursor }) : page.continueCursor
    return { catalog: { scope, records, ...(window ? { window } : {}) }, cursor, isDone: page.isDone && !nextUndated, revision: args.revision }
  },
})

// Repeated excerpts often appear under several fields and decisions. Keep each
// complete line once per model request and retain every record's references.
export function compactSearchCatalog(catalog: SearchCatalog) {
  const texts: string[] = []
  const positions = new Map<string, number>()
  const records = catalog.records.map(({ searchText, publishedAt, ...record }) => {
    const textRefs = [...new Set(searchText.split('\n').map(text => text.trim()).filter(Boolean))].map(text => {
      let index = positions.get(text)
      if (index === undefined) { index = texts.length; positions.set(text, index); texts.push(text) }
      return index
    })
    return { ...record, publicationDate: publishedAt ? new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Chicago', year: 'numeric', month: '2-digit', day: '2-digit' }).format(publishedAt) : null, textRefs }
  })
  return { records, texts, ...(catalog.window ? { window: catalog.window } : {}) }
}
