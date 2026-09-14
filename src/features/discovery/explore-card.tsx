import {
  ArrowUpRightIcon,
  Building2Icon,
  CalendarDaysIcon,
  FileTextIcon,
  LayersIcon,
  NewspaperIcon,
} from 'lucide-react'
import { Link, useRouterState } from '@tanstack/react-router'
import type { ExploreEntry } from './explore-model'
import type { ResultRowData } from './contracts'
import { formatDate } from './format'
import {
  evidenceJourneySearch,
  evidenceScenarioFromRouteSearch,
} from '../resident-handoff/navigation'
import './explore-card.css'

const icons = {
  Story: NewspaperIcon,
  Issue: LayersIcon,
  'Decision record': FileTextIcon,
  Meeting: CalendarDaysIcon,
  'Government body': Building2Icon,
  'Routine record': FileTextIcon,
}
const actions = {
  Story: 'Read story',
  Issue: 'Explore issue',
  'Decision record': 'View decision',
  Meeting: 'View meeting',
  'Government body': 'Browse decisions',
  'Routine record': 'View record',
}

export function ExploreCard({
  entry,
  image,
}: {
  entry: ExploreEntry
  image?: ResultRowData['image']
}) {
  const journey = useRouterState({
    select: (state) => ({
      currentHref: state.location.href,
      scenario: evidenceScenarioFromRouteSearch(state.location.search),
    }),
  })
  const issue = entry.kind === 'issue' ? entry.issue : null
  const row = entry.kind === 'issue' ? null : entry.row
  const kind = issue ? 'Issue' : row!.kind
  const Icon = icons[kind]
  const href = issue ? (issue.href ?? `/issues/${issue.slug}`) : row!.href
  const title = issue?.title ?? row!.title
  const summary = issue?.whyMatter ?? row?.summary
  const place = issue?.place ?? row?.place
  const body = issue?.body ?? row?.body
  const status = issue?.state ?? row?.state
  const evidence = issue?.evidence.status ?? row?.sourceStatus
  const checked = issue?.evidence.checked ?? row?.checked
  const date =
    issue?.nextDate ??
    issue?.latestOutcome ??
    (row?.date ? { label: 'Meeting date', date: row.date } : null)
  const topics = issue?.topics ?? row?.topics ?? []
  const media = row?.image ?? image
  const detailSearch =
    kind === 'Government body' ? { body } : evidenceJourneySearch(journey)
  const content = (
    <>
      <div className="pp-explore-card-content">
        <div className="pp-explore-card-heading">
          <span className="pp-explore-card-kind">
            <Icon aria-hidden="true" />
            {kind}
          </span>
          {status && status !== 'Status not stated' ? (
            <span className="pp-explore-card-state">{status}</span>
          ) : null}
        </div>
        {place || body ? (
          <p className="pp-explore-card-place">
            {[place, body === title ? undefined : body]
              .filter(
                (value, index, all) => value && all.indexOf(value) === index,
              )
              .join(' · ')}
          </p>
        ) : null}
        <h2 className="pp-explore-card-title">{title}</h2>
        {media ? (
          <img
            className="pp-explore-card-image"
            src={media.url}
            alt={media.alt}
            loading="lazy"
          />
        ) : null}
        {summary ? <p className="pp-explore-card-summary">{summary}</p> : null}
        {topics.length ? (
          <div className="pp-explore-card-topics">
            {topics.map((topic) => (
              <span key={topic}>{topic}</span>
            ))}
          </div>
        ) : null}
        <div className="pp-explore-card-details">
          {date ? (
            <p>
              <CalendarDaysIcon aria-hidden="true" />
              <span>
                {date.label} · {formatDate(date.date)}
              </span>
            </p>
          ) : null}
          {row?.reviewedThrough ? (
            <p>Reviewed through {formatDate(row.reviewedThrough)}</p>
          ) : null}
          {evidence ? (
            <p data-limited={evidence !== 'Evidence available' || undefined}>
              {evidence}
              {checked ? ` · Checked ${formatDate(checked)}` : ''}
            </p>
          ) : null}
          {issue?.evidence.note ? (
            <p className="pp-explore-card-note">{issue.evidence.note}</p>
          ) : null}
          {row?.id ? <p>Record {row.id}</p> : null}
          {row?.meta ? <p>{row.meta}</p> : null}
        </div>
        <div className="pp-explore-card-action">
          {actions[kind]}
          <ArrowUpRightIcon aria-hidden="true" />
        </div>
      </div>
    </>
  )
  const className = 'pp-explore-card'
  return /^https?:/.test(href) ? (
    <a className={className} data-kind={kind} href={href}>
      {content}
    </a>
  ) : (
    <Link
      className={className}
      data-kind={kind}
      to={kind === 'Government body' ? '/explore' : href}
      search={detailSearch}
    >
      {content}
    </Link>
  )
}
