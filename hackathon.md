# Hackathon log

- **Project:** Public Parish
- **Event:** Convex All Gas Hackathon
- **What it does:** Establishes a source-cited service for discovering, understanding, questioning, and following consequential Louisiana local-government decisions.
- **Live app:** https://befitting-flamingo-587.convex.site
- **Repo:** https://github.com/LaykenV/public-parish
- **Frontend:** Convex static hosting
- **Convex deployment:** https://befitting-flamingo-587.convex.cloud
- **Components:** `@convex-dev/static-hosting`, `@firecrawl/firecrawl-convex`, `@convex-dev/workflow`, `@convex-dev/rate-limiter`, `@convex-dev/agent`, `@convex-dev/auth`, `@agentmail/convex`
- **Convex features:** queries, mutations, internal actions, HTTP actions, realtime queries, file storage, crons, scheduled functions, durable workflows, authentication
- **Auth:** Convex Auth with Google OAuth, verified on the development, production custom-domain, and qualifying `convex.site` flows
- **AI models:** `openai/gpt-5.6-terra` for `MODEL_STRONG` extraction, consequence factors, and issue linking; `openai/gpt-5.6-luna` for `MODEL_FAST` coverage discovery classification, independent review, and Ask through Convex AI Gateway
- **Started:** 2026-08-27T04:38:41Z
- **Last updated:** 2026-09-11T03:06:22Z

Demo video: not recorded yet. The final submission link remains pending.

## Log

Current status and pending work are in [docs/work.md](docs/work.md). The entries
below preserve their original release context and repository paths. Earlier
plans are indexed in [the archive](docs/archive/README.md).

### 2026-09-10 - 7cbd36c

Released parallel PR reviews through PR #201. GLM 5.3 Flash and DeepSeek V4.1
Flash each reviewed commit `6e9fbd3` with no key issues and posted separate
summaries. GLM reused its comment across pushes. DeepSeek completed after setting
low reasoning effort and preferring its own provider through OpenRouter.
Full CI passed 686 tests. Production workflow `34490896584` and the independent
production smoke passed for merge commit `7cbd36c`, including both public origins,
the three stories, evidence links, images, sharing, and backend readiness.
The hackathon skill remains absent pending transfer from the owner's Mac.

### 2026-09-10 - Local PR review tooling

Prepared parallel GLM 5.3 Flash and DeepSeek V4.1 Flash reviews with separate
persistent summaries, commit checks, and bounded runs. Fifteen publisher tests
and Actionlint pass. This is development tooling, with no change to the app's
model roles or deployment. GitHub publication and live model verification remain
pending in [docs/work.md](docs/work.md). The requested local
`convex-hackathon-skill` was unavailable on this machine, so this entry records
the repository evidence directly.

### 2026-09-04 - 2fa1cff

Replaced the launch slot template with exact official artifact fixtures and ran
the complete development lifecycle. Seven bodies now pass gates 1 through 9
with immutable retrieval, extraction, deterministic validation, independent
review, publication, a missing-record probe, and paired agenda and minutes
replay. Production then promoted Alexandria City Council, Pineville City
Council, Rapides Parish Police Jury, Baton Rouge Metropolitan Council, and Baton
Rouge Planning and Zoning Commission after each passed Gate 10 and all ten current Gate v3
checks. Production workflows `33902515233` and `33902885913` passed for PRs #91
and #92. Rapides and East Baton Rouge are supported. Lafayette stays validating
because its planning commission, zoning board, and hearing examiner lack stable
meeting-specific agenda and outcome records. The LCG body pages and schedule
PDFs answer 200, but the event-detail host still answers 502.

Connected the resident area selector to a public, realtime jurisdiction-status
query. It enables a parish only when exactly one live jurisdiction row is
`supported`; missing, duplicate, candidate, validating, degraded, and paused
states remain unavailable. The selector therefore follows promotion instead of
hard-coded fixture claims. This closes Implementation Slice 8. Routine scheduled
source checks and automatic document-to-decision fanout are not deployed.

### 2026-09-04 - 00a2f9c

Stopped Chrome's unreliable `navigator.onLine` flag from showing an offline
banner or blocking Ask while the served origin still answers. Connectivity
events now confirm failure with a fresh same-origin request and recheck when a
resident returns to the tab. Added regression cases for a reachable origin and
Ask under a false browser flag (`src/features/discovery/hooks.ts`,
`src/features/ask/live-adapter.ts`). PR #90 deployed through production workflow
`33896198309`.

### 2026-09-04 - b5583ed

Released Implementation Slice 8 through PRs #85 through #88. The PR #87
production attempt stopped before backend activation because Convex's deployment
compiler rejected `Array.prototype.at`; PR #88 replaced that call with a
supported lookup. Production workflow `33889157140` then verified the exact
merge commit, deployed the backend and frontend, ran the guarded launch seed,
and passed its smoke test. An independent `npm run smoke:production` passed both
public origins, the canonical redirect, and production backend readiness. No
coverage proposal was promoted, so resident-visible coverage did not change.

### 2026-09-04 - 47d2c12

Closed the Slice 8 review gaps before release. Post-deploy seed replay now
preserves supported, degraded, paused, and ambiguous multi-registry state.
Evaluator v2 names the checks it actually performs, rejected candidates cannot
fill revision slots, and body promotion cannot clear an operator-set parish
pause or degradation. A stale proposal cannot replace or control a newer live
registry. The owner view and architecture now state that sample validation
stores snapshots but does not run extraction, review, or publication
(`convex/operations/seed.ts`, `convex/coverage/`, `docs/architecture.md`).

### 2026-09-03 - cc056f3

Built Implementation Slice 8 as three stacked development pull requests. PR
#85 accepts only one of ten checked root manifests, verifies every redirect
before paid work, records immutable stage attempts, and gives the owner a
private realtime run ledger. PR #86 adds one bounded Firecrawl map, three
official-domain searches, a 100-candidate ceiling, strict `MODEL_FAST`
classification in batches of 20, complete provider-call evidence, and stop
checks between paid calls. PR #87 freezes a registry proposal, validates a
fixed representative sample through the immutable snapshot path, evaluates the
ten coverage gates, and permits promotion only when the latest evaluation has
ten passes. No override can turn a blocked proposal into supported coverage.

The personal development deployment ran root verification, discovery,
classification, snapshot validation, and gate evaluation for the nine target
bodies. It did not run extraction, review, or publication. Every root passed
before discovery spent provider credits. Every proposal remained blocked, and
no resident-visible coverage state changed.

| Body                                 | Samples retrieved | Gates passed |
| ------------------------------------ | ----------------: | ------------ |
| Lafayette Planning Commission        |            7 of 9 | 2, 3         |
| Lafayette Board of Zoning Adjustment |            5 of 9 | 2, 3         |
| Lafayette Hearing Examiner           |            5 of 9 | 2, 3         |
| Youngsville City Council             |            2 of 7 | 2            |
| Alexandria City Council              |            5 of 7 | 2, 3         |
| Pineville City Council               |            4 of 7 | 2, 3         |
| Rapides Parish Police Jury           |            6 of 7 | 2, 3         |
| Baton Rouge Metropolitan Council     |            7 of 7 | 1, 2, 3      |
| Baton Rouge Planning Commission      |            8 of 9 | 2, 3         |

The results exposed real source limits instead of hiding them. Youngsville's
current packet, agenda, and minutes returned unsuccessful target responses.
Pineville's current minutes URL failed, its ordinance link redirected to an
unapproved document host, and discovery found no revision candidate. The
shared gate handled those failures, so no portal adapter or host exception was
added. Baton Rouge Planning's earlier gate 7 result was re-evaluated after a
logic correction and now fails because a retrieval error alone does not prove
that the publication path produces a limited or withheld result.

Browser testing signed into `/operations/coverage` with Google, returned to the
private route, loaded all ten roots and live runs, and inspected the redacted
representative-source health rows. The owner view exposes canonical URLs and
error classes but no snapshot contents. Its stage timeline now names discovery,
classification, sample validation, and gate evaluation separately. Production
remains untouched. The stack still needs final pull-request review, an
authorized merge, the exact production workflow, and independent production
smoke before Slice 8 can be called live.

### 2026-09-03 - d170fba

Closed three Slice 7 review edges through PRs #81 through #83. Weekly roundup
replies now search the complete published corpus instead of one representative
follow. Private source-report receipts keep their terminal delivery result after
AgentMail removes finalized payloads. Notification matching now stops for bodies
and places outside supported or degraded coverage (`convex/emailReplies/`,
`convex/sourceReports/`, `convex/follows/targets.ts`).

The PR checks and production workflows `33797222889`, `33797505992`, and
`33797772856` passed, followed by independent production smoke checks. A
clearly labeled production source report reached `sent`, stored that result in
the application five seconds after submission, and left the latest pipeline run
unchanged. The controlled development replay remains the only alert-and-reply
provider proof. No real production subscriber has completed that path yet.

### 2026-09-03 - 41a6d59

Built Slice 7D in two stacked code PRs. PR #78 accepts an alert reply only after
it verifies the AgentMail inbox, original delivery thread, and enrolled sender.
It reuses the 24-hour anonymous Ask path, its `MODEL_FAST` route, rate limits,
published-evidence selector, citation checks, and evidence-not-found response.
The reply ledger fences duplicate callbacks, concurrent preparation, model
retries, and outbound delivery. A five-minute sweep recovers interrupted work.
PR #79 connects the existing source-problem sheet to a separate private
AgentMail inbox. It keeps the issue, decision, meeting, and selected Source
route, applies browser and global limits, and never calls the evidence pipeline.

The final reply head `c39eafe` passed Verify run `33781686493` and PR Agent run
`33781686995`. PR #78 merged as `3f18c126`; production workflow `33786995126`
and the independent production smoke passed. The final report tree added a
45-second confirmation bound for unresolved AgentMail receipts, kept retries on
the same receipt, and preserved honest uncertainty when provider metadata is no
longer available. The clean report-only head `ec6d003` passed Verify run
`33787335483` and PR Agent run `33787335475`.

A controlled run on the personal development deployment sent an alert between
two owned AgentMail inboxes and replied with a question about Johnston Street
funding. The existing Ask action answered from the published issue evidence and
returned $7,986,192 in grant funds plus a $2,001,498 local match, totaling
$9,987,690. AgentMail delivered the answer with absolute development Source
links. A second reply reused the same Ask thread and delivered another cited
answer. The browser also opened a live published issue, preserved its selected
Source in the report attachment, and showed the connected private form. A
controlled report reached `sent`. Its application row contained hashes, the
category, the Public Parish route, the outbound ID, and timestamps. It contained
no report text or address. No pipeline run started after the report.

The development-only probe function and its seeded user, follow, delivery, and
reply records were removed after the test. The controlled provider email thread
remains as delivery evidence. The production reports inbox setting was added to
`befitting-flamingo-587`. PR #79 merged as `41a6d593`; production workflow
`33788197489` and the independent production smoke passed. A live browser opened
a published Pafford issue, selected Source `kh7be5xzdyvan21bqzhmctegnn8dqwjd`,
and confirmed that the connected private form attached the exact Source-bearing
route. The production availability query returned `available: true`.

### 2026-09-03 - 6bafeaa

PR #77 removed an empty development-fixture announcement from the live
signed-out Following page. The fixture label remains available during fixture
QA but no longer appears in the production accessibility tree when no fixture
scenario exists. Verify and PR Agent passed on `4a60791`. Production workflow
`33711607195` and the independent smoke passed after merge. A hard-reloaded
browser confirmed the signed-out Google and email entry choices remained and
`Fixture state:` was absent from the accessibility tree.

### 2026-09-03 - 6db32a3

Released Slice 7C through PRs #72 through #75. Accepted new decisions and
material revisions now create durable follow matches, deduplicate immediate
email per owner and change, link verified email subscribers to all their
follows, and assemble Monday roundups from stored local-time windows and
accepted evidence. The Following page now exposes live notification settings
and recent delivery state (`convex/follows/`, `convex/crons.ts`,
`src/features/following/`).

A controlled development replay matched government body, place, issue, and
topic follows, sent two immediate and two weekly messages through AgentMail,
validated the official source, app, and management links, and created no
duplicate on replay. Production workflows `33706796984`, `33707795958`,
`33708562803`, and `33709247528` passed. Independent smoke passed the direct
Convex host, canonical domain, apex redirect, and backend readiness after each
merge. A signed-out production browser showed the real account entry page with
no notification controls. The replay used no resident address.

### 2026-09-02 - Slice 7C planning checkpoint

Synchronized the current product, architecture, build, interface, and operator
documents after the Slice 7B release. The 7C contract now sends at most one
immediate email per owner and material change while keeping every matching
follow in a separate ledger. Issue-target alerts wait for an accepted issue
refresh. Weekly roundups run Monday at 7:00 AM in `America/Chicago` through a
deduplicated local-time claim that preserves the hour across daylight-saving
changes.

