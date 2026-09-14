import { Link } from '@tanstack/react-router'
import { ArrowUpRightIcon } from 'lucide-react'
import { useStatewideDecisions } from './statewide-section.data'
import { FollowAction } from '../following/follow-action'
import { PageLoading } from '../resident-blueprint/resident-loading'
import { toDecisionCard } from './live-publications'

export function StatewideRoundup() {
  const records = useStatewideDecisions()
  if (records === undefined) return <PageLoading />
  if (!records.length) return null
  return (
    <article
      className="pp-utility-roundup"
      aria-labelledby="utility-roundup-title"
    >
      <p className="pp-story-place">Statewide utility roundup</p>
      <h3 id="utility-roundup-title">Utility rates and service</h3>
      <p className="pp-story-summary">
        Follow rate cases, service audits and energy rules before the Louisiana
        Public Service Commission. Open a case for the recorded action and its
        official sources.
      </p>
      <ul className="pp-utility-cases">
        {records.slice(0, 6).map((record) => {
          const card = toDecisionCard(record)
          if (!card) return null
          return (
            <li key={record.recordKey}>
              <Link
                to="/decisions/$recordKey"
                params={{ recordKey: record.recordKey }}
                search={{ returnTo: '/' }}
              >
                <span className="pp-utility-case-meta">
                  <span>{record.sourceRecordId}</span>
                  <span>
                    {record.mode === 'limited'
                      ? 'Limited information'
                      : card.state}
                  </span>
                </span>
                <span className="pp-utility-case-title">{record.title}</span>
                <ArrowUpRightIcon aria-hidden="true" />
              </Link>
            </li>
          )
        })}
      </ul>
      <div className="pp-utility-actions">
        <FollowAction
          available
          live
          label="Follow utility updates"
          target={{
            kind: 'Government body',
            key: 'louisiana-public-service-commission',
            title: 'Louisiana Public Service Commission',
            detail: 'Utility rate cases, service audits and energy rules',
          }}
        />
        <Link
          to="/explore"
          search={{ body: 'Louisiana Public Service Commission' }}
        >
          View commission records
        </Link>
      </div>
    </article>
  )
}
