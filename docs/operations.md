# Operations and spending

This runbook governs source work, AI allowances, evidence recovery, releases and
agent handoffs. [Work](work.md) owns current status and priorities. This document
contains procedures, not standing permission to publish, deploy, contact others,
or start unrelated source processing.

## Spending policy

The September 7 approval for extra hackathon spending has ended. Routine paid
work now runs inside the monthly [maintenance budget](#maintenance-budget). Do
not turn the remaining pending or limited records into a mandate to complete
the archive.

Eligible spending produces a concrete result:

- Missing evidence, reviewed versions and useful updates for Meta, SpaceX or Boyce.
- A correction needed for an accurate public claim or usable resident journey.
- Bounded story, Ask, follow, reply, sharing and release verification.
- Public Ask and weekly source checks.

Work beyond the monthly budget needs its own owner-funded allowance.

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

## Maintenance budget

Public Parish makes no money. From November 2026 it runs on a small monthly
model budget that the owner funds by hand:

| Scope | Monthly allowance |
| --- | --- |
| Sources | $10 |
| Ask | $5 |

Each allowance expires and never renews by itself. When one runs out or
expires, paid work in that scope stops until the owner funds the next month.
`allowanceUsd` is a total ceiling that includes prior charges, so a new month
sets it to the current charge plus the monthly amount.

All monitoring policies check weekly, every 168 hours, which is the maximum
the policy allows. Keep each policy's document, target and daily call limits
and its September 11, 2026 source window. Historical catch-up stays off.
Changing a window can restart discovery.

The model ledger caps estimated model spend only. These bills are outside it
and need a manual audit against each provider's account: the Convex plan,
Firecrawl, AgentMail and the publicparish.com domain. No amounts are recorded
here.

### Model review, November 9, 2026

Both roles move to the GPT-6 generation, which halves model cost. Prices per
1M tokens, read on November 9, 2026 from OpenAI's
[pricing page](https://developers.openai.com/api/docs/pricing) and the
[GPT-6.1 Terra](https://developers.openai.com/api/docs/models/gpt-6.1-terra)
and [GPT-6 Luna](https://developers.openai.com/api/docs/models/gpt-6-luna)
model pages. Read them again before changing a rate in `convex/ai/types.ts`:

| Model | Input | Cached input | Output | Over 272K input tokens |
| --- | --- | --- | --- | --- |
| `openai/gpt-6.1-terra` | $1.00 | $0.05 | $5.00 | $2.00 / $0.10 / $7.50 |
| `openai/gpt-6-luna` | $0.10 | $0.01 | $0.50 | $0.20 / $0.02 / $0.75 |

Meta's Muse Ember (`muse-ember-1.0`, released November 9, 2026) was
considered and not adopted. It is not on Convex AI Gateway's
[model list](https://docs.convex.dev/ai-gateway/models.md). Meta's
[announcement](https://research.meta.ai/blog/muse-ember) gives a price that
matches GPT-6 Luna and does not mention strict JSON Schema support. Nobody
tested it here. Revisit it when it reaches the gateway.

### Switching to the GPT-6 models

The owner runs these steps by hand, in order. No agent has run them. Merging
the code change first is safe: the ledger prices whichever model the env
names, and production still names `openai/gpt-5.6-terra` and
`openai/gpt-5.6-luna` until step 4.

Owner functions need an identity. Each deployment has its own `users` table,
so look up the owner's `users` document ID on each deployment's Convex
dashboard. Do not paste either ID into docs or logs.

```sh
DEV=woozy-wren-227
DEV_OWNER="{\"subject\":\"$DEV_OWNER_USER_ID\"}"
PROD_OWNER="{\"subject\":\"$PROD_OWNER_USER_ID\"}"
```

1. Name yourself the operator for the shared development deployment, then sync
   merged `main` to it as described in
   [source stop, resume and diagnosis](#source-stop-resume-and-diagnosis).
2. Point development at the new models and fund a tiny source allowance there:

   ```sh
   npx convex env set --deployment $DEV MODEL_STRONG_ID openai/gpt-6.1-terra
   npx convex env set --deployment $DEV MODEL_FAST_ID openai/gpt-6-luna
   npx convex env set --deployment $DEV AI_SPENDING_GUARD_ENABLED true
   npx convex run --deployment $DEV system/aiGateway:checkModels '{"modelIds":["openai/gpt-6.1-terra","openai/gpt-6-luna"]}'
   npx convex run --deployment $DEV --identity "$DEV_OWNER" ai/spendingLedger:status '{}'
   npx convex run --deployment $DEV --identity "$DEV_OWNER" ai/spendingLedger:configure "{\"scope\":\"sources\",\"allowanceUsd\":<charged + 0.10>,\"expiresAt\":$(( ($(date +%s) + 86400) * 1000 )),\"enabled\":true}"
   ```

   `checkModels` must list both IDs as available.
3. Run one strict-JSON-Schema call per new model. Each must return
   `"outcome": "success"`, `"route": "ai_gateway"` and the expected model.

   ```sh
   npx convex run --deployment $DEV operations/developmentProof:gatewayModelProbe '{"role":"MODEL_STRONG"}'
   npx convex run --deployment $DEV operations/developmentProof:gatewayModelProbe '{"role":"MODEL_FAST"}'
   ```

   If either fails, stop here. Do not change production.
4. Only after both probes pass, point production at the new models:

   ```sh
   npx convex env set --prod MODEL_STRONG_ID openai/gpt-6.1-terra
   npx convex env set --prod MODEL_FAST_ID openai/gpt-6-luna
   ```

5. Move every production policy to a weekly check. Save the current policies,
   read the file, then reapply each one with only `intervalHours` changed:

   ```sh
   npx convex run --prod --identity "$PROD_OWNER" monitoring/ledger:policies '{"paginationOpts":{"numItems":50,"cursor":null}}' > policies.json
   jq -c '.page[] | {proposalId, enabled, intervalHours: 168, documentsPerRun, targetsPerRun, dailyCallLimit, startsAt}' policies.json |
     while read -r args; do npx convex run --prod --identity "$PROD_OWNER" monitoring/ledger:configure "$args"; done
   ```

   Reapplying a policy schedules one check right away. The unchanged
   `startsAt` keeps discovery state and keeps historical catch-up off.
6. Fund this month's allowances. Read the current charges, then set each
   ceiling to the charge plus the monthly amount, expiring in 30 days:

   ```sh
   npx convex run --prod --identity "$PROD_OWNER" ai/spendingLedger:status '{}'
   EXPIRES=$(( ($(date +%s) + 30 * 86400) * 1000 ))
   npx convex run --prod --identity "$PROD_OWNER" ai/spendingLedger:configure "{\"scope\":\"sources\",\"allowanceUsd\":<sources charged + 10>,\"expiresAt\":$EXPIRES,\"enabled\":true}"
   npx convex run --prod --identity "$PROD_OWNER" ai/spendingLedger:configure "{\"scope\":\"ask\",\"allowanceUsd\":<ask charged + 5>,\"expiresAt\":$EXPIRES,\"enabled\":true}"
   ```

7. Check the ledger after the first weekly checks and a few Ask questions. Run
   `ai/spendingLedger:status` again and open provider usage at
   `/operations/coverage`. New rows should name the GPT-6 model IDs, and
   charges should be about half of earlier calls of the same size.

Paid AI and monitoring admissions require `AI_SPENDING_GUARD_ENABLED=true`.
An absent or disabled guard pauses paid work even if an allowance is funded.
Existing model reservations can still settle after the guard is disabled.

The guard uses `ai/spendingLedger:configure` and owner-only `status`. Source and
Ask scopes have separate enabled flags, ceilings and expiries. Configure both
deliberately before enabling paid work. Expiry never renews automatically.
Reconfiguration preserves prior charges. Unknown usage retains its reservation.
The model-cost ledger does not cap Firecrawl, Convex, storage or email invoices.

Reserve usable Ask capacity separately from source work so a backfill cannot
consume the public experience's allowance. Review costs when funding each month
and after each paid research batch.

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

A Firecrawl 402 means the shared Firecrawl team is out of credits. Monitoring
records it as `monitoring_provider_credits`, keeps the failure count, opens no
incident and tries again a day later. From September 19 to October 3, 2026,
about 1,000 of these 402s were counted as source failures. They are most of
the failure counts recorded on November 10 and most of the open coverage
incidents. A 402 is not evidence that a government source moved or broke.

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
