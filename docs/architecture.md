# Technical architecture

This is the current engineering contract and the approved story extension.
Sections marked planned describe work that has not shipped. [Work](work.md)
owns delivery status. [Operations](operations.md) owns runtime settings and
procedures. Historical release descriptions live in [the archive](archive/README.md).

## System boundaries

Public Parish owns source identity, immutable artifacts, extraction contracts,
independent review, deterministic publication, resident projections, private
chat and subscriptions, and source health. The government owns the official
record. Public Parish never submits testimony or contacts an agency on a
resident's behalf.

The implemented path is:

```text
Approved official source
  -> Firecrawl retrieval
  -> immutable raw artifact and normalized snapshot
  -> structured extraction
  -> deterministic checks
  -> independent review
  -> deterministic full, limited, or withheld publication
  -> same-body issue linking and reviewed issue version
  -> resident queries, search, Ask, and sourced notifications
```

The development story path adds owner-reviewed composition over accepted evidence
from one or several bodies. It preserves the existing decision and issue path.

## Stack and code organization

| Responsibility | Implemented choice and source |
| --- | --- |
| Frontend | TanStack Start, React, SPA and static prerendering; `src/routes/` and `src/features/` |
| Backend | Convex queries, mutations, actions, schedules, storage and realtime; `convex/` |
| Hosting | Convex static hosting, `convex/http.ts`, `convex/convex.config.ts` |
| Durable evidence work | `@convex-dev/workflow`, `convex/pipeline/`, `convex/extraction/`, `convex/publication/`, `convex/issues/` |
| Retrieval | Firecrawl component, `convex/sources/`, `convex/coverage/`, `convex/monitoring/` |
| AI transport | Convex AI Gateway and a disabled direct-provider fallback behind `convex/ai/` |
| Chat | Agent component with application-owned access and evidence selection, `convex/ask/` |
| Accounts | Pinned Convex Auth v2 alpha, Google OAuth, `convex/auth/` |
| Follows and email | AgentMail component, `convex/follows/`, `convex/emailReplies/`, `convex/sourceReports/` |
| Public evidence | `convex/resident/`, `convex/sharing/` |
| Limits and reports | Rate-limiter component, `convex/ai/spendingLedger.ts`, `convex/operations/`, `convex/analytics/` |

The lockfile and `package.json` own exact versions. Convex Auth is pinned to
`2.0.0-alpha.1`. Do not install v1 or replace Google accounts with custom email
auth. Registered components live in `convex/convex.config.ts`; a dependency alone
does not prove integration.

Route files stay thin. Route-level `.data.ts` modules own query options,
preloading, and transitions to live data. Feature components render resident
contracts rather than raw pipeline objects. Presentational fixtures load only
through explicit development paths. Production never substitutes fixture success.

## Environments and HTTP ownership

| Environment | Frontend | Backend |
| --- | --- | --- |
| Personal development | Local Vite, optional `https://woozy-wren-227.convex.site` | `https://woozy-wren-227.convex.cloud` |
| Production | `https://www.publicparish.com` and `https://befitting-flamingo-587.convex.site` | `https://befitting-flamingo-587.convex.cloud` |

There is no standing staging deployment. `npm run dev` syncs the current branch
into one shared personal cloud backend. Worktrees do not provide separate data
or deployments. Coordinate backend syncs or use an explicitly scoped preview
when isolation is necessary.

`publicparish.com` is an apex redirect to `www`, implemented in
`infra/apex-redirect`. Vercel does not host the application. Preserve paths and
query strings. The qualifying hackathon host serves the application directly.

Production Auth uses the canonical `www` origin. A Google sign-in started from
`convex.site` first moves to the matching canonical path so OAuth state and the
callback remain on one origin. Verify each served entry path after auth changes.

`convex/http.ts` registers analytics, AgentMail, coverage unsubscribe, and issue
share handlers before the static fallback. Auth and Firecrawl component routes
remain registered through their existing mounts. Keep static hosting unmounted
at the root. Never move provider routes under a guessed common prefix.

Every push to `main`, including docs-only pushes, triggers the production
workflow. It verifies that exact commit, deploys the matching backend and
frontend, runs the idempotent launch seed, and smoke-tests production. An
authorized release still requires independent production smoke. A deployment
alone does not run or certify paid source processing.

## Existing data model

`convex/schema.ts` is the executable field and index definition. The logical
relationships below explain how to extend it without changing evidence identity.

