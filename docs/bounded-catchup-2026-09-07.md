# Bounded catch-up, September 7, 2026 UTC

The owner approved up to $10 total in additional paid catch-up processing after
the earlier [source-recovery checkpoint](source-operations-2026-09-07.md).
This approval does not authorize a recurring allowance or another team-cap increase.

## Active controls

Production now has `AI_SPENDING_GUARD_ENABLED=true`. Its nonrenewing allowances
are $4 for source AI and $0.50 for Ask, expiring September 14 UTC. The remaining
$5.50 of the approved maximum is unallocated headroom for operating costs and
is not an automatically available model allowance. The Convex team cap did not
increase. Direct OpenAI fallback remains disabled.

The shared source admission limit fell from 50,000 per day to 200 for the first
batch. After that limit stopped calls at about $0.99 in estimated source cost,
it increased to 600 within the unchanged $4 source ceiling. Consumed admissions
were preserved. A local bucket with higher historical usage cannot be reduced
below that usage until its window clears; the shared limit and dollar allowance
still apply to every new source call.

Production source monitoring is enabled only for the Metropolitan Council.
Its checks use five targets and one document per run. Other body policies are
paused, and development source monitoring remains off. Rapides and Hearing
Examiner were enabled temporarily for three explicit saved-snapshot retries,
then reconciled and paused again before further source discovery.

The initial Metropolitan Council queue page contained 100 eligible targets with
completed saved inventories. No Firecrawl retrieval was needed for this work.
Do not enable broad retrieval or other body policies based solely on the
remaining difference between the approved maximum and the funded AI allowances.

## Results

The first Metropolitan Council batch published five targets, two full and three
limited. The Rapides retry published one limited target. The Hearing Examiner
retry published one full target. An unattended Metropolitan Council run started at 04:23:32 UTC and processed
five more targets from saved inventories. Four published limited records; one
failed exact-citation validation for its summary. Across these attempts, eleven
target outcomes published, three full and eight limited. They can include
updates to existing decisions and are not eleven new issue timelines.

At 04:36 UTC, reconciliation left 172 pending targets, six failed, and none
running. Retried validation failures can return to pending with a future retry
rather than remain in the failed count. The two new citation failures remain
unpublished.

Issue linking published one limited timeline for the street and road
rehabilitation program. It withheld two timeline versions. Another issue build
stopped at the daily admission limit. The Rapides issue review initially stopped
because its policy was paused too early; resuming its saved matches completed
review with a withheld result. Its policy was paused again after that terminal
result. These outcomes do not establish completion of the separate issue queue.

The allowance ledger reported $2.900567 charged to sources and $0.036610 to Ask
at 04:36 UTC. These are estimated charges, not an invoice. Remaining source work
can resume under the unchanged $4 total allowance after the daily admission
window permits it. The allowance does not renew.

The other Rapides retry failed on processor v1.21. The validator could not find
exact cited text for its title, lifecycle state, summary, and record type.
The target remains paused for inspection. No citation check was weakened and no
repeat paid retry was started after that failure.

A live anonymous Ask question about the Cortana rebate returned the amount and
recipient with a source citation. Opening that citation showed the supporting
minutes excerpt and the official Metropolitan Council minutes link. Ask's
allowance was separate from source processing. Ledger charges are conservative
estimates and may retain a full reservation when provider usage is unavailable.

## Remaining work

Full decision catch-up, issue-proposal recovery, and all-body automatic updates
are unfinished. Youngsville still needs newer usable official agenda or outcome
documents. Its degraded status and Lafayette's limitation remain. Eleven bodies
are supported for their approved source types, which does not establish complete
history or ongoing updates for paused policies.

The $4 source allowance does not refill when the daily admission limit resets.
A pending queue does not renew the allowance or authorize exceeding the
approved $10 maximum. Unallocated headroom is not a funded model allowance. Keep current evidence
available while paid work is paused. The founder's full QA pass and hackathon submission remain separate work.
