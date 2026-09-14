import { Link } from '@tanstack/react-router'
import { useStatewideDecisions } from './statewide-section.data'
import { FollowAction } from '../following/follow-action'
import { HomeIssueCards } from './home-issue-cards'
import { toDecisionCard, toIssueCard } from './live-publications'
import type { IssueCardData } from './contracts'

export function StatewideSection() {
  const { records, issues } = useStatewideDecisions()
  if (!records?.length && !issues?.length) return null
  const cards = (
    issues?.length
      ? issues.slice(0, 6).map(toIssueCard)
      : (records ?? []).slice(0, 6).map(toDecisionCard)
  ).filter((card): card is IssueCardData => card !== null)
  return (
    <section
      className="pp-section pp-home-issues"
      aria-labelledby="statewide-decisions-title"
    >
      <header className="pp-home-issues-header">
        <h2 className="pp-home-issues-title" id="statewide-decisions-title">
          Statewide decisions
        </h2>
        <p className="pp-section-copy">
          Utility rate cases, service audits and energy rules before the
          Louisiana Public Service Commission.
        </p>
        <div className="pp-home-issue-actions">
          <FollowAction
            available
            live
            label="Follow the commission"
            target={{
              kind: 'Government body',
              key: 'louisiana-public-service-commission',
              title: 'Louisiana Public Service Commission',
              detail: 'Business and executive sessions',
            }}
          />
          <Link
            to="/explore"
            search={{ body: 'Louisiana Public Service Commission' }}
          >
            View commission records
          </Link>
        </div>
      </header>
      <HomeIssueCards
        issues={cards}
        regionLabel="Commission decisions"
        itemLabel="Decision"
      />
    </section>
  )
}
