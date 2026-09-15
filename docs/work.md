# Current work and launch gates

Updated September 15, 2026. This is the only active status and pending-work queue.
The approved order is stories, then the launch upgrade slices, then design and
QA, then launch and outreach.
[Business scope](../PLAN.md), [launch upgrade](launch-upgrade.md),
[architecture](architecture.md), [design](design.md),
[operations](operations.md), and [marketing](marketing.md) define the contracts.

## September 15 Ask full-screen correction

The owner rejected the desktop sidebar shipped in PR #254. The correction on
`fix/ask-full-screen` removes the visible title, introduction and corpus label.
Chat fills the screen beneath navigation with 24-pixel side margins. Scoped
record context remains available. The status shimmer now takes four seconds.

- [x] Pass all 778 tests, both typechecks, build and lint with 15 existing warnings.
- [x] Pass nine Chromium and WebKit checks, with one desktop-only skip on mobile.
  Verify full-screen geometry, saved-chat loading, recovery and reduced motion.
  Inspect the desktop conversation screenshot.
- [ ] Complete the authorized PR review, production merge and smoke checks.

## September 15 Ask layout and loading corrections

The owner requested more vertical conversation space, a spinner while opening
an Account conversation, and a simpler answer wait. Local changes on
`fix/ask-layout-loading`, based on `94f2916`, move desktop context into a side
column. Saved conversations show a spinner until they load or reach a visible
expiry or failure state. Answer generation shows three bouncing dots below one
shimmering status line and its active icon, driven by the existing backend stage.

- [x] Pass 41 Ask tests, both typechecks, production build and targeted lint.
- [x] Pass 17 browser checks in Chromium and WebKit, with one desktop-only case
  skipped on mobile. Cover delayed history, expiry, failure, composer placement,
  reduced motion and existing mobile chat/source journeys. Inspect screenshots.
- [x] Correct older browser assertions to check the visible mobile story title
  and the restored dots with their status icon. All five affected checks pass locally.
- [x] Retain the neutral status for an unfamiliar backend progress stage, with
  a regression test. This preserves the prior fallback for older browser tabs.
- [x] Clear a saved-chat failure message when a new conversation arrives.
  The recovery regression passes in Chromium and WebKit.
- [ ] Complete the owner-authorized PR review, production merge and smoke checks.
  No backend changes; release verification is pending.

The first unit run hit the system temporary-directory quota before tests ran.
Using a task-owned temporary directory fixed the test setup.

## September 15 local issue readability audit

The owner requested a review after a reader found formal titles and repeated
"Why this may matter" explanations. The [five-issue audit](readability-audit-2026-09-15.md)
compares current public copy with accepted citations and provides manually
prepared replacement drafts. Pafford EMS is the likely reader example; the exact
URL remains unconfirmed. Its latest dated action receives a report, while two
importance explanations repeat the broader contract scope.

Local work is isolated in `public-parish-readability`, based on released
`f46a933`. Extraction and issue prompts now ask for recognizable subjects,
familiar wording and distinct supported context. The reviewer preserves evidence
and procedural-stage requirements. Prompt versions changed, and existing tests
now use the new extraction version. No accepted text, scores or UI changed.

- [x] Inspect five public issue details and their accepted excerpts. Verify the
  live EMS page at desktop and phone widths and inspect both screenshots.
- [x] Prepare five source-backed review drafts and identify missing context.
- [x] Update extraction, issue drafting and issue review prompts locally.
- [x] Pass 775 tests, both typechecks, build, lint and diff review. Lint retains
  15 existing warnings. The first suite exposed two fixtures pinned to the old
  prompt version; updating those restored replay and evidence-chain checks.
  The initial build lacked the public Convex URL. Build and lint passed after
  supplying that URL in the local build environment.
- [ ] Evaluate new generated drafts on these five saved input sets in development
  before claiming a model-quality improvement. Existing publications need fresh
  review before replacement. No source batch or publication is authorized here.
- [ ] Resolve the Lena-Flatwoods stage mismatch in a bounded evidence correction.
  The issue says decided; the linked minutes record says scheduled. The supported
  action permits seeking bids, not a construction award or work start.
- [ ] During the next bounded library-tax source update, capture the official
  September 23 hearing line missing from the currently accepted excerpt.

The Rapides PDF host returned HTTP 403, so the three Rapides comparisons use
retained public citation excerpts. The full EMS report was not inspected.
No paid model calls, ingestion, backend sync, publication or release occurred.

## September 15 consequence-first Home release

The owner authorized implementing the ranking recommendation and shipping all
four corrections. The UI changes are separate PRs #249, #250 and #251.
The ranking change preserves accepted evidence scores, indexes them on current
issues and reads the highest-scoring 40 candidates before evidence hydration.
Accepted-version dates break equal-score ties in both the index and final list.
Recent routine work cannot outrank a higher-scoring consequence. The highest 20 valid issues remain the
query result and Home shows its existing six-card subset.

The publication transaction maintains the indexed score and accepted date.
The production workflow repairs missing scores with at most 100 issues per transaction and 100 batches.
It copies current accepted scores without changing versions, update dates or
notifications. Stale version references receive a noncompetitive marker and
still fail public evidence hydration. No source retrieval or AI spending.

- [x] Add regressions for consequence-first order and an older strong issue
  beyond forty newer low-scoring issues. Verify bounded, repeatable repair.
- [x] Pass all 783 tests, both typechecks and build. Fix four unused test bindings
  and one shadowed local name found by lint, then rerun lint.
