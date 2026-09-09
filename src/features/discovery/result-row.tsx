import { ChevronRightIcon } from 'lucide-react'
import { Link, useRouterState } from '@tanstack/react-router'

import { Badge } from '../../components/ui/badge'
import { formatDate } from './format'
import type { ResultRowData } from './contracts'
import {
  evidenceJourneySearch,
  evidenceScenarioFromRouteSearch,
} from '../resident-handoff/navigation'

export function ResultRow({
  row,
  layout = 'default',
}: {
  row: ResultRowData
  layout?: 'default' | 'decision'
}) {
  const journey = useRouterState({
    select: (state) => ({
      currentHref: state.location.href,
      scenario: evidenceScenarioFromRouteSearch(state.location.search),
    }),
  })
  const detailSearch = evidenceJourneySearch({
    currentHref: journey.currentHref,
    scenario: journey.scenario,
  })
  const metaParts = [
    row.place,
    row.body,
    row.date ? formatDate(row.date) : undefined,
    row.state,
    row.id,
  ].filter((part): part is string => Boolean(part))

  if (row.kind === 'Government body') {
    return (
      <Link className="pp-row" data-kind={row.kind} to="/coverage">
        <span className="pp-row-type">{row.kind}</span>
        <span className="pp-row-main">
          <span className="pp-row-title">{row.title}</span>
          <span className="pp-row-meta">
            {row.place} ·{' '}
            <span
              data-coverage={row.coverage === 'Supported' ? 'ok' : 'warning'}
            >
              {row.coverage}
            </span>{' '}
            · View coverage
          </span>
        </span>
        <ChevronRightIcon aria-hidden="true" className="pp-row-chevron" />
      </Link>
    )
  }

  const decisionLayout = layout === 'decision' && row.kind === 'Decision record'
  const className = decisionLayout ? 'pp-row pp-decision-row' : 'pp-row'
  const content = decisionLayout ? (
    <>
      <span className="pp-decision-date">
        <span className="pp-decision-date-label">Meeting date</span>
        <span>{row.date ? formatDate(row.date) : 'Not stated'}</span>
      </span>
      <span className="pp-row-main">
        <span className="pp-row-title">{row.title}</span>
        <span className="pp-row-meta">
          {[row.place, row.body, row.id].filter(Boolean).join(' · ')}
        </span>
        {row.state ||
        (row.sourceStatus && row.sourceStatus !== 'Evidence available') ? (
          <span className="pp-decision-status">
            {row.state ? <Badge variant="secondary">{row.state}</Badge> : null}
            {row.sourceStatus && row.sourceStatus !== 'Evidence available' ? (
              <Badge variant="warning">{row.sourceStatus}</Badge>
            ) : null}
          </span>
        ) : null}
      </span>
      <ChevronRightIcon aria-hidden="true" className="pp-row-chevron" />
    </>
  ) : (
    <>
      <span className="pp-row-type">{row.kind}</span>
      <span className="pp-row-main">
        <span className="pp-row-title">{row.title}</span>
        {metaParts.length > 0 ? (
          <span className="pp-row-meta">{metaParts.join(' · ')}</span>
        ) : null}
      </span>
      <ChevronRightIcon aria-hidden="true" className="pp-row-chevron" />
    </>
  )

  return row.href.startsWith('https://') || row.href.startsWith('http://') ? (
    <a
      className={className}
      data-kind={row.kind}
      href={row.href}
      rel="noreferrer"
      target="_blank"
    >
      {content}
    </a>
  ) : (
    <Link
      className={className}
      data-kind={row.kind}
      search={detailSearch}
      to={row.href}
    >
      {content}
    </Link>
  )
}