PR #70 cleared the preflight defect as merge commit `1ece03d`. The deployed
`place` resolver now accepts supported parishes and municipalities while an
unsupported place still fails closed. Convex tests cover issue, topic, body,
parish, and municipality targets. Pull-request checks, production workflow
`33682483792`, and the independent production smoke passed. The notification
match, delivery, roundup, and Google default-cadence records remain
unimplemented. No sourced alert has been sent or claimed. Alert copy will not
invite replies until Slice 7D's grounded inbound handler is live.

### 2026-09-02 - 8fc4642

Built the two-PR Slice 7B follow stack. The backend adds verified email
subscribers, hashed challenges and access tokens, encrypted delivery addresses,
Google-owned and email-owned follows, notification preferences, signed AgentMail
webhooks, bounded rate limits, and cleanup for expired verification data and
finalized component messages. The AgentMail component receives its declared
environment through the host app and keeps remote maintenance functions private
(`convex/follows/`, `convex/http.ts`, `convex/crons.ts`,
`patches/@agentmail+convex+0.1.0.patch`).

The resident follow sheet now sends and verifies real email codes, resumes a
Google follow through a URL-safe one-time intent, and reports expiry, retry, and
provider failures. The email management route loads one token-scoped follow,
updates its cadence, rotates the token, and removes the follow. Signed-in Google
users receive a reactive Following page with update and removal controls
(`src/features/following/`, `src/features/auth/google-auth.ts`). A development
browser completed enrollment, token rotation, old-token rejection, signed
webhook idempotency, and a Google-owned follow through the full OAuth return.
The signed-in Following page showed the new target, changed its cadence
reactively, and restored the requested weekly setting before the test session
signed out. A second development proof muted that weekly follow, kept weekly as
its resume cadence, and restored weekly delivery. The email-only management
fixture also changed from muted to following when its schedule-save action
resumed delivery.

PR #66 deployed the backend as `fdfebd8` through production workflow
`33672529400`. The workflow and independent production smoke passed the direct
Convex host, canonical `www` host, apex redirect, and backend readiness query.
The updates inbox and two new cryptographic keys are configured in production.
The AgentMail webhook is registered for outbound lifecycle events, and its
provider-issued signing secret is configured without exposing it in repository
history or logs.

PR #67 deployed the resident enrollment and management interface as `8fc4642`
through production workflow `33675616509`. Fresh PR checks ran against the
merged backend before release. The workflow and a second independent production
smoke passed both served hosts, the apex redirect, and backend readiness. A
production browser loaded a published issue, opened the live follow sheet, and
confirmed that a development fixture query could not replace production data.
The complete email, token rotation, signed webhook, Google OAuth, and reactive
management flows passed in development. A natural provider-signed production
delivery callback was not forced during the read-only production browser proof.

### 2026-09-02 - 8ea38af

Hardened issue linking after real launch-data runs exposed two evidence gaps.
PR #61 requires each issue claim to cite every excerpt needed for its complete
wording. PR #63 accepts scaled currency such as `$1.2 million` without treating
an unmarked quantity such as `1.2 million residents` as money. PR #64 moves the
linker to prompt v1.5 and names every allowed dynamic fact path, including the
required lifecycle fact, while excluding link relationship fields. The full,
limited, or withheld publication policy stays unchanged (`convex/issues/`,
`convex/extraction/textMatch.ts`, `convex/pipeline/state.ts`).

### 2026-09-02 - f725094

PR #58 deployed Google account sign-in and private saved areas and topics. It
also published the resident privacy notice. The first production workflow
stopped before deployment because the Convex auth config read the platform site
URL through the unavailable Node `process` global. PR #59 replaced that access
with Convex's generated typed environment value and merged as `f725094`.
Production workflow `33587446687` then deployed the backend and frontend,
seeded source configuration, and passed its smoke. The independent production
smoke passed both served origins, the apex redirect, and the backend readiness
query.

A real Google sign-in completed on `https://www.publicparish.com`, returned to
the saved areas and topics page, and signed out. A second sign-in started on the
qualifying `https://befitting-flamingo-587.convex.site` origin, handed the flow
to the canonical `www` origin, used the canonical callback, and returned signed
in without a cross-origin flow error. The test account signed out after the
proof. The privacy notice and its deletion contact rendered on both production
origins. No saved area or topic was added during production testing.

### 2026-09-01 - working tree

Mounted the pinned Convex Auth v2 alpha core and Google OAuth for Slice 7A.
Verified Google profiles create private users, and every saved-area or topic
query derives ownership from the signed JWT subject. Indexed, idempotent
mutations reject anonymous callers and unsupported launch targets. The resident
account route now separates the live Google setup from the development follow
and notification fixtures. A real development Google callback completed, saved
Lafayette Parish, survived a reload, and removed the saved area after the proof.
The production release and production callback proof remain pending
(`convex/auth.ts`, `convex/auth/`, `convex/follows/savedSetup.ts`,
`src/features/auth/`, `src/features/following/`). A public privacy notice now
states the live account, Ask, analytics, provider, retention, and deletion
boundaries required before publishing the dedicated Google consent screen
(`src/routes/privacy.tsx`, `src/features/privacy/`).

### 2026-09-01 - 13f735b

PR #56 deployed the high-reasoning Luna selector and answer flow as `adc0a34`
through production workflow `33560561545`. The selector sees the complete
current catalog and every accepted excerpt in scope. Code expands its selected
records, then the answer call receives their hash-checked normalized official
documents. Broad or invalid selections use the full scope, while a valid
not-found selection skips the answer call. App-wide request limits prevent
anonymous session rotation from creating unlimited calls. Record, excerpt, and
document-byte guards fail before model generation instead of truncating the
prompt. Provider token use remains private telemetry, not an answer limit.

PR #57 deployed the citation-display correction as `13f735b` through workflow
`33562735003`. A controlled production corpus question selected both Lafayette
surplus-pickup decisions and named Terrebonne Parish Consolidated Government
from accepted evidence. Four Source controls opened official evidence, and the
answer showed no raw internal evidence IDs. The exact issue Ask path and the
production smoke passed again. One answer rendered Markdown emphasis markers as
literal text, so that pre-demo display correction remains. This was test
traffic, not resident adoption.

### 2026-09-01 - 5679fa3

Deployed the resident-facing issue index and For You replacement through PR
#54 as `5679fa3`. Home reads the bounded accepted-issue and
decision queries, shows Lafayette and Rapides timelines before compact atomic
records, and keeps equal-weight issue cards because no resident-facing
importance score is published. Explore now searches accepted issues before
individual records. Primary navigation is Home, Explore, Ask, and Coverage.
`/for-you` redirects to Home, `/issues` redirects to Home's issue section, and
the cited issue detail routes remain stable. Development fixtures passed browser
inspection at 375 and 1280 CSS pixels with no horizontal overflow.
Production workflow `33533462706` and the independent production smoke passed
(`src/features/discovery/home.tsx`, `src/features/discovery/explore.tsx`,
`src/features/discovery/explore-model.ts`, `src/routes/for-you.tsx`,
`src/routes/issues_.tsx`).

Closed the Slice 5 data gate with two production issue builds. Terra linked
the accepted records, Luna reviewed the proposed facts independently, and
deterministic checks published full issue versions. The two builds used AI
Gateway and cost an estimated $0.088413 combined. A live subscriber first
received no Rapides millage issue, then received the accepted issue 10.8
seconds later on the same connection.

Added private evidence-scoped Ask threads for PR 6A. The browser keeps an opaque
token while Convex stores its SHA-256 hash. Scheduled expiry detaches access
after 24 hours. The Agent component owns threads and messages, while Public
Parish authorizes each call and retrieves only bounded current citations. A
development proof created a thread, saved one question, resumed its history,
and returned the exact LOATF Source links. Model answers remain out of this PR.

Built the stacked PR 6B answer path in the working tree. It pins
`@convex-dev/ai-sdk-provider` 0.1.0 and AI SDK 7.0.34, calls `MODEL_FAST`
through the Convex gateway, sends only bounded thread context and retrieved
published evidence, and validates every returned evidence ID before the Agent
component stores the assistant message. A private receipt and attempt ledger
records route, model, tokens, latency, estimated cost, and bounded safe errors
without copying resident questions or answers. Deterministic not-found answers
skip the model call. The exact stacked answer head later reached the personal
development deployment. A real `openai/gpt-5.6-luna` call returned a strict
answer with current Lafayette citations. A follow-up first exposed retrieval
that ignored its prior question. The corrected path combined that bounded prior
question with the current turn and returned the same current pickup records.
An unsupported volcano question returned not found without citations. PR #47
later deployed this answer path as `9ae0467` through production workflow
`33517184457`.

Built the stacked PR 6C resident connection in the working tree. The real
adapter keeps only opaque session and thread handles in browser storage, opens
Agent history after refresh, and projects accepted citation records into the
existing Source panel. It covers supported, not-found, expired, offline,
cooldown, retryable, and terminal states. One mutation now claims one answer at
a time, applies per-session request limits, and reserves 15,000 tokens against
both a 30,000-token minute and a 150,000-token day before any model call. The
same reservation counts against app-wide ceilings of 150,000 tokens per minute
and 1,500,000 tokens per day, so rotating browser sessions cannot remove the
production spend bound. The app-wide counter keeps the full reservation after
an accepted claim, including no-evidence results. That trades some daily
capacity for a simple hard ceiling.
Successful attempts reconcile known usage. Unknown failed work and abandoned
work consume the reservation. A no-evidence path releases it because that path
skips the model. The CAPTCHA adapter remains inactive. Automated
pull-request checks run in GitHub Actions. The exact stacked head reached the
personal development deployment. At 375 pixels, a signed-out browser completed
the real two-turn conversation, restored both turns from Agent history after a
refresh, and opened exact citation records in the mobile Source drawer. Escape
returned focus to the Source control. Browser storage contained only the opaque
session token and thread handles, not question or answer text. The not-found and
offline states passed, live status announced the completed answer with its
source count, and the page had no horizontal overflow. At 1280 pixels the same
source opened in the 320-pixel docked evidence rail.

PR #45 deployed the private thread foundation as `c9ea441` through workflow
`33515579521`. PR #49 deployed the final bounded Ask interface as `30dc267`
through workflow `33518827257`. Exact head `e1cd4b1` adds app-wide minute and
daily token ceilings that survive anonymous session rotation. A production
issue-scoped test then completed two related cited turns. Both answers used the
accepted `CO-022-2026` and `CO-023-2026` citations, and their Source controls
opened the exact supporting minutes spans. An unsupported question first
entered the safe retry state; its fenced retry returned evidence not found with
no citations. After refresh, the issue thread remained in Recent on this device,
and reopening it restored all three turns. Implementation Slice 6 is closed.

### 2026-09-01 - bdc0195

Connected accepted decision publications and exact citations to the finished
resident decision and meeting routes. Discovery now opens the Public Parish
record before the original source. A bounded development backfill grouped three
meeting-bearing records, and the Aug. 25 Rapides view resolved two current full
decisions from one accepted meeting time. The issue query stays closed when an
issue points at superseded decision versions. PR #44 deployed through workflow
`33463800155`; its workflow smoke and the independent production smoke passed.

### 2026-09-01 - 070958e

Removed the stale Lafayette board-vacancy projection from the production
resident feed without deleting its decision record or linked publication
evidence. The legacy record now has no current publication pointers. The
production resident query returns 26 publications and exactly one
board-vacancy card, under `CITY-BOARD-APPLICATIONS-2026-09-15`. This was a
one-time data correction. It did not add a withdrawal workflow or resident
correction product.

### 2026-09-01 - 85d6947

Deployed resident-interface Design Slice 8 through PR #43. Bounded return paths
preserve Explore filters, record context, Ask scope, and Following context across
route changes. Discovery and meeting links keep the matching development
evidence scenario, and Coverage uses one written request vocabulary. The code
handoff names the contract, readiness gate, fixture owner, and future API owner
for every resident destination. GitHub Verify and PR-Agent passed on the final
head. Production workflow `33454522729`, the independent production smoke, and a
live fixture-boundary check passed (`src/features/resident-handoff/`,
`docs/resident-interface-slice-8.md`).

### 2026-08-31 - c180659

Corrected the public coverage flow after a focused review. Successful request
and private-report states now move keyboard focus into the next useful control
or heading. Fixture parameters stay tied to active development scenarios, and
the public method page names deterministic checks as the final publication
gate. Automated validation is pending in pull-request CI
(`src/features/coverage/`, `docs/resident-interface-slice-6.md`).

### 2026-08-31 - d1bcdb8

Deployed anonymous resident telemetry through PR #41. Pull-request verification
passed, production workflow `33444625765` deployed the exact merge, and an
independent production smoke passed both served origins, the canonical asset,
the apex redirect, and the readiness query.

A controlled browser check started from zero counters. Loading the canonical
domain and the required `convex.site` origin, then selecting Lafayette on the
clean origin, produced 2 unique browser identifiers, 2 visits, 1 activated
visitor, and 1 Lafayette selection. One human tester created both identifiers
because browser storage is origin-specific. These rows prove that production
visit and activation writes reach the private report. They are controlled test
traffic, not two users or evidence of resident adoption.

### 2026-08-31 - 3393b19

