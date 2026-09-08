import { ArrowUpRightIcon } from 'lucide-react'

export function VoterFooter() {
  return (
    <aside aria-label="Voter information" className="resident-voter">
      <p className="resident-voter-date">
        Next statewide election <strong>Nov 3, 2026</strong>
      </p>
      <p className="resident-voter-text">
        <a
          href="https://voterportal.sos.la.gov"
          rel="noreferrer"
          target="_blank"
        >
          Check registration and sample ballots{' '}
          <ArrowUpRightIcon aria-hidden="true" />
        </a>
      </p>
      <p className="resident-voter-note">
        Louisiana Secretary of State calendar. Date checked Sep 4, 2026.
      </p>
    </aside>
  )
}
