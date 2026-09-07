# Slice 9 operations

The final build and follow-up repairs through PR #139 are deployed.
[Build status](build-status.md) separates completed features from remaining work.
The owner authorized production release and bounded live testing on September 5.
See the [production certification record](slice-9-production-certification.md)
and the separate [development evidence](slice-9-development-certification.md).

## Current operating state, September 7 UTC

Source processing is paused in production and development. All twelve launch
bodies have policy rows, but `SOURCE_MONITORING_ENABLED=false` prevents runs.
Do not turn it on from the historical rollout instructions below. See the
[current checkpoint](source-operations-2026-09-07.md) before changing settings.

PR #138 adds `ai/spendingLedger:configure` and owner-only `status`. Each scope,
`sources` or `ask`, has a total estimated-cost allowance, an expiry within 31
days, and an enabled flag. Reconfiguration preserves charges. Allowances never
refill themselves. Set both scopes deliberately before activating
`AI_SPENDING_GUARD_ENABLED=true`; a missing allowance refuses paid model calls.
The guard is deployed but remains off and unfunded at this checkpoint.

Model calls reserve a conservative amount before contacting the provider and
settle against known token usage. Failed calls or missing usage retain the
reservation. This is an estimated AI-cost control, not a cap on the provider's
invoice, Convex hosting, Firecrawl retrieval, or email. Existing request and
source-admission limits continue to apply. Do not reset their consumed usage to
lower a limit; wait for its window if the new limit is below calls already used.

Restoring automatic work requires an approved small allowance, conservative
source admissions, and observation of a scheduled run. Paid source processing
remains paused until that setup is complete. Direct OpenAI fallback stays off.

## Historical initial rollout and future activation

The initial rollout kept `SOURCE_MONITORING_ENABLED=false` before activation.
These paragraphs describe earlier activation, not current runtime settings. All added
schema fields are optional or belong to new tables. Existing source snapshots,
publication versions, issue IDs, issue slugs, follows, and citations remain.
New indexes deploy with the backend. The production Gate 10 classification
recognizes the current `www.publicparish.com` override and the built-in
`befitting-flamingo-587.convex.site` endpoint. Link checks and evaluation use
the same classification. Changing the
`CONVEX_SITE_URL` override or moving production requires an explicit update to
that classification and new Gate 10 evidence. For an already promoted proposal,
run the internal `coverage/validation:refreshSourceLinks` action with its
`proposalId`, then the owner `coverage/validation:reevaluate` mutation. The
refresh checks at most 20 representative links from the named backend, guards
every redirect against the approved manifest, and never retrieves evidence
through Firecrawl or republishes records. Watch that exact workflow to completion,
then run the independent `npm run smoke:production`.

The initial production search backfill completed after PR #95. For an
explicitly authorized repair that requires another backfill, run the internal
`resident/search:backfill` mutation separately for `decision` and `issue`, with
25 records per page and the returned cursor until `isDone`. This operation
indexes accepted publications. It does not republish records or send alerts.
Verify an older accepted record through Explore and corpus Ask before enabling
source automation. The current 1,000-record boundary proof is a CI workload,
not a measured production throughput claim.

The owner approved automatic monitoring for all seven previously supported
bodies on September 6 after scheduled Rapides runs demonstrated progress.
Rapides retains one document and one target per run, a 24-hour cadence, and its
original 30-day source window. Its daily limit is temporarily 500 for catch-up,
with a normal limit of 50 to restore after catch-up and the budget window allow
it. The other six policies use three documents, five targets, and 50 daily
admissions. See the [dated source-operations report](source-operations-2026-09-06.md)
for queue counts, failures, and the remaining Lafayette monitoring limitation.
The development catch-up used a separate explicit historical window to exercise
existing official revisions. Do not copy that window into production.

An admission is a safety reservation, not a bill. Model steps reserve capacity
for the configured provider path. A 31-page PDF required two Firecrawl calls
and reported 62 credits during development. An incomplete inventory resumes its accepted immutable snapshot before another
retrieval. Completed inventories return to the source-check cadence. Checking a
completed PDF can still cost retrieval credits.
The development run hit both 200- and 400-admission limits and stopped without
losing pending work. Calibration reached the existing 500-admission maximum;
the owner later approved 500 for production Rapides catch-up on September 6.
An admission limit is not a spending guarantee.
The owner approved one additional 100-admission development credit for the
window ending September 5 at 13:25:59 UTC. The internal proof helper credits
that exact exhausted canary once and records the grant separately. It retains
the 500 daily rate, original reset time, actual provider-call history, and
global limit. A repeat call adds nothing; the next window returns to 500.
This helper refuses other deployments and cannot grant a later window.

