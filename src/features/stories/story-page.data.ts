import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
export type { PublicStory } from '../../../convex/stories/resident'
export function useStory(slug: string) { return useQuery(api.stories.resident.get, { slug }) }
export function useFeaturedStories() { return useQuery(api.stories.resident.featured, {}) }
