# Operations and spending

This runbook governs source work, AI allowances, evidence recovery, releases and
agent handoffs. [Work](work.md) owns current status and priorities. This document
contains procedures, not standing permission to publish, deploy, contact others,
or start unrelated source processing.

## Spending policy

The owner approved additional targeted spending for the remaining hackathon
period on September 7. The previous hard cap followed an excessive backfill run;
it is not a total ceiling for the rest of the project. Do not turn the remaining
pending or limited records into a mandate to complete the archive.

Eligible spending produces a concrete launch result:

- Missing evidence, reviewed versions and useful updates for Meta, SpaceX or Boyce.
- A correction needed for an accurate public claim or usable resident journey.
- Bounded story, Ask, follow, reply, sharing and release verification.
- Public Ask and selected source maintenance during launch and judging.
- A necessary submission or source-change demonstration using real evidence.
- The named tranches in [launch upgrade](launch-upgrade.md) slices U4, U5 and
  U6: the September 16 LPSC outcome, the bounded LPSC coverage compile and the
  November 3 measure drafts. The plan proposes amounts; the owner configures
  each allowance through the spending guard before a run.

Before a paid batch, name the deliverable, source and date scope, existing stored
inputs, expected provider use, a finite allowance and the stop condition. Include
retrieval, model generation and review, retries, issue or story linking, and email
where applicable. Capture actual use and the resident or demo value afterward.
Keep unknown provider charges explicitly unknown; a rate admission is not a dollar.

Use the owner's existing authorization within the named task. Do not request
permission again for routine bounded steps already covered by it. A material
scope or spending increase, an unspecified large allowance, broad automation,
or an action outside the task needs a concrete owner decision. No numeric new
allowance was selected by the documentation request, and no settings changed.

Stop after the finite ceiling, repeated identical failure, missing official
evidence, or an input change that invalidates the expected work. Inspect the
failure before retrying. Reuse stored snapshots, accepted inventories and
successful stage results. Do not recrawl unchanged PDFs, reset consumed counters,
weaken citations, or activate all policies to increase a publication count.

### Work-order template

| Field | Record before starting |
| --- | --- |
| Outcome | Named story claim, resident defect, demo proof or operating need |
| Environment | Development or production, with the deployment identified |
| Inputs | Exact documents, saved snapshots, target IDs and date window |
| Spend | Expected use, finite maximum, covered providers, known unknowns |
| Stop | Completion, ceiling, bounded retries and failure to escalate |
| Evidence | Accepted output, observed behavior, provider ledger and residual gaps |

## Allowances and production settings

The owner authorized $20 of fresh model capacity each for Ask and recent source
monitoring on September 18. The configured total ceilings are $21.454589 for Ask
and $25.043045 for sources, including prior charges. Both expire at midnight
starting October 3 Central, covering October 2. Ask, source spending and all
thirteen monitoring policies are enabled after the authorized September 18
backend deployment. This supersedes the September 14 allowance snapshot.

The active monitoring window begins September 11, 2026, including later-posted
minutes for the September 16 LPSC meeting. Each policy has a 24-hour interval,
one document and one decision target per run, and fifteen processing calls per
day. The global limit is 120 calls per day. Incomplete work may schedule another
run before the normal interval; the daily admission limits still apply. These
limits cover the twelve parish bodies and the LPSC's approved agendas and minutes.
They do not automate curated story or ballot review.

First-run verification preserved all 157 pending pre-window decision targets.
The first dispatched target was dated September 21. Initial retrievals exposed
undated historical Lafayette event pages; source spending was paused while the
official URL-date parser was extended and all 22 retained dated calendar entries
were classified. The correction was deployed and spending restored under the
same ceiling. Source retrieval remains paced at four requests per minute; pacing
deferrals and incomplete checks are not proof of fresh coverage. Check the run
ledger and actual remaining allowance before changing limits.

Historical catch-up stays deferred through the hackathon. Changing the window
must exclude existing old queued targets from dispatch and baseline-completion
checks, while preserving those targets for a later authorized expansion. Review
cheaper model options after the hackathon before resuming catch-up. The current
model roles and independent review remain unchanged. Read current balances before
spending; a dated receipt is not today's remaining budget.

Paid AI and monitoring admissions require `AI_SPENDING_GUARD_ENABLED=true`.
An absent or disabled guard pauses paid work even if an allowance is funded.
Existing model reservations can still settle after the guard is disabled.

The guard uses `ai/spendingLedger:configure` and owner-only `status`. Source and
Ask scopes have separate enabled flags, ceilings and expiries. Configure both
deliberately before enabling paid work. Expiry never renews automatically.
Reconfiguration preserves prior charges. Unknown usage retains its reservation.
The model-cost ledger does not cap Firecrawl, Convex, storage or email invoices.

Plan finite funded operation through at least the September 25 judging window.
Reserve usable Ask capacity separately from source work so a backfill cannot
consume the public experience's allowance. Choose thresholds from measured
bounded calls, not an invented per-resident average. Review costs daily during
launch and after each paid research batch.