AI Gateway is the verified provider. Keep direct OpenAI fallback disabled.
The owner accepted this configuration because development has no direct
OpenAI key. Re-enabling fallback requires its own bounded provider check.

## Automatic catch-up after PR #105

Ready decisions run before new source work. A run first reconciles the previous
batch and starts eligible targets within the existing per-run limit. While a
batch is active, this policy performs no discovery or document retrieval. The
provider limiter still applies to every extraction, review, and issue call.

An incomplete document cannot release its targets. Dispatch scans at most 100
due items and defers blocked entries so later ready work can advance. Documents
with waiting targets receive continuation priority within the bounded scan.
Budget exhaustion preserves the queue and failure attempts, then sets the next
check to the limiter reset. The 15-minute cron picks up due work automatically.
An owner does not need to start each pending target. Check now still uses the
same limits; it is not a way around an exhausted budget.

Read current queue, run, and limiter state before reporting progress. The 61
pending production targets recorded on September 5 are a historical receipt.
After the next window, verify targets advance, inspect actual rejection reasons,
and review provider use before changing limits or enabling another body.

## Stop and resume

For a deployment-wide stop, set `SOURCE_MONITORING_ENABLED=false` on the named
deployment. For one source, use Pause checks in `/operations/coverage`.
Policy changes advance the generation. Every paid step and monitored publication
checks current authority. Already issued provider requests may finish, but the
next step cannot spend or publish under a revoked generation.

Pending documents, inventory sections, target decisions, and listing cursors
remain stored. Resume the same approved policy to continue that work. Changing
the approved proposal or source window restarts listing discovery. Changing a
quota does not erase admissions already consumed in the current window.
A completed listing waits until the next scheduled discovery time. An incomplete
listing resumes its cursor without repeating completed discovery.

Use Check now for a due source. It replaces an expired two-hour lease, not an
active lease. Retry incomplete document requeues one document. Retry failed
decision resets the selected target's bounded retry state. Do not repeatedly
retry a source without inspecting the specific failure and remaining quota.

## Diagnose incomplete work

Read the private monitoring run, provider ledger, document inventory, and issue
proposal records. Inventory completeness covers the complete immutable document,
including all checkpointed sections. Continuation sends accepted locators to
both models, rejects repeated excerpts deterministically, and requires independent
review to reject the same decision with different excerpts. Prior context stops
at 1,000 targets or 250,000 serialized characters. An accepted section alone does not permit
its targets to run while the document remains incomplete.

Repeated retrieval or processing failures open a public-safe incident and can
degrade coverage. Dated accepted evidence remains readable with a warning.
A successful fetch does not prove a missing outcome. A healthy scheduled run
does not restore support by itself. Re-evaluate all coverage gates and use the
owner recovery action against the current registry generation.

Issue proposals use accepted same-body records. Competing issue matches remain
atomic and searchable. The owner may inspect the reason; do not merge issues
by changing IDs, rewriting source citations, or bypassing independent review.
A proposal marked proposed names a build, not an accepted publication. Failed or
withheld builds update their proposals. Concurrent extensions retry at most twice
against the current timeline and keep their original accepted matches. Pause,
quota, and stale-publication checks still apply. Exhausted retries need owner
inspection. Automatic scans stop after 1,000 same-body records, more than 30
matches, or more than 200 historical links for a record. Current timelines retain
at most 200 members. These bounds produce visible failures or ambiguity; they do
not authorize dropped members or guessed relationships.

## Delivery and cost review

Inspect Notification delivery problems for pending, failed, rejected, bounced,
and complained states. Provider acceptance, receipt in the controlled inbox,
and a real resident receiving useful information are different evidence.
Notice sweeps read waiting and queued subscriptions through the state index;
sent and stopped history adds no polling work. Coverage launch notices require
verification and support for the requested
place. A body promotion alone cannot trigger a parish notice. Historical
monitoring backfill suppresses notifications.

Daily usage updates from bounded ledger batches every five minutes. Model cost
is an estimate. Missing token, credit, and cost fields remain unknown. Retrieval
calls outside monitoring enter a separate ledger from this release onward.
Earlier retrieval-stage summaries do not establish every historic provider call.
Monitoring retrieval remains in monitoring totals to avoid double counting.
No provider pricing for email is inferred from delivery counts.

