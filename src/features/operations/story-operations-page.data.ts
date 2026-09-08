import { usePaginatedQuery, useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'
import type { StoryDraft } from '../../../convex/stories/contracts'

export function useImports() { return usePaginatedQuery(api.stories.imports.list, {}, { initialNumItems: 10 }) }
export function useImport(id: Id<'storyImports'> | null) { return useQuery(api.stories.imports.preview, id ? { importId: id } : 'skip') }
export function useSourceIntake(id: Id<'storyImports'>) { return useQuery(api.stories.intake.sources, { importId: id }) }
export function useStoryBuilds(storyKey: string) { return useQuery(api.stories.intake.builds, { storyKey }) }
export function useBuild(id: Id<'storyBuilds'>) { return useQuery(api.stories.operations.preview, { buildId: id }) }
export function useStoryIdentity(id: Id<'stories'>) { return useQuery(api.stories.intake.identity, { storyId: id }) }
export function useStoryHistory(id: Id<'stories'>) { return usePaginatedQuery(api.stories.operations.historyPage, { storyId: id }, { initialNumItems: 10 }) }

export function changedDraftFields(previous: StoryDraft | null, current: StoryDraft): string[] {
  const keys: Array<keyof StoryDraft> = ['title', 'summary', 'sections', 'timeline', 'nextAction', 'limitations']
  return keys.filter(key => !previous || JSON.stringify(previous[key]) !== JSON.stringify(current[key]))
}
