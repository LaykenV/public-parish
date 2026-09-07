import { LAUNCH_STORIES } from './manifest'
import type { Id } from '../_generated/dataModel'
import type { MutationCtx } from '../_generated/server'
import { advanceCorpusRevision } from '../resident/search'
import { resolvePublicStory } from './resident'

export async function indexStory(ctx: MutationCtx, storyId: Id<'stories'>) {
  const record = await ctx.db.get(storyId)
  if (!record) return
  const key = `story:${record.slug}`
  const previous = await ctx.db.query('publishedSearchEntries').withIndex('by_key', q => q.eq('key', key)).unique()
  const story = await resolvePublicStory(ctx, record)
  if (!story) {
    if (previous) await ctx.db.delete(previous._id)
  } else {
    const entry = { key, kind: 'story' as const, revision: story.revision, href: `/stories/${story.slug}`, title: story.payload.title.text, summary: story.payload.summary.text,
      bodyName: 'Reviewed story', placeName: LAUNCH_STORIES[record.storyKey].parish, placeSlug: LAUNCH_STORIES[record.storyKey].parish.toLowerCase().replaceAll(' ', '-'), mode: story.mode, lifecycle: 'Developing', topics: [], date: story.reviewedThrough,
      dateAt: Date.parse(`${story.reviewedThrough}T00:00:00Z`), checkedAt: Date.parse(`${story.reviewedThrough}T00:00:00Z`),
      searchText: [story.payload.title.text, story.payload.summary.text, ...story.geography, ...story.payload.sections.flatMap(section => section.statements.map(statement => statement.text))].join('\n') }
    if (previous) await ctx.db.replace(previous._id, entry)
    else await ctx.db.insert('publishedSearchEntries', entry)
  }
  await advanceCorpusRevision(ctx)
}
