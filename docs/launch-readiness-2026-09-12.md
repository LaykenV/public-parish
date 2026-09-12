# Launch preparation, September 12

This is the overnight audit snapshot. The [release receipt](launch-release-2026-09-12.md)
records the subsequent production fixes, Meta publication and email checks.

The app has enough published evidence for a focused launch in Lafayette,
Rapides and East Baton Rouge. The most useful next work is a current Meta
update, reliable Ask access, and proof of the resident email loop. Processing
the remaining archive would spend money without proving those things.

This session prepared local fixes and one targeted production story candidate.
It did not deploy code, publish a story, send email, post publicly or submit the
hackathon entry. The final Meta candidate needs an image-description correction
and fresh review before publication. The current public version remains intact.

## What improved

- All 12 source monitoring policies are now paused. Source AI spending is also
  disabled. The old Metropolitan Council policy can no longer restart the
  backlog when an operator funds a source task.
- Ask received a separate $5 increment and an expiry at the end of September 25
  Central. Nine controlled production questions used $0.096788 of that increment.
- One new three-page LPSC agenda was retained through the existing Firecrawl
  pipeline. Six existing Meta sources were reused without retrieval.
- Local owner screens now show separate source and Ask balances, guard status,
  expiry and outstanding reservations. They explain why a configured monitor
  can still be blocked. Public source-health copy no longer equates a configured
  schedule with current paid processing.
- A local Ask presentation fix replaces bare validated evidence IDs with
  readable source references. Citation controls keep their exact evidence IDs.
- The story correction API and owner editor now support image alt-text repairs.
  A correction preserves the image and prior version, creates a new candidate,
  and requires another independent review.

The code is in the isolated `launch/overnight-readiness-20260912` worktree based
on main `b287c40`. Existing work in the original checkout was preserved. These
are local changes, not a production release. Keep the budget display, Ask text
and image-description repair separate when filing their PRs.

## Spending and current controls

| Scope | Session charge | Remaining configured allowance | State |
| --- | ---: | ---: | --- |
| Targeted source work | $0.077956 | $1.922044 | Disabled |
| Controlled Ask checks | $0.096788 | $4.903212 | Enabled through September 25 Central |
| Total model ledger charge | $0.174744 | | |
| Firecrawl retrieval | 7 credits | 93 of the initial 100-credit task ceiling unused | No further retrieval scheduled |

These are application estimates and provider-reported credits, not invoices.
The model ledger does not cover this coding session, hosting, storage, email,
or a conversion of Firecrawl credits to dollars. The source ceiling is
$6.401016 with $4.478972 charged. Ask's ceiling is $5.123635 with $0.220423 charged.
Ceilings include historical charges; configuring an allowance never resets them.
No broad backfill or model migration was started.

The session used $2 of the proposed source allocation as a finite available
tranche, then disabled it. The unallocated source funds and contingency were
not enabled. Do not treat the total proposed budget as money that must be spent.

Historical usage supports the owner's concern about the large run. Recorded
production model estimates total about $206.59, and development adds about
$26.28. September 6 alone accounts for about $196.46 in production. These totals
come from daily usage aggregates and do not reconcile the reported $250 invoice.
Some calls lack dollar estimates, including older story work. The largest
production categories were decision processing at $117.47 and monitoring at
$88.68. Reusing completed work matters more than changing a label on the model.

## What data we have

These are database counts from this session, not the public list query's page
limits. They describe current accepted versions. LIMITED records retain stated
evidence gaps and must not be presented as fully documented outcomes.

| Parish | Accepted decisions | Full / limited | Accepted issues | Full / limited |
| --- | ---: | --- | ---: | --- |
| Lafayette | 128 | 40 / 88 | 6 | 4 / 2 |
| Rapides | 180 | 64 / 116 | 32 | 25 / 7 |
| East Baton Rouge | 612 | 86 / 526 | 78 | 29 / 49 |
| Total | 920 | 190 / 730 | 116 | 58 / 58 |

All 12 named launch bodies report Supported for the agenda/minutes coverage
contract. That does not promise a complete archive or uninterrupted monitoring.
There were 314 retained snapshots before this task; the new Meta agenda adds
one. Three statewide stories are active, all LIMITED. Story publication does
not promote Richland or Vermilion into full parish coverage.

Pending work remains substantial:

