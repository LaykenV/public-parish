import { MobileAsk } from '../ask/mobile-ask'
import { Link } from '@tanstack/react-router'
import { MessageCircleIcon } from 'lucide-react'

import { Button } from '../../components/ui/button'
import { PageLoading } from '../resident-blueprint/resident-loading'
import { formatDate } from '../discovery/format'
import { Notice } from '../discovery/notice'
import { ShareButton } from '../discovery/share'
import { FollowAction } from '../following/follow-action'
import { evidenceRouteHref } from '../resident-handoff/navigation'
import {
  BackLink,
  ChangeList,
  DocumentList,
  ReportProblem,
  Section,
  StateLine,
  VersionHistory,
} from './evidence-blocks'
import { Claim, EvidenceProvider, SourceControl } from './evidence-surface'
import { resolveCitationId } from './contracts'
import type { DecisionDetailFixture, EvidenceSearch } from './contracts'
import { toDecisionFixture, usePublishedDecision } from './live-evidence'
import '../stories/stories.css'
import './record-reading.css'

export function DecisionPage({
  fixture,
  onSelectSource,
  recordKey,
  search,
}: {
  fixture: DecisionDetailFixture | null
  onSelectSource: (id: string | null) => void
  recordKey: string
  search: EvidenceSearch
}) {
  if (fixture) {
    return (
      <DecisionView
        fixture={fixture}
        liveFollow={false}
        onSelectSource={onSelectSource}
        search={search}
      />
    )
  }
  return (
    <PublishedDecisionPage
      onSelectSource={onSelectSource}
      recordKey={recordKey}
      search={search}
    />
  )
}

function PublishedDecisionPage({
  onSelectSource,
  recordKey,
  search,
}: {
  onSelectSource: (id: string | null) => void
  recordKey: string
  search: EvidenceSearch
}) {
  const published = usePublishedDecision(recordKey)
  const currentFixture = published ? toDecisionFixture(published) : null
  if (published === undefined) {
    return (
      <main className="ev-page" id="resident-main">
        <PageLoading />
      </main>
    )
  }
  if (!currentFixture) return <DecisionNotFound recordKey={recordKey} />
  return (
    <DecisionView
      fixture={currentFixture}
      liveFollow
      onSelectSource={onSelectSource}
      search={{ ...search, fixture: undefined }}
    />
  )
}