- [x] File ranking PR #252. A verified review finding exposed different tie
  ordering at the candidate cutoff. Both stages now use the accepted-version
  date and descending slug, with an equal-score regression beyond forty rows.
- [x] Pass all 775 tests, both typechecks, build and lint with the 15 existing
  warnings after the tie correction. The lower test count removes tests of the
  deleted date-bonus calculation.
- [ ] Finish the corrected-head CI and reviews.
- [ ] Follow each authorized production deployment and run independent smoke.

## September 15 Follow, Explore and statewide ranking review

Local work on `fix/follow-filters-utilities`, based on released `0496797`, removes
only the utilities image caption, makes the shared Follow trigger primary and
lets selected Explore dropdown options clear on click or keyboard activation.
The illustration and its alt text remain intact. Sort resets to its default.

`npm run verify` passed all 780 tests, both typechecks, build and lint with the
15 existing warnings. The initial test attempt hit the machine's temporary-file
write quota before running tests. Using a worktree-local temporary directory
resolved it. Eighteen browser cases passed in Chromium and WebKit. An older
Follow test failed in both browsers because its issue URL is absent from the
production corpus. Separate checks against current published stories,
amendments, issues and linked decisions passed primary colors, dialog opening
and focus return in both browsers. Desktop and mobile screenshots were inspected.
The local frontend read public production queries. No backend sync, publication,
email, commit or deployment occurred.

The ranking review found that Home takes the newest 40 issue candidates before
sorting by cited consequence points plus 25 for a future action or 10 for a
meeting within 60 days. That pool can exclude older important issues. The live
roof-design issue receives 20 consequence points plus 10 for recency, ahead of
the ExxonMobil rebate at 26. Featured stories keep their fixed editorial order;
utility cases use record update time. Ranking code remains unchanged.

- [x] Complete and validate the requested UI corrections locally.
- [ ] Release the UI corrections when authorized.
- [ ] Follow up on statewide ranking. Prefer consequence before recency and
  remove the newest-40 cutoff from candidate selection through a bounded indexed
  design. Review the rubric for routine contracts before changing accepted scores.

## September 15 Ask speed work on development

The owner authorized implementation, repeated development testing and release.
Work is on `perf/ask-indexed-retrieval` in the isolated phone-fixes checkout.
Development `woozy-wren-227` has the backend changes and the already-reviewed
progress UI. Production remains on `d24dade`.

Corpus Ask now selects from the complete published search projection, with up
to four parallel batches. Requests deduplicate repeated text, use short target
references and readable publication dates, and retain exact citations after
selection. Explicit date and place filters use database indexes. Ambiguous dates,
undated records and uncertified indexes retain complete retrieval. Answers verify
full document hashes before selecting surrounding source passages. Selector
reasoning is low; answer reasoning remains high. See the model-role table in
[architecture](architecture.md).

Development backfill visited 254 decision records in 11 bounded pages and
certified 223 current published decisions. A synthetic thousand-record test
checks selection across distant pages without a hidden result cutoff.

| Live development check | Time | Result |
| --- | --- | --- |
| Weekly question, first indexed implementation | 63.1 seconds | Answer with four citations |
| Low reasoning with raw dates, rejected iteration | 96.5 seconds | Unhelpful not-found answer |
| Weekly question with readable dates and short references | 32.8 seconds | Correct record updates, six citations |
| Weekly repeat | 35.8 seconds | Same two records and date distinction, four citations |
| Magnolia audit in mobile WebKit | 15.8 seconds | Correct $137,500 budget, five citations |
| Lafayette projector proposal | 9.9 seconds | Funding transfer and introduction status, three citations |
| Unsupported bicycle-ban question | 10.3 seconds | Not-found, no invented answer or citations |

The weekly prompt was "What decisions changed this week?" The improved runs
separated September 14 and 15 Public Parish updates from August 12 government
votes. Selection took about six seconds across three model calls. The first
improved answer used 34,693 input tokens, versus 58,310 in the first indexed
iteration. Its model-attempt ledger estimate was $0.027152. These are development
measurements on a smaller corpus, not a production latency guarantee.

Mobile WebKit displayed all backend stages and had no browser errors or horizontal
overflow. The final review tightened date routing to simple explicit questions
and preserved the full search for ambiguous scheduling language. Local tests
cover that guard and daylight-saving boundaries. The final guard was synced to
development after the live benchmark batch.

The six-question iteration batch charged $0.143545 to the spending guard within
a $0.50 ceiling. Total guard charges for this session were $0.202831, including
the initial experiments. Every reservation settled. Closing the temporary batch
restored the prior expiry and $0.085585 unspent balance without erasing charges.
No source retrieval, email or production settings changed.

- [x] Implement and test faster retrieval and verified source passages on dev.
- [x] Check real mobile progress, supported answers and unsupported claims.
- [x] Pass all 780 tests in 102 files, both typechecks, build and lint with
  15 existing warnings. Review session ownership and revision checks.
- [ ] File and release the authorized performance change. Production will
  need a complete decision search backfill before the indexed path activates.
- [ ] Measure the same weekly question on the full production corpus after release.

## September 14 phone Ask and Google sign-in correction

The production diagnosis against release `34aa8bd` found an Ask request that ran
for 115 seconds before `ask_scope_too_large`. Its sixteen selector attempts all
recorded `selection_invalid`; fallback retained each batch until selection
exceeded 1,500 excerpts. The rejected output was not stored, so its exact
validation reason remains unproved.

