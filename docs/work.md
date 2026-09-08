# Current work and launch gates

Updated September 7, 2026. This is the only active status and pending-work queue.
The approved order is stories, then design and QA, then launch and outreach.
[Business scope](../PLAN.md), [architecture](architecture.md), [design](design.md),
[operations](operations.md), and [marketing](marketing.md) define the contracts.

## Current checkpoint

Production code `7ababad83d311609dd75648813e16500478ddd78` is deployed.
PR 180 delivers accepted metadata and the interactive app at ordinary story
URLs. PR 181 restores the Louisiana relief. Their production workflows
[34180958554](https://github.com/LaykenV/public-parish/actions/runs/34180958554)
and [34181213262](https://github.com/LaykenV/public-parish/actions/runs/34181213262)
passed, followed by independent `npm run smoke:production` for each release.
The production Home browser check found the relief and all three story links.

The earlier story publication release was `771f660`.
PR 175 shipped the combined story release; PR 178 repaired signed artifact
transfer behind the production custom domain. Exact production workflow
[34174377315](https://github.com/LaykenV/public-parish/actions/runs/34174377315)
and independent `npm run smoke:production` passed.

All eleven source snapshots and three images are ready in production. Three
retained drafts passed fresh independent LIMITED reviews. The owner approved
and published the exact candidates at generation 1. Production story queries,
route responses, image hashes, citations, typed search, share HTML and nine
anonymous Ask checks passed. Baseline publication created zero update events.
[Production preparation](story-production-preparation.md) records the evidence.

The full development gate passed at `decf363`. The presentation follow-up backend
and CI-built frontend now run at `7c76f8a` on https://woozy-wren-227.convex.site.

In development, Meta is the Home lead, with SpaceX and Boyce secondary. All three have accepted
LIMITED versions, official document images, exact citations and explicit gaps.
Actual development verification covered Ask, Google and verified-email follows,
three immediate updates, a three-story roundup, sourced replies, management and
unsubscribe. [Development certification](story-development-certification.md)
records the evidence and the production boundary.

| Capability | Evidence and limitation |
| --- | --- |
| Evidence pipeline | Immutable snapshots, deterministic validation, independent review, and full, limited, or withheld publication deployed |
| Resident loop | Discovery, issues, decisions, evidence, anonymous Ask, Google and email-only follows, alerts, roundups, replies, and private reports deployed |
| Coverage and operations | Owner compiler, bounded scheduled processing, coverage requests, launch notices, search, issue sharing, and reports deployed |
| Latest inspected release | Main commit `7ababad`, successful production workflow [34181213262](https://github.com/LaykenV/public-parish/actions/runs/34181213262) and independent smoke |
| Local coverage | Eleven of twelve named bodies supported; Youngsville degraded. Lafayette accessible with a limitation; Rapides and East Baton Rouge available |
| Source automation | Public health reads on September 7 showed only Metropolitan Council scheduled checks enabled |
| Existing corpus | September 7 public queries returned 50 decisions per parish, the query cap; 6 Lafayette, 20 Rapides at the issue cap, and 19 East Baton Rouge timelines |
| Boyce starting evidence | Existing Applied Digital issue returned three linked decisions and thirteen citations. This is a source base, not the new story page |
| Remaining proof | Production story mail proof, full founder design and QA pass, organic resident usefulness, final demo, and submission |

Many recent decisions are limited. Query counts are bounded results, not complete
archive totals. A source can pass certification while its backlog remains
unfinished. Do not claim continuous updates for paused policies.

The [last funded checkpoint](archive/pre-stories-2026-09-07/docs/bounded-catchup-2026-09-07.md)
recorded $4 source AI and $0.50 Ask allowances expiring September 14 UTC, 172
pending decision targets, six failed, and an unfinished issue queue. These are
dated operating facts, not current live balances. The owner now permits targeted
additional spending under [operations](operations.md#spending-policy).

The older release record reports 560 CI tests and independent production smoke
through PR #139. The three stories are published and passed bounded production smoke. No physical-device or screen-reader
pass, organic resident outcome, production story mail delivery or submission is claimed.

## Owner follow-up before outreach

- PR 180 makes ordinary story URLs return accepted social metadata with the
  interactive application. Legacy share links redirect without another click.
  CI and PR review passed. Development HTTP checks covered all three story URLs,
  redirects and cache invalidation. The Meta route rendered the interactive app
  with its accepted metadata. In signed-in Chrome, Facebook Sharing Debugger
  returned 200 and constructed the correct title, description, canonical URL
  and image URL for each development story. Each reported missing `fb:app_id`.
  Native screenshot capture returned a blank window, so image crops are not
  visually certified. Facebook confirmed the production Meta preview metadata.
  Production SpaceX and Boyce HTTP metadata and redirects passed; their Facebook
  checks remain for QA after Chrome switched to another active task.
- PR 181 restores the existing 3D Louisiana relief beside the Home introduction.
  Keep featured stories directly below it and local selection below the stories.
  CI and PR review passed. Browser inspection confirmed the relief at 1280-pixel
  desktop and 390-pixel mobile widths. This is not a physical-device QA pass.
- The owner supplied replacement renderings for Meta, Boyce and SpaceX. Originals
  and hashes are preserved in the private handoff. Source credit and reuse
  evidence are pending; do not present a rendering as completed construction.
- The owner will perform production email verification during the founder QA
  pass. Agent verification remains development-only for that provider loop.
- PRs 180 and 181 are merged and production-smoked. PR 179 records this release.

## Phase 1: finish stories

The owner implements and reviews the new functionality with agents. Use a
bounded PR per concern; keep implementation verification inside each packet.
Do not begin the full redesign campaign until this phase passes.

| Packet | Required outcome | Dependencies | State |
| --- | --- | --- | --- |
| S1 | Versioned story contract, owner authorization, source intake, exact evidence references, image provenance, review and publication policy | Architecture and source contracts | Implemented and CI passed; real staging and bounded retrieval exercised in development |
| S2 | Owner JSON import, preview, approve, revise and withdraw workflow; replay and stale-evidence protection | S1 | Development passed; exact owner approval and revision exercised, stale/withdrawal negatives passed CI |
| S3 | Published story routes, evidence view, all-three homepage composition, related records, search and social share HTML | S1, S2 | Development passed on all three routes, Home, images, search and share HTML |
| S4 | Story-scoped anonymous Ask and private thread authorization using accepted story evidence | S1, S3 | Development passed, two supported and one unsupported question per story |
| S5 | Google and verified-email story follows, material-update alerts, roundup integration, grounded replies, management and unsubscribe | S1, S3, S4 | Development passed with actual isolated provider callbacks, receipt, reply, management and unsubscribe proof |
| S6 | Accepted Meta, SpaceX, and Boyce source bundles and published versions, with images and current limits | S1 through S5 | Meta reviewed v3, SpaceX v2 and Boyce v2 accepted and published LIMITED in development |
| S7 | Story-loop release certification on all three stories, exact production release and independent smoke after authorized deployment | S1 through S6 | Development gate passed; exact owner-approved production publication and bounded smoke passed. Production email is assigned to founder QA. |

Build the first complete vertical path with the existing Boyce evidence if that
reduces risk. Meta remains the lead on the delivered homepage. Research for all
three can proceed while shared functionality is implemented. No fourth story is
required. CCS is deferred; do not substitute it for the agreed launch set.

The full development evidence is recorded in
[development certification](story-development-certification.md). The approved
production application is `7ababad`; its exact workflow and independent smoke
passed. All eleven source snapshots and three images passed target checks.
No new body or parish was certified and no broad monitoring was activated.
The acceptance checks below describe the completed development gate; production
email verification is assigned to the owner's QA pass.

### Story acceptance

- [x] Home shows Meta as the lead and SpaceX and Boyce as secondary stories on
  desktop and mobile. No carousel or location-selection gate hides a story.
- [x] Every story has a stable direct URL, substantive reviewed explanation,
  relevant image, source credit, exact citations, timeline, known gaps,
  reviewed-through date, related records, and update expectations.
- [x] Official source identity, full artifact retention, hashes, exact spans,
  independent review, deterministic checks, and owner approval all pass.
- [x] An anonymous visitor can ask two related story questions and an unsupported
  question. Answers cite accepted evidence; not-found and exhausted-budget
  states remain honest. No open-web civic answer path is added.
- [x] Google and verified-email visitors can follow each story, manage delivery,
  receive a controlled material update, reply, and unsubscribe. Replays and
  overlapping follows do not create duplicate updates.
- [x] A caption, image, headline-style, or featured-order change alone sends no
  material-change alert. An initial import sends no historical alert batch.
- [x] Changed or withdrawn source evidence cannot remain silently current in a
  story, answer, search result, email, or social preview.
- [x] Story search and share previews use the accepted story version and its
  approved image. Direct refresh and dedicated share HTML passed production smoke. Ordinary URL metadata and direct app delivery passed the PR 180 production follow-up.
- [x] Story publication neither promotes a new parish nor enables agency-wide
  monitoring. Supported local coverage retains its existing gates.
- [x] Owner review, retries, revisions, withholding, and rollback or withdrawal
  have a repeatable documented path. New versions preserve prior evidence.
- [x] Record development and CI results separately from production proof. Capture
  the exact release, live paths, controlled inbox evidence, and cost.

Story following is required. A link to an underlying issue follow is useful
navigation but does not satisfy the whole-story follow requirement. If the
schedule threatens this scope, report the tradeoff to the owner rather than
silently replacing functionality or dropping a launch story.

## Phase 2: global design and full QA

The S7 development gate and owner-approved production publication have passed.
Boyce's exact target mappings were checked before publication. The owner may
begin the full QA campaign now, including the production email check. Image,
image replacement and final social-preview checks remain tracked above.
[Design](design.md) owns the page contracts and review order.

- [ ] Agree on global colors, type, spacing, button and input treatments,
  navigation, cards, statuses, image treatment, and evidence interactions.
- [ ] Use Home and story detail as the reference pages, then update shared
  components and the design-system reference together.
- [ ] Review Home, all three stories, Explore, issue, decision, meeting, Ask,
  Following, sign-in and email management, Coverage, requests, reports, method,
  privacy, and voter links on desktop and mobile.
- [ ] Exercise source panels, limited and missing evidence, stale updates,
  pagination, unsupported areas, loading, empty, error, offline, expired-session,
  exhausted-allowance, keyboard, focus, reduced-motion, and long-content states.
- [ ] Fix blocking findings and recheck affected resident journeys. Check social
  previews and direct routes after relevant layout or metadata changes.
- [ ] Run a small private resident pilot after the founder pass and repair
  confusing or broken interactions before the broad public announcement.

### QA ledger

Keep findings here until resolved. Evidence can link to a PR or permissioned
screenshot. Do not put personal messages, emails, or private questions here.

| ID | Route and viewport | Reproduction and expected behavior | Severity | Owner | State | Resolution evidence |
| --- | --- | --- | --- | --- | --- | --- |
| No findings recorded yet | Full pass pending | Record observations when the pass starts | Unassessed | Layken | Pending | None |

P0 is an unsupported public claim, privacy leak, or destructive failure. P1 is a
broken primary journey, unusable mobile layout, source link, Ask, follow, or
unsubscribe path. Both block launch. P2 is bounded confusion or presentation
work that can wait when the owner accepts it.

## Phase 3: launch, outreach, content, and submission

- [ ] Confirm all three stories are current enough for their published claims
  and have an owner and next review date.
- [ ] Fund finite operating allowances for public Ask, selected source checks,
  story review, and email through submission and judging. Compare provider use
  with the ledger; do not assume the September 14 allowances renew.
- [ ] Pass the founder and private-pilot launch gates with no open P0 or P1.
- [ ] Inspect actual Facebook, X, and LinkedIn previews for the URLs to be used.
- [ ] Prepare the personal Facebook launch, group-specific posts, short video,
  outreach list, and required sponsor-tagged X or LinkedIn post.
- [ ] Publish and send only after authorization. Observe behavior and answer
  feedback; keep corrections and small reliability fixes moving.
- [ ] Record known resident actions and permissioned feedback separately from
  anonymous browser telemetry and controlled test activity.
- [ ] Record the under-three-minute demo, recheck public artifacts, and complete
  [the submission checklist](submission.md#submission-checklist).

## Calendar targets

The phase gates control order. Dates are targets at the owner's current pace,
not evidence of completion or permission to skip a gate.

| Window | Focus | Exit |
| --- | --- | --- |
| September 7 through 11 | Stories, source dossiers, targeted processing, and functional release proof | Three stories and the full story loop accepted |
| September 12 through 15 | Global design, page-by-page desktop and mobile QA, private pilot | Launch gate passed; major design and feature freeze |
| September 16 through 20 | Public launch, outreach, content, resident feedback, small fixes | Useful live product and permissioned usage evidence |
| September 20 through 21 | Demo and submission artifacts alongside launch support | Submit by September 21 with authorization |
| September 22 | Contingency | Deadline noon Pacific, 2 p.m. Central |
| Through September 25 | Keep public app and operating allowances usable for judging | Monitor errors and source freshness |

If stories slip, protect their acceptance and the QA gate. Cut a rich editor,
extra visual variants, archive depth, broad automation, and nonessential scope
first. Do not start the full redesign early, drop a named story, or count a
broken flow as complete to preserve a calendar target. Escalate the schedule
tradeoff while there is time to reserve several days for outreach.

## Backlog triage

Do not clear pending, limited, or failed records for the sake of counts. Work a
target only when it supplies a launch-story claim, fixes a resident-blocking
problem, proves the demo, or supports useful selected local evidence. Prefer
saved snapshots and inventories. Preserve missing evidence and failure reasons.
Youngsville recovery is useful if a new official document can be obtained at low
cost; repeated retrieval of its old packet is not a launch prerequisite.

Keep completed tasks with their release or observation evidence until the next
checkpoint, then archive the dated record. Do not reopen the original nine
implementation slices or eight design slices from historical checklists.