function DecisionView({
  fixture,
  liveFollow,
  onSelectSource,
  search,
}: {
  fixture: DecisionDetailFixture
  liveFollow: boolean
  onSelectSource: (id: string | null) => void
  search: EvidenceSearch
}) {
  const { citations, decision } = fixture
  const selected = resolveCitationId(citations, search.source)
  const currentDecisionHref = evidenceRouteHref(
    `/decisions/${decision.recordKey}`,
    search,
  )

  return (
    <EvidenceProvider
      citations={citations}
      onSelect={onSelectSource}
      selected={selected}
    >
      <main className="ev-page ev-page-with-chat ev-reading" id="resident-main">
        <MobileAsk
          key={`${decision.recordKey}:${decision.issue?.slug ?? 'corpus'}`}
          scopeKey={decision.issue ? `issue:${decision.issue.slug}` : 'corpus'}
          returnTo={currentDecisionHref}
          scenario={search.fixture ? 'empty-issue' : undefined}
        />
        <BackLink
          label="Back to Explore"
          returnTo={search.returnTo}
          to="/explore"
        />

        <header className="ev-head pp-story-head">
          <p className="ev-kicker">
            <span>{decision.place}</span>
            <span>{decision.body}</span>
            <StateLine state={decision.state} />
          </p>
          <h1 className="ev-title">{decision.title}</h1>
          {decision.summary.length > 0 ? (
            <div className="ev-reading-summary" id="summary">
              {decision.summary.map((claim, index) => (
                <Claim citationId={claim.citationId} key={index}>
                  <p>{claim.text}</p>
                </Claim>
              ))}
            </div>
          ) : null}
          <p className="ev-record-line">
            <span className="ev-record-label">{decision.recordType}</span>
            <span className="ev-record-key">{decision.recordKey}</span>
          </p>
          <div className="pp-story-actions">
            <Button
              render={
                <Link
                  to="/ask"
                  search={
                    decision.issue
                      ? {
                          scope: 'issue',
                          issue: decision.issue.slug,
                          returnTo: currentDecisionHref,
                        }
                      : { scope: 'corpus', returnTo: currentDecisionHref }
                  }
                />
              }
              size="touch"
            >
              <MessageCircleIcon aria-hidden="true" /> Ask Public Parish
            </Button>
            {decision.issue ? (
              <FollowAction
                available
                live={liveFollow}
                label="Follow this issue"
                target={{
                  kind: 'Issue',
                  key: decision.issue.slug,
                  title: decision.issue.title,
                  detail: `${decision.place} · ${decision.body}`,
                }}
              />
            ) : null}
            <ShareButton
              path={`/decisions/${encodeURIComponent(decision.recordKey)}`}
              title={decision.title}
            />
          </div>
        </header>
        {decision.coverageNote ? (
          <p className="ev-limited-note">{decision.coverageNote}</p>
        ) : null}

        {decision.limitedNote ? (
          <Notice title="Limited information" tone="warning">
            <p>{decision.limitedNote}</p>
          </Notice>
        ) : null}

        {decision.latest ? (
          <aside aria-label="Record status" className="ev-reading-status">
            <div className="ev-status-date" data-tone="outcome">
              <p className="ev-status-label">{decision.latest.label}</p>
              <p className="ev-status-value">
                <time dateTime={decision.latest.date}>
                  {formatDate(decision.latest.date)}
                </time>
              </p>
              {decision.latest.citationId ? (
                <SourceControl citationId={decision.latest.citationId} />
              ) : null}
            </div>
          </aside>
        ) : null}

        <nav className="pp-story-jump" aria-label="In this decision">
          <a href="#fields">Accepted details</a>
          <a href="#official-title">Official item title</a>
          {decision.issue || decision.meeting ? (
            <a href="#related-records">Related records</a>
          ) : null}
          {decision.changes.length > 0 ? (
            <a href="#what-changed">What changed</a>
          ) : null}
          <a href="#sources">Official evidence</a>
        </nav>

        <div className="ev-column">
          <Section id="fields" title="Accepted details">
            <dl className="ev-fields">
              {decision.fields.map((field) => (
                <Claim citationId={field.citationId} key={field.label}>
                  <dt>{field.label}</dt>
                  <dd>
                    {field.value}
                    {field.note ? (
                      <span className="ev-field-note">{field.note}</span>
                    ) : null}
                  </dd>
                </Claim>
              ))}
            </dl>
          </Section>

          <Section id="official-title" title="Official item title">
            <Claim citationId={decision.officialTitleCitationId}>
              <p className="ev-official-title">{decision.officialTitle}</p>
            </Claim>
          </Section>

          {decision.issue || decision.meeting ? (
            <Section id="related-records" title="Related records">
              {decision.issue ? (
                <p className="ev-parent">
                  <span className="ev-parent-label">Part of the issue</span>
                  <Link
                    params={{ issueSlug: decision.issue.slug }}
                    search={{
                      fixture: search.fixture,
                      returnTo: currentDecisionHref,
                    }}
                    to="/issues/$issueSlug"
                  >
                    {decision.issue.title}
                  </Link>
                </p>
              ) : null}

              {decision.meeting ? (
                <p className="ev-parent">
                  <span className="ev-parent-label">Discussed at</span>
                  <Link
                    params={{ meetingId: decision.meeting.id }}
                    search={{
                      fixture: search.fixture,
                      returnTo: currentDecisionHref,
                    }}
                    to="/meetings/$meetingId"
                  >
                    {decision.meeting.title}
                  </Link>
                </p>
              ) : null}
            </Section>
          ) : null}

          {decision.changes.length > 0 ? (
            <Section id="what-changed" title="What changed">
              <ChangeList entries={decision.changes} />
            </Section>
          ) : null}

          <Section id="sources" title="Sources and update history">
            <DocumentList documents={decision.documents} />
            <VersionHistory versions={decision.versions} />
            <div className="ev-report-row">
              <p className="ev-report-lede">
                Something here does not match the official record?
              </p>
              <ReportProblem
                available={Boolean(search.fixture)}
                recordUrl={currentDecisionHref}
              />
            </div>
          </Section>
        </div>
      </main>
    </EvidenceProvider>
  )
}

function DecisionNotFound({ recordKey }: { recordKey: string }) {
  return (
    <main className="ev-page ev-page-recovery" id="resident-main">
      <header className="ev-head">
        <p className="ev-kicker">
          <span>Record not found</span>
        </p>
        <h1 className="ev-title">
          Public Parish has no decision record at this address.
        </h1>
        <p className="ev-recovery-text">
          Nothing is published under <code>{recordKey}</code>. Search the
          records Public Parish has accepted, or check whether the body is
          covered.
        </p>
      </header>
      <div className="ev-recovery-actions">
        <Button render={<Link to="/explore" />} size="touch">
          Search records
        </Button>
        <Button render={<Link to="/coverage" />} size="touch" variant="outline">
          Check coverage
        </Button>
      </div>
    </main>
  )
}