Added production-only anonymous visit and area-selection telemetry. Fixed event
contracts update deduplicated browser, event, and aggregate rows in one Convex
mutation. The private report separates unique browsers, 30-minute visits,
activated visitors, 24-hour returns, and area counts. A bounded daily cleanup
removes browser identifiers and events after 90 days. The browser sends a hash
of a random local identifier, never resident content. A same-origin HTTP route
keeps the write mutations internal, validates the exact payload, and applies
per-browser and global limits. The counts remain unauthenticated product
signals. Browsers that cannot persist the random identifier are excluded rather
than recounted after each reload. Automated validation is pending in pull-request CI (`convex/analytics/`,
`src/features/analytics/product-analytics.tsx`).

### 2026-08-31 - dd5501e

Deployed the repeatable launch-data promotion through production workflow
`33435833908`; the independent production smoke passed the Convex origin,
canonical domain, apex redirect, and readiness query. Seventeen included
official PDFs matched their development hashes before extraction.

The run published 26 launch records: 15 Lafayette, 9 Rapides, and 2 East Baton
Rouge. Fifteen are full and 11 are limited. The Rapides negative control
returned `not_found`, and replay reused all 27 successful extraction run IDs
without new model calls. Three targets stayed out after repeat exact-citation
validation failures. At promotion time, the resident query also exposed one
older duplicate Lafayette board-vacancy card, which raised the public count to 27. The September 1 production-data correction above removed that stale
projection while preserving its record and evidence
(`docs/production-batches/launch-data-2026-08-31.v1.json`,
`convex/operations/seed.ts`).

### 2026-08-31 - 432645b

PR #33 fixed review completion budgets for high reasoning effort, merged as
`fd03192`, deployed to production, and passed the independent production smoke.
PR #35 moved review findings onto exact fact paths or `null`; a development
retry then published the previously blocked Rapides millage-election record as
limited. It merged as `434c263`. Exact production workflow `33419095880` and an
independent production smoke passed.

PR #36 fixed displaced PDF superscript text that blocked a valid lifecycle
citation. Extraction processor v1.17 restores the paired ordinal suffix without
weakening changed-text checks; the Pafford EMS contract then validated,
reviewed, and published limited. It merged as `432645b`. Production workflow
`33419981241` timed out during its first static-file upload after deploying the
backend. Attempt 2 completed the backend and frontend deploy, production seed,
and workflow smoke. An independent production smoke also passed.

The bounded data runs ingested four East Baton Rouge and four Rapides official
PDFs, published seven limited records, retained two negative cases, and replayed
without new snapshots or model calls. Production was not used for those data
runs (`convex/extraction/textMatch.ts`, `convex/review/`,
`convex/pipeline/state.ts`).

### 2026-08-31 - Design Slice 7 review

Implemented resident-interface Design Slice 7 for pull-request review. Shared
route completion now updates the page title and focuses the new heading, which
reads the page name once instead of twice. Loading actions keep their written
label inside a mirrored spinner slot that holds the width and keeps the label
centered. Discovery refreshes announce accepted updates, sheets focus their
written Close control and return focus after a delay read from the
`--dur-standard` motion token, Explore's search input stretches to fill its
field, and reduced-motion rules cover resident transitions and spinners. A browser sweep
checked 14 development routes at 320, 375, 414, 768, 1280, and 1440 CSS pixels.
All 84 frames had one main region, a visible page heading, named visible form
fields, full-size written controls, and no page-level horizontal overflow.
Automated validation remains with pull-request CI
(`src/features/resident-blueprint/`, `src/features/discovery/`,
`src/components/ui/button.tsx`).

### 2026-08-31 - 0853f69

Implemented resident-interface Design Slice 6 against explicit development
fixtures. Coverage now explains five written source-health states body by body,
keeps accepted records distinct from complete coverage, records coverage demand
without starting source work, explains the evidence method, and sends source
problems through a private form. Production routes remain unavailable until
their real coverage, request, and private-delivery paths pass their gates.
Browser checks covered the request, email verification, duplicate, rate-limit,
notice-delivery failure, follow, area-selector, and report paths from 320
through 1440 CSS pixels without application overflow. Automated validation
remains with the pull-request checks (`src/features/coverage/`,
`src/routes/coverage*`, `src/routes/how-it-works.tsx`).

### 2026-08-31 - adfe81e

PR #31 deployed resident-interface Design Slice 5. Exact production workflow
`33401768387` and the independent smoke passed the Convex host, canonical
domain, apex redirect, asset delivery, and production readiness query. The
deployed code keeps follows unavailable until Auth and AgentMail pass their
integration gates.

### 2026-08-31 - 9d6751d

PR #31 review found that muting a target could discard a cadence change that
the resident had not saved yet. The management sheet now owns one cadence draft
per opening. Mute and resume leave that draft visible, while closing without
saving discards it. The exact choose-weekly, mute, close, and reopen sequence
was replayed in the browser without overflow or runtime warnings. GitHub Actions
will rerun the automated gate after the fix is pushed.

### 2026-08-31 - f0b46ec

Implemented resident-interface Design Slice 5 against development-only typed
fixtures. The new follow flow preserves the chosen cadence through equal Google
and email-only paths, keeps the target, cadence, and destination visible, and
does not show `Following` before the fixture confirms the action. Following,
saved areas and topics, notification preferences, immediate and roundup email
layouts, and scoped email-only management now replace their low-fidelity route
blueprints.

Production still has no Convex Auth or AgentMail follow integration. Routes
without an explicit development fixture show an honest unavailable state and
load no fixture subscription data. Browser checks covered 320, 375, 390, 1280,
and 1440 CSS pixels without horizontal overflow. The email verification path,
Google return, empty and degraded lists, frequency changes, mute, one-target
unfollow with Undo, saved-area add and removal, and expired management links
were exercised manually. The email management page also opens on the cadence
saved by that subscription.
Automated validation remains deferred to pull-request CI
(`src/features/following/`, `src/routes/following*`,
`src/routes/email.manage.$token.tsx`).

### 2026-08-31 - ff36c1b

PR #28 merged the Ask Public Parish interface as `ff36c1b`. Production workflow
`33389489990` succeeded for that exact commit. This session did not repeat the
independent production smoke.

### 2026-08-30 - PR #28 review

Implemented resident-interface Design Slice 4 (Ask Public Parish) and opened
PR #28. The review record below predates the later `ff36c1b` merge.

The route renders corpus, issue, and meeting scope behind a hard production
availability gate: a two-question cited thread on the real CO-022-2026 and
CO-023-2026 records, not-found, checking, expiry, cooldown, CAPTCHA, retryable
and terminal provider failures, offline, recent same-device handles, and the
shipped evidence viewer with multi-source claims. The private `q=` URL handoff
is replaced by an in-memory draft that never enters a URL or history state.
Eleven presentation scenarios load through a DEV-only dynamic import;
production never requests the fixture module.

The first `npm run verify` run passed on the branch with 194 tests across 23
files, typecheck, the production build, prerender, and lint. A later ship review
added focused Ask coverage for route privacy, scope restoration, in-memory draft
consumption, citation accounting, production fixture gating, duplicate-submit
protection, the compact thread composer, and named official contacts. GitHub
Actions owns validation for the follow-up commit.

The follow-up reviewer found that the existing scope-change confirmation was
attached to a recent-list branch that could not run. Route scope changes could
therefore clear an active thread without asking. The confirmation now intercepts
the real route transition, keeps the current scope and conversation on cancel,
and starts the new scope only after confirmation.

The next reviews caught four related edge cases. Corpus scope identity dropped
the selected public area, and canceling a cross-scope handoff discarded its
draft. Corpus identities now retain the area key. Cancel restores the old route
after saving the incoming draft to its in-memory scope handoff, and unrelated
scope transitions no longer consume that draft. Opening a recent conversation
now updates the public route to the conversation's scope instead of leaving the
URL on the previous evidence scope.

Four checked-in fixes came out of CI and review rather than from me reading the
diff first. Verify caught a decision page still passing the old string scope,
then seventeen lint errors in the new module. The reviewer then found two real
defects: the record pages invited a question and dropped it at the unavailable
gate, and the page cleared its own cooldown while the adapter kept refusing, so
Send did nothing at all. A third finding about a stale closure in the expiry
sweep was wrong and was dismissed with a written reason; the effect closes over
the conversation object, so the field is read fresh on every tick.

The adapter contract needed three additions the handoff did not specify:
`subscribe` for the realtime channel a Convex backend will own,
`resolveChallenge` for the abuse adapter, and `clearRecent` because the adapter
owns same-device handle storage.

No chat backend exists behind any of this. Ask stays in production navigation
showing the honest unavailable state, and the record pages show that same
message instead of a composer.

### 2026-08-30 - 3a59e45

PR #27 passed its first GitHub verification run. PR-Agent found an inherited-key
crash in citation URL validation and three fixture rows whose destination did
not match their displayed record. Citation lookup now requires an own property.
The unsupported water-meter record link is gone, and the April meeting rows
open matching routine records. New invariants cover inherited citation ids and
meeting-row title mismatches. Revalidation is deferred to the next PR checks
(`src/features/evidence/contracts.ts`, `src/features/evidence/record-fixtures.ts`).

The next full-context review found two responsive defects. Accepted detail
labels and values now stay together in the content column instead of entering
the evidence gutter. The mobile drawer retains its last citation and size until
the close transition finishes. Browser checks measured aligned definition rows
at 1,280 pixels with no overflow and kept the excerpt visible during the
390-pixel drawer exit. Automated revalidation remains with PR checks
(`src/features/evidence/decision-page.tsx`,
`src/features/evidence/evidence-surface.tsx`).

The final full-context review found that static imports still placed the
development evidence fixtures in the production JavaScript graph even though
the runtime gate prevented rendering them. Route loaders now fetch the fixture
modules through development-only dynamic imports. The production build can
drop the fabricated excerpts entirely. Citation URLs opened without a click
now record the first matching Source control as their focus-return target. The
next PR checks own automated revalidation
(`src/features/evidence/evidence-page.data.ts`,
`src/features/evidence/evidence-surface.tsx`).

PR #27 merged as `3a59e45`. GitHub verified typecheck, 194 tests across 23
files, the client and server builds, prerender, and lint on the final branch
head. PR-Agent reviewed that exact head with no major or security findings.
Production workflow `33332573558` deployed the backend and frontend, seeded the
source configuration, and passed its smoke. The independent production smoke
then passed the direct Convex host, canonical domain, apex redirect, and backend
readiness query.

### 2026-08-30 - ac0cc55

Implemented resident issue, atomic decision, meeting, and citation-level
evidence pages against explicit development fixtures. Material claims open an
exact official excerpt in a mobile Coss drawer or desktop evidence rail, keep
the selected citation in the URL, and return focus to the opening Source
control. Full, limited, delayed, historical, uncertain, before-minutes,
after-minutes, and live-update states are covered. Production builds ignore the
fixture parameters and render recovery pages because real detail queries are
not connected. Runtime checks at 320, 390, and 1,440 pixels found no horizontal
overflow. `npm run verify` passed typecheck, 194 tests across 23 files, the
production builds, prerender, and lint. No deployment is claimed
(`src/features/evidence/`, `docs/resident-interface-slice-3.md`).

A review pass then hardened the evidence viewer. Closing the desktop panel
returns focus to the opening Source control in an effect after the commit
instead of inside a requestAnimationFrame, so the restore no longer depends on
the browser painting a frame. Escape closes the panel, the Source controls
aria-controls target exists while nothing is selected, and the live-update
fixture matches the timeline entry it moves by its date instead of a
hard-coded string. The open, close, Escape, focus-return, and deep-link paths
were checked in the local browser. Suite re-validation is deferred to the pull
request checks (`src/features/evidence/evidence-surface.tsx`,
`src/features/evidence/evidence-model.ts`).

### 2026-08-30 - 409a3e1

Connected Home, For You, and Explore to current full and limited atomic
publications through a bounded public Convex query. The query returns only
accepted resident fields, hides withheld versions, and fails closed on stale
publication pointers. Live cards identify themselves as published decision
records and open the accepted official source. They do not invent issue
ranking, topics, or consequence text. Explicit fixture URLs still drive
development QA and remain disabled in production. The development deployment
returned four accepted records. `npm run verify` passed typecheck, 169 tests
across 21 files, the production builds, prerender, and lint. Production-preview
checks at 390 and 1,440 pixels found no horizontal overflow, rendered four
official-source links, and ignored fixture parameters. PR #26 merged this exact
commit and the production release passed its workflow and independent smoke
(`convex/resident/discovery.ts`, `src/features/discovery/`).

### 2026-08-30 - b22e321

Deployed the Slice 2 owner phone-review refinements through PR #25. Production
workflow `33324166404` verified the merge, deployed the backend and frontend,
seeded source configuration, and passed its smoke. The independent production
smoke then passed the direct Convex host, canonical domain, apex redirect, and
backend readiness query. A live 390-pixel check confirmed one-color Watching
text, the Louisiana Coverage icon, 44-pixel Coverage actions, no fixture banner,
and no fixture state at `?fixture=update`. The fixture URLs remain
development-only. No production resident projection is claimed.

