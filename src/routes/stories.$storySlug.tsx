import { createFileRoute } from '@tanstack/react-router'
import { ResidentShell } from '../features/resident-blueprint/resident-shell'
import { StoryPage } from '../features/stories/story-page'
export const Route = createFileRoute('/stories/$storySlug')({ component: StoryRoute })
function StoryRoute() {
  const { storySlug } = Route.useParams()
  return <ResidentShell><StoryPage slug={storySlug} /></ResidentShell>
}
