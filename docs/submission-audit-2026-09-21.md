# Submission audit, September 21

Public Parish has a working app and a complete demo. The entry copy,
screenshots and chronological build-log cleanup are prepared. The SpaceX
location correction is released and verified through PR #267. Submit after the
final form check. More launch posts, new features and another demo recording
are unnecessary.

This audit checked commit `7a64f2f1b606dd6eb0060833e77c08cd3946104e`, the public
app, organizer rules, submission form, repository, documentation, operating
counters and selected resident journeys. [Current work](work.md) owns pending
actions. This report preserves the findings at this checkpoint.

## Cleanup disposition

| Finding | Result of the requested cleanup |
| --- | --- |
| Build history | Preserved all 168 original dated entries, normalized six embedded sessions, added eight verified release and research receipts, and sorted the log oldest to newest |
| Judge introduction | Added a signed-out walkthrough, sponsor implementation evidence and qualified launch metrics while keeping the complete root log |
| Submission package | Prepared [form copy](submission-entry.md) and [two inspected screenshots](submission-assets/README.md); no submission made |
| SpaceX location | Released through PR #267 as `ae417c9`; [workflow](https://github.com/LaykenV/public-parish/actions/runs/35630017027), independent smoke and live location checks passed; immutable versions and URLs remain |
| Validation | Cleanup passes 794 tests across 103 files, both typechecks, build and lint with 15 existing warnings; live smoke passed before and after the correction |
| Images and video | Retained existing assets as requested; unverified image reuse rights remain disclosed and are not represented as cleared |
| Source health | Current degradation and elapsed review checkpoints remain maintenance work within existing limits; no recovery or fresh government outcome is claimed |
| Analytics | Kept the instrumentation gap explicit; deferred the code change and omitted unqualified usage claims from the entry |

The earlier suggestion to shorten the root log and archive its full history is
superseded. The hackathon skill calls for a chronological build log, and the
owner asked to retain the full process there. `docs/work.md` remains the smaller
active checklist required by this repository.

## Requirements and artifacts