### 2026-08-30 - 0eed59c

Extended the production fixture gate to every scenario-derived state, including
signed-in areas, update rows, degraded notices, empty scenarios, and section
failures. A production preview at 390 pixels checked all 14 Home, For You, and
Explore fixture scenarios. Each rendered zero fixture cards, update rows,
failure states, fixture notices, and known fixture copy without horizontal
overflow. Development checks still rendered the explicit update, signed-in, and
section-failure scenarios. `npm run verify` passed typecheck, 163 tests across 19
files, the production client and server builds, prerender, and lint. No
deployment is claimed (`src/features/discovery/`).

### 2026-08-30 - ee05d8d

Closed a review finding that unlabeled fixtures could look like real civic
records. Development builds now require an explicit `?fixture=` scenario before
rendering fixture records. Production builds ignore fixture parameters and show
an honest empty state until the resident projection is connected. A production
preview at 390 pixels rendered zero fixture cards on Home, For You, and Explore,
including URLs with `?fixture=update`. The same URLs still rendered the full QA
states on the development server. `npm run verify` passed typecheck, 163 tests
across 19 files, the production client and server builds, prerender, and lint.
No deployment is claimed (`src/features/discovery/`).

### 2026-08-30 - 6cd03da

Refined the Slice 2 resident hierarchy after a phone review. Decision cards now
use a ruled header, status pill, evidence footer, and the shared Coss primary
and outline button treatments. "Watching" uses the main text color, and the
Coverage navigation item uses the Louisiana outline instead of a shield.
Resident pages no longer show fixture banners. The existing `?fixture=` query
states remain silent QA controls and do not prove production data. Browser
checks at 320, 375, 390, 414, 768, 1280, and 1440 pixels found no horizontal
overflow. At 390 pixels, every tested standalone resident control measured 44
pixels tall. `npm run verify` passed typecheck, 162 tests across 19 files, the
production client and server builds, prerender, and lint. No backend, provider,
production feed, or deployment is claimed
(`src/features/discovery/`, `src/features/resident-blueprint/`).

### 2026-08-30 - 64e3f72

Completed a controlled Lafayette City Council production onboarding from eight
official PDFs. Production now has full current publications for CO-062 as
postponed, CO-069 as decided, and CO-072 as scheduled. Every published material
field has an exact citation into an immutable snapshot. The board-vacancy item
remains a limited source-only publication because the agenda does not support
the required timezone offset for its deadline. PRs #15 through #23 deployed the
retrieval, lifecycle, review, and Firecrawl formatting fixes that the batch
exposed. No production issue build, importance assessment, or resident feed
projection ran.

### 2026-08-30 - 4e2ac67

Added a checked, metadata-only gold set for Lafayette City Council. It covers
four agendas, three corresponding minutes, one ordinance packet, lifecycle
changes, amounts, a public deadline, exact source excerpts, facts that must
remain unknown, expected record links, and a negative example. A narrow test
checks the manifest's domains, body labels, evidence, enums, references, and
required coverage shapes
(`docs/gold-sets/lafayette-city-council.v1.json`,
`scripts/gold-set-manifests.test.ts`).

Mapped Lafayette's separate planning and zoning bodies and their official
schedules. Broken agenda and result paths prevent a complete recent
meeting-cycle replay, so Public Parish will not onboard those bodies until each
one passes the same source and coverage checks as the City Council
(`docs/source-spikes/lafayette-planning-and-zoning-2026-08-29.md`).

Implemented resident-interface Design Slice 1 as labeled low-fidelity fixtures
for the approved route graph. Added thin TanStack Start routes, a shared
responsive shell with router-driven navigation and a fixed loading region,
typed page and state contracts, a standalone email-management frame, and a
route inventory check tied to the generated router types. The bottom navigation
remains available through 1024 pixels and becomes the desktop header at 1025
pixels. The mobile top bar now scrolls away while the safe-area-aware bottom
navigation stays fixed. The documented mobile contract adds written sheet
openers, grabbers after opening, medium and full heights, explicit dismissal,
native issue-rail snapping, browser-owned Back gestures, system sharing, and a
real-iPhone Safari review after every deployed design slice.

A controlled production run ingested the August 18 City Council minutes, the
September 1 agenda, and the 27-page CO-072 packet into three immutable source
snapshots. Firecrawl returned complete page counts and normalized text, but it
also attached an engine warning about unsupported `skipTlsVerification` to all
three PDFs. The ingest path conservatively marked every snapshot truncated.
Both approved CO-072 extraction starts then failed closed at the snapshot check
before Terra ran. Production still has no AI call, decision record, publication
version, or planning-body support.

The development backend now explicitly disables Firecrawl's unsupported PDF
TLS option. Re-ingesting the September 1 agenda produced the same source and
normalized-text hashes without a truncation warning. Retrieval now creates a
new immutable version when the raw artifact is unchanged but the prior
snapshot's normalized hash or truncation state differs. A clean replay after a
false truncation marker records the old version as an unusable predecessor. The
extraction contract accepts Lafayette's 549-character official
CO-072 caption, and citation matching joins a hyphenated PDF line break such as
`Sub-\nAward` before checking exact excerpts. Processor `v1.9` extracted CO-072
with Terra, then Luna independently supported all nine cited facts. Development
published a full record with the $3,982,500 amount and exact offsets into the
immutable agenda snapshot. Terra cost an estimated $0.024469 and Luna cost
$0.003019. Replaying the same extraction start returned the original run with
`reused: true`, so it made no second model call. These fixes are not deployed to
production.

Production extraction run `jd7exmg7z2m9p4m2n615vm1yyd8de9yq` sent the July
21 CO-062 agenda record to Terra successfully, then deterministic validation
failed closed on `/sourceRecordId`, `/title`, and `/plainLanguageSummary`.
Firecrawl preserved underline markup around `CO-062-2026`, while Terra returned
the same cited text without formatting tags. Citation normalization now ignores
only `<u>` tags, including underline tags with attributes, and preserves their
text. Extraction processor `v1.10` makes the corrected run distinct from the
failed attempt. A focused regression covers the exact council-agenda shape.
The hotfix is not deployed to production.

Extraction prompt `v1.4` and review prompt `v1` published the CO-062 source
and version history, but the August 4 minutes record exposed a lifecycle error.
Its cited text says the council approved a motion to defer indefinitely, while
publication version 3 labels the ordinance `decided` instead of `postponed`.
The July 21 introduction minutes used `decided` for an approved motion to
introduce, even though the ordinance remained proposed. The onboarding batch
stopped after CO-062, and no other decisions advanced. A new defense-in-depth
hotfix defines the underlying-item rule in extraction and independent review,
then rejects the two observed successful-motion mismatches deterministically.
No production correction is claimed.

The next controlled production extraction for the August 18 CO-069 minutes
failed closed after Terra returned its structured response. The `/title` fact's
citation exceeded the 600-character excerpt bound, even though Lafayette's
official item combines a long ordinance caption with the procedural clause in
one contiguous minutes span. The checked public-record shape is 664 characters.
The contract now permits at most 1,000 characters for any citation excerpt,
matching the existing bounded official-title limit, and processor `v1.11` keeps
the corrected attempt distinct from the failed run. A focused regression covers
the CO-069 shape and rejects a 1,001-character excerpt. No production retry or
publication is claimed.

The September 1 agenda exposed a separate citation mismatch after Terra copied
visible paragraph text from Firecrawl Markdown. Firecrawl wrapped each PDF line
in underscore emphasis and expanded the visible council email address into a
matching `mailto:` link, so seven exact citations failed deterministic checks.
Citation normalization now removes only whitespace-bounded underscore emphasis
and matching email link syntax while preserving displayed text and punctuation.
Processor `v1.12` prevents reuse of those failed attempts. Tests cover the exact
agenda shape and reject changed addresses, dates, punctuation, and mismatched
link destinations. No production retry or publication is claimed.

That deadline record exposed one more deterministic mismatch. Its official
text says resumes are due at "noon," while the candidate stores the exact
zoned time as 12:00. Time matching now recognizes deadline phrases ending in
that word and rejects incidental mentions, other times, and unsupported
seconds. Extraction processor
`v1.13` keeps the corrected attempt distinct from the earlier failed runs. No
production retry or publication is claimed.

Production deadline run `jd7f5xh088k0zwepdh2nfxpx918dewb3` on processor
`v1.13` reached Terra, then failed closed with six `citation_not_found`
findings. A forced-fresh Firecrawl reproduction with `maxAge: 0`, matching the
second PDF scrape during ingest, wrapped each visible deadline paragraph line
in single-star emphasis, kept the email address as plain text, and inserted
repeated spaces between spans. Citation normalization now unwraps only complete
whitespace-bounded `*span*` runs. It preserves bullets, horizontal rules,
double-star formatting, unmatched or internal asterisks, dates, punctuation,
and changed source text. Extraction processor `v1.14` makes a corrected attempt
distinct. No production retry or publication is claimed.

Browser checks passed at 375, 768, 1024, 1025, and 1440 pixels without
horizontal overflow. A later computed-style check measured 125 pixels of
combined app chrome at 390 pixels wide, below the 8-rem budget, and confirmed
the sticky desktop header at 1280 pixels. `npm run verify` passed 146 tests,
typecheck, production client and server builds, prerender, and lint. Every
unfinished action remains inert and labeled. No API, resident data, provider
call, or working production feature is claimed. PR #14 deployed the labeled
blueprint as `6e46fd7`
(`docs/resident-interface-plan.md`, `docs/resident-interface-slice-1.md`,
`src/features/resident-blueprint/`, `src/routes/`).

Completed Slice 2 repair work after code and responsive-layout review. Every
fixture view now identifies its data as design-only. Explore restores only
supported URL filters, applies topic and evidence filters to matching record
types, sorts dated and undated results correctly, and lets the forced empty
fixture override the browse catalog. Mobile filters and area selection use a
downward-swipe Base UI drawer, while desktop uses a dialog. One Coss UI Button
size now gives standalone discovery actions a measured 44-pixel height.
The area setup has one trigger, rail-card actions align, and the lead issue
action has clear priority. Computed DOM checks passed at 320, 375, 390, 414,
768, and 1280 pixels without horizontal overflow. Date-only records now keep
their Chicago calendar day in other visitor timezones. Each More filters group
can be cleared without removing the query or unrelated filters. Sort appears
only when Explore shows a sortable result sequence. `npm run verify` passed 160
tests across 19 files, typecheck, production client and server builds,
prerender, and lint. PR #24 deployed the release as `4e2ac67`. Production
workflow `33318753459` and the independent production smoke passed the direct
Convex host, canonical domain, apex redirect, and readiness query. No API,
provider call, production feed projection, or working civic action is claimed
(`docs/resident-interface-slice-2.md`, `src/features/discovery/`).

### 2026-08-30 - 3996bfc

Split implementation Slices 6 through 9 into 15 dependency-ordered PR packets:
three for anonymous Ask and four each for accounts and email, coverage expansion,
and release work. Each packet delivers a complete vertical capability with named
dependencies, exclusions, tests, and runtime proof. Planned chat uses
`@convex-dev/agent` for durable threads with `MODEL_FAST` through Convex AI
Gateway. No component, API, resident feature, provider call, commit, or
deployment is claimed
(`docs/post-slice-5-pr-plan.md`, `docs/architecture.md`).

### 2026-08-30 - e169cdf

Completed the Slice 5 resident-interface decision grill and wrote one master
plan for the full frontend. It fixes the sitemap, page hierarchy, responsive
shell, evidence interaction, state matrix, connected flows, and eight bounded
design-agent assignments. The plan uses real development evidence for the main
flow and labeled local fixtures for unfinished integrations. No API, deployment,
or working public feature is claimed (`docs/resident-interface-plan.md`,
`docs/product-spec.md`, `docs/architecture.md`, `docs/build-plan.md`).

### 2026-08-29 - c162543

Deployed Phase 1 Slice 4 through PR #13. Production workflow `33273984552`
verified the merge commit, deployed the backend and static frontend, applied the
idempotent registry seed, and passed its smoke. The independent production smoke
then passed the direct Convex host, canonical domain, apex redirect, and
readiness query. Production now has the Slice 4 evidence engine. No production
extraction, model review, or issue build ran, so the real issue proof remains in
the personal development deployment.

### 2026-08-29 - 1ad6a8a

Implemented Phase 1 Slice 4 in the personal development deployment. Added
immutable source-snapshot comparisons and publication material changes. The
change classifier distinguishes normalized source edits from raw-only churn and
records field-level amendments, date or amount changes, decisions,
postponements, cancellations, public-action changes, information limits, and
information expansion. Withheld publication versions do not create a public
change or replace the last accepted pointer (`convex/changes/`, `convex/publication/`,
`convex/sources/snapshots.ts`).

Added the `buildIssueV1` durable workflow with separate link, review, rank, and
publish stages. Terra proposes one issue only from exact published decision
versions and citations. A concrete shared signal must appear in evidence from
every record, and each link reason must cite its own record plus another. Luna
then reviews every proposed fact from the cited excerpts. Deterministic code
removes unsupported factors, assigns the fixed 100-point score, and writes a
full, limited, or withheld immutable issue version. The backend keeps atomic
decision records, exact issue links, review checks, importance assessments, raw
model response evidence, and idempotent build keys (`convex/issues/`,
`convex/operations/issues.ts`, `convex/schema.ts`).

