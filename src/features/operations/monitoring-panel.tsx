import { useState } from 'react'
import { useMutation, usePaginatedQuery, useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { PageLoading } from '../resident-blueprint/resident-loading'
import { Button } from '../../components/ui/button'
import { SpendingPanel } from './spending-panel'

export function MonitoringPanel() {
  const overview = useQuery(api.operations.dashboard.monitoring, {})
  const configure = useMutation(api.monitoring.ledger.configure)
  const retryTarget = useMutation(api.monitoring.ledger.retryTarget)
  const retryDocument = useMutation(api.monitoring.ledger.retryDocument)
  const [deliveryState, setDeliveryState] = useState<
    'failed' | 'bounced' | 'complained' | 'rejected' | 'pending'
  >('failed')
  const deliveries = usePaginatedQuery(
    api.operations.dashboard.deliveryProblems,
    { state: deliveryState },
    { initialNumItems: 10 },
  )
  const checkNow = useMutation(api.monitoring.ledger.checkNow)
  const [pending, setPending] = useState(false)
  const [notice, setNotice] = useState('')
  const [kind, setKind] = useState<
    'pipeline' | 'ask' | 'compiler' | 'monitoring' | 'retrieval'
  >('monitoring')
  const usage = usePaginatedQuery(
    api.operations.dashboard.providerUsage,
    { kind },
    { initialNumItems: 25 },
  )
  const daily = usePaginatedQuery(
    api.operations.usage.daily,
    {},
    { initialNumItems: 10 },
  )
  const incidents = usePaginatedQuery(
    api.operations.dashboard.incidents,
    {},
    { initialNumItems: 10 },
  )
  const proposals = usePaginatedQuery(
    api.operations.dashboard.issueProposals,
    {},
    { initialNumItems: 10 },
  )
  if (!overview) return <PageLoading />
  async function operate(task: () => Promise<unknown>) {
    setPending(true)
    setNotice('')
    try {
      await task()
      setNotice('Operation saved.')
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Operation failed.')
    } finally {
      setPending(false)
    }
  }
  return (
    <div className="operations-monitoring">
      <SpendingPanel />
      <section className="operations-panel" aria-labelledby="monitoring-title">
        <h2 id="monitoring-title">Source monitoring</h2>
        <p>
          {overview.enabled
            ? 'The deployment switch is on.'
            : 'The deployment switch is off. Scheduled source checks are dormant.'}
        </p>
        <p>
          New policies check daily, inspect up to 3 documents, start up to 5
          decisions, and reserve at most 50 provider calls per day. The initial
          source window covers the past 30 days and suppresses backfill alerts.
        </p>
        <p className="operations-notice" role="status">
          {pending ? 'Saving operation...' : notice}
        </p>
        <div className="operations-source-grid">
          {overview.sources.map((source) => (
            <article className="operations-source-card" key={source.proposalId}>
              <h3>{source.bodyName}</h3>
              <p>
                {source.policy?.enabled
                  ? 'Monitoring configured. Paid work depends on the source allowance.'
                  : 'Monitoring paused'}
                {source.pendingTarget ? '. Decisions remain pending.' : ''}
                {source.failedTarget ? '. A decision needs attention.' : ''}
              </p>
              {source.policy?.lastCompletedAt ? (
                <p>
                  Last complete document check:{' '}
                  {new Date(source.policy.lastCompletedAt).toLocaleString()}
                </p>
              ) : null}
              <Button
                variant="outline"
                disabled={
                  pending || (!overview.enabled && !source.policy?.enabled)
                }
                onClick={() =>
                  void operate(() =>
                    configure({
                      proposalId: source.proposalId,
                      enabled: !source.policy?.enabled,
                      intervalHours: source.policy?.intervalHours ?? 24,
                      documentsPerRun: source.policy?.documentsPerRun ?? 3,
                      targetsPerRun: source.policy?.targetsPerRun ?? 5,
                      dailyCallLimit: source.policy?.dailyCallLimit ?? 50,
                      startsAt:
                        source.policy?.startsAt ?? Date.now() - 30 * 86_400_000,
                    }),
                  )
                }
              >
                {source.policy?.enabled
                  ? 'Pause checks'
                  : 'Enable bounded checks'}
              </Button>
              {source.failedTargetId ? (
                <Button
                  variant="outline"
                  disabled={pending}
                  onClick={() =>
                    void operate(() =>
                      retryTarget({ targetId: source.failedTargetId! }),
                    )
                  }
                >
                  Retry failed decision
                </Button>
              ) : null}
              {source.retryDocumentId ? (
                <Button
                  variant="outline"
                  disabled={pending}
                  onClick={() =>
                    void operate(() =>
                      retryDocument({ documentId: source.retryDocumentId! }),
                    )
                  }
                >
                  Retry incomplete document
                </Button>
              ) : null}
              {source.policy?.lastAttemptAt &&
              source.policy.activeRunId &&
              Date.now() - source.policy.lastAttemptAt > 2 * 3_600_000 ? (
                <p>
                  A source run has been active for more than two hours. Check
                  now replaces its expired lease.
                </p>
              ) : null}
              {source.policy ? (
                <Button
                  variant="outline"
                  disabled={pending || !source.policy.enabled}
                  onClick={() =>
                    void operate(() =>
                      checkNow({ policyId: source.policy!._id }),
                    )
                  }
                >
                  Check now
                </Button>
              ) : null}
            </article>
          ))}
        </div>
        {overview.sources.length === 0 ? (
          <p className="operations-empty">
            No approved sources are available for monitoring.
          </p>
        ) : null}
      </section>
      <div className="operations-panel-grid">
        <section className="operations-panel">
          <h2>Open source incidents</h2>
          {incidents.status !== 'LoadingFirstPage' &&
          incidents.results.length === 0 ? (
            <p className="operations-empty">No open source incidents.</p>
          ) : null}
          {incidents.results.map((incident) => (
            <p key={incident._id}>
              {incident.summary} Attempts: {incident.attempts}. Last seen:{' '}
              {new Date(incident.lastSeenAt).toLocaleString()}.
            </p>
          ))}
          {incidents.status === 'CanLoadMore' ? (
            <Button onClick={() => incidents.loadMore(10)}>
              More incidents
            </Button>
          ) : null}
        </section>
        <section className="operations-panel">
          <h2>Issue proposals</h2>
          {proposals.status !== 'LoadingFirstPage' &&
          proposals.results.length === 0 ? (
            <p className="operations-empty">No issue proposals to review.</p>
          ) : null}
          {proposals.results.map((proposal) => (
            <p key={proposal._id}>
              {proposal.state}. Checked {proposal.scanned} candidate records.{' '}
              {proposal.errorClass ?? ''}
            </p>
          ))}
          {proposals.status === 'CanLoadMore' ? (
            <Button onClick={() => proposals.loadMore(10)}>
              More proposals
            </Button>
          ) : null}
        </section>
      </div>
      <section
        className="operations-panel"
        aria-labelledby="operations-delivery"
      >
        <h2 id="operations-delivery">Notification delivery problems</h2>
        <label>
          Delivery state{' '}
          <select
            value={deliveryState}
            onChange={(event) =>
              setDeliveryState(event.target.value as typeof deliveryState)
            }
          >
            <option value="failed">Failed</option>
            <option value="bounced">Bounced</option>
            <option value="complained">Complaint</option>
            <option value="rejected">Rejected</option>
            <option value="pending">Pending</option>
          </select>
        </label>
        {deliveries.results.map((delivery) => (
          <p key={delivery.id}>
            {delivery.kind}: {delivery.state}. Enqueue attempts{' '}
            {delivery.enqueueAttempts}; receipt checks{' '}
            {delivery.reconcileAttempts}. Last change{' '}
            {new Date(delivery.updatedAt).toLocaleString()}.
          </p>
        ))}
        {deliveries.results.length === 0 ? (
          <p>No loaded deliveries in this state.</p>
        ) : null}
        {deliveries.status === 'CanLoadMore' ? (
          <Button onClick={() => deliveries.loadMore(10)}>
            More delivery problems
          </Button>
        ) : null}
      </section>
      <section className="operations-panel">
        <h2>Civic activity counts</h2>
        <p>
          Evidence opens, document opens, returns, and outcome reads are
          browser-reported. Question, answer, follow, and request counts come
          from successful server operations. Development and production stay
          separate. These counts do not prove resident benefit.
        </p>
        <ul className="operations-counter-list">
          {overview.counters.map((counter) => (
            <li key={counter._id}>
              {counter.environment}: {counter.kind.replaceAll('_', ' ')}:{' '}
              {counter.count}
            </li>
          ))}
        </ul>
      </section>
      <section className="operations-panel" aria-labelledby="operations-usage">
        <h2 id="operations-usage">Daily provider totals</h2>
        <p>
          Totals update every five minutes as ledger batches are processed.
          Source retrieval totals begin with this release; earlier retrieval
          stages do not record every provider call. Monitoring retrieval is
          counted under monitoring. Unknown usage remains separate from reported
          amounts.
        </p>
        {daily.results.map((row) => (
          <p key={row._id}>
            {row.day}, {row.kind}, {row.provider}: {row.calls} calls,{' '}
            {row.failures} unsuccessful attempts, {row.reportedTokens} reported
            tokens, ${row.estimatedCostUsd.toFixed(4)} estimated cost,{' '}
            {row.reportedCredits} reported credits. Unknown cost for{' '}
            {row.unknownCostCalls} calls, tokens for {row.unknownTokenCalls},
            and credits for {row.unknownCreditCalls}. Mean latency{' '}
            {Math.round(row.totalLatencyMs / row.calls)} ms.
          </p>
        ))}
        {daily.status === 'CanLoadMore' ? (
          <Button onClick={() => daily.loadMore(10)}>More daily totals</Button>
        ) : null}
      </section>
      <section className="operations-panel">
        <h2>Provider usage</h2>
        <label>
          Work type{' '}
          <select
            value={kind}
            onChange={(event) => setKind(event.target.value as typeof kind)}
          >
            <option value="monitoring">Source monitoring</option>
            <option value="pipeline">Evidence pipeline</option>
            <option value="retrieval">Source retrieval</option>
            <option value="compiler">Coverage compiler</option>
            <option value="ask">Resident Ask</option>
          </select>
        </label>
        <p>
          Costs are estimates. Missing provider usage means unknown, not zero.
          This list shows the loaded page, not a complete spending total.
        </p>
        <div
          className="operations-table-scroll"
          role="region"
          aria-label="Provider usage details"
          tabIndex={0}
        >
          <table>
            <caption className="sr-only">Loaded provider calls</caption>
            <thead>
              <tr>
                <th>Time</th>
                <th>Operation</th>
                <th>Provider and model</th>
                <th>Status</th>
                <th>Tokens</th>
                <th>Estimated USD</th>
                <th>Credits</th>
              </tr>
            </thead>
            <tbody>
              {usage.results.map((row) => (
                <tr key={row.id}>
                  <td>{new Date(row.at).toLocaleString()}</td>
                  <td>{row.operation}</td>
                  <td>
                    {row.provider} {row.model ?? ''}
                  </td>
                  <td>{row.status}</td>
                  <td>{row.tokens ?? 'Unknown'}</td>
                  <td>{row.estimatedCostUsd ?? 'Unknown'}</td>
                  <td>
                    {('credits' in row ? row.credits : undefined) ?? 'Unknown'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {usage.status === 'CanLoadMore' ? (
          <Button onClick={() => usage.loadMore(25)}>
            More provider calls
          </Button>
        ) : null}
      </section>
    </div>
  )
}
