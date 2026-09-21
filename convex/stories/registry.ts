// Only reviewed, code-owned entries can enter the shared publication pipeline.
export const LAUNCH_STORIES = {
  'meta-richland': { kind: 'story', rank: 0, placement: 'lead', parish: 'Richland Parish' },
  'spacex-pecan-island': { kind: 'story', rank: 1, placement: 'secondary', parish: 'Vermilion Parish' },
  'applied-digital-boyce': { kind: 'story', rank: 2, placement: 'secondary', parish: 'Rapides Parish' },
} as const

const measure = (number: number) => ({
  kind: 'ballot_measure' as const, rank: 100 + number, placement: 'ballot' as const,
  parish: 'Louisiana', electionDate: '2026-11-03', scope: 'statewide' as const,
  measureNumber: number, ballotClaimKey: 'ballot-question',
})
export const STORY_REGISTRY = {
  ...LAUNCH_STORIES,
  'beaver-lake-rapides': { kind: 'story', rank: 3, placement: 'secondary', parish: 'Rapides Parish' },
  '2026-amendment-1': measure(1),
  '2026-amendment-2': measure(2),
  '2026-amendment-3': measure(3),
  '2026-amendment-4': measure(4),
  '2026-amendment-5': measure(5),
  '2026-amendment-6': measure(6),
  '2026-amendment-7': measure(7),
  '2026-amendment-8': measure(8),
  '2026-amendment-9': measure(9),
  '2026-amendment-10': measure(10),
} as const
export type StoryKey = keyof typeof STORY_REGISTRY
export function registeredStory(slug: string) {
  return Object.prototype.hasOwnProperty.call(STORY_REGISTRY, slug) ? STORY_REGISTRY[slug as StoryKey] : null
}
export function storyPath(slug: string) {
  return `${registeredStory(slug)?.kind === 'ballot_measure' ? '/ballot' : '/stories'}/${slug}`
}

export function requiresStoryImage(slug: string) {
  return registeredStory(slug)?.kind === 'story' && slug !== 'beaver-lake-rapides'
}