Proved the path with real Lafayette agenda and minutes records `CO-022-2026` and
`CO-023-2026`. Extraction prompt v1.4 produced full minutes publications with
supported vote and approved-outcome facts. Issue
`n57071y9n25rrs09yaanb1hz918dd1fs` links both records through cited references
to Terrebonne Parish Consolidated Government. Luna accepted one
`public_assets` consequence factor, and rubric v1 assigned 5 of 100 points with
14 percent factor completeness. The evidence query returns both publication
histories, the scheduled-to-decided progression, and the earlier limited-to-full
expansion.

The proof failed closed twice before acceptance. The first linker response used
a mismatched fact value, which led to exact fact-copy instructions and raw
failure-response persistence. The next candidate named the asset topic without
stating what the approved action authorized, so Luna withheld issue version 1.
Prompt v1.2 required a cited consequence statement. Luna then passed every fact,
and deterministic policy wrote full issue version 2. Replaying the input records
in reverse order returned the same build with `reused: true` and created no new
model call or issue version. The accepted issue build used one Terra and one Luna
AI Gateway call at an estimated combined cost of $0.042153.

Reviewing the real development history caught two noisy change labels. A
trailing-period edit had been called an amendment, and a full-to-limited
evidence downgrade had been called an amount change because the limited payload
omitted an empty amounts array. The classifier now suppresses punctuation,
casing, and whitespace-only text edits and labels evidence downgrades
`information_limited`. The two stale development rows were recomputed from
their immutable publication payloads. The temporary internal repair operation
was removed after use.

A later code review found three more correctness gaps. Lifecycle labels now
require an actual state transition. Losing time precision stays quiet, while a
newly supported date or clock-time change is public. A terminal issue-build
failure no longer reserves the deterministic input key, so the same evidence
can retry and a later success resumes normal replay. Deterministic link
validation also rejects the government body's own name or home jurisdiction as
the only shared signal. Issue-link prompt v1.3 states the same rule.

`npm run verify` passes typechecking, 110 tests across 14 files, the production
build and prerender, and lint. The final schema and functions are ready on the
personal development deployment. No new model call, production deployment, or
public interface change was made.

### 2026-08-29 - 0b49718

Reconciled the public record with the release history. Slice 2 merged through
PR #6 as `74ce97e`; production workflow `33222925340` deployed the reviewed
private extraction backend and passed smoke. The real Terra extraction and
idempotent replay ran in the personal development deployment, not production.
At that checkpoint, release `0b49718` also passed its production workflow. The
Slice 2 backend was deployed, while publication and independent Luna review
remained unbuilt.

### 2026-08-29 - 28ba0c3

Selected Field Notes as the production landing page in `cf828ad`, then replaced
its hero note stack with an interactive three-dimensional Louisiana relief built
with vGPU and WebGPU. The relief now shares the hero's page plane instead of
sitting inside a card. Pointer movement anywhere across the hero controls its
tilt. The solid dark slab keeps three labeled static cobalt launch pins,
perimeter light, floor radiance, and one traveling flare behind the silhouette.
The flare has a visible core, halo, and rotating beam but no scanning line or
marker pulses. Ambient draws run at a low rate only while visible, pointer
settling briefly runs faster, and reduced-motion mode holds one static frame.
The ray walk and render resolution are capped, and the component keeps a static
SVG fallback (`src/features/landing/`).

Added Coss UI Button and Badge primitives, Base UI behavior, and semantic design
tokens. Replaced the placeholder mark with a path-based double-P SVG and recorded
the selected logo, Inter and Geist Mono typography, tokens, and component rules
in the design system (`src/components/ui/`, `public/brand-mark.svg`,
`docs/design-system.html`). Browser checks passed at desktop, 390-pixel, and
320-pixel widths with the WebGPU render ready, hero-wide tilt responding, all
three pin labels in view, and no horizontal overflow. The
marketing header now uses the live-text name without the mark. On mobile, the
headline appears before the Louisiana field while the state remains visible in
the first viewport. Supporting copy follows the field. Sequence labels use plain
numbers without leading zeroes, and the connector stops at step 4.
`npm run verify` passes typechecking, 70 tests, the production build and
prerender, and lint. No deployment was made.

### 2026-08-29 - ed9aebd

Reduced the desktop Louisiana field so it supports the headline without
filling the right side of the hero. Fine-pointer devices keep the hero-wide
tilt and low-rate flare. Touch-first devices render one static WebGPU frame with
no pointer listeners or ambient loop. Browser checks passed at 1414 by 872 and
390 by 844 with the WebGPU render ready and no horizontal overflow. No
deployment was made for that landing-page refinement at the time. The later
`8df651c` release carried it to production.

### 2026-08-29 - 8df651c

Implemented Slice 3 as a separate `reviewAndPublishCandidateV1` durable
workflow. A validated candidate now queues an exact candidate, snapshot, and
fact set for a high-reasoning `MODEL_FAST` review. Luna receives the candidate
and cited spans, not the full source document, and must return one check for
every stored fact under strict JSON Schema. The contract rejects missing,
duplicate, unknown, or mismatched checks. The review model cannot match the
Terra extraction model. Deterministic source and input-hash checks run before
and after the model step (`convex/review/`, `convex/publication/`,
`convex/extraction/workflow.ts`).

Added immutable review, check, finding, decision-record, publication-version,
and citation evidence. The final policy derives full, limited, or withheld from
the stored checks. Luna cannot repair fields or choose the public payload. A
limited version contains only source record ID, title, registered body, and
official-source metadata. A withheld version cannot replace the last full or
limited current pointer. The starter is internal and idempotent on the exact
candidate plus review, policy, and payload versions (`convex/schema.ts`,
`convex/operations/publication.ts`).

Fourteen Slice 3 tests cover full publication, incomplete-source limiting,
core evidence withholding, dishonest verdict rejection, same-model rejection,
exact-check enforcement, current-pointer preservation, and replay. They also
prove that a limited finding on a core field withholds the record, duplicate
checks fail at persistence and finalization, a late failure cannot reuse a
successful review, a gateway response cannot substitute the extraction model,
and replay repairs a successful extraction that has no publication run. The
extraction workflow now completes the extraction and starts publication in one
mutation, so a scheduling failure rolls back both changes. The full suite passes
84 tests, typecheck, build, prerender, and lint.

The original Slice 3 proof ran on personal development deployment
`woozy-wren-227` and set `MODEL_FAST_ID` there to
`openai/gpt-5.6-luna`. Run `jd75t07cb5m350nt3fyys67e8n8dckn5`
reviewed candidate `k571jxydqzev299r67v2d0ew2d8ddmcd` through Convex AI
Gateway in one 11.953-second call. It used 1,707 prompt tokens, 1,281 completion
tokens, 641 reasoning tokens, and an estimated $0.001879. Luna rejected the
`recordType` and `lifecycleState` excerpts while supporting the core identity.
The deterministic policy wrote limited version
`ks74a1k6nh3gc49f5bby3q7vcn8dc6kz` with only three core citations. Replaying
the starter returned `reused: true`, kept one AI call, and created no second
version. PR #12 merged the reviewed hardening as `8df651c`. Production workflow
`33261235916` verified the release, deployed the backend and frontend, applied
the registry seed, and passed its smoke. An independent production smoke then
passed the direct `convex.site` host, canonical domain, apex redirect, and
readiness query. No production extraction or model review was run.

### 2026-08-28 - 74ce97e

Implemented Slice 2, the cited atomic decision. Registered `@convex-dev/workflow`
0.4.6 and built `extractSnapshotV1`, a durable workflow that runs the pipeline
steps prepare, extract, validate, and complete, with the model step on a bounded
three-attempt retry and parallelism capped at two. The pipeline ledger gained
`extract` and `validate` stages, a `manual_extraction` trigger, and a private
evidence set of `aiCalls`, `extractions`, `decisionCandidates`,
`candidateFacts`, and `validationFindings` tables. The internal starter is
idempotent on a key that hashes prompt, schema, and processor versions plus
registry, snapshot, and target record, and it records the workflow ID on the run.

Built the strict extraction contract v1 (`convex/extraction/contractV1.ts`) with
a JSON Schema `response_format` for OpenAI Structured Outputs, a matching Convex
validator, constrained JSON Pointer fact paths, and bounded fields. Built the Convex AI
Gateway provider boundary (`convex/ai/`) that mints the scoped token in the
action, posts Chat Completions with `reasoning_effort: "high"` and `store:
false`, classifies refusals, length cutoffs, malformed and schema-invalid
responses, transient and permanent HTTP failures, and keeps a direct OpenAI
adapter behind the same interface, disabled unless configuration explicitly
enables it. Every vendor attempt is recorded with route, model role, usage,
cached and reasoning tokens, and an estimated cost from the architecture price
table.

Validation is fail-closed: snapshot basis, normalization, truncation, stored
hash and size, and official-domain checks run before any model call and again at
validation. The validator re-verifies the stored text, requires every cited
snapshot ID and excerpt to resolve inside normalized source text, gates page
numbers behind a page map, checks section-before-excerpt ordering, parses
Louisiana meeting dates and public-action deadlines as zoned ISO timestamps
supported by the cited date and time, requires amounts to be finite nonnegative
two-decimal values that appear as complete money tokens in the excerpt, blocks
agenda evidence from producing decided outcomes or votes, and requires exactly
one fact row for every non-null material leaf. Unknown paths, duplicate paths,
blank excerpts, and fact values that do not equal the stored candidate fail
validation. Passing validation moves the candidate to
`deterministically_validated`, which means ready for independent review, not
published. No public decision, citation, review, or publication table exists
yet.

Added 40 tests around a `CO-029-2026` fixture derived from the official agenda.
The tests ingest stubbed PDF and Firecrawl responses through `convex-test`, then
use stubbed Gateway responses to cover ordered stages, transient retry without
a second run, exhausted retry budgets, `Retry-After` evidence, permanent HTTP
errors, malformed envelopes, replay after persistence, key composition, exact
amount and time checks, page-map offsets, public-action deadlines, fact binding,
and fail-closed model and source errors. Direct mutation tests prove that a run
cannot complete before both stages agree, a workflow crash writes failure
evidence, target IDs cannot cross runs, and a validated candidate cannot flip to
failed. `npm run verify` passes typecheck, 70 tests, build, and lint.

A manual file-by-file review after the first pull request pass found and fixed
several gaps. Validation now checks page maps against the original source-text
offsets instead of whitespace-collapsed offsets. Date evidence must match
seconds when the source states them, and amount matching rejects numeric text
embedded in identifiers. Ledger mutations verify run, stage, extraction,
candidate, snapshot, source kind, and target ownership before changing state.
Workflow-level failures create a failed extraction row, and successful run
completion requires both stages to point to the same validated or not-found
extraction. Failed ledger handoffs delete any newly stored raw model response
instead of leaving an orphaned blob. Those changes used processor `v1.3`, so
runs made under the earlier validator could not be reused.

Proved the Slice 2 exit gate on the personal development deployment with the
real processor v2 agenda snapshot `js7facykrk86ep9rgf98ttj52n8dadh2`. Three
scoped Convex AI Gateway calls used `openai/gpt-5.6-terra`. The first response
invented fact-path syntax and the second joined a heading to a later record
line. Deterministic validation rejected both, and those failures led to prompt
versions `v1.1` and `v1.2`. The `v1.2` call completed in one model attempt with
2,418 prompt tokens, 1,609 completion tokens, 431 reasoning tokens, and an
estimated cost of $0.024144. It produced a private `CO-029-2026` proposal with
nine fact rows. Every excerpt resolved to the stored snapshot, every fact value
matched its candidate field, both workflow stages succeeded, and the candidate
reached `deterministically_validated`. Repeating the starter returned the same
successful run with `reused: true` and made no new model call. Production is
untouched.

After the hard-review fixes, processor `v1.3` ran the same immutable snapshot
again as workflow `jd77cjr93ffka05sxygsmk9cvs8dae8x`, pipeline run
`jd7fdefsdfnwqzqfje6j44t9zs8dap09`, extraction
`k97163nwwnsfn09ma10wvgaass8da9y2`, and candidate
`k5702garn0ve9czhxa51b9022x8damkw`. Terra completed in one attempt with 2,418
prompt tokens, 1,691 completion tokens, 469 reasoning tokens, and an estimated
cost of $0.020781. The request used 2,415 cached input tokens. Both stages
referenced the same extraction, the candidate reached
`deterministically_validated`, all nine fact rows persisted, and no validation
finding existed. Repeating the starter returned `reused: true`; the run still
had one AI call. Production remained untouched.