| Records | Relationship and responsibility |
| --- | --- |
| `jurisdictions`, `governmentBodies`, `sourceRegistries` | Bodies belong to places; registries bind a body to checked hosts, paths and source types |
| Coverage compiler runs, stages, candidates, proposals, samples and gate evaluations | Internal onboarding ledger; proposals become supported only through current passing gates |
| Source expectations, direct link checks, coverage incidents | Date-qualified support and missing-source evidence |
| `sourceSnapshots` | Registry, raw and normalized storage, hashes, retrieval time, version, previous snapshot, page map, truncation and retrieval metadata |
| Pipeline runs and stages, AI calls, extractions | Versioned, retryable processing and provider-attempt evidence |
| Decision candidates, candidate facts, validation findings, reviews and review checks | Private input claims, exact spans, deterministic checks and independent verdicts |
| `decisionRecords`, `publicationVersions`, `citations` | Stable atomic identity, immutable accepted or withheld versions, exact claim-to-snapshot references |
| Snapshot changes and material changes | Preserve source differences and classify substantive publication changes |
| Issue proposals, builds, reviews, `issues`, `issueVersions`, `issueDecisionLinks` | Reviewed single-body timelines referencing exact atomic publication versions |
| Importance assessments | Cited factors and deterministic scores, separate from evidence completeness |
| Published search entries and corpus state | Current accepted search projection, pagination and corpus revision fencing |
| Monitoring policies, runs, documents, inventory targets and provider calls | Bounded routine checks and resumable document-to-decision processing |
| Anonymous sessions, Ask access and receipts | Private session-to-Agent-thread ownership and answer deduplication |
| Users, saved areas and topics | Google-owned preferences |
| Email subscribers, verification challenges and access tokens | Protected email-only delivery identity, verification and management |
| Follows, preferences, matches, fanouts, deliveries and roundup records | Scoped ownership, material-change matching and idempotent delivery |
| Email reply threads and events | Verified provider-thread and sender binding to grounded Ask |
| Source report and coverage request records | Private reports or demand capture; neither starts paid evidence work |
| AI allowances and reservations, provider usage and civic telemetry | Cost admission, measured usage and bounded aggregate product evidence |

Meeting views derive from accepted decision evidence and meeting keys. Do not
assume a standalone meetings table because an old plan proposed one.

Public queries return only accepted resident projections. Internal pipeline
functions never become client-callable to simplify an importer. Owner operations
require authenticated owner authorization. Never trust a caller-supplied user ID
or role as identity.

## Official-source intake and coverage

Checked manifests in `convex/coverage/roots.ts` identify official bodies, roots,
allowed hosts, tenant paths, and versions. A root gate checks HTTPS and each
redirect before requesting it. Unapproved hosts and shared-host tenants remain
quarantined. A reachable URL does not establish official provenance or support.

The owner compiler accepts a checked body key and manifest version, performs
bounded discovery, classifies stored candidates, freezes a registry proposal,
retrieves exact representative samples, and evaluates evidence. A public coverage
request only records demand and optional verified notice enrollment.

[Sources](sources.md) owns the ten coverage gates and the distinction between
story evidence and continuous body coverage. The current gold set is an exact
artifact manifest, not a model-generated set of replacement URLs. Promotion and
recovery use the latest evaluator and registry generation. Old successful checks
cannot restore a changed or degraded registry.

## Snapshots, extraction, review, and publication

Preserve raw bytes and normalized text with separate content hashes, byte counts,
retrieval provenance, and page maps where available. A snapshot is immutable.
Raw-only and normalized-content changes remain distinguishable. Reject truncated
material when completeness is required. A page number needs a proven page map.

Successful stages replay by their deterministic input identity. Keys include the
registry, snapshot, target record, processor, prompt and schema versions as
applicable. A processor version change can create new paid work for the same
source. It does not authorize a bulk rerun.

The extraction contract contains record identity, type, title, body, lifecycle,
meeting time, summary, affected places, amounts, public actions and fact-level
citations. Unknown values use explicit nulls or empty arrays. Use the versioned
schemas in `convex/extraction/` and `convex/pipeline/state.ts` rather than copying
an obsolete prose schema.

Deterministic checks enforce official identity, full artifact hashes and size,
body and target identity, source kind, exact normalized citation spans, field
values, amounts, date precision, and agenda-versus-outcome distinctions. Existing
format normalization does not permit semantic paraphrases as exact excerpts.
Never infer a vote from an agenda or a completed agreement from authorization to
draft it.

The independent reviewer receives the candidate, exact facts and supporting
spans. It cannot repair a candidate while accepting it. Validate the review's
schema, input hash, model separation and fact coverage. Deterministic publication
policy accepts full, accepts limited source-only information, or withholds.
Withheld output never replaces the current accepted pointer. Material changes
compare accepted versions. Formatting-only changes send no update.