| Queue | Observed state | Launch treatment |
| --- | --- | --- |
| Decision inventory | 1,183 targets: 966 published, 170 pending, 6 failed, 41 withheld | Leave broad processing paused |
| Pending targets by body | Metropolitan Council 153, EBR Planning 16, Rapides Police Jury 1 | Select only a target needed for a named launch claim |
| Monitored documents | 454, with 203 not inventory-complete, including 54 discovery-only rows | A discovered document is not published evidence |
| Issue proposals | 149 proposed, 159 ambiguous, 190 failed, 463 no-match | Review selected links only; 173 failures say recovery stopped |
| Source incidents | Four older open incidents | Inspect exact failed URLs before closing or retrying |
| Older story candidates | Two reviewed builds predate the current story generation | They are stale, not ready-to-publish work |

Inventory publication counts include processing history and are not a count of
unique current decisions. The database contains 953 decision identities and
238 issue identities, so identities without accepted versions must not be added
to the public totals.

## Story evidence and freshness

Meta has a substantive update. The official
[revised September 16 LPSC agenda](https://lpsc.louisiana.gov/docs/agenda/Sept_16_2026_Agenda_Revised.pdf)
lists two procedural matters in U-37882. It schedules the session for 9 a.m. in
the Galvez Building's first-floor Natchez Room. It does not establish a vote
outcome or final approval of the expansion. The May procedural order's December
16 consideration date remains separately attributed.

Bundle 7 adds exact retained excerpts and a September 16 review date. The draft
and image-retention candidates passed independent LIMITED reviews. The final
review accepted every factual text field but rejected the inherited image alt
text's description of visible ponds as "retention ponds." The revised alt text
is prepared as "Rendering of a multi-building data-center campus surrounded by
roads, fields and ponds." The deployed correction API cannot edit alt text yet.
The local repair adds that path. Do not publish an earlier candidate to evade
the later finding. After release, prepare the corrected candidate and require
fresh review before exact owner approval. A material story publication may send
update notifications to existing followers.

SpaceX's published evidence supports the announcement and describes reviews
and conditional legislation. It does not establish that the project meets Act
874's qualifying conditions or has an FAA authorization. Live Ask preserved
those limits. The LED project page remains a useful source; this check does not
certify a complete current permit search.

For Boyce, the newer
[July 23 England Authority minutes](https://englandairpark.org/wp-content/uploads/2026/09/2.1-Regular-Session-Minutes-7.23.2026.pdf)
and August 27 agenda did not provide a matching project action. I did not pay
to process those documents. The story still lacks an executed final tax agreement
and payment schedule. Live Ask stated that limitation and declined to invent a
payment. A reviewed-through date should not be advanced by a direct database edit.

All three published versions had a September 10 next-review date. This session
found the Meta update and performed the bounded SpaceX/Boyce checks above. It
does not claim their full research dossiers are now complete.

## Local issues to use for launch

These nine existing issues provide a useful selection without another model
batch. Each returned published evidence. Eleven distinct cited source URLs
returned HTTP 200 with content during the direct link check.

| Parish | Existing issue | What to say accurately |
| --- | --- | --- |
| Lafayette | [Johnston Street](https://www.publicparish.com/issues/johnston-street-ownership-changes-and-safety-improvement-funding-0c96b703) | Approved street-ownership and safety-funding actions |
| Lafayette | [Grid resilience funding](https://www.publicparish.com/issues/fy-25-26-budget-amendment-for-the-system-hardening-and-resiliency-proj-be43b7c8) | A proposed budget amendment, not established adoption |
| Lafayette | [Transit grant](https://www.publicparish.com/issues/fta-section-5307-grant-and-required-match-for-transit-division-a46034ef) | Approved federal grant and required local match |
| Rapides | [Cotile Lake fees](https://www.publicparish.com/issues/cotile-lake-and-recreation-area-fees-amendment-7e8f29a8) | Distinguish the proposed fee terms from final adoption |
| Rapides | [Pineville annexation](https://www.publicparish.com/issues/annexation-proposal-and-hearing-for-3419-hwy-165-f5856f27) | Records call a September 29 noon hearing |
| Rapides | [Pafford EMS](https://www.publicparish.com/issues/pafford-ems-contract-motion-and-december-2025-report-motion-32fb0dc3) | Contract actions and required reports, with their individual statuses |
| East Baton Rouge | [Traffic-signal maintenance](https://www.publicparish.com/issues/full-signals-maintenance-agreement-for-the-fiscal-year-ending-june-30--ee81c8c3) | Council authorized the fiscal-year agreement |
| East Baton Rouge | [Bluebonnet pump station](https://www.publicparish.com/issues/bluebonnet-blvd-pump-station-improvements-ce-i-entity-state-agreement-4fc3061d) | Council authorized the state agreement |
| East Baton Rouge | [LAZ Parking](https://www.publicparish.com/issues/laz-parking-contract-amendment-2e30a723) | The proposed one-year extension became six months |

Ten of twelve official coverage roots returned HTTP 200. Alexandria and Rapides
Police Jury roots returned HTTP 403 to this direct client. That result does not
prove an outage for residents or for Firecrawl. Pineville lists a September 8
agenda. EBR lists September 9 and 16 Metro agendas and September 21 Planning.
Those are follow-up leads, not newly accepted Public Parish evidence. Some
follow-up document requests also returned 403. No broad retry was started.

## How to use the operations screens

`/operations/coverage` is the control room for ongoing local evidence. Source
monitoring shows each policy and its limits. Pause stops subsequent admitted
work; requests already issued can finish. Check now uses the same limits as a
scheduled run. Retry failed decision should follow diagnosis of that exact
failure. Neither button overrides an exhausted or disabled AI allowance.

Coverage compiler starts a checked official root through identity, retrieval,
validation and promotion gates. It is for establishing or repairing a body's
coverage. It is not the button to press when an existing story needs one new
source. Run ledger shows which stage failed and why. Source incidents, issue
proposals and delivery failures are different queues with different remedies.

Usage shows provider-call details and delayed daily totals. Missing estimates
are unknown, not zero. After the local budget panel ships, start there before
any paid task. A funded source allowance still requires an enabled source
policy for automatic monitoring.

`/operations/stories` manages the three curated stories. Select a staged bundle,
inspect exact sources, reuse saved artifacts, prepare a candidate, and read its
independent review. Missing or changed bytes require a corrected manifest, not
an invented citation. Correct this draft creates another reviewed candidate.
The local repair also exposes caption and alt-text corrections. Approval
publishes the exact version. Withdrawal removes the active story from public
reading. Neither action expands supported parish coverage.

## Verification and its limits

`npm run verify` passed both TypeScript checks, all 692 tests, the production
build and lint. Lint reports 15 existing warnings. Fourteen synthetic owner
browser checks passed in Chromium and WebKit, including narrow layouts, owner
gates, balances and the alt-text correction request. Screenshots were inspected.
The new correction test proves that image bytes and the accepted version remain
unchanged and that review and approval are not copied into a correction.

Production HTTP and application-query smoke passed on the qualifying host and
canonical domain. Twenty-six browser route checks covered Home, all three stories
and all nine selected issues in desktop Chromium and phone-sized WebKit without
page errors or horizontal overflow. A further 24 live interaction checks opened
source drawers, selected email-only follows and entered unsubmitted Ask drafts
on those stories and issues in both browsers. No email was sent by these checks.
These are browser checks, not native iPhone keyboard certification.

Nine production Ask cases checked three stories, three local issues and three
unsupported questions. All three unsupported questions returned not-found.
Supported answers preserved the SpaceX qualification limits, Boyce agreement
gap, Johnston funding, proposed Cotile terms and six-month LAZ extension. The
Meta answer accurately described the subpoena vote but could be more explicit
that it did not establish expansion approval. These are a bounded sample, not
proof that every possible answer is correct. Controlled QA generates activity
counters and must not be presented as organic resident use.

## Smallest remaining launch plan

1. Release the reviewed image-description repair, then correct and independently
   review Meta bundle 7. Inspect its new next action and publish only the exact
   accepted candidate. Recheck after the September 16 session before recording
   a demo that describes the agenda as upcoming.
2. Release the budget visibility and Ask presentation fixes. Keep source policies
   paused. Leave Ask funded separately and review its balance daily through judging.
3. Use the nine local issues above for founder QA and the demo. Process an extra
   record only if it changes one of those explanations or supplies a necessary
   story claim. Start a named source task with a small finite tranche and at most
   one diagnosed retry. Stop when its deliverable is met.
4. Complete the owner-assigned production email verification, native phone check,
   and a small private resident pilot. The email proof must include receipt,
   grounded reply, management and unsubscribe. Opening the form is not delivery.
5. Record the existing 2:45 demo plan using accepted evidence. Check the final
   video and public links, then submit after authorization. Preserve the founder's
   weekday 90-minute Varholdt sales block.

After judging, benchmark a cheaper provider against the same supported and
unsupported questions before migration. Preserve separate extraction and review
models, exact citations and the spending guard. No provider or model changed here.

The full archive, old no-match proposals, additional parishes and a fourth story
can wait. Launch depends on useful, accurate public paths and working delivery.