A second independent review found that a date-only citation accepted a
timestamp with nonzero seconds. Processor `v1.4` now requires exact midnight
when the source gives a date without a time. The same review added direct test
coverage for target-record mismatches, agenda evidence claiming an outcome, and
citations tied to another snapshot. It also replaced an unexplained AI-call
query limit with the retry-derived six-call ceiling, rejects a seventh call
instead of leaving it unlinked, caps validation-stage error details at 500
characters, removes the duplicate extraction-version re-export, and documents
why ESLint rather than TypeScript checks first-party unused symbols.

Processor `v1.4` then ran snapshot `js7facykrk86ep9rgf98ttj52n8dadh2`
as workflow `jd7bpj99vzmfbse5sq4z7zrsy18dcawg`, pipeline run
`jd73w9yar4s5hc0mh3swbhbce58dc9rf`, extraction
`k977t7yxh9fbmzv8y1edcaccy18ddnra`, and candidate
`k571jxydqzev299r67v2d0ew2d8ddmcd`. Terra completed in one attempt with 2,418
prompt tokens, 2,103 completion tokens, 816 reasoning tokens, and an estimated
cost of $0.030072. Both stages referenced the same extraction, all nine fact
rows persisted, the candidate reached `deterministically_validated`, and the
run had no validation finding. Repeating the starter returned `reused: true`
with the same run and workflow IDs; the run still had one AI call. Production
remained untouched.

### 2026-08-28 - 70ee961

Built and deployed the Slice 1 source ledger and retrieval processor v2 to the
personal development deployment `woozy-wren-227`. Production remained
untouched. The schema holds jurisdictions, bodies, registries, per-source
immutable snapshot chains, pipeline runs, and stage evidence. The processor
checks requested and final URLs, requires a successful target status, hashes
the raw artifact separately from normalized Markdown, reuses only the current
source-chain head with the same raw hash, and cleans redundant or failed file
uploads (`convex/schema.ts`, `convex/operations/ingest.ts`, `convex/sources/`,
`convex/pipeline/`).

The real Lafayette council hub created processor v2 snapshot
`js7c4pvv6xx0x1p8d9hk3zw64s8danvf`. It stores 37,372 bytes of normalized
Markdown and 131,799 bytes of raw HTML. The raw artifact hash starts
`d02b2171…`; its separate normalized hash starts `53188bd7…`. An immediate
repeat reused the same snapshot ID and version 2.

Expanded the Lafayette registry from one seed to the council hub, council
document search, and schedule/research pages. A bounded Firecrawl map found 19
official council pages. The portal did not expose individual records to the
map, so two official-domain-restricted Firecrawl searches found 50 ranked
candidates, including stable `/obcouncil/api/Document/<id>/` records. The
official portal query paired the April 21, 2026 Lafayette City Council agenda
with its minutes.

The first PDF spike revealed that Firecrawl's `rawHtml` is a rendered
representation, not the original PDF. The processor now keeps Firecrawl's
Markdown extraction and downloads the approved official PDF as the immutable
raw artifact. That download checks redirects, status, and content type, stops
after 60 seconds, and enforces a streamed 25 MB limit. The corrected agenda
snapshot `js7facykrk86ep9rgf98ttj52n8dadh2` stores a 172,034-byte, two-page PDF
and 4,274 bytes of Markdown. The corrected minutes snapshot
`js76769zsap7fwv3e1j6r2tqbh8db1cv` stores a 160,754-byte, seven-page PDF and
12,696 bytes of Markdown. Immediate repeats reused both version 2 snapshot IDs.
The earlier version 1 PDF snapshots remain in development as transparent spike
evidence and contain rendered HTML rather than the source PDFs.

`npm run verify` passes typechecking, 30 tests, the production build, and lint.
The Convex review found no public function, auth, query-scan, validator, or
unbounded-result issue in this change. A hosted development build was uploaded
to `https://woozy-wren-227.convex.site`; a direct GET and the live readiness
query passed. PR review caught a PDF body-stream timeout that could escape the
structured failure path after response headers arrived. The downloader now
records that case as retryable, and a regression test fails the stream after
its first chunk. A later review found that Firecrawl Markdown and the direct PDF
download could straddle an agency file replacement. PDF ingestion now brackets
a forced fresh Firecrawl scrape with official-file downloads and commits only
when both raw hashes agree. A regression test changes the PDF between those
downloads and proves that no mixed snapshot is created. The revised processor
was pushed to the personal development deployment and ingested the agenda again.
Both official downloads matched around the fresh Firecrawl scrape, and the run
reused snapshot `js7facykrk86ep9rgf98ttj52n8dadh2` at version 2. The final
fail-closed content-type and PDF-signature checks passed the same live dev run
and reused that snapshot again.

Added the hackathon release path in the working tree. Pull requests run the full
verification command. A reviewed merge to `main` will deploy the matching
backend and frontend, apply the idempotent registry seed, and run a production
smoke. The smoke script checks the direct `convex.site` origin, the canonical
custom domain, the path-preserving apex redirect, a built JavaScript asset, and
the live readiness query. Its read-only HTTP checks pass against the current
production shell. The new release workflow has since run: this work merged through PR #5
(`70ee961`), deployed the production backend and frontend, and the production
smoke passed, so Slice 1 is live in production. No AI model call, AgentMail
integration, authentication, public evidence interface, or public pipeline
function exists yet.

### 2026-08-27 - dd12d01

Established separate hosted development and production environments. The Phase
0 shell passed its hosted development smoke before the matching Convex backend
and static frontend were promoted to production. Renamed the product, GitHub
repository, local remote, and Convex project to Public Parish and
`public-parish`. GitHub redirects the former repository URL; the Convex
deployment names and public URLs remain unchanged.

Attached `https://www.publicparish.com` directly to the production Convex HTTP
router and set it as the production `CONVEX_SITE_URL`. Added a redirect-only
Vercel project for the bare domain so paths and query strings on
`https://publicparish.com` permanently redirect to `www`; Vercel does not host
the application frontend. Checked the isolated redirect configuration into
`infra/apex-redirect`. Kept the required
`https://befitting-flamingo-587.convex.site` origin public and functional.
Documented why the redirect is needed and why it does not replace the
hackathon's qualifying URL. The submission will use the public `convex.site`
host; the custom domain remains an additional resident-facing entry point.

Kept the team warning threshold at $20 per month and raised the hard disable
threshold from $40 to $60 per month before real AI Gateway calls begin. The
limit remains team-wide; model calls will also have application-level token,
retry, batch, and chat budgets.

Verified the custom-domain DNS and TLS certificate, the public root and direct
SPA routes on both served production origins, the production-bound JavaScript
asset, desktop and mobile layouts, and the live readiness query
(`package.json`, `README.md`, `docs/`). Convex Auth v2 and Google OAuth remain
planned but unconfigured. No Firecrawl ingestion, OpenAI model call, AgentMail
integration, authentication, or resident evidence experience exists yet.

### 2026-08-27 - 96938c4

Initialized a fresh repository and completed the product grilling. Documented
the agreed scope, resident experience, evidence policy, source plan,
architecture, sponsor roles, four-week build order, demo, user-proof targets,
and stop rules. Completed event registration and selected Convex AI Gateway,
Convex Auth v2 alpha, and a two-tier GPT-5.6 model split for the implementation
plan.
Narrowed the plan before implementation by removing FAQ aggregation, the public
correction workflow, public-triggered compiler runs, and cross-device chat
history. Kept a private source-problem inbox, public coverage demand capture,
the owner-triggered coverage compiler, weekly roundup emails, and per-issue share
HTML.
Confirmed that the Convex Professional plan satisfies the AI Gateway paid-team
requirement. Revised the model assignment so that GPT-5.6 Terra performs record
extraction, consequence factors, and issue linking, while GPT-5.6 Luna performs
discovery classification, ranking, independent publication review, and chat.
Dropped GPT-5.6 Sol from the plan entirely; two tiers cover the pipeline.
Documented the roles `MODEL_STRONG` and `MODEL_FAST` with a single
role-to-model table in `docs/architecture.md`, and set every stage that produces
or clears a published claim to high reasoning.
Scaffolded TanStack Start in SPA/static-prerender mode and created a Convex
development deployment. Added the static-hosting component, a live readiness
query and React subscription, a checked-in environment template, an MIT
license, and a public GitHub remote (`package.json`, `vite.config.ts`, `convex/`,
`src/`, `.env.example`, `LICENSE`).

Installed Convex's generated AI guidance and pinned Convex Auth v2 alpha without
configuring authentication. Verified an AI Gateway service token and confirmed
that the planned Terra and Luna model IDs are available through the gateway's
model-list endpoint; this was not an AI model call. Redeemed the official
Firecrawl participant credit grant.

Proved a clean dependency install, generated guidance status, three tests,
typechecking, a production build, linting, a Convex cloud push, and a local
"Convex connected" runtime. No public app deployment, Firecrawl ingestion,
OpenAI model call, AgentMail integration, or authentication exists yet.

Hardened the first public release by pinning every direct dependency, declaring
the supported Node.js and npm majors, and making production builds reject a
missing Convex URL. The deploy command now rebuilds before publishing. Generated
agent guidance stays local and is reproducible through the documented install
command (`package.json`, `package-lock.json`, `vite.config.ts`, `.gitignore`,
`README.md`).

Added a narrowly bounded plan for one static landing-page voter-information
strip. It will link to the Louisiana Secretary of State and show a date verified
against the official calendar. Candidate coverage, ballot matching, crawling,
and model-generated election content remain out of scope (`PLAN.md`,
`docs/product-spec.md`, `docs/build-plan.md`).

Published the initial Phase 0 source commit to the public `main` branch. The app
itself remains undeployed.

### 2026-09-05 - dbb7984

Opened PRs #93 through #99 for final Build Slice 9. Development now runs approved
source monitoring, continuing issue proposals, paginated accepted-history search,
batched corpus Ask, live coverage requests and verified launch notices, issue
share HTML, and private operations reports. The Cotile Lake issue passed automatic
linking and independent review. Pafford retained its existing URL after an added
decision. The bounded citation audit passed 497 citations across 94 publication
versions without changing stored evidence. Browser and controlled provider
certification continue. The PRs remain open and production is unchanged. See
`docs/slice-9-development-certification.md` for proof and remaining checks.


### 2026-09-05 - working tree

The combined development build passed 455 application tests and eight desktop
and mobile browser checks.
Controlled immediate and weekly emails arrived with official links, and a signed
webhook replay produced one grounded reply. Removal and address-wide unsubscribe
passed. The citation audit now covers 558 citations across 105 publication
versions. Corrected callback typing, readable email references, search result payloads,
concurrent extension retries, and outcome visibility counting. PDF continuation is paused at the
500-admission limit; final-head CI and reviews continue. AI Gateway is verified
and direct fallback stays disabled. No production merge or source activation.


### 2026-09-05 - 186d936 and final certification

Completed the 31-page Rapides minutes inventory from its saved first section.
The strong extractor and independent reviewer accepted the remaining section
on the same immutable snapshot. A recorded review truncation led to an 8,000-token
review limit. The owner approved one development-only 100-admission credit;
the canary used 69, retained its normal 500 daily rate, and stopped with 31 unused.
All ten fresh Rapides gates passed and the public development page showed seven
supported bodies, with three Lafayette planning bodies still validating.
Monitoring is paused with 54 pending and 29 published targets. The final audit
passed 575 citations across 108 publication versions. All provider rows reconciled
with their daily aggregates. CI on 186d936 passed 456 application tests and eight
browser checks. Review then found a misleading launch-notice reverification
message; the final change reports sent or stopped notices without promising
another send. Production approval and live release checks remain separate.

The final application code at 7d2ed31 passed 457 application tests and eight
browser checks in Verify 33949802588. Its CI artifact is served on development
as hosting deployment 48bd933b-b4dd-40fe-8e1d-349f6785a597. No local automated
validation ran.


### 2026-09-05 - 3882fa5

Final source review found four duplicate pending targets at the PDF section
boundary. None had reached publication. Continuation now provides previously
accepted locators to extraction and review, rejects nested locator repeats,
and resumes the immutable snapshot before another retrieval. The bounded
repair recomputed only the unpublished last section. Run
tn7cz50rsvjx8k52687tmz0sa58dt4a1 completed with 38 targets and no nested duplicates.
The canary used 99 of the approved 100 extra admissions. Monitoring is paused
with one admission unused, 49 pending targets, and 30 published targets. All ten
fresh Rapides gates pass. The final audit passed 581 citations across 109
publication versions with no problems. Provider ledgers and daily aggregates
agree. No production merge or source activation occurred.

Verify 33950769153 passed all 458 application tests and eight browser checks on
3882fa5. The deployed frontend remains the unchanged 7d2ed31 artifact; development
runs the final backend. Subsequent changes only record this evidence.

The final source review corrected the date-window boundary: a policy activated
midday includes meetings dated that day. The regression covers the previous,
current, and next calendar day. Development runs the combined code at 0da2d88
with monitoring paused. The latest PR checks record this final regression.


### 2026-09-05 - 48dedf3

