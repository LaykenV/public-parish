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
      Your ballot depends on your precinct.{' '}
      <a
        href="https://voterportal.sos.la.gov/"
        target="_blank"
        rel="noreferrer"
      >
        Check your sample ballot at the Secretary of State.
      </a>
    </p>
  )
}

export function BallotSection({
  home = false,
  compact = false,
}: {
  home?: boolean
  compact?: boolean
}) {
  const measures = useBallotMeasures()
  if (home && !measures?.length) return null
  const visibleMeasures = home && compact ? measures?.slice(0, 2) : measures
  return (
    <section
      className="pp-section pp-ballot"
      data-home={home || undefined}
      data-compact={(home && compact) || undefined}
      aria-labelledby="ballot-title"
    >
      <header>
        <h2 id="ballot-title">
          {home ? 'On the November 3 ballot' : 'Statewide amendments'}
        </h2>
        <p>
          Proposed Louisiana constitutional amendments for the November 3, 2026
          election. Read the ballot question and what the official Act would
          change.
        </p>
        {home && compact && measures ? (
          <p className="pp-story-meta">
            Previewing {visibleMeasures?.length} of {measures.length} statewide
            amendments.
          </p>
        ) : null}
        {home ? <BallotNotice /> : null}
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
          {visibleMeasures?.map((measure) => {
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
                  {!home ? <p>{measure.payload.summary.text}</p> : null}
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
      {!home ? (
        <p>
          No parish propositions have been verified for this guide. This is not
          a complete sample ballot.
        </p>
      ) : (
        <p className="pp-ballot-guide-link">
          <Link className="pp-story-read" to="/ballot">
            Read the ballot guide <ArrowUpRightIcon aria-hidden="true" />
          </Link>
        </p>
      )}
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
            Understand the amendments before you vote. Read each ballot
            question, see what the official Act would change and open the
            documents behind it.
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
          <h2 id="voter-tools-title">Before you vote</h2>
          <p>
            Your ballot depends on your precinct. Use the Louisiana Secretary of
            State's tools for your own voting information.
          </p>
          <a
            className="pp-story-read"
            href="https://voterportal.sos.la.gov/"
            target="_blank"
            rel="noreferrer"
          >
            Check registration and sample ballot{' '}
            <ArrowUpRightIcon aria-hidden="true" />
          </a>
          <a
            className="pp-story-read"
            href="https://www.sos.la.gov/elections-voting/voter-registration-faqs"
            target="_blank"
            rel="noreferrer"
          >
            How to register or update your registration{' '}
            <ArrowUpRightIcon aria-hidden="true" />
          </a>
          <p className="pp-story-meta">
            Official voter links checked September 14, 2026.
          </p>
        </aside>
      </header>
      <BallotSection />
    </main>
  )
}
