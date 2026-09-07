# Historical document

Archived September 7, 2026 before the stories-first launch plan. This document
records an earlier plan or checkpoint. It does not authorize work, set current
budgets, or override the [current work plan](../../../work.md).
Original repository path: `docs/source-operations-2026-09-07.md`.

# Source operations, September 7, 2026 UTC

This is the recovery checkpoint before the owner funded additional processing.
The [bounded catch-up report](bounded-catchup-2026-09-07.md) records the subsequent
activation, allowances, and results. This checkpoint replaced the September 6
operating counts and activation notes at that time.
The feature build through Slice 9 is complete. Catch-up and full current source
coverage are not complete. The founder's full QA pass and launch remain ahead.

## Spending and automation

Production and development retain `SOURCE_MONITORING_ENABLED=false`. All twelve
bodies have monitoring policies; none currently runs automatic source updates.
The repair session started no paid data-processing AI or Firecrawl calls and
made no increase to account spending limits or source admissions.

[PR #138](https://github.com/LaykenV/public-parish/pull/138) adds separate,
nonrenewing estimated-cost allowances for source work and public Ask. The code
is deployed, but `AI_SPENDING_GUARD_ENABLED` remains off and neither scope has a
funded allowance. A specific small allowance is still needed before reactivation.
Existing public Ask retains its prior provider path and request limits.

The guard reserves estimated input and maximum output cost before a model call.
Known usage settles once; errors or missing usage retain the reservation.
An exhausted, expired, disabled, or missing allowance refuses new paid AI work.
A source allowance also gates new monitoring runs and retrieval admissions.
Allowances preserve prior charges when edited and do not replenish at midnight.
This controls estimated AI cost, not the complete Convex, Firecrawl, or email bill.

Keep AI Gateway as the provider and direct OpenAI fallback disabled. Before
resuming automation, configure both source and Ask allowances deliberately,
activate the guard, and reduce source admission limits as their consumed windows
allow. Do not reset consumed capacity to make a smaller limit fit. Observe a
scheduled run and compare actual ledger charges with provider telemetry before
expanding work.

## Queue and failures

Reconciliation used stored pipeline and publication results to clear stale
running target states. It did not rerun extraction or create evidence.
The subsequent bounded production audit found:

| Body | Pending decision targets | Failed decision targets | Running targets |
| --- | --- | --- | --- |
| Metropolitan Council | 164 | 3 | 0 |
| East Baton Rouge Planning and Zoning Commission | 16 | 3 | 0 |
| Rapides Parish Police Jury | 0 | 2 | 0 |
| Hearing Examiner | 0 | 1 | 0 |
| Other eight launch bodies | 0 | 0 | 0 |

These 180 pending targets are agenda or minutes extraction tasks, not public
issue timelines. The nine failed targets came from extraction processor v1.19
and failed exact-citation checks. Current v1.21 has not been rerun against them.
A newer processor is a reason to inspect and bound retries, not proof of repair.
The pending pipeline audit found 122 targets without a run, 55 with a failed
terminal run, and three with succeeded extraction runs but unresolved downstream
publication. No publication or citation gate was bypassed.

The separate issue-proposal audit found 125 pending and 56 failed proposals.
Proposal generation can inspect several pages of prior decisions, so one new
record can require more than one matching call. No estimate that a small
allowance will finish the entire backlog has been established.

Complete eligible inventories before their targets are dispatched. Keep dated
archives outside each policy's initial window excluded; unfinished old inventory
is not permission to pay for a complete archive.

## Source recovery

The Metropolitan Council and East Baton Rouge Planning and Zoning Commission
each passed all ten coverage gates after production refreshed their four
representative official links. All eight links returned HTTP 200. This used
bounded direct link checks and existing immutable evidence, with no Firecrawl
retrieval or model call. The normal recovery mutation restored both supported
statuses and resolved their source incidents. Their decision backlog remains.

Eleven launch bodies are now supported. Youngsville remains degraded. The
checked [official portal](https://meetings.municode.com/PublishPage/index?cid=YOUNGSVILA&ppid=5d44059a-1e19-4452-a226-babc4b369c18&p=1)
still lists July 9, 2026 as its newest meeting. No newer official agenda or
minutes were found. A stored February packet cannot establish current coverage.

[PR #139](https://github.com/LaykenV/public-parish/pull/139) allows the old packet
to take its meeting date from the complete, hash-checked accessible agenda for
the same official meeting ID. It ignores the editable download filename,
records the supporting snapshot, and preserves unfinished inventory and source
limitations. This prevents automatic retries outside the current source window.

The production repair returned February 12, 2026. A subsequent read confirmed
that date precedes the August 7 policy window, the evidence snapshot is recorded,
`inventoryComplete` remains false, and Youngsville remains degraded.

Lafayette remains selectable with a limitation notice. Rapides and East Baton
Rouge have records available. These statuses describe the approved bodies and
source types, not complete historical archives or currently running automation.

## Release and live checks

| Release | Merge | Production workflow |
| --- | --- | --- |
| PR #138 | `95165a9` | [Passed](https://github.com/LaykenV/public-parish/actions/runs/34076236925) |
| PR #139 | `4c42d12` | [Passed](https://github.com/LaykenV/public-parish/actions/runs/34076658256) |

The combined PR checks passed 560 tests. No local automated tests, typechecks,
builds, or lint ran. Both changes deployed to development; unfunded source and
Ask reservations returned no admission. This was a refusal check, not a paid
provider call or a live demonstration of usage settlement.

Both releases passed independent production smoke across the direct site, canonical
site, apex redirect, resident routes, search, issue evidence, share HTML, and
backend readiness. A live desktop check showed all three places selectable and
six issue cards plus six decision links on East Baton Rouge's homepage. A
375-pixel browser check showed that page without horizontal overflow or a new
card crash. These checks do not replace the founder's full QA pass.

## Still required before claiming full catch-up

- Choose and activate a small allowance; finish eligible inventory and decision
  work within it, inspect failures, and check issue-proposal recovery.
- Prove unattended progress after controlled reactivation. Deployed scheduler
  code alone is not operational proof.
- Obtain newer official Youngsville evidence and pass recovery gates against
  usable sources. Do not remove Lafayette's limitation just to make the selector
  look complete.
- Complete the founder's QA pass, current demo and submission checks, and real
  resident feedback. No hackathon submission or resident benefit is claimed.