Released final Build Slice 9 through PRs #93 to #99 and the narrow replay repair
#100. All eight production deployments and independent live smokes passed.
Final application CI passed 473 tests; the unchanged frontend passed eight
browser checks. Production verified older-record search, grounded Ask, controlled
alert and reply delivery, unsubscribe, and 283 immutable citations. Seven bodies
passed their coverage gates. Only Rapides Police Jury has automatic checks
active, capped at 50 daily admissions with incomplete catch-up retained.
Lafayette's three planning bodies remain validating. See
`docs/slice-9-production-certification.md` for proof and limits. Resident benefit,
the timed demo, and submission remain separate from build completion.


### 2026-09-05 - f289503

Added a versioned permission for Lafayette's official event-document path while
preserving old source manifests. The earlier Hearing Examiner agenda PDF worked,
but the event service returned 502 again and a fresh Firecrawl scrape failed.
The planning bodies remain unvalidated. Exact City and Parish commission
identities and working agenda/outcome pairs are still required. Added a path
restriction regression for CI; development deployment and production release of
this repair follow PR checks.


### 2026-09-05 - working tree

Separated Lafayette City Planning, Parish Planning, and City Zoning commission
identities so one body cannot satisfy another body's coverage gate. Kept the
legacy manifests and gold set for historical runs. Production had no decisions
under the old generic entry. Added a regression proving that promoting the old
placeholder cannot mark the parish supported while a real commission is missing.
PR #102's event-path repair deployed and passed independent production smoke;
the source outage still prevents full planning-body certification.

### 2026-09-05 - 0d13b0b

PR #103 passed 476 CI tests and deployed the separate Lafayette commission
identities. Production smoke then caught its outdated ten-body expectation.
The follow-up checks the exact twelve current bodies within their parishes,
including each Lafayette commission. Release certification remains pending
the corrected production smoke. No planning body has been promoted.

### 2026-09-05 - working tree

Repaired automatic catch-up after production showed 61 pending Rapides targets
and repeated daily-budget pauses. Ready decisions now precede source discovery;
incomplete documents cannot block the queue, and budget pauses preserve retries.
Added scheduler and limiter regressions for PR checks. Daily limits and evidence
gates remain unchanged. Development and production proof follow review.


### 2026-09-06 - 4b8927b

Closed the Slice 9 follow-up record. PRs #102 through #105 deployed the Lafayette
source and identity repairs, corrected the twelve-body production smoke, and
repaired queued-decision priority. PR #105 passed 483 CI tests, production
deployment, and independent smoke. Its development run published one queued
item with six citations; production proved the exhausted-budget pause without
consuming attempts. The build is complete. Catch-up, broader activation, full
Lafayette certification, resident proof, the demo, and submission remain open.
`docs/build-status.md` records those boundaries and links the dated evidence.


### 2026-09-06 - 55a9158

Recovered the five Lafayette planning bodies' official agendas and outcome
sources through event attachments and links inside PDFs. PR #106 records the
checked samples and extraction corrections. Production certification exposed a
missing-record probe that could route to an unrelated case. Review withheld
that result. PR #107 requires the literal printed identifier; development and
production replays returned `not_found` without a candidate. PR #108 uses City
Zoning's printed body name while preserving its older root manifest.

All five bodies passed all ten development and production coverage gates and
were promoted. Public queries report all twelve launch bodies supported and
all three parishes available. The five planning bodies still need owner-started
updates because future attachment discovery has not been proved.

Scheduled Rapides runs demonstrated progress after the budget reset. The owner
approved 500 daily admissions during catch-up. Normal monitoring cleared 39 of
the previous 61 pending targets, with 38 more published and one withheld.
The exhausted bucket leaves 22 pending, including 18 blocked by an incomplete
minutes inventory. Automatic work resumes after the September 7 reset. Restore
50 after catch-up and the budget window permit it. The six other previously
supported bodies now have bounded policies and subsequent scheduled runs.

PRs #106 through #108 passed CI, review, production deployment, and independent
smoke. The final PR passed 486 tests and desktop/mobile emulation. Chrome showed
the first four planning promotions before its connection became unavailable.
The final promotion and selector availability have live public-query proof,
not a final manual browser click. The source-operations report records the
case-level results, dates, budgets, and remaining work. No resident benefit or
hackathon submission is claimed.


### 2026-09-06 - working tree

Repairing the empty parish homepage by selecting government bodies before
applying bounded issue and decision limits. Regression coverage includes a
newer publication flood in another parish. GitHub Actions will run automated
checks and desktop/mobile browser checks. No paid source processing is restarted.

Repairing access to already-published evidence during coverage interruptions.
The selector keeps such parishes selectable with a limitation notice, while
parish recovery no longer skips degraded status. Explicit pauses remain.
Automated validation is delegated to GitHub Actions; source processing stays off.

### 2026-09-07 - working tree

The production parish-switch check exposed a card crash on an official date
written as "September 29, 2026, at Noon." Date formatting now retains printed
wording when it is not a valid ISO date, instead of throwing or guessing.
Regression tests use that exact input. No source records or provider settings change.

### 2026-09-07 - working tree

Adding expiring estimated-cost allowances for source AI and resident Ask after
the spending interruption. Reservations precede model calls and preserve charges
when usage is unknown. Existing admission windows remain intact. Automated
validation is delegated to the PR; paid catch-up remains paused during review.

Youngsville's old packet can take its meeting date from a hash-checked stored
accessible agenda with the same official meeting ID. This avoids repeated PDF
retrieval outside the current source window. It preserves unfinished inventory
and records the date's snapshot. No model call or coverage promotion is involved.


### 2026-09-07 - 4c42d12

PRs #138 and #139 deployed expiring estimated AI-cost allowances and a stored
Youngsville meeting-date repair. Their exact production workflows and independent
live smoke passed. The combined PR checks passed 560 tests. Both changes also
deployed to development, where unfunded reservations refused admission. No live
paid model call was used to demonstrate settlement.

Production applied the February 12 date from the stored official accessible
agenda and preserved unfinished inventory and Youngsville's degraded status.
Bounded direct source-link checks and stored-evidence reevaluation restored both
East Baton Rouge bodies after all ten gates passed for each. Their backlog remains.
The live East Baton Rouge homepage showed six issue cards and six decision links
on desktop and at 375 pixels without a new card crash or horizontal overflow.

Source processing remains off in development and production. The new allowance
guard is deployed but not activated or funded. No new paid data-processing model
or Firecrawl calls were started and no account spending cap was raised. The
[current operating checkpoint](docs/archive/pre-stories-2026-09-07/docs/source-operations-2026-09-07.md) records 180
pending decision targets, nine failed targets, separate issue-proposal work,
and the unresolved need for newer Youngsville documents. Full catch-up,
sustained automatic processing, founder QA, and launch are not claimed complete.


### 2026-09-07 - working tree

Activated nonrenewing production allowances within the owner's $10 total
maximum, $4 for source AI and $0.50 for Ask. The bounded saved-snapshot pass
published eleven target outcomes and one limited issue timeline. An unattended
Metropolitan Council batch published four records without new document retrieval.
A live anonymous Ask answer returned the Cortana rebate amount with its official
minutes citation. Estimated ledger charges were $2.90 for sources and $0.04 for
Ask. The team cap did not increase. Other body policies remain paused, 172 targets
remain pending, and Youngsville still lacks newer official documents. The
[bounded catch-up checkpoint](docs/archive/pre-stories-2026-09-07/docs/bounded-catchup-2026-09-07.md) records failures,
withheld timelines, and the remaining work before full catch-up can be claimed.


### 2026-09-07 - working tree documentation review

Updated the README and canonical plans to match repairs through PR #139 and
the bounded catch-up checkpoint. Replaced stale support and automation claims
with eleven supported bodies, Youngsville's limitation, and one enabled policy.
Added the founder QA checklist and limited-beta gate to `docs/build-status.md`.
Full catch-up, the founder sweep, and launch remain unfinished. Production
workflow `34083784580` and independent live smoke passed for the prior checkpoint.
This review did not start paid retrieval or model processing or change allowances.

### 2026-09-07 - working tree: stories-first documentation

Consolidated the active business, architecture, work, design, source, operations,
marketing and submission documents and archived completed slice plans. The owner
selected Meta as the lead story with SpaceX and Boyce secondary, required the full
story loop before design and QA, and approved targeted launch spending. Stories
remain planned. This session changed documentation only; no new runtime feature,
paid processing, deployment or submission is claimed.

### 2026-09-07 - working tree: story research intake

Added the frozen story research contract and owner-only staging, preview and
paginated history. Exact bundle hashes fence changed inputs and make identical
replay reuse its receipt. Regression tests cover private access, malformed
references and replay. Automated validation is deferred to PR CI. Story drafting,
publication and the resident story loop remain unfinished; no deployment or
provider round trip is claimed.

### 2026-09-07 - 78ab15d

Implemented owner story publication, resident routes, accepted-evidence Ask and
story follows through existing alerts and replies. PR CI passed, and the exact
backend and CI-built frontend run on personal development. Staged all three
frozen research bundles and reused the existing Boyce snapshots. Eight missing
official documents were retrieved with one bounded rate-limit retry. Corrected
manifests, real drafting, owner approvals and mail round trips remain pending.
No story publication, production deployment or resident delivery is claimed.


### 2026-09-07 - 61c9fec

Published all three reviewed launch stories in development, with Meta first on
Home. Verified exact evidence, images, anonymous Ask, story follows, real
controlled updates, a three-story roundup, grounded replies and unsubscribe.
Retained artifact and draft promotion reuse saved work while requiring target
review and approval. CI passed; no local suite or production promotion ran.
The founder design and full QA campaign remains separate.


### 2026-09-08 - decf363

Fixed story promotion when existing local records have different development and
production identities. Owner previews bind the target's accepted record hash to
the candidate without changing the frozen research or retained writing. Historical
receipts remain inspectable after related evidence changes. CI
passed 632 tests. Development mapping and import replay preserved all three
accepted stories with no new model calls or update events. Production remains
unchanged and requires owner approval.

### 2026-09-08 - 771f660

Deployed the combined story code and repaired signed artifact transfer behind
the production custom domain. Exact workflow 34174377315 and independent
production smoke passed. Eleven source snapshots and three official images are
ready; retained drafts passed three fresh independent reviews for $0.013657.
The three LIMITED candidates remain unpublished pending exact owner approval.
No baseline notifications or promotion mail were sent.

### 2026-09-08 - production publication at 771f660

Published the three exact owner-approved LIMITED stories with Meta first.
Production queries, routes, image hashes, citations, search and share caching
passed. Nine anonymous Ask checks passed, with cited answers and unsupported
questions returning not found, for an estimated $0.049127. Independent smoke
passed after publication. Baseline publication created zero update events.

### 2026-09-08 - story presentation follow-up

Prepared ordinary story URLs that return approved metadata with the interactive
app, with legacy share links redirecting directly. Restored the existing 3D
Louisiana relief in a separate PR. Preserved three owner-supplied rendering
originals for media review. The owner will check production email during QA.
These changes are not yet promoted; Facebook preview verification is pending.

### 2026-09-08 - development presentation inspection at 7c76f8a

PRs 180 and 181 passed CI and review. Inspected the restored Louisiana relief
at desktop and mobile browser widths. The ordinary Meta URL rendered its story
and retained accepted social metadata. Signed-in Facebook Sharing Debugger
returned 200 and the correct preview metadata for all three development stories.
Each reported missing `fb:app_id`. Blank native screenshots prevented visual
image-crop inspection. Production unchanged.

### 2026-09-08 - presentation production release at 7ababad

Merged PR 180 as 0648c4d and PR 181 as 7ababad after owner approval. Each exact
production workflow and independent smoke passed. Production Home renders the
Louisiana relief and all three story links. Ordinary story URLs provide approved
metadata and app scripts; legacy links redirect. Facebook confirmed production
Meta metadata. Replacement media and final image-crop checks remain open.

### 2026-09-08 - working tree, region selector placement

Moved the existing Louisiana relief below featured stories beside the local
region selector, including the selected-area state. Kept the introduction
compact. This corrects the owner-rejected placement from PR 181. Static diff
review passed. PR 182 passed CI and review at 3cd0257. Its CI-built frontend
passed development layout checks at 1280 and 390 pixels, with WebGPU ready.
Screenshot capture failed, so visual QA is not claimed. Production unchanged.

### 2026-09-08 - owner-selected story images, working tree

Implemented the owner's explicit exception for three supplied rendering hashes.
The correction path retains accepted prose and evidence, validates the exact
image, and starts independent review before a new immutable publication.
Unknown rights and source attribution stay explicit. PR CI and release pending.

### 2026-09-08 - production rendering replacement at cb2ae00

PR 183 passed 637 CI tests and review, deployed, and passed independent production
smoke. Published the exact three supplied renderings after fresh independent
reviews in development and production. Draft hashes and evidence stayed unchanged;
no update events were created. Verified public image hashes, page loads, social
image metadata, cache invalidation and replay. Estimated review cost was $0.03856.
The owner's explicit exception records unverified rights without inventing a license.

### 2026-09-08 - working tree, remove story image subtext

Removed visible captions, credits and rights text beneath the three story images
on Home and story details at the owner's request. Alt text and all retained
review metadata remain. No story version, evidence or notification change.
Automated validation runs in PR CI.

