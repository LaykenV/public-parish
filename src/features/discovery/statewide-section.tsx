import { Link } from '@tanstack/react-router'
import { useStatewideDecisions } from './statewide-section.data'
import { FollowAction } from '../following/follow-action'
import { HomeIssueCards } from './home-issue-cards'
import { toDecisionCard, toIssueCard } from './live-publications'
import type { IssueCardData } from './contracts'

export function StatewideSection() {
  const { records, issues } = useStatewideDecisions()
  if (!records?.length && !issues?.length) return null
  const cards = (issues?.length ? issues.slice(0, 6).map(toIssueCard) : (records ?? []).slice(0, 6).map(toDecisionCard))
    .filter((card): card is IssueCardData => card !== null)
  return <section className="pp-section" aria-labelledby="statewide-decisions-title">
    <header className="pp-stories-intro"><h2 id="statewide-decisions-title">Statewide decisions</h2>
    <p>Louisiana Public Service Commission business and executive sessions.</p></header>
    <div className="pp-story-actions">
      <FollowAction available live label="Follow the commission" target={{ kind: 'Government body', key: 'louisiana-public-service-commission', title: 'Louisiana Public Service Commission', detail: 'Business and executive sessions' }} />
      <Link to="/explore" search={{ body: 'Louisiana Public Service Commission' }}>View commission records</Link>
    </div>
    <HomeIssueCards issues={cards} regionLabel="Commission decisions" itemLabel="Decision" />
  </section>
}
