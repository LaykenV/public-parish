import { useEffect, useState } from 'react'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { allowanceStatus } from './spending-status'

export function SpendingPanel() {
  const overview = useQuery(api.ai.spendingLedger.overview, {})
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30_000)
    return () => window.clearInterval(timer)
  }, [])

  return (
    <section
      className="operations-panel"
      aria-labelledby="operations-allowances"
    >
      <h2 id="operations-allowances">Paid AI allowances</h2>
      {!overview ? (
        <p role="status">Loading allowances...</p>
      ) : (
        <>
          <div className="operations-source-grid">
            {(['sources', 'ask'] as const).map((scope) => {
              const allowance = overview.allowances.find(
                (row) => row.scope === scope,
              )
              return (
                <article className="operations-source-card" key={scope}>
                  <h3>
                    {scope === 'sources' ? 'Source processing' : 'Resident Ask'}
                  </h3>
                  <p>
                    {allowanceStatus(allowance, overview.guardEnabled, now)}
                  </p>
                  {allowance ? (
                    <>
                      <p>
                        $
                        {Math.max(
                          0,
                          allowance.allowanceUsd - allowance.chargedUsd,
                        ).toFixed(4)}{' '}
                        remaining.
                      </p>
                      <p>
                        ${allowance.chargedUsd.toFixed(4)} charged or reserved
                        against a ${allowance.allowanceUsd.toFixed(2)} ceiling.
                      </p>
                      <p>
                        Expires{' '}
                        <time
                          dateTime={new Date(allowance.expiresAt).toISOString()}
                        >
                          {new Date(allowance.expiresAt).toLocaleString()}
                        </time>
                        . No automatic renewal.
                      </p>
                    </>
                  ) : null}
                </article>
              )
            })}
          </div>
          <p>
            These estimates include outstanding model reservations. Firecrawl
            credits, hosting, storage and email costs are separate. Enabling
            monitoring or choosing Check now cannot bypass an exhausted
            allowance.
          </p>
        </>
      )}
    </section>
  )
}
