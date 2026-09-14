import type { PublicStory } from '../stories/story-page.data'
import type { ExploreEntry } from './explore-model'
import type { PublishedIssue } from './live-publications'
import { toIssueCard } from './live-publications'

export function recommendExploreEntries(
  entries: ExploreEntry[],
  stories: PublicStory[],
  issues: PublishedIssue[],
): ExploreEntry[] {
  const preferred: ExploreEntry[] = stories.map((story) => ({
    kind: 'Story',
    date: story.reviewedThrough,
    row: {
      kind: 'Story',
      href: `/stories/${story.slug}`,
      title: story.payload.title.text,
      summary: story.payload.summary.text,
      place: story.geography.join(' · '),
      reviewedThrough: story.reviewedThrough,
      sourceStatus:
        story.mode === 'full' ? 'Evidence available' : 'Limited information',
      image: story.media ?? undefined,
    },
  }))
  // The public issue query already ranks cited consequences and documented dates.
  for (const issue of issues) {
    const card = toIssueCard(issue)
    if (card)
      preferred.push({ kind: 'issue', issue: card, date: card.nextDate?.date })
  }
  const seen = new Set<string>()
  return [...preferred, ...entries].filter((entry) => {
    const key =
      entry.kind === 'issue'
        ? (entry.issue.href ?? `/issues/${entry.issue.slug}`)
        : entry.row.href
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}