A local regression reproduces the broad-selection defect. The prompt asked for
relevant targets, but validation rejected broad selections containing targets.
The correction validates and retains those targets. Both model stages receive
the question date in America/Chicago for relative dates. Invalid selections now
record the specific validation reason without storing questions or model output.
Evidence and spending limits remain in force. Broad questions still scan every
catalog page, so these changes do not establish a production latency bound.

Google callbacks completed in the inspected window, with later unauthenticated
account queries. This does not prove which session the reported phone used.
The local correction requests Google's account chooser through the pinned Auth
v2 OAuth flow. Following waits for the backend profile before loading private
data, shows the signed-in name and email, and offers sign-in recovery if the
profile is missing.

The Account card now shows the Google avatar with an initials fallback, name
and email. Its outlined Sign out button reports pending and retryable error
states. Ask replaces the bouncing dots with four backend stages, a shimmer
label, elapsed time and a longer-search note. Stages advance only when the
server reaches them. Progress queries require the owning session, and stage
writes require the active answer attempt.

- [x] Reproduce the selector contract defect with the existing weekly suggestion.
  The old behavior fails the regression by adding an unrelated record.
- [x] Check Google authorization URL protections and profile ownership locally.
- [x] Check account loading, missing-profile recovery, identity and sign-out.
- [x] Check progress ownership, stage updates and subscription cleanup.
- [x] Inspect account and Ask previews at 320, 375 and 900 pixels in WebKit and
  Chromium. Check reduced motion, avatar fallback and sign-out pending, error
  and retry states. These checks use local components, not live Google OAuth.
- [x] Pass 767 tests, both typechecks, build and lint with 15 existing warnings.
  Review the changed authorization and evidence paths. The initial build lacked
  VITE_CONVEX_URL in the isolated checkout; rerunning with the public development
  URL passed. No cloud sync was required for these local checks.
- [x] Receive authorization to file, review, merge and test production.
- [x] Merge account PR #246 as `191b039` after CI and both reviews passed.
- [x] Merge Ask PR #247 as `d24dade` after final CI and both reviews passed.
  Production workflow `34967536624` and independent smoke passed. Mobile WebKit
  completed the weekly question in 169 seconds with nine citations and no
  browser errors. All four backend stages appeared. Google reached its real
  sign-in page with the chooser requested.
- [ ] Reduce broad Ask selection latency and cost. The live test scanned 39
  batches in about 140 seconds, retained 47 excerpts and used 40 successful
  AI Gateway calls. The app ledger estimates $0.261008 for this one question.
- [ ] Confirm complete Google sign-in on the owner's phone.

