import { AREA_SLUGS } from '../../../convex/follows/contracts'
import { StatewideSection } from './statewide-section'
import { BallotSection } from '../stories/ballot-page'
import { ArrowUpRightIcon, SearchIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'

import {
  PageLoading,
  usePageLoading,
} from '../resident-blueprint/resident-loading'
import { Button } from '../../components/ui/button'
import { ResidentSectionBoundary } from '../resident-blueprint/resident-recovery'
import { FeaturedStories } from '../stories/story-page'
import { LouisianaRelief } from '../landing/louisiana-relief'
import { AreaSelector } from './area-selector'
import { setArea, useArea, useHasSelectedArea } from './area-store'
import {
  areaName,
  getActiveDiscoveryFixture,
  homeFocusArea,
  homeBodySelection,
  HOME_CITIES,
} from './contracts'
import {
  ChooseAreaButton,
  HomeBodyFilter,
  StatewideStoriesButton,
} from './home-controls'
import { Spinner } from '../../components/ui/spinner'
import type {
  AreaSlug,
  HomeSearch,
  HomeCity,
  HomeScenario,
  IssueCardData,
  ResultRowData,
} from './contracts'
import { EXPLORE_ROW_FIXTURES, PUBLISHED_ISSUE_FIXTURES } from './fixtures'
import { useRepeatedAnnouncement, useMediaQuery } from './hooks'
import { HomeIssueCards } from './home-issue-cards'
import {
  toDecisionRow,
  toIssueCard,
  usePublishedDecisions,
  usePublishedIssues,
} from './live-publications'
import { Notice, SectionFailure, UpdateRow } from './notice'
import { ResultRow } from './result-row'

import './home.css'

const HOME_SECTION_LIMIT = 6

export function HomePage({
  area: urlArea,
  city,
  body,
  bodies,
  scenario,
}: {
  area?: HomeSearch['area']
  city?: HomeCity
  body?: string
  bodies?: string[]
  scenario?: HomeScenario
}) {
  const storedArea = useArea()
  const hasSelectedArea = useHasSelectedArea()
  const area = homeFocusArea({ area: urlArea, body, bodies, city }, storedArea)
  useEffect(() => {
    if (storedArea !== area) setArea(area)
  }, [area, storedArea])
  const pageLoading = usePageLoading()
  const focusKey = `${area ?? 'louisiana'}:${hasSelectedArea}`
  const previousFocus = useRef(focusKey)
  const mainRef = useRef<HTMLElement>(null)
  const activeScenario = getActiveDiscoveryFixture(scenario)
  const fixturesEnabled = activeScenario !== undefined
  const watching: AreaSlug[] = area
    ? [area]
    : activeScenario === 'signed-in'
      ? ['lafayette-parish', 'east-baton-rouge-parish']
      : []
  const selected = watching.length > 0
  const showHero = !selected && !hasSelectedArea
  const showStories = !selected && !fixturesEnabled
  // A body focus only narrows a single focused parish.
  const selectedBodies = homeBodySelection({ body, bodies }, area)
  const bodyFocus = selectedBodies.length === 1 ? selectedBodies[0] : undefined
  const cityFocus = selectedBodies.length ? undefined : city
  const resetKey = `${area ?? 'all'}:${selectedBodies.join(',') || city || 'all'}:${scenario ?? 'live'}`

  useEffect(() => {
    if (pageLoading) return
    if (previousFocus.current === focusKey) return
    // Choosing a parish removes the hero and its opener; returning to Louisiana
    // removes the back control. Either way the page heading changes, so give
    // keyboard users a stable destination after the dialog unmounts.
    const frame = window.requestAnimationFrame(() => {
      if (document.querySelector('[role="dialog"]')) return
      previousFocus.current = focusKey
      mainRef.current
        ?.querySelector<HTMLElement>('h1')
        ?.focus({ preventScroll: true })
    })
    return () => window.cancelAnimationFrame(frame)
  }, [focusKey, pageLoading])

  return (
    <main className="pp-page pp-home" id="resident-main" ref={mainRef}>
      {showHero ? <FirstVisitHero /> : null}
      {showStories ? (
        <FeaturedStories
          mainHeading={!showHero}
          action={<ChooseAreaButton />}
        />
      ) : null}
      {!fixturesEnabled && showStories ? <><StatewideSection /><BallotSection home /></> : null}
      <div id="local-content">
        <ResidentSectionBoundary label="Local issues" resetKey={resetKey}>
          <LocalIssues
            pageHeading={!showHero && !showStories}
            city={cityFocus}
            body={bodyFocus}
            bodies={selectedBodies}
            fixturesEnabled={fixturesEnabled}
            scenario={activeScenario}
            watching={watching}
          />
        </ResidentSectionBoundary>
      </div>
      {!fixturesEnabled && !showStories ? <BallotSection home /> : null}
      <ResidentSectionBoundary label="Decision records" resetKey={resetKey}>
        <LocalDecisionRecords
          city={cityFocus}
          bodies={selectedBodies}
          fixturesEnabled={fixturesEnabled}
          watching={watching}
        />
      </ResidentSectionBoundary>
    </main>
  )
}

function FirstVisitHero() {
  const desktop = useMediaQuery('(min-width: 48.001rem)')
  return (
    <section
      className="pp-home-hero"
      aria-labelledby="home-title"
      data-relief-interaction
    >
      <div className="pp-home-hero-copy">
        <h1 id="home-title" tabIndex={-1}>
          Understand what Louisiana's government is deciding.
        </h1>
        <p>
          See the documents behind each decision and follow what happens next.
        </p>
        <div className="pp-home-hero-actions">
          <AreaSelector
            trigger={(props) => (
              <Button {...props} size="touch">
                <SearchIcon aria-hidden="true" /> Focus on a parish
              </Button>
            )}
          />
          <a href="#stories">
            Browse Louisiana stories <ArrowUpRightIcon aria-hidden="true" />
          </a>
        </div>
        <p className="pp-home-access">
          Free to read and ask questions. No account needed.
        </p>
      </div>
      <div className="pp-home-relief">
        {desktop ? <LouisianaRelief /> : null}
      </div>
    </section>
  )
}

function LocalIssues({
  pageHeading,
  city,
  body,
  bodies,
  watching,
  scenario,
  fixturesEnabled,
}: {
  pageHeading: boolean
  city?: HomeCity
  body?: string
  bodies?: string[]
  watching: AreaSlug[]
  scenario?: HomeScenario
  fixturesEnabled: boolean
}) {
  const publishedIssues = usePublishedIssues(
    !fixturesEnabled,
    watching.length ? watching : [...AREA_SLUGS],
    undefined,
    city,
    bodies?.length ? bodies : undefined,
  )
  const [refreshed, setRefreshed] = useState(false)
  const [refreshAnnouncement, announceRefresh] = useRepeatedAnnouncement(
    'Home updated from the official record.',
  )
  const fixtureIssues = scenario === 'no-issues' ? [] : PUBLISHED_ISSUE_FIXTURES
  const issues = filterIssues(
    fixturesEnabled
      ? fixtureIssues
      : (publishedIssues ?? [])
          .map(toIssueCard)
          .filter((issue): issue is IssueCardData => issue !== null),
    watching,
  )

  return (
    <>
      <p aria-live="polite" className="visually-hidden" role="status">
        {refreshAnnouncement}
      </p>
      {scenario === 'update' && !refreshed ? (
        <UpdateRow
          onRefresh={() => {
            setRefreshed(true)
            announceRefresh()
          }}
        />
      ) : null}
      <IssuesSection
        pageHeading={pageHeading}
        city={city}
        body={body}
        bodies={bodies}
        issues={issues}
        loading={!fixturesEnabled && publishedIssues === undefined}
        scenario={scenario}
        watching={watching}
      />
      {scenario === 'degraded' ? (
        <Notice
          action={
            <Button
              render={<Link to="/coverage" />}
              size="touch"
              variant="outline"
            >
              View coverage
            </Button>
          }
          title="Source delayed"
          tone="warning"
        >
          <p>
            Agenda packets from the Lafayette City-Parish Council are posting
            late. Public Parish last checked Aug 27. Decisions since Aug 1 may
            be missing.
          </p>
        </Notice>
      ) : null}
    </>
  )
}

function LocalDecisionRecords({
  city,
  bodies,
  watching,
  fixturesEnabled,
}: {
  city?: HomeCity
  bodies?: string[]
  watching: AreaSlug[]
  fixturesEnabled: boolean
}) {
  const publishedDecisions = usePublishedDecisions(
    !fixturesEnabled,
    watching.length ? watching : [...AREA_SLUGS],
    undefined,
    city,
    bodies?.length ? bodies : undefined,
  )
  const rows = fixturesEnabled
    ? filterFixtureRows(
        EXPLORE_ROW_FIXTURES.filter((row) => row.kind === 'Decision record'),
        watching,
      )
    : (publishedDecisions ?? [])
        .filter((decision) => isWatched(decision.placeSlug, watching))
        .map(toDecisionRow)
  return (
    <DecisionRecordsSection
      loading={!fixturesEnabled && publishedDecisions === undefined}
      rows={rows}
    />
  )
}

function IssuesSection({
  pageHeading,
  city,
  body,
  bodies,
  issues,
  loading,
  scenario,
  watching,
}: {
  pageHeading: boolean
  city?: HomeCity
  body?: string
  bodies?: string[]
  issues: IssueCardData[]
  loading: boolean
  scenario?: HomeScenario
  watching: AreaSlug[]
}) {
  const [recovered, setRecovered] = useState(false)
  const settled = useHasLoaded(!loading)
  const showFailure = scenario === 'section-failure' && !recovered
  const Heading = pageHeading ? 'h1' : 'h2'
  const focused = watching.length === 1 && scenario !== 'signed-in'
  const title = body
    ? `Issues from ${body}`
    : city
      ? `Issues in ${HOME_CITIES[city].name}`
      : watching.length === 1
        ? `Issues in ${areaName(watching[0])}`
        : watching.length > 1
          ? 'Issues in your saved areas'
          : 'Issues across covered parishes'

  return (
    <section
      aria-labelledby="current-issues-title"
      className="pp-section pp-home-issues"
      id="current-issues"
    >
      <div className={focused ? 'pp-home-issues-header' : 'pp-section-head'}>
        <Heading
          className="pp-home-issues-title"
          id="current-issues-title"
          tabIndex={pageHeading ? -1 : undefined}
        >
          {title}
        </Heading>
        {focused ? (
          <div className="pp-home-issue-actions">
            <StatewideStoriesButton />
          </div>
        ) : null}
        {focused ? (
          <HomeBodyFilter
            key={watching[0]}
            bodies={bodies ?? []}
            city={city}
            area={watching[0]}
          />
        ) : null}
        {focused ? (
          <p className="pp-section-copy">
            Follow an issue through the decisions that shape it.
          </p>
        ) : null}
      </div>
      {!focused ? (
        <p className="pp-section-copy">
          Follow an issue through the decisions that shape it.
        </p>
      ) : null}
      <div className="pp-home-results" aria-busy={loading}>
        {showFailure ? (
          <SectionFailure
            label="Issue timelines"
            onRetry={() => setRecovered(true)}
          />
        ) : loading ? (
          <HomeResultsLoading settled={settled} label="Updating issues" />
        ) : issues.length > 0 ? (
          <HomeIssueCards
            horizontal={!focused}
            issues={issues.slice(0, HOME_SECTION_LIMIT)}
          />
        ) : (
          <EmptyIssues city={city} body={body} watching={watching} />
        )}
      </div>
    </section>
  )
}

function EmptyIssues({
  city,
  body,
  watching,
}: {
  city?: HomeCity
  body?: string
  watching: AreaSlug[]
}) {
  const place = body
    ? ` for the ${body}`
    : city
      ? ` for ${HOME_CITIES[city].name}`
      : watching.length === 1
        ? ` for ${areaName(watching[0])}`
        : ''
  return (
    <div className="pp-empty">
      <p className="pp-empty-title">
        No published issue timeline is available{place} yet.
      </p>
      <p className="pp-empty-text">
        Individual decision records appear below. Public Parish connects them
        only after the relationship and citations pass review.
      </p>
      <Button
        render={<Link to="/explore" search={{ type: 'issue' }} />}
        size="touch"
        variant="outline"
      >
        Search all issues
      </Button>
    </div>
  )
}

function DecisionRecordsSection({
  loading,
  rows,
}: {
  loading: boolean
  rows: ResultRowData[]
}) {
  const settled = useHasLoaded(!loading)
  return (
    <section
      aria-labelledby="decision-records-title"
      className="pp-section pp-home-decisions"
      id="decision-records"
    >
      <div className="pp-section-head">
        <div>
          <h2 id="decision-records-title">Latest decision records</h2>
        </div>
        <Button
          className="pp-section-link"
          render={<Link to="/explore" search={{ type: 'decision' }} />}
          size="touch"
          variant="ghost"
        >
          Explore records
          <ArrowUpRightIcon aria-hidden="true" />
        </Button>
      </div>
      <p className="pp-section-copy">
        Read individual actions from agendas, minutes, and other official
        records.
      </p>
      <div className="pp-home-results" aria-busy={loading}>
        {loading ? (
          <HomeResultsLoading
            settled={settled}
            label="Updating decision records"
          />
        ) : rows.length > 0 ? (
          <div className="pp-row-list">
            {rows.slice(0, HOME_SECTION_LIMIT).map((row, index) => (
              <ResultRow
                key={`${row.href}-${index}`}
                row={row}
                layout="decision"
              />
            ))}
          </div>
        ) : (
          <div className="pp-empty">
            <p className="pp-empty-title">
              No published decision records are available for this area.
            </p>
            <p className="pp-empty-text">
              New records appear after their official evidence passes the
              publication checks.
            </p>
            <Button
              render={<Link to="/coverage" />}
              size="touch"
              variant="outline"
            >
              View coverage
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}

function useHasLoaded(ready: boolean) {
  const [settled, setSettled] = useState(ready)
  useEffect(() => {
    if (ready) setSettled(true)
  }, [ready])
  return settled
}

function HomeResultsLoading({
  settled,
  label,
}: {
  settled: boolean
  label: string
}) {
  if (!settled) return <PageLoading />
  return (
    <div className="pp-home-results-loading" role="status">
      <Spinner aria-hidden="true" />
      <span>{label}</span>
    </div>
  )
}

function filterIssues(issues: IssueCardData[], watching: AreaSlug[]) {
  return issues.filter(
    (issue) => watching.length === 0 || watching.some(slug => slug === issue.placeSlug),
  )
}

function isWatched(placeSlug: string, watching: AreaSlug[]) {
  return watching.length === 0 || watching.some((slug) => slug === placeSlug)
}

// Fixture rows carry no place slug, so dev-only scenarios match on the name.
function filterFixtureRows(rows: ResultRowData[], watching: AreaSlug[]) {
  const names = watching.map(areaName)
  return rows.filter(
    (row) => names.length === 0 || (row.place && names.includes(row.place)),
  )
}