AI Gateway remains the verified provider. Direct OpenAI fallback stays disabled.
A free Grok Bot trial covers neither downstream model calls nor retrieval and
email providers. Keep global and per-source admission controls alongside dollar
allowances. Lower a limit only when its consumed window permits it.

## Working environments

The personal development backend is shared across branches. An isolated worktree
protects files, not remote data or provider inboxes. Check other worktrees and
coordinate backend syncs. Never use symlinked dependencies as a substitute for
an actual install when runtime work is authorized.

Separate exploratory failures and synthetic inputs from production. Production
source import and publication require the owner-authorized exact batch and an
inspection of existing state. A documentation change does not enable a source
policy or create story data.

## Source stop, resume and diagnosis

Name one operator for writes to shared personal development `woozy-wren-227`
before a verification session. Earlier agent assignments are not continuing
ownership. An isolated implementation checkout does not isolate that deployment.
Download the exact green PR's `development-frontend-<SHA>` artifact
for frontend sync. `convex dev --once --typecheck disable --codegen disable`
performs the authorized backend sync without local automated validation. Upload
the prebuilt artifact with static hosting's `upload --dist <artifact> --spa`.
Confirm the development target before each command. Do not use `deploy`, `--prod`
or `--build` for this development path.

Story verification uses a dedicated development AgentMail sender and a separate
owned recipient. The development guard rejects other recipients. A mailbox
existing or an outbound provider ID is not a completed round trip. Record the
development webhook, receipt and grounded reply separately. Do not modify a
production webhook to make a development check pass. The callback and controlled
round trips passed the [development gate](story-development-certification.md).
The [September 12 production receipt](launch-release-2026-09-12.md#production-email-and-phone-proof)
records the controlled story email loop. The owner completed founder QA on
September 16. Verify later material updates under their own work order.

Saved artifact hash differences require a new manifest version with corrected
exact spans. Preserve the frozen predecessor. Repeating retrieval to force a
hash match is not a repair. A provider failure stops the batch; inspect its
receipt and reserve a bounded retry only when the cause is understood.

For a global source stop, set `SOURCE_MONITORING_ENABLED=false` on the identified
deployment. For a single source, use Pause checks in `/operations/coverage`.
Generation checks fence subsequent paid steps and publication. Already issued
requests may finish. Do not report their cancellation without evidence.

Resume the same approved policy to preserve stored cursors and work. Changing a
registry or date window can restart discovery. Check now uses the same budgets
and cannot bypass an exhausted allowance. Do not replace an active lease or
reset historical usage to make another batch fit.

Inspect the monitoring run, provider ledger, document inventory, target states
and issue proposals. An accepted inventory section does not release targets
until the full document inventory passes. Ready target processing precedes new
retrieval. Source backlog and issue backlog are separate. A run marked complete
does not certify every source artifact or sustained unattended progress.

Retry a failed decision only after identifying the exact reason and a plausible
repair. Unchanged missing evidence stays limited or withheld. A newer processor
version is not proof that rerunning a whole corpus will help.

Coverage recovery requires fresh passing gates for the current registry
generation. `coverage/validation:refreshSourceLinks` checks bounded representative
links; `coverage/validation:reevaluate` evaluates the named proposal. These are
not evidence ingestion or publication shortcuts. Preserve public limitations
until the recovery contract passes.

`resident/search:backfill` is an internal projection repair over accepted
publications. It is separate from retrieval and model extraction. Use bounded
pages and inspect the returned cursor. Do not call a projection repair new
published evidence or put it into every deployment seed.

## Story operating procedure

1. Prepare the bounded source dossier and JSON manifest described in
   [sources](sources.md#source-dossier-and-import-contract).
2. Inspect existing snapshots and publication versions before pricing new work.
3. Import into the owner-only staged workflow, validate inputs, process only
   missing evidence, and review the exact draft and findings.
4. Approve a specific version after all evidence gates pass. Approval becomes
   stale if the input or draft changes. Initial import creates no backfill mail.
5. Verify the published route, evidence, Ask, follow, search and share behavior.
6. Assign a next review date. Fetch only named sources needed for a substantive
   update and publish a separately reviewed revision.
7. Inspect delivery, reply and dedupe receipts. A photo or layout change sends no
   material update. Withdraw a known-invalid version using the defined workflow.

The owner importer and review interface are implemented at `/operations/stories`.
All three launch stories passed the bounded development loop. Use
[architecture](architecture.md#owner-curated-story-model) and
[the transfer procedure](story-artifact-transfer.md). Do not substitute direct
database insertion or copied approval for this path.

## AgentMail and controlled verification

Use an explicitly authorized controlled recipient for verification, update,
roundup, reply and unsubscribe checks. A provider-accepted message, inbox receipt,
verified application callback and useful resident outcome are distinct results.
The controlled Meta production email loop passed on September 12, and the
owner completed the founder QA pass on September 16. These dated receipts do
not authorize repeated test mail. A new U4 material update has its own delivery
verification under the named work order.

The story development gate used a dedicated development inbox and callback, with
only the owner-controlled reports inbox as recipient. Production routing was not
changed. Both deployments previously shared the updates inbox, so trace the
application record to its intended deployment before claiming a round trip.

The production webhook is `/agentmail/webhook` on the qualifying Convex host.
Provider subscriptions must include `message.received` for grounded replies and
the required delivery-state events. Preserve signature validation, known thread,
configured inbox, owner matching, replay prevention and retention. Do not enable
untrusted message classes to compensate for missing routing.

Source-problem reports use a separate private path. They never initiate
retrieval, extraction, compilation or publication. Retain public-safe receipt
metadata and the existing expiry behavior, not private descriptions in logs.

## Releases and validation

Follow [AGENTS.md](../AGENTS.md) and [PR-Agent instructions](../pr-agent.md).
One concern per real PR. Review source and diffs, and run local tests, builds,
typechecks and lint as needed. `npm run verify` runs the full suite. PR CI
repeats the automated checks.

PR verification builds the frontend while typechecks, application tests and lint
run in a separate job. With the `development-certification` label, the resident,
reading/chat and owner browser suites each run desktop Chromium and mobile
WebKit in separate jobs after the build. Each browser job installs only its
engine and keeps its own screenshots, videos and failure traces. Tests still
use one worker per job. The final `verify` check requires every applicable job
to pass before publishing `development-frontend-<head SHA>` for 14 days. The
one-day `frontend-build-<head SHA>` artifact is an intermediate build, not a
certified preview. AI reviews run independently of these jobs.

Only commit, push, open a PR, merge or deploy when authorized for that action.
Merging or pushing `main` deploys the backend and frontend, including docs-only
changes. State that consequence before obtaining any needed release approval.
Watch the exact head and workflow, then run the required independent
`npm run smoke:production` after an authorized release. Never infer live feature
or data correctness solely from green CI.

Production code releases must use a clean, committed revision that passed PR
checks and review. Use the production workflow for backend and frontend together.
Do not upload production code from a dirty working tree, even when a source
publication is authorized. Source publication and code deployment are separate
actions. If production already contains uncommitted code, preserve it, reconcile
all dependent changes through PRs, and release the complete reviewed revision.
Do not deploy an intermediate revision that removes another live correction.

Use meaningful bounded live verification for the changed behavior. Report which
environment, source versions, routes and provider paths passed. Keep development
proof, production proof and resident benefit separate. Failure tests must not
send unapproved mail or publish synthetic civic claims.

## Grok Bot handoff

Use Layken's standalone Grok Bot Mac app. The concise [bot brief](../grok-bot.md)
points here. Assign only named missing source evidence, reviewed successor
bundles, bounded development diagnosis or reproducible UI QA from the work queue.
Do not start an archive-completion mission or use a substitute cloud agent.

Each handoff names the completed outcome, exact public source links, saved
artifacts, accepted or withheld evidence, code changes if any, costs and unknown
charges, blockers, and the next bounded task. Never include secrets, resident
messages or private application records. Agents do not post, email officials,
merge, publish or change production merely because the tool can do it.

## Routine review after launch

Public launch completed September 18. Through judging, inspect paid allowances
and expiry, selected source freshness,
story review dates, failed Ask calls, delivery problems and public routes. Keep
public explanations accurate when checks pause. Triage resident failures before
new content. [Work](work.md) records findings and completion evidence.

The [historical runbook](archive/pre-stories-2026-09-07/docs/slice-9-operations-runbook.md)
preserves old one-time commands and receipts. They are not current grants or
instructions to replay a previous development or production exception.

## Publishing the owner-selected rendering replacements

Use owner-authorized `stories/operations:uploadImage` for each exact PNG, then
`stories/corrections:prepare` with the current accepted build, unchanged draft,
parent hash, generation and `replacementImageId`. Preview the fresh independent
review and approve its exact input, draft and review hashes. Repeat on the target
deployment using target IDs; do not copy development IDs. Check live image bytes,
image dimensions, captions, social metadata and absence of new update events.
The September 8 exception is limited to the three hashes in `ownerMedia.ts`.

## Retaining images during evidence updates

For a new unpublished source candidate, `stories/corrections:prepare` accepts
`currentImageVersionId` to retain the same story's current accepted media. Supply
the unchanged candidate draft and exact parent hash and generation. This cannot
be combined with `replacementImageId`. Every retained caption evidence key must
exist in the candidate. A `mediaCaption` correction must be nonempty and at most
600 characters. Each new candidate needs fresh independent review and exact
approval; image retention never copies approval or proves a license.

Review reservations can exceed the expected charge when media is included.
Inspect the reservation before retrying, preserve consumed counters and keep
any temporary ceiling adjustment within the authorized finite task allowance.
Restore prior ceilings and expiries after the batch. Verify image hashes,
accepted text and notification intent after publication. See the
[September 8 source continuation](targeted-catchup-2026-09-08.md).