Both releases are live. The [Ask release receipt](https://github.com/LaykenV/public-parish/pull/247#issuecomment-5680056362)
records the production result and remaining latency concern. The account release
passed its own workflow and independent smoke. No spending settings or email
changed. Local release notes remain uncommitted after deployment.

## September 14 citation source actions

The local UI now gives citation drawers a persistent action footer. A purple
"Open official source" button shows the website, and stories and amendments
have a separate "View saved copy" button. The excerpt scrolls above the actions.
One shared component covers stories, amendments, records and Ask, with explicit
unavailable-link states and accessible new-tab labels. Exact excerpts stay intact.

Validation passed 754 tests, both typechecks, build and lint with 15 existing
warnings. All 96 reading and citation browser cases passed, one after a
page-loading timeout on an unchanged retry. The source-link tests passed again
after checking the real saved-copy fallback. An old local smoke configuration
caused the first lint run to fail; removing it from the scan resolved that.
Phone, short-screen, record and desktop screenshots were inspected, including
the owner's Source 12. [PR #245](https://github.com/LaykenV/public-parish/pull/245)
is open. CI found two resident test selectors that still used the old link
wording. Updated them to the new source label; all six affected Chromium and
WebKit cases passed locally. Latest-commit CI, review and release are pending.

## September 14 mobile citation drawer correction

The owner's iPhone screenshot showed a gap below the source drawer. A local
WebKit reproduction left the same 37-pixel gap when the visible viewport was
taller than the root layout measurement. The shared viewport calculation now
accepts the taller window measurement while retaining its stale-height guard.
Medium and full evidence drawers use that same height, so full drawers also
shrink within a reduced viewport instead of extending below it.

Local verification passed 754 tests, both typechecks, build and lint with 15
existing warnings. All 72 Chromium and WebKit reading and citation checks passed.
The expanded suite passed all 34 cases across all ten amendments, all three
featured stories, issues, decisions, meetings and Ask. It checks 360-pixel
viewport heights and every story and amendment source at 320 by 568 pixels,
including scrolling to source links and restoring focus and reading position.
Before and after screenshots were inspected. Work is isolated on
`fix/mobile-citation-drawers`, based on released `2e89429`.

- [x] Correct the shared viewport and evidence drawer sizes.
- [x] Check citation bounds, source scrolling, focus and reading restoration.
- [x] Ship the sizing fix through PR #244 as `34aa8bd`. Both reviewers, CI,
  production workflow `34918385898`, independent smoke and 26 live citation
  checks passed. See the [release receipt](https://github.com/LaykenV/public-parish/pull/244#issuecomment-5673474815).
- [ ] Confirm native iPhone toolbar behavior. Browser tests simulate viewport
  changes; they do not operate native Safari toolbars.

## September 14 code-freeze corrections

The [audit](launch-audit-2026-09-14.md) and
[correction receipt](code-freeze-2026-09-14.md) support moving the main effort to
launch content and residents. Work is isolated from the older dirty checkout,
starting at the actual released commit `0c0d24c`.

- [x] Fix anonymous Ask write admission, historical management-token revocation,
  ballot URLs and metadata, initial Google follow failure feedback and the empty
  next-action contradiction in production.
- [x] Fix unknown-page hydration and verify desktop and mobile recovery.
- [x] Pass 754 application tests, both typechecks, build and lint. Final integrated
  resident browser checks pass all 140 cases. Independent diff review found no
  verified regression.
- [x] Refresh SpaceX and Boyce in production through source checks, independent
  review and exact-version approval. Both retain factual text and images, with
  one SpaceX alt-text correction. Reviewed September 14, next review September 18.
  No update alerts. Post-review production smoke passes.
- [x] Restore source spending to disabled. Review cost was $0.192740 in the app
  ledger and three Firecrawl credits. Ask settings remain unchanged.
- [x] Ship the owner-authorized corrections through PRs #237 through #241. Both
  reviewers and CI passed. Combined release `7d2b467` passed production workflow
  `34903301247` and independent smoke. The correction receipt records the exact
  workflow, review history and validation limits. All 56 fresh production browser
  checks passed.
- [ ] Keep the September 16 Meta watch, September 17 amendment review and
  September 18 SpaceX/Boyce review. Check Ask allowance and failed journeys daily.
- [ ] Reconcile EBR Planning inventory in the next bounded source update. Official
  July minutes exist; August minutes are not linked. Its stale expected date
  remains disclosed, and no future date was invented. This does not block freeze.
- [ ] Finish source-backed launch assets, actual social previews, resident feedback
  and the final demo.

Older entries below preserve the state at each work session. Their pending
release labels do not override the confirmed production base or this active
freeze queue. The audit distinguishes current verification from the September 12
production email and phone acceptance receipt.

## Issue and decision reading, September 14

The owner approved aligning both pages with stories on phones and desktop, then
shipping through a reviewed PR. The local change uses a 54rem reading column,
accepted summaries beneath titles, header actions and section links. Dates and
evidence status sit below the introduction. Decisions gain Share and the existing
Follow action when linked to an issue. Mobile retains full-screen chat.

Local validation passed 744 tests, both typechecks, build and lint with the 15
existing warnings. Reading and chat checks passed 57 browser cases with one
intentional skip. Six additional Chromium and WebKit cases checked 320px, 768px
and 1280px layouts, section targets, Ask scopes, Follow and Share. Before and
after screenshots were inspected. PR review and production release are pending.

## Desktop reading cleanup, September 14

PR #233 includes the latest issue-sharing and mobile-hero fixes from main.
Desktop dialogs use a 100 ms fade with matching focus return. Issue and decision
pages put Ask in the status actions and remove their inline question forms.
Mobile keeps its chat button, draft retention and existing motion.

Both typechecks, build and lint passed with 15 existing warnings. The suite
passed 714 tests before three files hit a temporary-file write error. Those
three files passed all 30 tests with a separate temporary directory. Chromium
and WebKit passed desktop issue and decision Ask navigation, linked-issue and
corpus scopes, area and filter motion, reduced motion, focus return and mobile
chat draft retention. Screenshots were inspected. The owner authorized the PR, review monitoring,
merge after green checks and production verification. Release remains pending.


## Pelican identity release, September 14

The owner approved the pelican and authorized shipment. The compact SVG uses
its own dark violet tile in the header and browser tab. The 3D bird appears in
the footer and How it works introduction. Browser icons and the generic share
image use the approved identity. Story shares retain their accepted images.
[Artwork and regeneration](brand-assets.md) records the assets.

The earlier preview passed 686 tests, both typechecks, build, lint and visual
checks. The release applies only branding changes to current main. Release CI,
review bots and independent production smoke remain pending.

## September 14 Elections hub

The owner approved Elections in navigation and a redesigned `/ballot` page.
The page has a clear election header, official voter tools and numbered amendment
cards with accepted summaries and reading links. Statewide Home retains all ten
cards. Parish Home shows two statewide amendments in ballot order and links to
the full guide. Elections remains highlighted on measure pages and returns to
the hub when clicked.

Local verification passed 742 tests, both typechecks, build and lint with 15
existing warnings. Browser checks cover 320px, 768px, 1025px and 1280px in
Chromium and WebKit. The four initial guide checks matched a footer link as well
as the new voter link. After correcting the selector, all 34 targeted browser
cases pass. Inspected desktop and mobile screenshots.
PR, hosted development and production checks are pending.

## September 14 Home card design

The owner requested a story image for the utility roundup, stronger homepage
ballot cards and an arrow link for Read the ballot guide. The local design uses
an AI-labeled utility illustration, the existing story image and headline styles,
an expandable case list and numbered ballot cards with direct reading links.
The [image record](utility-image.md) retains the prompt and asset provenance.

Validation passed 742 application tests, both typechecks, build, lint with 15
existing warnings and all 30 targeted browser cases in Chromium and WebKit.
Inspected the roundup and ballot cards at 320px and 1280px. PR #229 merged as
`3da06db`. Both reviews and CI passed. All 77 hosted dev files matched the
certified artifact. Eight browser checks passed on each of development and
production, plus the exact production workflow and independent smoke.

## September 14 statewide reading and utility roundup

The owner approved one utility roundup alongside the three featured stories.
Home now groups the accepted commission cases into the fourth grid card. Each
case links to its own evidence and shows its docket and published status.
The existing commission follow provides utility updates. The separate statewide
section is removed. This does not add a new editorial story or merge decisions.

The owner found a false Record not found page for statewide decisions. All four
production decision queries and both meeting queries return accepted records.
The frontend reader rejected Louisiana. The fix admits Louisiana for decision,
meeting and issue reading while retaining the unknown-place check. Three
regression checks failed before the fix and now pass. The original U5 release
smoke missed decision-page navigation. Validation passed 742 application tests, both typechecks, build and lint
with 15 existing warnings. All 64 targeted browser cases pass after correcting
the story-image selector and waiting for visible layout. PR #228 merged as
`03ebec2`; its exact production workflow and independent smoke passed.

## September 14 production upgrade release

The owner authorized production deployment. PR #226 merged statewide commission
coverage as `33d18fe`. Its exact production workflow and data checks are pending. This separate ballot release adds all ten November 3 amendments.
Production data must pass the bounded work order in
`docs/upgrade-production-work-order.md`, including fresh independent ballot
reviews, before the release is complete. U4 still awaits an official outcome.

## September 14 overnight U4, U5 and U6 handoff

The development build and data are ready for founder QA at
https://woozy-wren-227.convex.site. U5 passed ten gates and has four accepted
records. U6 has ten reviewed statewide measures. U4 preparation is complete;
its September 16 outcome remains pending. The [morning report](upgrade-morning-report.md)
contains the QA route, evidence quality, spending and remaining release gates.

Validation passed 738 application tests, both typechecks, build and lint with
15 existing warnings. Browser coverage passed 179 cases with one intentional
skip after the documented reruns. All 76 hosted code files match the local
build; 26 hosted browser checks passed. Source processing is idle and its
development allowance is closed. Ask remains available for QA. The work is
uncommitted on `upgrade/overnight-u4-u6`; production has not changed.

## September 14 UTC mobile area controls, local update

Mobile menu selection closes the area picker and menu, then opens Home with
the chosen parish or Louisiana. Dismissing the picker keeps the menu open.
Choose area now sits beneath the statewide story introduction and shares the
plain-link styling of View Statewide Stories instead of floating over the page.

Both typechecks, build, targeted lint and 42 unit tests passed. All twelve Home
browser checks passed across Chromium and WebKit after correcting a layout
assertion to allow the shared button's relative positioning. Changes are local
in `fix/mobile-area-navigation`; this follow-up has not been committed or deployed.


## September 14 parallel PR verification

Prepared on `codex/parallel-ci`. The frontend build runs alongside typechecks,
application tests and lint. Six browser jobs cover the existing resident,
reading/chat and owner suites across Chromium and WebKit. The final `verify`
check requires all applicable jobs before publishing the certified frontend.
Browser selection still requires `development-certification`. Workflow lint
and all 128 final-gate result combinations pass. Test discovery confirms all
168 browser cases appear exactly once. The owner authorized filing the PR and
merging when green. GitHub execution and measured timing are pending.

Local validation passed 726 application tests, both typechecks, build and lint
with 15 existing warnings. The browser run passed 166 cases, skipped one
desktop-only case on mobile and timed out waiting for one synthetic Ask answer.
That unchanged case passed its targeted rerun. The operations document still
has a pre-existing Prettier table-formatting difference; the workflow passes
formatting and Actionlint.

## September 13 Explore, Ask and coverage request controls

The owner accepted the preview except Explore's sparse cards and date-only
default order. The follow-up leads unfiltered browsing with published stories
and consequence-ranked issues, removes duplicate links and retains explicit
sort order. New cards keep accepted summaries and type-specific metadata, with
story headlines above approved images. Body cards open their records. All five
entry types passed desktop and mobile checks. Local validation passed 726 tests,
typechecks, build and lint with the 15 existing warnings. Ten final desktop and
mobile checks passed, and screenshots were inspected. Replacement PR checks and
the dev artifact are pending.

The owner requested two desktop Explore columns, modal filters, loading confined
to results, a centered empty desktop Ask composer, a centered coverage request
form and complete focus borders on composite inputs. The changes are implemented
on `fix/resident-page-interactions`. Explore preserves scroll and mounted filters
during query changes. The shared area search and Explore search keep their focus
border around the whole field. Coverage assurance follows the form.

Local validation passed 721 tests, both typechecks, build and lint with the
15 existing warnings. All 26 desktop and mobile browser checks passed, plus the
desktop Ask transition using synthetic chat. These cover delayed queries,
dropdown anchors, modal bounds and focus, responsive cards and request layout.
Inspected before and after screenshots. PR #222 is green at `97c4010`, with clean
GLM and Muse reviews. CI `34789189134` passed 721 application tests and 165 browser
checks, with one desktop-only test skipped on mobile. Synced the matching dev
backend and uploaded exact artifact `10326759975` as deployment
`1252ad35-ed0a-4ade-81d1-8e6e32e9f0b5`. Eight independent hosted Chromium and WebKit
checks passed. Direct Ask checks passed on desktop and mobile, and all 70 hosted
HTML, JavaScript and CSS files matched the artifact. Ready for owner testing at
https://woozy-wren-227.convex.site. The PR remains open and production is unchanged.
This final receipt is recorded locally after the tested commit and in the PR.

## September 13 Home story grid and filter controls

The owner requested removal of Search issues and authorized merging and shipping
once green. Home now keeps only View Statewide Stories beside the mobile Filters
button. Build and all ten Home browser checks passed. Inspected the final
mobile and desktop controls. Final PR validation is pending, followed by the
authorized production merge, deployment and independent smoke checks.

The owner approved desktop and rejected the mobile navigation box in `6fc18d0`.
The mobile follow-up removes the box and divider, uses an outlined Filters
button and places the description under the heading. Build and ten Home browser
checks passed. Lafayette screenshots at 430px, 390px and 320px were inspected.
The desktop screenshot is byte-identical to the approved version. Head `3716d64` passed CI `34772035606` attempt 2 with 721 application tests and
156 browser checks. Both reviews are clean. Development upload
`31c1e896-d1c9-4d51-b4d1-2f9cd917db7f` uses exact artifact `10322447358`. Ten
independent hosted Home checks passed and all 70 code files matched. Inspected
Lafayette at three phone widths. The preview is ready; production is unchanged.
This final receipt is recorded locally after the tested commit and in the PR.

Separate follow-up: Explore's WebKit filter-close check intermittently loses
focus after changing the body. CI attempt 1 at `3716d64` failed this check while
all Home checks passed. The same test failed twice in three runs against the
approved `6fc18d0` artifact, and four times in five against the current local
build. No Explore or shared dialog code changed in PR #221. The same-head CI
retry passed. Investigate the focus timing in a separate change.

The latest owner refinement moves parish filters into the issues header. Mobile
stacks Search issues and View Statewide Stories in a divided white group beside
a regular Filters button. Desktop removes the duplicate Change area control,
keeps both navigation links in the issues card and places the selection summary
dropdown inline with the heading. Typechecks, build and lint passed with the
15 existing warnings. All 48 Home browser checks passed on the finished build.
Inspected 320px, 375px, tablet and desktop screenshots. Head `6fc18d0` passed
CI `34770704225` with 721 application tests and 156 browser checks. Both reviews
are clean. Development upload `d5e6f8da-191a-48ba-bc91-ed67ef4a6f6e` uses exact
artifact `10322023029`. Ten independent hosted checks passed; all 70 code files
matched. The updated preview is ready for owner testing. The PR remains open
and production is unchanged. This final receipt is recorded locally after the
tested commit and in the PR comment.

The owner requested vertical parish issues, multiple body selections and the
mobile statewide action beside Search issues after testing `5067366`. The follow-up
is implemented locally. Development query support is synced. Local validation
passed 721 tests, both typechecks, build and lint with 15 existing warnings.
All 46 Home browser checks passed across Chromium and WebKit. The final 320px
layout check passed again after waiting for both result sections to settle.
Head `4d77edf` passed CI `34766698331` with 721 application tests and 154 browser
checks. GLM and Muse reported no key issues. Development upload
`46c7b550-89af-4a3b-8d59-c7e2d075c2cd` uses exact artifact `10320232798`. Eight
independent hosted checks and the desktop combined-filter check passed. All 70
HTML, JavaScript and CSS files matched. Inspected hosted 320px and 375px layouts.
The updated development preview is ready for testing; production is unchanged.
This final receipt is recorded locally after the tested commit and in the PR.

Local work on `design/home-controls`, based on `27b79d8`, gives all three
statewide stories full-sized cards in a two-column desktop grid. Parish Home
keeps View Statewide Stories inside the issues card. Mobile stacks it beneath
Search issues beside the filter button. Desktop has a selection dropdown beside
the issue heading. Statewide keeps the floating mobile area selector. Both use draft checkboxes, Reset, Apply filters and Change area.
Several selected bodies include results from any selection. Parish issues stack
vertically on phones; statewide issues retain the swipe row. Filter requests keep the page visible and show
loading within the issue and decision result sections. URLs retain body and city
focus, and closing the drawer discards unapplied choices.

Local validation passed 719 application tests, both typechecks, build and lint
with 15 existing warnings. All 44 Home browser checks and six initial-loading
checks passed across Chromium and WebKit after updating the old chip assertions.
Inspected desktop stories with loaded images, 320px parish and drawer layouts,
and section loading.

[PR #221](https://github.com/LaykenV/public-parish/pull/221) opened at `323986f`.
CI `34764692736` passed 719 application tests and 152 browser checks. GLM and Muse
reported no key issues. Development upload `b38ec75f-a464-41f6-9f14-c302d682c1cb`
used exact CI artifact `10320420943`. Six independent hosted checks passed and
all 70 HTML, JavaScript and CSS files matched. Screenshot review then found the
desktop select's focus outline touching the copy below it. The follow-up adds a
12px spacing. Previous head `5067366` passed CI `34765244359`, including all
719 application tests and 152 browser checks, and both reviews are clean.
Development upload `8bfde61c-bdd2-4c4d-bf59-dfbfc2cb1de9` used exact artifact
`10320840979`. Six hosted Chromium/WebKit checks passed; all 70 HTML, JavaScript
and CSS files matched the artifact. Final screenshots confirm the spacing fix.
The owner can test https://woozy-wren-227.convex.site. PR #221 remains open and
production has not changed. This final receipt was recorded locally after the
tested commit; the PR comment carries the same handoff evidence.

## September 13 Home UX correction

The owner tested U1 through U3 and changed the Home contract. The follow-up
implementation hides featured stories in parish views, limits the area selector
to Louisiana and parishes, and remembers an explicit Louisiana choice so the
hero only introduces visitors without a saved selection. Body filters remain on
Home. Existing shared body and city URLs remain valid. Local validation passed
719 tests, both typechecks, build, lint and 38 Home browser checks. PR checks and
review are pending; production keeps the previous behavior until this merges.

## Launch upgrade slices, September 12 decision

The owner adopted the [launch upgrade plan](launch-upgrade.md) after two agent
reviews. It sharpens the existing resident workflow instead of adding datasets.
Slice contracts, acceptance and spend proposals live there; status lives here.
U1 through U3 are implemented in PRs #216 through #219. Their release checks
and exact production receipts live in those PRs. The overnight development work
completed U5 and the ten statewide U6 measures in dev. U4 preparation is ready;
its September 16 outcome remains pending. U7 has not started. The
[morning report](upgrade-morning-report.md) records validation, spending and
the remaining release work. These changes are uncommitted on
`upgrade/overnight-u4-u6` in `public-parish-upgrade-data`.

| Slice | Outcome | State | Evidence |
| --- | --- | --- | --- |
| U1 | Louisiana-first Home with parish focus and return | Implemented | [PR #216](https://github.com/LaykenV/public-parish/pull/216) |
| U2 | Place-qualified body labels; parish, city, body selector; body focus on Home and Explore | Implemented | [Labels #217](https://github.com/LaykenV/public-parish/pull/217), [focus #218](https://github.com/LaykenV/public-parish/pull/218) |
| U3 | Consequence-first Home issues with a cited one-line reason | Implemented | [PR #219](https://github.com/LaykenV/public-parish/pull/219) |
| U4 | September 16 LPSC agenda-to-outcome on Meta, follower delivery and demo capture | Dev preparation complete; official outcome pending | Current production prose mirrored in dev; Follow beside next action; [watch procedure](upgrade-u4-watch.md) |
| U5 | Louisiana Public Service Commission through the ten gates as a statewide body | Ten gates passed and promoted in dev; production pending | Three retained session documents, four accepted records, scoped Home and commission Follow |
| U6 | Ten November 3 constitutional amendments with Ask and follows; verified parish propositions | Ten reviewed, accepted limited measures in dev; production pending | Exact numbered SOS questions, ten Acts, seven fiscal notes, actuarial note and statutory definition. Parish propositions remain unpublished |
| U7 | Launch content, demo sequence and previews for the new surfaces | Not started | |

- [x] Prepare all ten statewide amendments under the overnight authorization.
- [x] Configure finite development allowances through the spending guard and record actual use.
- [x] Prove the LPSC ten-gate compile and four resident records in development.
- [x] Preserve the three launch stories and the existing supported parish set.
- [ ] Founder QA covers Louisiana Home, parish focus, all ten measures, sources,
      scoped Ask, Follow and mobile reading. Use the morning report's test route.
- [ ] Review and release the uncommitted changes in separate concerns. A merge
      to main deploys production; this overnight instruction did not authorize it.
- [ ] U4 records a reviewed Meta outcome from a new official document after
      September 16, or a written no-document checkpoint by September 19.
      Tuesday, September 15 launch must use the existing scheduled-action copy.
- [ ] U5 repeats the bounded compile and ten-gate evaluation in production
      under an authorized allowance before production support promotion.
- [ ] U6 transfers the retained sources and publishes reviewed production
      measures as baselines, then passes direct URL and production smoke checks.
- [ ] Decide whether verified parish propositions follow the statewide launch.
      The research leads and specific evidence gaps are in the morning report.
- [ ] U7, the private resident pilot, actual-platform social previews and the
      final demo remain launch work. Protect the weekday sales block.

The review corrected four release defects. Search retains stored body identity
names and displays the public label without requiring a backfill. Shared Home
links derive their parish from the selected body or city and clear filters when
returning to Louisiana. Monitoring notices read policy state separately from
coverage certification. Written dates use UTC calendar days, matching ISO dates.
City rows are selectable and filter both issues and records. The combined
application suite passed 718 tests before the final browser and filter fixes;
latest-head CI and production receipts are linked from the PRs above.

The previous P2 findings, design pass and pilot remain below. Their order moves
after the slices, not off the list.

## September 12 launch checkpoint

The owner authorized the prepared releases and the corrected Meta publication.
The [release receipt](launch-release-2026-09-12.md) records exact production
workflows, independent smoke checks and the controlled email test. The
[overnight audit](launch-readiness-2026-09-12.md) explains the operations pages,
regional evidence, pending queues and the minimum spending plan.

The three launch regions have 920 accepted decisions and 116 accepted issues.
All 12 named bodies pass the Supported agenda/minutes gate. That does not mean
complete archives. The 170 pending decision targets and other recovery queues
are deferred unless a specific launch claim needs them. Use the nine selected
local examples in the overnight audit instead of processing the backlog.

Meta version 4 is published with the September 16 LPSC agenda and corrected,
reviewed image text. SpaceX version 3 and Boyce version 2 remain published.
All three are LIMITED where evidence is missing. Publishing Meta did not add
supported parishes or activate monitoring.

All 12 source policies are paused, no source run is active, and source AI
spending is disabled. Public Ask has a separate finite allowance through the
end of September 25 Central. Keep OpenAI through judging. Review the Meta
agenda after September 16; authorize only a named gap and bounded work before
any future processing.

- [x] Release owner spending balances, readable Ask citations and reviewed image-text corrections.
- [x] Publish the supported Meta update and verify it appears on an open live page.
- [x] Confirm real verification-code receipt, follow activation and material-update email delivery.
- [x] Open the update email's private follow-management link.
- [x] Release the Ask proceeding-attribution correction and pass the triggering live question without the unsupported filer.
- [x] Receive the controlled inbound email reply, verify its delivered grounded response, and confirm per-follow unsubscribe after reload.
- [x] Owner confirmed the native-phone composer stays reachable and source close preserves reading position.
- [ ] Complete the private resident pilot, final demo, social previews and submission gates below.

The earlier owner operations, loading and mobile reading work shipped in PRs
209, 208 and 207. Their old branch and pending-release notes are superseded by
this checkpoint. The owner has now confirmed the native-phone keyboard and
reading-position check.

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

## September 8 checkpoint

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
| S6 | Accepted Meta, SpaceX, and Boyce source bundles and published versions, with images and current limits | S1 through S5 | Initial development bundles passed; current published versions are Meta 4, SpaceX 3 and Boyce 2, all LIMITED in production |
| S7 | Story-loop release certification on all three stories, exact production release and independent smoke after authorized deployment | S1 through S6 | Development gate passed; exact owner-approved production publication and bounded smoke passed. The September 12 controlled Meta production email loop passed. |

Meta remains the lead on the delivered homepage. Future research is limited to
named gaps in these three stories. No fourth story is required. CCS is deferred;
do not substitute it for the agreed launch set.

The full development evidence is recorded in
[development certification](story-development-certification.md). The approved
production application is `7ababad`; its exact workflow and independent smoke
passed. All eleven source snapshots and three images passed target checks.
No new body or parish was certified and no broad monitoring was activated.
The acceptance checks below describe the completed development gate; the September 12 checkpoint records the controlled production email proof.

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
| September 13 through 15 | Upgrade slices U1, U2, U3; U5 development compile; U6 manifests and drafts; U4 pre-session check | Louisiana-first Home reviewed locally; LPSC gates evaluated in development; measure drafts reviewed |
| September 16 through 17 | U4 session watch and publication; U5 production compile; U6 publication | Outcome published or honestly undocumented; LPSC status known; amendments live |
| September 17 through 19 | Global design and page-by-page QA over the upgraded surfaces, private pilot, U7 drafts and previews | Launch gate passed; major design and feature freeze |
| September 18 through 20 | Public launch, outreach, content, resident feedback, small fixes | Useful live product and permissioned usage evidence |
| September 20 through 21 | Demo and submission artifacts alongside launch support | Submit by September 21 with authorization |
| September 22 | Contingency | Deadline noon Pacific, 2 p.m. Central |
| Through September 25 | Keep public app and operating allowances usable for judging | Monitor errors and source freshness |

If time compresses, protect U1, U2, U3 and U4 first, then the statewide
amendments in U6, then U5. Parish propositions are the first cut. Cut a rich
editor, extra visual variants, archive depth, broad automation, and nonessential
scope before any slice. Do not drop a named story, label a body supported or a
measure current, or count a broken flow as complete to preserve a calendar
target. Escalate the schedule tradeoff while there is time to reserve several
days for outreach.

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

## September 11, mobile chat keyboard and history follow-up

The owner's iPhone screenshot showed standalone Ask panning away while its
recent-history controls remained visible. The floating chat looked correct.
This follow-up freezes the document position during phone chat and prevents
programmatic scrolling of the outer panel. Conversation and textarea scrolling
remain available. Recent device conversations move to Account, including for
signed-out readers. A memory-only handoff restores each conversation and scope.
Three bouncing dots replace the answer-wait card; the send spinner stays.

Local verification passed 685 existing tests, typechecks, build and lint with
15 existing warnings. The new memory-handoff test passed separately. Browser
checks passed the new Account, menu-to-Ask and three-dot states in Chromium and
WebKit, plus the existing chat reopen and nested-source checks. The first
Account fixture run exposed an invalid fixture name, corrected before the
passing rerun. CI and the updated development upload are pending. Native
iPhone keyboard acceptance remains pending.

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

## September 14, clickable Louisiana labels selected

The owner selected round-two option A and authorized a PR, review, merge and
release. Home keeps its current desktop Louisiana size. The three parish labels
open the existing parish view and remember the selection. The chosen preview
restores Louisiana below the introduction on phones. Labels have keyboard focus,
44-pixel phone targets and the same coverage availability as the area picker.
The SVG fallback keeps the selection controls when WebGPU is unavailable.

The implementation is on `feat/clickable-parish-labels`. Local typechecks, all
744 tests, the build and lint pass, with 15 existing lint warnings. Ten browser
checks pass in Chromium and mobile WebKit. The actual 3D render was inspected
at 1440, 390 and 320 pixels. PR checks, reviews and production release are pending.
The comparison-page variations are not part of this change.

## September 14, restore the mobile hero visibility rule

The owner corrected the clickable-label release: Louisiana must stay hidden on
mobile. The canvas, fallback, labels and wrapper now mount only above 48rem.
The desktop size and clickable labels remain unchanged. Mobile readers use
Focus on a parish. Layout and mounting share the same breakpoint, including
exactly 768 pixels. This supersedes the phone visual described above.

Implementation is isolated on `fix/hide-mobile-louisiana`. Typechecks, build and
targeted lint pass. Ten Chromium and mobile WebKit checks pass, including
resize across 768/769 pixels, mobile picker selection and desktop labels.
Screenshots were inspected. PR checks, reviews and production release are pending.

## September 14, issue sharing domain

The owner found that issue sharing replaced the public hostname with the direct
Convex hostname. The isolated fix uses the current site origin and retains
`/share/issues/:slug`, which supplies the issue's evidence-backed social preview.
The existing preview endpoint already serves the public domain and links back
to the public issue timeline. Native sharing, clipboard copying and manual-copy
fallback retain their existing behavior. Local verification passed 744 tests,
both typechecks, build and lint with 15 existing warnings. Browser checks
reproduced the old domain on production and passed all three sharing paths with
the local build on the public origin. PR review and release are pending.
