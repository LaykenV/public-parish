# Current work and launch gates

Updated September 10, 2026. This is the only active status and pending-work queue.
The approved order is stories, then design and QA, then launch and outreach.
[Business scope](../PLAN.md), [architecture](architecture.md), [design](design.md),
[operations](operations.md), and [marketing](marketing.md) define the contracts.

## Resident reading and Ask pass, September 10

The owner completed a broad app review and requested consistent reading,
sources and chat across stories, issues, decisions and meetings. The authorized
handoff is a reviewed green PR and a development URL for morning inspection.
Production shipment requires the owner's approval of that preview.

- [x] Keep stories above issues after area selection and remove the mobile 3D model.
- [x] Add meeting chat, compact sources, shared source drawers and scroll preservation.
- [x] Repair narrow timelines, remove pill dots and colored notice edges, and simplify Account tab rules.
- [x] Keep Ask's composer below the conversation with an up-arrow send control.
- [x] Add shared drawer motion with reduced-motion support.
- [x] Pass local verification, 685 application tests and 66 Chromium/WebKit journeys.
- [x] File PR #205 and verify both reviewers' findings.
- [ ] Finish final-head checks and upload the exact green development artifact.
- [ ] Deliver the morning report and dev link.

The approved header releases are PR #203 at `0c5b16b` and PR #204 at `0500f63`.
Both production workflows and independent smoke tests passed. The desktop
header is 48px with 80 percent top opacity and 72 percent scrolled opacity.

## Parallel PR reviews, September 10

