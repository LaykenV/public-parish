import { Link } from '@tanstack/react-router'
import { ArrowUpRightIcon, ChevronDownIcon } from 'lucide-react'
import { useStatewideDecisions } from './statewide-section.data'
import { FollowAction } from '../following/follow-action'
import { PageLoading } from '../resident-blueprint/resident-loading'
import { toDecisionCard } from './live-publications'
import utilityImage from '../../assets/utility-roundup.webp'

export function StatewideRoundup() {
  const records = useStatewideDecisions()
  if (records === undefined) return <PageLoading />
  if (!records.length) return null
  return (
    <article
      className="pp-utility-roundup"
      aria-labelledby="utility-roundup-title"
    >
      <figure className="pp-story-image">
        <Link
          to="/explore"
          search={{ body: 'Louisiana Public Service Commission' }}
          aria-label="Explore utility cases"
        >
          <img
            src={utilityImage}
            width={1672}
            height={941}
            loading="lazy"
            alt="Illustration of power lines, a water tower and homes in a Louisiana landscape."
          />
        </Link>
        <figcaption className="pp-utility-image-credit">
          AI illustration
        </figcaption>
      </figure>
      <div className="pp-story-copy">
        <p className="pp-story-place">Statewide utility roundup</p>
        <h3 id="utility-roundup-title">
          <Link
            to="/explore"
            search={{ body: 'Louisiana Public Service Commission' }}
          >
            Utility rates and service
          </Link>
        </h3>
        <p className="pp-story-summary">
          Follow rate cases, service audits and energy rules before the
          Louisiana Public Service Commission. Open a case for the recorded
          action and its official sources.
        </p>
        <details className="pp-utility-details">
          <summary>
            Cases in this roundup <span>{Math.min(records.length, 6)}</span>
            <ChevronDownIcon aria-hidden="true" />
          </summary>
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
                    <span className="pp-utility-case-title">
                      {record.title}
                    </span>
                    <ArrowUpRightIcon aria-hidden="true" />
                  </Link>
                </li>
              )
            })}
          </ul>
        </details>
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
            className="pp-story-read"
            to="/explore"
            search={{ body: 'Louisiana Public Service Commission' }}
          >
            View commission records <ArrowUpRightIcon aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  )
}
