import { createFileRoute } from '@tanstack/react-router'
import { ResidentShell } from '../features/resident-blueprint/resident-shell'
import { StoryPage } from '../features/stories/story-page'
import { BallotNotice } from '../features/stories/ballot-page'
import { registeredStory } from '../../convex/stories/registry'

export const Route = createFileRoute('/ballot/$measureSlug')({ component: MeasureRoute })
function MeasureRoute() {
  const { measureSlug } = Route.useParams()
  return <ResidentShell>{registeredStory(measureSlug)?.kind === 'ballot_measure' ? <><div className="pp-page pp-ballot-notice"><BallotNotice /></div><StoryPage slug={measureSlug} /></> : <main className="pp-page" id="resident-main"><h1>Measure unavailable</h1><p>No registered measure exists at this address.</p></main>}</ResidentShell>
}