[PR #201](https://github.com/LaykenV/public-parish/pull/201) merged as `7cbd36c`.
GLM 5.3 Flash and DeepSeek V4.1 Flash each published a separate clean review of
head `6e9fbd3`. GLM updated its original comment after pushes. DeepSeek completed
with low reasoning effort and preference for its own provider through OpenRouter.
Full CI passed 686 tests. [Production run 34490896584](https://github.com/LaykenV/public-parish/actions/runs/34490896584)
and independent `npm run smoke:production` passed for the release.

- [x] Merge the parallel reviewer setup after checks and both reviews pass.
- [x] Verify separate model summaries on the same commit and GLM comment updates.
- [ ] Verify a manual `/review` on an open PR after rollout and a DeepSeek comment
      update on a subsequent push.
- [ ] Compare unique confirmed bugs, false positives, time, and cost during the
      first 10 to 20 PRs. See [PR-Agent setup](../pr-agent.md).
- [x] Confirm the copied `convex-hackathon-skill` is available in this repository.
- [ ] Release and verify the owner-requested DeepSeek high-reasoning setting.
      The local workflow raises its output cap to 131,072 tokens and lowers its
      input ceiling to 850,000. GLM retains its existing settings.

## Overnight resident design pass, September 9

The owner requested the rest of the app follow the approved Home design. The
local branch `design/resident-app-home-patterns`, based on `f7742d5`, now contains
that pass. The [morning report](design-morning-report-2026-09-09.md) records the
changed pages, native Chrome desktop/mobile checks and remaining proof.
The owner authorized a PR, review monitoring and a merge after checks pass.
Production verification remains pending.

- [x] Implement consistent resident-page typography, controls, cards and phone layouts.
- [x] Repair current-body filter links, story citation focus, cramped email details,
  the short source-report drawer and hidden focus during sheet closing.
- [x] Perform bounded native Chrome visual and keyboard checks and static diff review.
- [x] PR 199 initial head passed 671 application tests and all 42 Chromium/WebKit
  journeys. A final source-quote styling correction awaits latest-head checks.
- [ ] Inspect authenticated owner workflows. Local Google sign-in did not complete.
- [ ] Complete physical-device, screen-reader, offline/image-failure and founder QA.
- [ ] Use the authorized merge after green checks, then verify the exact deployment
  and independent production smoke. Production mail proof remains a separate gate.

### September 9 owner corrections

The local pass now uses charcoal Louisiana with muted violet highlights, mobile
chat drawers on stories/issues/decisions, rectangular source controls, shorter
decision links and visible Following tabs. Colored left-edge card accents were
removed at the owner's request. The owner authorized release after green PR checks.

The dedicated preview browser verified a story draft surviving drawer close and
reopen, a sourced fixture answer on the decision page, nested source inspection
and focus return, the 320-pixel Following navigation and the rendered charcoal
WebGPU model. Native Chrome controls became unreliable, so later checks used the
app's dedicated preview. A development hot-reload context error cleared on a
fresh route load; the subsequent fixture answer and source inspection completed.
Initial PR CI passed; the latest-head recheck and physical-phone keyboard behavior
remain pending. The story browser
regressions now cover the mobile drawer and draft retention.

## Current checkpoint

Production is ready for the global design and founder QA pass. The September 8
continuation published the targeted Youngsville records and stronger Meta and
SpaceX versions with the accepted images. All twelve launch bodies report
Supported. The stories remain LIMITED where official evidence is missing.
[Morning report](targeted-catchup-2026-09-08.md) records the exact releases,
remaining gaps, live checks, $0.600803 in model charges and 86 Firecrawl credits
for this continuation.

The latest inspected behavior release is `c82080960d9162b7d459ff6b49773dc4976b1cd6`.
PRs 191, 192, 193 and 195 added honest Ask pause messages, resident error
recovery, required spending protection and email-only stop-all links. PR 196
repaired a test compatibility error that stopped PR 195's initial deployment
and made PR CI check the Convex TypeScript configuration. Production workflow
[34255328183](https://github.com/LaykenV/public-parish/actions/runs/34255328183)
and independent `npm run smoke:production` passed. This does not certify visual
QA or the production provider email loop. No allowance or source policy changed.
PR 194 adds all-three-story checks to the release smoke.

The morning source-continuation release was `61fe72ec964c21f704d2cfaa559b54e6d1fee140`,
PR 189. Its production workflow
[34244890498](https://github.com/LaykenV/public-parish/actions/runs/34244890498)
and independent `npm run smoke:production` passed. Two final anonymous Ask checks
preserved Act 874's qualifying conditions and exceptions. One raw citation marker
remains a P2 formatting observation for the design pass below.

The handoff documentation then deployed at `864d405` through PR 190. Production
workflow [34246165533](https://github.com/LaykenV/public-parish/actions/runs/34246165533)
and independent smoke passed. This is the verified checkpoint before the
September 8 documentation audit, not a claim about later pushes.

Earlier production application code `cb2ae0014572b1f1054eb80a345e694ed29f73e2`
was deployed through PR 183. Production workflow
[34225263905](https://github.com/LaykenV/public-parish/actions/runs/34225263905)
and independent `npm run smoke:production` passed. PR 182 previously moved the
Louisiana relief beside the region selector below featured stories. PR 180
serves accepted social metadata and the interactive app at ordinary story URLs.

The earlier story publication release was `771f660`.
PR 175 shipped the combined story release; PR 178 repaired signed artifact
transfer behind the production custom domain. Exact production workflow
[34174377315](https://github.com/LaykenV/public-parish/actions/runs/34174377315)
and independent `npm run smoke:production` passed.

The initial release retained eleven source snapshots and published three
independently reviewed LIMITED candidates at generation 1. The initial September 8 image
revision retained those exact drafts and evidence in new immutable versions. The
later source continuation published Meta and SpaceX successors with fresh reviews. Initial production story queries,
route responses, image hashes, citations, typed search, share HTML and nine
anonymous Ask checks passed. Baseline publication created zero update events.
[Production preparation](story-production-preparation.md) records the evidence.

The full development gate passed at `decf363`. The later presentation checkpoint used backend
and CI-built frontend `03831bf` on https://woozy-wren-227.convex.site. Later
backend rehearsals and source revisions are recorded in the morning report.

In development, Meta is the Home lead, with SpaceX and Boyce secondary. All three have accepted
LIMITED versions, owner-selected renderings, exact citations and explicit gaps.
Actual development verification covered Ask, Google and verified-email follows,
three immediate updates, a three-story roundup, sourced replies, management and
unsubscribe. [Development certification](story-development-certification.md)
records the evidence and the production boundary.

| Capability | Evidence and limitation |
| --- | --- |
| Evidence pipeline | Immutable snapshots, deterministic validation, independent review, and full, limited, or withheld publication deployed |
| Resident loop | Discovery, issues, decisions, evidence, anonymous Ask, Google and email-only follows, alerts, roundups, replies, and private reports deployed |
| Coverage and operations | Owner compiler, bounded scheduled processing, coverage requests, launch notices, search, issue sharing, and reports deployed |
| Latest inspected behavior release | Main commit `c820809`, successful production workflow [34255328183](https://github.com/LaykenV/public-parish/actions/runs/34255328183) and independent smoke |
| Local coverage | Live September 8 checks returned Supported for all twelve named bodies, including all seven Lafayette bodies. Four targeted Youngsville decisions are published; full archive catch-up remains incomplete |
| Source automation | Only the prior Metropolitan Council policy is enabled. The restored $4 source allowance is exhausted, so new paid source processing is blocked. Ask has a separate funded allowance |
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

## Home design pass, September 8

Released through [PR 197](https://github.com/LaykenV/public-parish/pull/197)
at `fbda95b`. [Production workflow](https://github.com/LaykenV/public-parish/actions/runs/34287037797)
and independent `npm run smoke:production` passed. The owner approved
the two Home layouts, restored Louisiana hero, purple and lavender system,
redesigned story and issue cards, mobile menu and footer voter information.
The next owner critique adopts a lavender off-white page with a white issues
section, horizontal mobile issues, full-sized mobile stories, and menu area and
account controls at the bottom without a visible brand heading.
The owner then selected a centered global spinner instead of skeletons.
The mobile refinement removes nested issue-section padding and uses nearly
full-width cards with native touch snapping, without arrow buttons. Cards share one height and display an index below the swipe row. The palette now separates near-white sections, white
cards, dark reading text, purple actions and a pale lavender footer.
[Design](design.md) records the adopted behavior and shared controls.

- PR head `3dbddbe` passed 670 application tests and 22 browser journeys in CI.
  Chromium and WebKit covered equal issue-card heights, native snapping, index
  changes, the 320/375/768/1280 pixel layouts, menu focus return, and hero focus
  with normal motion enabled. Saved screenshots were inspected. No physical-device
  or screen-reader pass is claimed.
- Production smoke passed the direct and canonical origins, apex redirect,
  resident routes, coverage, search, issue evidence, all three story images and
  evidence references, share behavior, and backend readiness. It did not repeat
  paid Ask or provider-mail verification.
- Review first visit, parish selection, returning visit, area changes, three
  stories in both orders, mobile menu and focus return, loading, partial failures,
  empty issues, long headlines and failed images at 320, 375, tablet and desktop.
- Confirm shared colors and action states on Home before the remaining pages.
  Recheck Ask's composer after removal of the bottom navigation.

### Home follow-up release, September 8

The next owner critique removes the selected-area hero, leaving the parish issues
heading as the page heading. Louisiana uses purple lighting and a transparent
canvas. Header and footer share the lavender off-white page background. Mobile
issues keep only the visible dot index, with a screen-reader position announcement.
Follow enrollment replaces the initial receipt with the target title and compact
cadence choices. The mobile menu uses the portfolio hamburger-to-X animation and
a floating Coss Popover, with area and account controls at the bottom. The open
menu X has no button background. Home decision records use a white list with
separate meeting dates, larger titles and lifecycle badges. Dates stack above
titles on phones. The design document lists all five Home fixture URLs.

Released through [PR 198](https://github.com/LaykenV/public-parish/pull/198) at
`f7742d5`. The owner approved the local appearance. Head `7f258f1` passed 670
application tests and 24 Chromium/WebKit browser journeys, including compact
follow controls at 320/375/1280 pixels, area changes through the floating menu,
hero focus and native issue snapping. The initial area test needed to wait for
the control for its configured viewport. Latest-head review found no major
issues; no review threads remained open. CI screenshots were inspected.
[Production workflow](https://github.com/LaykenV/public-parish/actions/runs/34307373914)
and independent `npm run smoke:production` passed for the merge commit. This
checks both origins, apex redirect, resident routes, coverage, search, issue and
story evidence, images, sharing and backend readiness. No paid Ask or provider
mail verification was repeated. Founder QA continues with the remaining pages.

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
- PR 182 deployed the existing 3D Louisiana relief beside the region selector
  below featured stories, including after an area is selected. Development
  checks covered 1280 and 390 pixels without horizontal overflow. Production
  inspection confirmed the placement with WebGPU ready. This is not full QA.
- The owner supplied replacement renderings for Meta, Boyce and SpaceX. Originals
  and hashes are preserved in the private handoff. On September 8 the owner
  approved an exception for these exact files with unverified rights recorded.
  All three replacements are published in production after fresh independent
  LIMITED reviews. Public image bytes match the supplied hashes; the unchanged
  drafts and evidence created no update events. Replay returned the same builds.
  Home and direct story routes load the new images. Ordinary story HTML uses the
  new social images and invalidates prior ETags. Facebook cache refresh remains
  a separate QA check. See [image release](story-image-release.md).
- The owner will perform production email verification during the founder QA
  pass. Agent verification remains development-only for that provider loop.
- PRs 180 and 181 are merged and production-smoked. PR 179 records this release.

## Phase 1: finish stories

This phase passed. The table preserves the implementation gate and development
proof; the current checkpoint above records later production revisions. Keep
future repairs bounded to one concern per PR.

| Packet | Required outcome | Dependencies | State |
| --- | --- | --- | --- |
| S1 | Versioned story contract, owner authorization, source intake, exact evidence references, image provenance, review and publication policy | Architecture and source contracts | Implemented and CI passed; real staging and bounded retrieval exercised in development |
| S2 | Owner JSON import, preview, approve, revise and withdraw workflow; replay and stale-evidence protection | S1 | Development passed; exact owner approval and revision exercised, stale/withdrawal negatives passed CI |
| S3 | Published story routes, evidence view, all-three homepage composition, related records, search and social share HTML | S1, S2 | Development passed on all three routes, Home, images, search and share HTML |
| S4 | Story-scoped anonymous Ask and private thread authorization using accepted story evidence | S1, S3 | Development passed, two supported and one unsupported question per story |
| S5 | Google and verified-email story follows, material-update alerts, roundup integration, grounded replies, management and unsubscribe | S1, S3, S4 | Development passed with actual isolated provider callbacks, receipt, reply, management and unsubscribe proof |
| S6 | Accepted Meta, SpaceX, and Boyce source bundles and published versions, with images and current limits | S1 through S5 | Initial development bundles passed; Meta v5, SpaceX v3 and unchanged Boyce evidence are now published LIMITED in production |
| S7 | Story-loop release certification on all three stories, exact production release and independent smoke after authorized deployment | S1 through S6 | Development gate passed; exact owner-approved production publication and bounded smoke passed. Production email is assigned to founder QA. |

Meta remains the lead on the delivered homepage. Future research is limited to
named gaps in these three stories. No fourth story is required. CCS is deferred;
do not substitute it for the agreed launch set.

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
| QA-001 | Story Ask, all viewports | The verified Act 874 exceptions answer includes a raw public evidence marker in its prose. Render readable citations without exposing the marker in answer text | P2 | Layken | Open for design and QA | September 8 anonymous production answer, prompt `ask-answer-v5`; factual qualifiers passed |
| QA-002 | Explore, desktop and mobile | Current-body links such as Pineville lost their body filter during URL parsing. Preserve current names and show the selected body | P2 | Agent | Fixed locally, CI pending | Pineville URL and live results checked in native Chrome; parser and browser regressions added |
| QA-003 | Private source report, 375 pixels | Full-size drawer used a short height. Give the form room and preserve access to its submit action | P2 | Agent | Fixed locally, CI pending | Native Chrome form and local invalid-input focus checked |
| QA-004 | Email management, 320 pixels | Destination address split across a cramped ledger. Stack destination and status on phones | P2 | Agent | Fixed locally, CI pending | Final 320-pixel fixture inspected |
| QA-005 | Shared sheet close, 375 pixels | Closing hid a focused descendant and triggered a Chrome accessibility warning. Release popup focus before hiding and restore opener focus | P2 | Agent | Fixed locally, CI pending | Escape and Close returned focus without a new hidden-focus warning; browser regression added |

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
