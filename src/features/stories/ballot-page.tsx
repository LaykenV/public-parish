import { Link } from '@tanstack/react-router'
import { useBallotMeasures } from './ballot-page.data'
import { registeredStory } from '../../../convex/stories/registry'
import { PageLoading } from '../resident-blueprint/resident-loading'
import { formatDate } from '../discovery/format'
import './stories.css'

export function BallotNotice() {
  return <p>Your ballot depends on your precinct. <a href="https://voterportal.sos.la.gov/" target="_blank" rel="noreferrer">Check your sample ballot at the Secretary of State.</a></p>
}

export function BallotSection({ home = false }: { home?: boolean }) {
  const measures = useBallotMeasures()
  if (home && !measures?.length) return null
  const CardHeading = home ? 'h3' : 'h2'
  const Heading = home ? 'h2' : 'h1'
  return <section className="pp-section pp-ballot" aria-labelledby="ballot-title">
    <header>
      <Heading id="ballot-title">On the November 3 ballot</Heading>
      <p>Proposed Louisiana constitutional amendments for the November 3, 2026 election. Read the ballot question and what the official Act would change.</p>
      <BallotNotice />
    </header>
    {measures === undefined ? <PageLoading /> : !measures.length ? <p>Measure explanations are under review. No measures have been published here yet.</p> : <ol className="pp-ballot-grid">
      {measures.map(measure => {
        const entry = registeredStory(measure.slug)
        return <li key={measure.id}>
          <article>
            <p className="pp-story-meta">Amendment {entry?.kind === 'ballot_measure' ? entry.measureNumber : ''} · Statewide</p>
            <CardHeading><Link to="/ballot/$measureSlug" params={{ measureSlug: measure.slug }}>{measure.payload.title.text}</Link></CardHeading>
            {!home ? <p>{measure.payload.summary.text}</p> : null}
            <p className="pp-story-meta">Reviewed through {formatDate(measure.reviewedThrough)}.{measure.mode === 'limited' ? ' Some questions remain unanswered.' : ''}</p>
          </article>
        </li>
      })}
    </ol>}
    {!home ? <p>No parish propositions have been verified for this guide. This is not a complete sample ballot.</p> : <p><Link to="/ballot">Read the ballot guide</Link></p>}
  </section>
}

export function BallotPage() {
  return <main id="resident-main" className="pp-page"><BallotSection /></main>
}