## AI roles and cost admission

This is the sole active documentation table mapping roles to model identifiers.
Code owns runtime configuration. Historical logs preserve their original model
facts without acting as current configuration.

| Role | Gateway model ID | Work |
| --- | --- | --- |
| `MODEL_STRONG` | `openai/gpt-5.6-terra` | Record extraction, document inventory, consequence factors, issue linking, story drafting |
| `MODEL_FAST` | `openai/gpt-5.6-luna` | Discovery classification, independent review, Ask selection and answers, story review |

Use strict JSON Schema in Chat Completions `response_format`. Generation and
publication review run with the configured high reasoning effort; short discovery
classification uses low reasoning. Deterministic code computes importance.
Reviewer and extractor must be different models. Do not add a third tier to hide
a source, contract, or citation defect.

Calls run through Convex AI Gateway from actions. Direct OpenAI remains a
disabled implementation behind the same provider interface. Enabling it needs
separate bounded verification. Gateway credentials, secrets, and private data do
not belong in docs or public logs. Source text and questions are untrusted input
and cannot choose tools, domains, or publication policy.

When the spending guard is active, separate source and Ask allowances reserve a
conservative input estimate plus the output bound before each model request.
Known usage settles once. Failed calls or unknown usage retain the reservation.
Retries need admission, and changing a ceiling does not erase charges. Allowances
expire and never replenish automatically. These are estimated model-cost limits,
not total provider invoices or Firecrawl, hosting, storage and email limits.
[Operations](operations.md#spending-policy) defines purposeful spending and stops.

## Routine monitoring and continuing issues

The 15-minute source cron selects due owner-enabled policies. Global enablement,
policy and registry generations, active leases, admission limits and AI allowances
fence paid steps and monitored publication. Pause prevents later steps from
spending or publishing; an already issued request can finish.

Bounded discovery persists listing cursors. Inventory uses checkpointed sections
of an immutable document, with independent review and exact locators. Accepted
sections survive retry. A document releases no decision targets until its entire
inventory passes. Ready target processing takes priority over new retrieval.
An unfinished batch does not trigger another source crawl.

A run scans bounded queues, defers incomplete items and preserves failure counts
when budget exhaustion postpones work. Baseline backfill suppresses notifications.
An empty processing page is not proof that the archive or issue queue is complete.

Issue proposals use accepted records from the same government body. A unique
accepted match may extend the existing stable issue ID and slug; competing
matches remain ambiguous. Versions pin exact atomic publication references.
Current membership and safety bounds are in `convex/issues/membership.ts` and
`convex/issues/proposals.ts`. Do not invent a multi-body issue by rewriting IDs.

Importance uses cited public money, assets, land use, health and safety, rights
and access, service delivery, and deadlines. Code applies the fixed rubric in
`convex/issues/scoringV1.ts`. Coverage completeness, editorial feature placement,
clicks and partisan interest do not increase that score.

## Resident queries, search, and Ask

Home queries select the requested bodies before applying their bounds. Current
limits return up to 50 decisions and 20 issue timelines. Explore uses a paginated
published projection. Hydration rejects stale references. Public pages must not
call these bounded results complete archive totals.

Current Ask scopes are issue, meeting and corpus. Anonymous access lasts 24 hours
on the same device. The Agent component stores threads and messages; application
rows bind scope and session ownership before each read or write. Questions stay
out of URLs and public telemetry.

Ask selects accepted evidence, expands chosen issues and meetings to decisions,
and verifies normalized document hashes before the answer pass. Valid not-found
selection skips the document-heavy answer. Invalid, broad or empty selections
expand to the allowed scope rather than silently dropping evidence. Corpus
selection progresses through pages with a revision fence; selected-record and
byte bounds fail visibly and ask for a narrower scope. Do not answer from only
the first pages or a hidden fixed top-k.

Returned evidence IDs must belong to the accepted input and remain valid before
display. A full source document may provide reading context but cannot authorize
an unsupported public answer. Per-session and application request limits remain
separate from paid-call admission. There is no open-web civic-answer fallback.

## Auth, follows, email, and private reports

Google owns account sessions and saved preferences. Email verification grants
subscription access only. Store the delivery-address hash, encrypted address,
hashed one-time code and bounded challenge state. Do not create an account by
verifying an alert address. Management tokens are scoped and expiring;
unsubscribe applies to the subscriber's address, and re-verification restores
only the explicitly requested follow.

Existing follow types are issue, topic, government body and place. Resolve owner
identity on the backend. Gate body and place subscriptions against their current
coverage contract. Publication fanout records each matching follow, then dedupes
immediate delivery by owner and material change. Issue alerts wait for a readable
accepted issue version containing the changed publication.

Weekly roundups claim the Monday 7 a.m. America/Chicago window, resume stored
cursors and include only material updates. Empty windows send nothing. AgentMail
outbound IDs and application receipts prevent replay from creating duplicate mail.

Inbound replies verify provider event, configured inbox, known notification
thread and matching owner before calling grounded Ask. Recovery leases allow
bounded retry. Both development and production have used the shared updates
inbox; provider receipt alone cannot prove which deployment handled an event.
Match the application receipt before claiming a successful round trip.

The separate private-report path sends the resident's description through
AgentMail without triggering retrieval or publication. Application receipts keep
bounded delivery metadata, not the description or address. Retention and cleanup
live in `convex/follows/retention.ts`, `convex/emailReplies/recovery.ts`, and
`convex/sourceReports/reports.ts`. Preserve these controls when adding stories.

## Owner-curated story model

The story schema and resident loop are implemented in `convex/stories` and the
existing Ask, follow and email domains. Application `61c9fec` passed the bounded
development gate. Production promotion remains owner-gated. The contracts below
remain requirements for later revisions. See [development evidence](story-development-certification.md).

A story has its own identity because it can cover several government bodies.
Use these logical records, reusing existing ledgers where their contracts fit:

| Record | Required contract |
| --- | --- |
| `stories` | Stable ID and unique slug, editorial placement, affected places and topics, owner, current accepted version pointer, active or withdrawn state |
| `storyVersions` | Immutable version, build and review references, exact evidence set, content hash, full or limited or withheld result, title, summary, sections, timeline, known gaps, reviewed-through time and approved image metadata |
| Story evidence links | Story-version reference to exact accepted issue or decision versions and citation IDs; support more than one body without changing member identities |
| Story build and review records | Import identity, source bundle hash, prompt and schema versions, provider attempts, independent verdicts, deterministic findings, owner approval and publication receipt |
| Approved media metadata | Stored asset reference, original source, permission or license, caption, alt text and rendering label where needed; captions with factual claims carry evidence |

Do not place unchecked JSON prose directly into a published field. A story title,
summary and connecting explanation need claim-level support just as a decision
does. Existing accepted versions are the preferred evidence input. A document
that fits no current atomic record contract needs a minimal explicit reviewed
fact contract before use. It must preserve the shared snapshot, citation and
publication guarantees. Do not fabricate a decision merely to satisfy a table.

### Import and publication

The development implementation lives in `convex/stories`. `storyImports` stores
private research under the frozen 1.0.0 contract. `storyBuilds` binds sources,
draft, review, notification intent and generation. `storyVersions` stores the
immutable approved statements and exact shared snapshot spans. Reviewed story
facts can reference multiple official bodies without inventing a decision or
changing the single-body issue-linking contract.

Owner operations are at `/operations/stories`. Public story, Ask, search and
share queries resolve the current accepted version and recheck source retention
and revisions. Ask includes only spans used by approved statements. The corpus
deduplicates shared exact spans against atomic records and other stories.

`storyUpdateEvents` identifies substantive approved revisions. Existing fanout,
delivery, roundup and reply records carry a typed story reference. A change-claim
ledger deduplicates overlapping local and story follows by owner and cadence.
Reviewed cosmetic revisions retain a pending material event; a later material
revision or suppressed historical baseline invalidates the older event. Replies
recheck accepted citation IDs, inbox, sender, subscription and thread before send.
These paths have CI coverage and passed the three-story development model and
controlled email round trips. Production promotion remains pending.

The owner supplies a versioned JSON manifest referencing exact approved sources,
saved artifacts or existing accepted records, proposed grouping, questions and
media provenance. It contains no resident data or secrets. Computer use can
assemble the manifest. Firecrawl remains normal evidence retrieval; any supported
file intake must retain raw bytes, provenance and hashes without impersonating a
Firecrawl result. Follow the documented retrieval-failure policy in sources.

Validate the manifest before paid work. Resolve official hosts, source identity,
content completeness, duplicate imports and scope. Retrieve only missing required
artifacts. Extract missing evidence through the shared pipeline, draft with
`MODEL_STRONG`, review with `MODEL_FAST`, and run deterministic publication checks.
Provide an owner preview showing the claims, citations, gaps, media and diff.

Approval binds to the exact input and output hashes. Changed inputs invalidate
that approval. A changed source produces a new candidate version; it cannot edit
an accepted version in place. Owner authorization is required to publish or
withdraw. Replay of an unchanged accepted import spends no new model calls and
sends no new notifications.

Initial publication is a baseline and sends no historical-update flood. A
subsequent approved substantive evidence change can create a story update.
Featured order, image selection and stylistic edits alone do not qualify.

### Evidence changes and withdrawal

Pin exact versions for historical inspection. Before public current reads,
answers, previews and sends, check that referenced evidence still satisfies the
accepted-current or intentionally historical contract. A newer source marks the
story for review and exposes freshness limits. Invalidated evidence removes its
unsupported current claims or withholds the story; it never silently inherits
old approval. Preserve older versions for truthful history.

An owner withdrawal removes the current story from Home, search and social
metadata, stops new story mail and Ask generation, and leaves an honest stable
route explaining unavailability. Do not erase provenance or redirect a withdrawn
story to unrelated content. Public history must not keep serving known invalid
claims as currently accepted. Define cache invalidation in the implementation.

### Story Ask

Add a first-class story scope with the same anonymous ownership, retention,
limits and receipts. Resolve only that story's accepted evidence set, including
any explicitly supported direct facts. Use source documents and exact citations
as evidence; generated story prose is not an independent source.

Fence each answer against the story version and its evidence revisions. A
version change during selection or generation requires revalidation or a bounded
retry. Old conversation text cannot override the current scope. Citation IDs
from another story, draft, withheld version or unapproved document fail closed.
Email replies use the same scope and checks.

### Story following and material updates

Add `story` as a follow target throughout validators, owner checks, enrollment,
Following, preferences, fanout, delivery, roundup, reply scopes and management.
Do not implement a second subscriber system. An underlying issue follow does not
represent a whole-story subscription.

Existing material-change and delivery records are decision-oriented. Extend them
with explicit typed story-event references where needed; never invent a dummy
decision ID. Publish the approved story version and its event atomically. Keep
one delivery per owner and substantive update, including overlaps with local
follows when the same underlying change triggered both. The implementation must
specify and verify that cross-target dedupe identity.

Recheck publication, subscription, owner and source validity at enqueue time.
Paused editorial checks must be visible to subscribers. Updating a story's
membership does not silently subscribe the resident to each member body or
change local coverage gates. Story follows, sourced alerts, roundups, replies
and unsubscribe are required before the full design pass.

### Story routes, Home, search and sharing

Add `/stories/$storySlug` and `/share/stories/:slug`. A Stories navigation link
may target the homepage story section for the three-story launch; a separate
editorial index is unnecessary. Existing issue and decision URLs remain stable.

Home displays all three accepted launch stories before local setup and local
issues. It queries featured stories separately from the bounded local feed.
Choosing a location does not filter them out. Owner-selected placement is
independent of importance scores. [Design](design.md) owns composition and
responsive behavior.

Add story results to the current paginated search projection with an explicit
result type and valid version references. Include published story evidence in
corpus Ask through the same accepted-evidence resolver, with deduplication of
shared source records. Do not count a story and its member decision as independent
corroboration.

Share HTML uses only accepted metadata and the approved stored image. Escape
content, validate asset references, implement revision-aware caching, and return
an honest unavailable result for unknown or withdrawn slugs. Register these HTTP
routes before the static fallback. Source reports can attach a story URL through
the existing private reporting path.

## Privacy, analytics, and verification

Never store private questions, reports, email addresses or arbitrary tracking
properties in public analytics. Existing product telemetry counts browser IDs,
area selection and return windows. Civic event counters record an allowlist of
accepted actions. Those are product signals, not audited people or residency.
Story views and attribution are planned additions that need bounded context;
reading a story without choosing an area must not be treated as no engagement.

Use semantic headings, visible focus, keyboard paths, reduced motion, readable
source controls and mobile evidence sheets. Probe uncached same-origin
`/brand-mark.svg` reachability rather than trusting `navigator.onLine` alone.
Failures must leave evidence and navigation understandable.

Automated checks run in PR CI. Agents do not run local tests, builds, typechecks
or linters without authorization for the exact command. Static review and
`git diff --check` are allowed. Test new behavior against meaningful failure
cases, especially cross-story access, stale citations, import replay, independent
review, image metadata, withheld content and duplicate mail. Run authorized live
checks separately and state their limits. [Work](work.md) owns launch acceptance;
[operations](operations.md) owns release and controlled-provider procedures.


### Retained story promotion

`stories/transfer` verifies signed source-artifact receipts against actual retained
bytes and target-resolved stable identities. `stories/retainedDraft` binds exact
accepted writing to a frozen manifest and target deployment. The target builder
rechecks every span, retains the draft and runs a fresh independent review. It
copies neither review nor approval. See [the bounded transfer procedure](story-artifact-transfer.md).