Application analytics distinguish development from production. Both deployments
currently share the AgentMail updates inbox, so provider messages can reach the
production callback regardless of which deployment initiated a test. Verify the
matching production challenge, delivery, or reply record before claiming proof.
Browser counts do not prove
unique residents or civic benefit. Do not add questions, answers, email addresses,
report descriptions, or arbitrary URLs to analytics or public incident text.

## AgentMail inbound delivery

The production provider endpoint is
`https://befitting-flamingo-587.convex.site/agentmail/webhook`. Its subscribed
events must include `message.received` as well as the existing sent, delivered,
bounced, complained, and rejected events. The September 5 review found the
received event missing and enabled it without changing the endpoint or signing
secret. A fresh provider reply then reached the app and produced a grounded
answer received by the controlled inbox. Inbox receipt alone does not establish
callback routing. Do not subscribe to spam, blocked, or unauthenticated events
to compensate for a missing received event.

## Production closure

After the approved canary, check immutable citations, accepted record and issue
pages, an older Explore result, corpus Ask, current body health, share metadata,
and the stop switch. A real production alert-and-reply round trip needs an
explicit recipient and bounded send. Keep Lafayette's unpassed planning bodies
validating and name the supported bodies individually.

Production release proof, resident observations, the demo, and submission remain
separate from development certification. Correctness and source repairs can
continue after this final feature slice without starting another feature list.

## Catch-up capacity

The owner can set a body's daily admission limit between 10 and 5,000 through
`monitoring/ledger:configure`. The shared limit defaults to 1,000 until the owner
sets `monitoring/ledger:configureGlobalBudget` with a `dailyCallLimit` between
10 and 50,000. Deploying this capability does not raise any active limit.
Both controls preserve admissions consumed and the current window start. A
reduction below admissions already used fails. Never reset a bucket to create
capacity. Raise the shared limit and the affected body limits together, size
them from pending work and measured calls, then reassess after catch-up. These
are provider admission caps, not dollar budgets. Evidence gates, approved
hosts, per-run bounds, and the deployment kill switch still apply.

## Interrupted issue processing

The 15-minute recovery job resumes budget-paused issue proposals from their
accepted scan cursor and matches. A preflight waits for both admission windows;
the model steps still reserve their own calls. Malformed responses and
interrupted scans get at most two automatic recovery attempts. Evidence
rejection, ambiguous membership, and scan-capacity limits require inspection.
A withheld issue never enters this retry queue.

After inspecting a failed proposal, the owner can call `issues/proposals:retry`
with its `proposalId`. The retry records the owner and a new monitoring
authorization run linked to the original publication run. It requires the same
current accepted publication and an enabled, promoted source. It cannot resume
a paused body or change the original publication history. Old workflow
completion callbacks cannot overwrite a newer retry.

After repairing an inventory failure, the owner can call
`monitoring/ledger:retryDocument` with one `documentId` to bring its next check
forward. The normal monitoring workflow resumes accepted chunks and retains
existing targets and quota usage. A stopped deployment or disabled policy
rejects the retry. This does not certify incomplete documents or reset their
history.

## Provider request pacing

Development and production each pace monitored Firecrawl requests to four per
minute with a one-request burst. The deployments share a team whose observed
limit is ten requests per minute. A request can reserve at most 45 seconds of
waiting time. The action keeps the first PDF artifact while waiting for its
required verification scrape, then rechecks monitoring authority and daily
capacity before sending it. Longer waits and provider 429 responses return to
the durable workflow. A generation-checked scheduled wake continues after one
minute. A paused source cannot restart from an old wake.

Provider throttling preserves inventories and does not count as a government
source failure. Missing official artifacts and evidence failures still do.
These controls cover monitored retrieval; owner compiler work and other apps
sharing the Firecrawl team can still consume its account limit.

## Catch-up worker capacity

The evidence workflow pool permits eight concurrent steps. Source retrieval,
extraction, publication, and issue work share this pool. Two paced discovery
steps previously occupied the entire two-worker pool during launch catch-up.
Eight workers let model steps proceed during those waits. The per-body and shared
daily admissions still guard provider calls, and Firecrawl retains its separate
four-request-per-minute deployment limit. This setting does not change source
windows, target batch sizes, model roles, review gates, or retry bounds.

During catch-up, inspect provider failures and budget usage with queue progress.
If the provider starts throttling model calls, reduce worker concurrency through
a reviewed change. More workers do not authorize a higher daily allowance.