### 2026-09-08 - 61fe72e

Released citation-encoding, accepted-image retention, caption correction and Ask
qualifier fixes through PRs 186 through 189. Each exact production deployment and
independent smoke passed. CI passed 640 tests across 81 files. The browser
journey steps were skipped in Verify run 34244530223; this release does not
claim a new Playwright pass.
Published five LIMITED versions across four targeted Youngsville decisions and
stronger Meta and SpaceX stories with the owner's images and fresh independent
reviews. Anonymous story, decision, image and fourteen source-artifact checks
passed. Ask preserved the tested legal qualifiers and refused a missing FAA
license number. One citation-marker formatting item remains for design and QA.
The continuation recorded $0.600803 in model charges and 86 Firecrawl credits.
The full design, founder QA and production email checks remain the next phase.

### 2026-09-08 - working tree, documentation audit after 864d405

PR 190 deployed the morning report and passed independent production smoke.
Aligned active guides with the shipped story loop, source continuation, retained
images and exhausted source allowance. Preserved dated receipts and linked their
successors. Marked the replaced landing experiment as historical and clarified
that existing merge authorization persists. Global design, founder QA and
production story mail remain pending.
This audit changes documentation only; its release verification follows the push.

### 2026-09-08 - working tree, story release checks

Extended production smoke to require all three accepted stories in the approved
order, current detail versions, retained evidence links, reachable images and
matching social metadata on both public origins. Missing-story responses and
legacy share redirects have explicit checks. Added failure regressions for CI.
Corrected the earlier browser-journey claim against the skipped workflow steps.
These changes are pending PR validation and deployment. The smoke does not run
paid Ask or provider mail, which still need separate controlled verification.

### 2026-09-08 - c820809

Released honest Ask rate-limit and allowance notices, resident error recovery,
malformed-source-link handling and email-only unsubscribe links through PRs 191,
192, 193 and 195. Reusable encrypted unsubscribe tokens avoid per-alert growth
and are revoked on re-verification. PR 195's initial deployment stopped on a
test-only Array.at incompatibility. PR 196 replaced it and added the Convex
TypeScript configuration to PR validation. Production workflow 34255328183 and
independent smoke passed at c820809. Earlier releases 2683b1a, 5f9764a and
236e3ea passed their exact workflows and independent smoke. No paid allowance,
source policy or controlled provider-mail verification changed during release.

### 2026-09-08 - working tree, Home design reference

Implemented the owner's two Home layouts with the original Louisiana hero,
selected-parish issue priority, three-story composition, purple and lavender
colors, compact voter information, and mobile hamburger navigation. Added Coss
Sheet, Scroll Area and Input components. Removed bottom navigation and adjusted
the Ask composer offset. Initial page loading and navigation share one centered
spinner; the owner explicitly rejected skeletons. Separate section failures
preserve other readable content. Updated the design reference and browser
regressions. Static diff review passed. Automated validation is deferred to PR
CI; browser visual QA and production release remain pending. No backend data,
paid processing, source publication or deployment changed in this session.

The owner's next Home critique moves voter information into the footer and
reverses the section contrast to a lavender off-white page with white issues.
Mobile issues use a horizontal scroll row; every mobile story uses a full-sized
image. The menu omits its visible brand header and anchors area and account
controls at the bottom. "Showing" uses the same text color as the parish.
These refinements remain local and await owner visual QA.

The next mobile refinement removes nested section padding and widens issue cards.
Native touch scrolling snaps to each card without navigation arrows. The owner then chose a shared card height
and a noninteractive dot index with the current issue count. Revised shared colors separate the page,
sections, cards, reading text and actions. A bounded 390-pixel Chrome inspection
showed the wider card and compact height. Final touch and viewport QA remain
pending, with automated checks deferred to PR CI.


### 2026-09-08 - fbda95b

Released the Home design pass through PR 197, including equal-height mobile
issue cards with native snapping and a bottom index. PR CI passed 670 application
tests and 22 Chromium/WebKit browser journeys. Normal-motion hero focus passed;
the review's conditional focus finding did not reproduce. Production workflow
34287037797 and independent `npm run smoke:production` passed on the merge commit.
Founder QA continues. No paid Ask or provider-mail verification was repeated.

### 2026-09-08 - working tree, Home polish

Matched Louisiana lighting to purple and made its canvas transparent. Removed
the selected-area hero and header/footer color boundaries. Kept only visible
dots beneath mobile issues. Compacted follow enrollment and replaced the mobile
side sheet with a floating Coss Popover using the portfolio hamburger animation.
Removed the open-menu X background and refined Home decision rows with separate
meeting dates, larger titles and neutral lifecycle badges. Documented Home fixture
URLs. Static review passed; automated checks await PR CI and visual QA remains pending.


### 2026-09-09 - f7742d5

Released the owner-approved Home polish through PR 198. The latest PR head passed
670 application tests and 24 Chromium/WebKit journeys after correcting an early
visibility check in the area-selection test. Review found no major issues.
Production workflow 34307373914 and independent production smoke passed for the
merge commit on both public origins. No paid Ask or provider-mail check was repeated.


### 2026-09-09 - working tree, resident design pass

Extended the owner-approved Home visual system to the remaining resident pages,
forms, recovery views and owner-tool styling. Added story section navigation and
source focus, repaired Explore links for current launch bodies, expanded the
mobile source-report drawer and corrected hidden focus during sheet closing.
Native Chrome desktop and responsive checks covered the route families and
selected recovery states. Added browser regressions and a body-parser regression;
automated validation remains deferred to PR CI under the repository rules.
Local Google sign-in did not complete, so protected owner views remain unverified.
No commit, deployment, paid source work or provider email was performed. The
[morning report](docs/design-morning-report-2026-09-09.md) records the evidence;
[docs/work.md](docs/work.md) retains the pending checks.


### 2026-09-09 - working tree, owner mobile corrections

Added mobile Ask drawers to stories, issues and decisions using the existing
conversation adapter. Drafts survive closing the drawer, and answer citations
open a nested source drawer. Following now uses visible route tabs on phones.
Refined source controls and decision links, changed Louisiana to charcoal with
muted violet highlights, and removed colored left-edge card accents. Dedicated
preview checks covered a retained story draft, a sourced fixture answer, nested
citation focus return, 320-pixel navigation and the rendered WebGPU model.
Updated browser regressions, with automated checks still deferred to CI. No
production change or paid Ask call was made.

### 2026-09-09 - PR 199 validation

Head `8231446` passed 671 application tests and 42 Chromium/WebKit journeys.
Reviewed CI screenshots and removed a remaining purple quote rule in story
source cards. The final revision awaits PR checks and authorized release.

### 2026-09-09 - warm limestone selection

Applied the owner-selected warm limestone material to the Louisiana relief,
using the exact shader colors from the local comparison. Matched the SVG
fallback to the same warm neutral finish. PR validation and release are pending.

### 2026-09-10 - working tree, DeepSeek high reasoning

Configured DeepSeek V4.1 Flash for high reasoning at the owner's request.
Raised its output cap to 131,072 tokens and reserved context space with an
850,000-token input ceiling. GLM settings are unchanged. Fifteen publisher
tests and Actionlint passed. This change is local; live verification is pending.
The copied hackathon skill is now available and was used for this update.

### 2026-09-10 - working tree, mobile navigation

Added a 48-pixel sticky mobile header with blur after scrolling and a full-screen
navigation menu. Eight Chromium and WebKit checks cover Escape, focus return, nested area selection
and retained reading position at 320 and 375 pixels. Build, typecheck and lint pass.
The first CI pass exposed font swapping during the scroll test; the test now waits
for fonts before recording its starting position. PR checks and development
deployment are pending. Production is unchanged.

### 2026-09-10 - working tree, mobile menu refinements

Applied the owner's phone-test feedback: more header transparency, restored nav
icons, Account as the mobile label, and a larger Change area button without the
duplicate settings link. Inspected Apple's live mobile menu and matched its
expanding panel and two-stage menu icon motion. Updated browser checks retain
reduced-motion coverage and exercise normal animation. Eight targeted Chromium
and WebKit checks, build, typecheck and targeted lint passed. PR CI is pending.

### 2026-09-10 - working tree, compact desktop header

Reduced the desktop header from 64 to 48 pixels at the owner's request.
Added a translucent blurred background at the top of the page while preserving
the shared scrolled treatment and existing control sizes. Build and Chromium/WebKit
visual checks passed at desktop and mobile widths. PR and development checks are pending.

### 2026-09-11 - working tree, resident reading and Ask

Applied the owner's review across Home, stories, issues, decisions, meetings,
Ask and Account. Sources open in shared drawers without resetting reading;
chat keeps its composer below the conversation. Added Chromium and WebKit
regressions for sources, drafts, narrow layouts, notices and tabs. A real SpaceX
excerpt exposed horizontal drawer overflow, now constrained and wrapped.
Local checks passed 685 application tests and 66 browser journeys. PR review
and the development upload remain pending.


## September 11, owner phone review corrections

The owner supplied before-and-after iPhone screenshots showing chat leaving the
visible screen when the keyboard opened. The follow-up replaces keyboard
subtraction with visible viewport bounds and adds resize/pan regression checks.
It also fixes touch timeline arrows and route heading outlines and simplifies
Account follow controls. This entry records implementation; final CI and dev
upload receipts belong in PR #205 after validation.


## September 11, full-screen conversation revision

The owner supplied T3 Code reference screenshots after rejecting the resized
chat drawer. The new mobile conversation covers the reading page, has one
Back/title bar and starts with a single-line composer. Source drawers remain.
T3's public thread screen and composer code informed the layout approach;
Public Parish retains its own browser implementation. Draft, source and
keyboard tests passed locally. Final CI and development receipts remain in
PR #205; native iPhone confirmation remains with the owner.

## September 11, Safari underlay and empty chat layout

Owner screenshots showed article pixels through Safari keyboard controls despite
the full-screen chat backdrop. The follow-up hides the reading document without
removing its layout or state. T3 Chat mobile informed the centered empty composer;
messages retain the bottom composer. Regression checks cover document visibility,
reading focus restoration and keyboard bounds. Native iPhone confirmation remains
pending; CI and development receipts belong in PR #205.

### September 11, working tree, mobile design review

Reviewed PR #207 and retained its compact header, bottom composer and visual
viewport bounds. Corrected loading-title CSS and hidden navigation focus in
standalone Ask. Added short-screen, stale keyboard-close and nested source
checks. The owner's reading refinements add small mobile citations, one issue
action row, compact follow cards, grouped meeting source documents, Explore
loading text and Account at the bottom of the mobile menu. Validation and dev
upload receipts will be recorded on PR #207. No production release is included.

## September 11, chat keyboard and device history follow-up

The owner reported that standalone Ask still panned away on iPhone while the
floating chat worked. PR #207 now freezes the reading document during phone
chat and clips the outer panel to prevent focus-driven panel scrolling.
Recent conversations move to Account with anonymous access and the existing
24-hour device-only expiry. A memory-only handoff restores the selected chat
and scope. Three bouncing dots replace the answer-wait card while the send
button retains its spinner.

Local application verification passed, with 685 existing tests and one new
handoff test checked separately. Chromium and WebKit passed Account history,
menu-to-Ask keyboard bounds, reduced-motion dots, reopened chat drafts and
nested source drawers. Native iPhone acceptance and updated dev deployment
remain pending. No backend or production changes were made.

## September 11, keyboard regression after the body-position change

The owner's next iPhone recording showed both chat entry points moving out of
view when the keyboard opened. The previous browser pass did not certify native
keyboard behavior. This follow-up removes fixed-body positioning and geometry
tweens, gives each mobile chat one viewport measurement, uses root client height
for layout coordinates and accepts fractional and pinched zoom updates. Keyboard
panning keeps its real offset; closing the keyboard discards stale offsets.
Recent conversations on Account and the three-dot wait remain.

T3 Code web commit `18f7254` informed the pane layout and supported-browser
`interactive-widget=resizes-content` meta. Its web app does not contain a
Safari visual-viewport handler; its native app uses a native keyboard controller.

A bounded WebKit comparison against the deployed build reproduced an 812-pixel
chat after the visible area shrank to 320 pixels with fractional scale and a
resized innerHeight. The revised local build measured 320 pixels, followed the
120-pixel visible offset and hid the privacy note. No chat request was sent.
The comparison tests geometry inputs, not a native iPhone keyboard. Local
verification passed 686 tests, typechecks, build and lint with 15 existing
warnings. Eighteen focused browser checks passed in Chromium and WebKit,
including zoom, resize, Back, retained drafts and nested source drawers.
CI, the next dev upload and native iPhone acceptance remain pending.

### 2026-09-11 - working tree, app-wide loading
The loading fix hides page content and the footer while page data loads. Only
the header and one centered spinner remain visible. The container and shadow stay
still while the icon rotates. The original checkout passed local validation and
eight browser checks. The PR applies the fix to current production code, with CI
validation pending. Review and browser CI led to fixes for offline status, parish
selection focus and hash-link scrolling. A local build and 18 targeted Chromium
and WebKit checks passed after those fixes. No deployment yet.
