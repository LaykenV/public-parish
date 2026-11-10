import { ArrowUpRightIcon } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { useBallotMeasures } from './ballot-page.data'
import { registeredStory } from '../../../convex/stories/registry'
import { PageLoading } from '../resident-blueprint/resident-loading'
import { formatDate } from '../discovery/format'
import './stories.css'
import './elections.css'

export function BallotNotice() {
  return (
    <p>
      This election was held on November 3, 2026. Public Parish has not
      published the results.{' '}
      <a
        href="https://voterportal.sos.la.gov/graphical"
        target="_blank"
        rel="noreferrer"
      >
        See official results at the Secretary of State.
      </a>
    </p>
  )
}

export function BallotSection() {
  const measures = useBallotMeasures()
  return (
    <section className="pp-section pp-ballot" aria-labelledby="ballot-title">
      <header>
        <h2 id="ballot-title">Statewide amendments</h2>
        <p>
          Proposed Louisiana constitutional amendments that were on the
          November 3, 2026 ballot. Read the ballot question and what the
          official Act would change.
        </p>
      </header>
      {measures === undefined ? (
        <PageLoading />
      ) : !measures.length ? (
        <p>
          Measure explanations are under review. No measures have been published
          here yet.
        </p>
      ) : (
        <ol className="pp-ballot-grid">
          {measures.map((measure) => {
            const entry = registeredStory(measure.slug)
            const number =
              entry?.kind === 'ballot_measure' ? entry.measureNumber : undefined
            const title =
              number !== undefined
                ? measure.payload.title.text.replace(
                    new RegExp(`^Amendment ${number}:\\s*`),
                    '',
                  )
                : measure.payload.title.text
            return (
              <li key={measure.id}>
                <article>
                  <div className="pp-ballot-card-top">
                    <span className="pp-ballot-number" aria-hidden="true">
                      {number}
                    </span>
                    <p className="pp-story-meta">
                      Constitutional amendment
                      <br />
                      Statewide vote
                    </p>
                  </div>
                  <h3>
                    <Link
                      aria-label={measure.payload.title.text}
                      to="/ballot/$measureSlug"
                      params={{ measureSlug: measure.slug }}
                    >
                      {title}
                    </Link>
                  </h3>
                  <p>{measure.payload.summary.text}</p>
                  <p className="pp-story-meta pp-ballot-reviewed">
                    Reviewed through {formatDate(measure.reviewedThrough)}.
                    {measure.mode === 'limited'
                      ? ' Some questions remain unanswered.'
                      : ''}
                  </p>
                  <Link
                    className="pp-story-read pp-ballot-card-read"
                    to="/ballot/$measureSlug"
                    params={{ measureSlug: measure.slug }}
                    aria-label={`Read Amendment ${number}`}
                  >
                    Read amendment <ArrowUpRightIcon aria-hidden="true" />
                  </Link>
                </article>
              </li>
            )
          })}
        </ol>
      )}
      <p>
        No parish propositions have been verified for this guide. This is not
        a complete sample ballot.
      </p>
    </section>
  )
}

export function BallotPage() {
  return (
    <main id="resident-main" className="pp-page pp-elections">
      <header className="pp-election-header pp-section">
        <div className="pp-election-intro">
          <p className="pp-story-place">Elections in Louisiana</p>
          <h1>The November 3 election</h1>
          <p className="pp-election-lede">
            This election has been held. These pages keep each ballot question,
            what the official Act would change and the documents behind it.
          </p>
          <div className="pp-election-date">
            <time dateTime="2026-11-03">November 3, 2026</time>
            <a
              className="pp-story-read"
              href="https://www.sos.la.gov/elections-voting/election-dates"
              target="_blank"
              rel="noreferrer"
            >
              Election dates and deadlines{' '}
              <ArrowUpRightIcon aria-hidden="true" />
            </a>
          </div>
        </div>
        <aside
          className="pp-election-voter"
          aria-labelledby="voter-tools-title"
        >
          <h2 id="voter-tools-title">Results</h2>
          <p>
            Public Parish has not published the results of this election. The
            Louisiana Secretary of State publishes the official results.
          </p>
          <a
            className="pp-story-read"
            href="https://voterportal.sos.la.gov/graphical"
            target="_blank"
            rel="noreferrer"
          >
            See official election results{' '}
            <ArrowUpRightIcon aria-hidden="true" />
          </a>
          <p className="pp-story-meta">
            Official results link checked November 9, 2026.
          </p>
        </aside>
      </header>
      <BallotSection />
    </main>
  )
}