The [organizer page](https://www.convex.dev/hackathons/all-gas), checked September
21, sets the deadline at September 22, noon Pacific, 2 p.m. Central. It requires
a new app started on or after August 25 at noon Pacific, a public repository,
root build log, qualifying public host, sponsor integrations and a video under
three minutes. It asks for all four sponsor tags on X or LinkedIn. Its rules
also require original work that does not violate intellectual property rights.

| Requirement | Evidence and remaining limit |
| --- | --- |
| Registration and personal eligibility | Owner confirmed both during this audit |
| New application | First repository commit is August 27; project history identifies a fresh application |
| Public repository | GitHub reports PUBLIC; signed-out access works |
| Qualifying app | `https://befitting-flamingo-587.convex.site` opens without an invitation; canonical domain also works |
| Video | Signed-out YouTube page loads the accepted demo and reports 168.221 seconds |
| Sponsor sharing | Owner confirmed all four linked mentions in the existing X post; LinkedIn post and demo comment are publicly readable |
| Sponsor integrations | Registered components, production code and dated execution receipts establish real use |
| Root build log | Present, but the starting file has 2,711 lines, 168 entries and about 22,400 words |
| Image rights | Unverified for the three featured renderings; see the finding below |
| Submission | No submission receipt exists; this audit did not submit |

X rejected automated signed-out retrieval. The owner's confirmation establishes
the tags, not an independent inspection of that post. Another launch post is
unnecessary to satisfy the tag requirement.

## Current verification

- `npm run verify` passed both typechecks, 793 tests across 103 files, build and
  lint. Lint retains 15 warnings and no errors.
- The exact current [production workflow](https://github.com/LaykenV/public-parish/actions/runs/35613500565)
  passed. Independent `npm run smoke:production` passed during this audit.
- Both public origins, the apex redirect, resident routes, search, issue
  evidence, featured stories, images and share metadata passed smoke checks.
- All 52 distinct saved source URLs across the three featured stories, Beaver
  Lake and ten amendments returned HTTP 200 to HEAD requests. The demonstrated
  Meta order and its saved copy also downloaded as matching-length PDFs.
  Reachability alone does not revalidate every factual claim.
- A signed-out story Ask answered the early-termination-fee question using the
  relevant order excerpt. The two model attempts succeeded with about $0.0074
  in recorded estimated model charges. This is controlled verification.
- Inspected desktop and 390-pixel phone screenshots of Meta reading and its
  source drawer. Controls fit, and the inspected pages had no horizontal overflow.
- The active Markdown files checked had no broken relative file links. A narrow
  scan found no tracked private-key, OpenAI-key or GitHub-token pattern matches.
  This is not a complete secret-history audit.

The security review sampled owner authorization, anonymous Ask ownership,
accepted-evidence checks, email sender and thread checks, webhook verification
and their regression tests. It found no new confirmed access-control defect in
those paths. It does not certify every endpoint. No new Google sign-in, real
email round trip, screen-reader session or live publication update ran here.
The [September 12 receipt](launch-release-2026-09-12.md#production-email-and-phone-proof)
retains controlled email, reply, unsubscribe and realtime publication evidence.
The [September 17 Meta check](meta-morning-report-2026-09-17.md#live-verification)
recorded an omitted qualifier in a broader Ask answer. Today's focused question
does not close that observation or establish that every generated answer is correct.

## Findings to address

### Correct the SpaceX geography

At the initial audit, the live Home card and story said "Pecan Island, Vermilion
Parish." None of the
15 public accepted excerpts contains "Pecan Island." [PLAN.md](../PLAN.md#approved-launch-scope)
explicitly says the accepted evidence does not establish that precise site.
The frontend prints the published version's geography in
[story-page.tsx](../src/features/stories/story-page.tsx), so this is published
metadata, not merely an old route name.

The released correction uses the approved parish in `convex/stories/registry.ts`
for reading, Follow, weekly email and Ask context. Search already displays the
registered parish and uses the corrected geography when indexed. Share metadata
does not display the geographic label. A regression covers the public queries,
follow target, Ask context, search indexing and preserved version history.
No immutable record, citation, publication or slug changed. The
[release receipt](https://github.com/LaykenV/public-parish/pull/267#issuecomment-5764505314) records passing CI, both reviews, exact production
workflow and independent smoke. Direct checks found Vermilion Parish on both
origins with the same publication revision and 15 accepted excerpts.

### Resolve the rendering rights gap

[ownerMedia.ts](../convex/stories/ownerMedia.ts) and the live story responses
explicitly label all three renderings as having unverified reuse rights. Two
also have no verified original creator. The owner exception permits publication
within the app; it does not supply rights from a creator. The MIT repository
license does not establish permission for these assets.

The owner requested that the existing images be kept if practical. This pass
retains them, their provenance disclosures and the accepted video. It does not
establish infringement or clear reuse rights. Record permission or a replacement
if obtained later. Do not describe the exception as a license or the renderings
as project-owned artwork.

### Diagnose source health and close overdue reviews

At the audit checkpoint, eight of thirteen bodies were Degraded: all seven
Lafayette bodies and Alexandria City Council. Five remained Supported. The
selector reports Lafayette and Rapides as limited and East Baton Rouge as
available. Existing accepted records remain readable.

The latest 100 monitoring runs contained 94 incomplete and six completed runs.
Of the incomplete runs, 33 recorded daily-limit deferrals and 19 recorded
provider-rate deferrals. Ten open incidents carry the generic monitoring-failed
code. These figures do not mean 94 failed provider calls. The sampled ledger
does not identify one cause for every degraded body.

The separate model allowances were enabled, with about $19.90 left for Ask and
$18.87 for sources before this audit's Ask test. Both expire October 3 at
05:00 UTC, covering October 2 Central. Those balances do not establish remaining
Firecrawl credits, provider rate capacity or the Convex team's billing headroom.

The featured stories' planned review dates are September 19 for Meta and
September 18 for SpaceX and Boyce. All ten amendments show September 17. Beaver
Lake's September 25 review is still ahead. Automatic body monitoring does not
perform these curated reviews.

Use a finite diagnostic pass on the affected policies and named review sources.
Distinguish queue progress, provider pacing and a source defect before changing
limits. Preserve the coverage gates. If a source cannot recover before the
deadline, retain its visible limitation and describe the scope accurately in the
entry. Do not hold submission for archive completion or an unavailable outcome.

The official [LPSC session page](https://lpsc.louisiana.gov/Agenda), checked
September 21, still lists August 12 as its latest minutes and transcript.
This check does not establish the September 16 motions' outcome or complete a
review of every Meta source. Keep the existing missing-outcome statement.

### Repair story evidence telemetry before interpreting the zero

The story source selector in
[story-page.tsx](../src/features/stories/story-page.tsx) opens the drawer without
calling `recordCivicEvent`. Its `SourceActions` also omits the official-source
callback. Ballot pages reuse this component. The shared issue and Ask viewer in
[evidence-surface.tsx](../src/features/evidence/evidence-surface.tsx) records both
events.

A browser check intercepted telemetry locally, opened a story citation and
observed no event. The zero in the launch report therefore cannot establish
that no one inspected evidence. Add the existing event calls to the story path
and verify them without sending synthetic resident events. Past missing opens
cannot be reconstructed from this counter.

This does not stop a resident reading evidence and is not an eligibility gate.
It is a small worthwhile correction before measuring further distribution.

### Make the build log readable at first glance

The original log moved backward from September 10 to August before moving
forward again. September 11 through 21 work was already present, but several
development entries lacked a final release receipt.

The local cleanup preserves the entire root history, normalizes six embedded
September 11 session headings, restores chronological order and adds eight
release or research receipts. A judge introduction carries the app, video,
walkthrough and sponsor proof. Stable day links connect the active checklist
to the history. The Started timestamp now matches the first retained meaningful
commit in UTC. Original entry bodies were checked for preservation.

The active checklist points completed email and publication history at the log,
records current source limits and links the entry. Architecture, source
contracts, manifests, gold sets and dated reports retain their paths. README
puts the public app, demo and build log before development setup.

## What the launch numbers establish

The owner supplied these internal analytics totals for Friday's September 18
launch through the September 21 report. Exclusion of founder activity was not
confirmed. They are owner-reported launch-window figures, not an independently
reconstructed cohort.

| Metric | Reported total |
| --- | ---: |
| Unique browsers | 183 |
| Visits | 197 |
| Returning browsers | 4 |
| Follows created | 2 |
| Ask questions submitted | 5 |
| Evidence opened | 0, incomplete story instrumentation |

These show initial reach and some actions. They do not establish 183 distinct
residents, two new unique followers, successful answers to all five questions or
a resident who benefited from an update. The raw production reports are lifetime
counters that include earlier testing; do not substitute those larger totals
for this launch window. Browsers on the two origins can count separately.

This audit made one controlled Ask submission. Its first public browser load
may have counted as a visit before the audit enabled analytics opt-out. Later
browser checks used opt-out or locally intercepted telemetry. Keep this audit's
activity separate from any new launch-window report.

## Submission presentation and distribution

Lead with one resident journey. The strongest demonstration connects a claim to
an official passage, answers a question within that evidence and continues by
email. Distinguishing an announcement, an approval and an undocumented outcome
is more memorable than listing every page in the app.

| Sponsor | Concrete work and inspectable proof |
| --- | --- |
| Convex | Schema, immutable storage, durable workflows, authenticated accounts, session-owned chat and reactive queries in [convex](../convex/), with [registered components](../convex/convex.config.ts) |
| Firecrawl | Official-source discovery and retrieval in [sources](../convex/sources/), [ingest](../convex/operations/ingest.ts) and the retained source receipts |
| OpenAI | Extraction, separate review and Ask through AI Gateway in [provider](../convex/ai/provider.ts), [review](../convex/review/review.ts) and [answer](../convex/ask/answer.ts) |
| AgentMail | Verified subscriptions, sourced delivery and inbound questions in [agentmailClient](../convex/follows/agentmailClient.ts), [emailReplies](../convex/emailReplies/) and the [controlled production receipt](launch-release-2026-09-12.md#production-email-and-phone-proof) |

One useful X or LinkedIn follow-up is reasonable after the corrections. Reuse
the demo and describe one concrete capability, such as replying to a sourced
update email. Include the existing working links and accurate sponsor mentions.
Do not claim organic email outcomes from the founder test. Reply to existing
comments first. A small permissioned resident session with specific feedback
would add more evidence of usefulness than another broad launch announcement.

Further Facebook distribution is optional. Use one or two relevant groups only
when their rules allow it and there is time to answer. Do not postpone the entry,
repeat the first batch or start a new content campaign. Keep the weekday sales
block intact.

## Entry preparation

The live [submission form](https://vibeapps.dev/submit) asks for a title, a tagline
of at most 140 characters, description, website, creator, tags and optional
assets. Its generic form calls video and GitHub optional, but the hackathon
requires them. Select `AllGasHackathon` and the applicable sponsor tags. A
clear product screenshot is useful. Use the qualifying host as the website.

Exact fields, description and optional follow-up copy now live in
[submission-entry.md](submission-entry.md), with screenshots in
[submission-assets](submission-assets/README.md). The draft does not claim
"183 users." The build log and this report retain the owner's metrics with
their measurement caveats. Submission, posting and deployment remain separate
actions. The owner authorized the reviewed release after the initial local
cleanup. No social post or hackathon submission was made.
