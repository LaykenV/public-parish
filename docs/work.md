# Current work and launch status

Updated September 21, 2026. This is the only active status and pending-work queue.

Public Parish is launched. The owner confirmed completion of the product and
launch work on September 18, following the September 16 design and founder QA
sign-off. The submission video is accepted as finished. Personal Facebook, X,
LinkedIn and the first five Facebook group posts are published.

## Launch receipt, September 18

These publication receipts come from the owner's confirmation and supplied
links. Group-post permalinks and resident results have not been recorded.

| Deliverable | Receipt |
| --- | --- |
| Public app | https://www.publicparish.com |
| Qualifying app | https://befitting-flamingo-587.convex.site |
| Finished submission video | [YouTube, 2:48](https://www.youtube.com/watch?v=zuOhc5rGgsQ), accepted as-is by the owner |
| X launch | https://x.com/LLVarholdt/status/2100947546864578717 |
| LinkedIn launch | https://www.linkedin.com/feed/update/urn:li:activity:7506714084554383360/ |
| Personal Facebook launch | https://www.facebook.com/layken.varholdt.3/posts/pfbid02BVoz9bg6yM9po47N9rVoTMpoM7R8zctMQVD1M9z6o3p6Y693EHXwRQZVR9d6CLM6l |
| First community batch | Owner confirmed all five posts published, groups listed below |

The first community batch covered What's Up CenLa?, Vermilion Parish, Louisiana
Updates & More, All Things Monroe/West Monroe, What's Up In Acadiana?, and
Lafayette Entrepreneurs & Small Businesses. See the [group report](facebook-launch-groups-2026-09-16.md)
for group links and dated rule observations. Group visibility and engagement
are separate from the owner's posting confirmation.

Launch completion supersedes the old remaining-launch queue. It does not imply
that an LPSC outcome document appeared, that a new provider test ran, or that
the hackathon entry was submitted. Preserve existing publication limits until
new official evidence passes review. The [U4 procedure](upgrade-u4-watch.md)
remains a source-maintenance reference, not an unmet launch gate.

## Next actions through submission and judging

- [x] Read the hackathon skill, preserve the complete root build log, put it in
  chronological order and reconcile the September 11 through 21 release history.
  Add the judge introduction and [form copy](submission-entry.md).
- [x] Release the SpaceX location correction through [PR #267](https://github.com/LaykenV/public-parish/pull/267).
  Both reviews and CI passed. The exact [production workflow](https://github.com/LaykenV/public-parish/actions/runs/35630017027)
  and independent smoke passed for `ae417c9`. Both public origins display
  Vermilion Parish. The published version and its 15 accepted excerpts remain.
  See the [release receipt](https://github.com/LaykenV/public-parish/pull/267#issuecomment-5764505314).
- [ ] Submit the entry and retain its public URL and confirmation. Registration,
  personal eligibility and all four X sponsor tags are owner-confirmed.
  Signed-out repository, video and app checks passed September 21. Target today,
  before September 22 at 2 p.m. Central. Actual submission is not yet authorized.
- [ ] Answer existing comments before expanding distribution. Further posts are
  optional; use the [follow-up copy](submission-entry.md#optional-follow-up-after-submission)
  only when it adds a useful reason to return. Do not repeat the first five groups.
- [ ] Keep Ask, sources and email paths usable through September 25. Diagnose
  incomplete source checks within existing limits and review the dated source
  checkpoints. Preserve visible coverage limitations if a source cannot recover.
  No broad backfill or production-setting change is queued.

The owner asked to keep the existing images if practical. They remain unchanged
with their existing provenance disclosures. Reuse rights are unverified, and
the owner exception is not a license. No infringement has been established by
this audit. The video remains accepted as finished.

### September 21 audit receipt

The owner reports 183 unique browsers, 197 visits, four returning browsers,
two follows and five submitted questions since the September 18 launch.
Founder-activity exclusions were not confirmed. The reported zero evidence
opens cannot measure story engagement because the story drawer omits those
events. These are initial usage signals, not verified resident outcomes.

The audit checked main `7a64f2f` and its successful
[production workflow](https://github.com/LaykenV/public-parish/actions/runs/35613500565).
Baseline verification passed 793 tests, both typechecks, build and lint with
15 warnings. Independent production smoke passed. All 52 distinct saved source
URLs answered HEAD requests. A controlled Ask question and desktop and phone
source views passed inspection. The question is audit activity.
The [audit report](submission-audit-2026-09-21.md) records verification limits
and the final disposition of each finding.

The local cleanup then passed 794 tests across 103 files, both typechecks,
build and lint with the same 15 warnings. The new regression checks the SpaceX
label in reading, Follow, Ask and search while preserving its version history.
The owner then authorized review and release. PR #267, production workflow
`35630017027`, independent smoke and the direct location check passed.
The [release receipt](https://github.com/LaykenV/public-parish/pull/267#issuecomment-5764505314) records the live result.

## Beaver Lake publication, September 18

[Beaver Lake](https://www.publicparish.com/stories/beaver-lake-rapides) is live
with 23 citations across 16 official snapshots. Estimated processing cost was
$1.44 under the owner's $8 ceiling. The [research dossier](beaver-lake-research-2026-09-18.md)
and [build log](../hackathon.md#2026-09-18) retain publication, source and test
receipts. It remains separate from the three featured stories.

- [ ] Review by September 25 for the recorded land option, replacement project,
  site-specific FastSites agreement, actual payments and current industrial tax
  exemption status. Full permit letters remain outside accepted evidence.
  Do not turn public authorizations into a claim of completed spending.

## Meta demo evidence update

The live LIMITED story has eight retained official sources and 27 exact
excerpts following the September 17 update. Fresh review covered text and the
retained image. The [morning report](meta-morning-report-2026-09-17.md) and
[build log](../hackathon.md#2026-09-17) retain publication, source checks,
spending overrun and the broader Ask qualifier issue. No September 16 outcome
has been established. The September 21 session-page check still found August 12
as the latest linked minutes and transcript. Unaccepted permit leads remain
maintenance work below, not published evidence.

## Founder design and QA sign-off

The owner signed off the three-story functionality, Louisiana-first Home,
statewide commission coverage, ten amendment explanations and global design
and QA on September 16. This closes the launch gate. It does not assert a
separate device, screen-reader or provider test without a receipt.
The [September 16 log](../hackathon.md#2026-09-16) and
[archived QA ledger](archive/work-through-2026-09-15.md#qa-ledger) preserve the
iterations. Record new reproducible defects here.

## Released application

The latest application-code release is `ae417c9b9c28ee213657d519de7161db98fd0742`
through PR #267. [Production workflow 35630017027](https://github.com/LaykenV/public-parish/actions/runs/35630017027)
and independent smoke passed. The [release receipt](https://github.com/LaykenV/public-parish/pull/267#issuecomment-5764505314) records
the live SpaceX label on both origins, with its publication revision and 15
accepted excerpts retained. The submission-documentation PR follows this
application release and must have its own exact deployment and smoke receipt.

The earlier September 21 application release was `1bf4d2ed73a8d948b3eb2757f3b811892d568760`,
which includes the reviewed monitoring, Beaver Lake and receipt changes from
PRs #264, #265 and #266. [Production workflow 35610443021](https://github.com/LaykenV/public-parish/actions/runs/35610443021)
passed release verification, backend and frontend deployment, source
configuration, Home indexing and workflow smoke. The production workflow is
active again after the temporary reconciliation pause.

The [release receipt](https://github.com/LaykenV/public-parish/pull/266#issuecomment-5761979522)
records successful independent `npm run smoke:production`, unchanged Beaver
Lake publication with 23 citations and all 16 source downloads available, and
desktop and mobile visual checks. The three featured stories and ten ballot
explanations remain. Local verification passed 793 tests, both typechecks,
build and lint with 15 existing warnings. Jev remains parked.

These are receipts for the named application release. Later documentation-only
pushes run the same production workflow and require verification of their
exact commit and independent smoke. Do not treat this dated receipt as proof of a later run.
The earlier product-release receipts below preserve their original context.

| Released change | Merged PR | Successful production workflow |
| --- | --- | --- |
| SpaceX supported location | [#267](https://github.com/LaykenV/public-parish/pull/267) | [35630017027](https://github.com/LaykenV/public-parish/actions/runs/35630017027) |
| Monitoring and Beaver Lake reconciliation | [#264](https://github.com/LaykenV/public-parish/pull/264), [#265](https://github.com/LaykenV/public-parish/pull/265), [#266](https://github.com/LaykenV/public-parish/pull/266) | [35610443021](https://github.com/LaykenV/public-parish/actions/runs/35610443021) |
| Readable email reply citations | [#263](https://github.com/LaykenV/public-parish/pull/263) | [35243471354](https://github.com/LaykenV/public-parish/actions/runs/35243471354) |
| Email layout and button compatibility | [#262](https://github.com/LaykenV/public-parish/pull/262) | [35236695643](https://github.com/LaykenV/public-parish/actions/runs/35236695643) |
| Statewide commission coverage | [#226](https://github.com/LaykenV/public-parish/pull/226) | [34839377430](https://github.com/LaykenV/public-parish/actions/runs/34839377430) |
| Ten November 3 amendments | [#227](https://github.com/LaykenV/public-parish/pull/227) | [34840513905](https://github.com/LaykenV/public-parish/actions/runs/34840513905) |
| Faster Ask evidence selection | [#248](https://github.com/LaykenV/public-parish/pull/248) | [34980640214](https://github.com/LaykenV/public-parish/actions/runs/34980640214) |
| Utility caption, primary Follow and clearable Explore filters | [#249](https://github.com/LaykenV/public-parish/pull/249), [#250](https://github.com/LaykenV/public-parish/pull/250), [#251](https://github.com/LaykenV/public-parish/pull/251) | [34989843889](https://github.com/LaykenV/public-parish/actions/runs/34989843889), [34990316955](https://github.com/LaykenV/public-parish/actions/runs/34990316955), [34991046919](https://github.com/LaykenV/public-parish/actions/runs/34991046919) |
| Consequence-first Home ranking | [#252](https://github.com/LaykenV/public-parish/pull/252) | [34992012793](https://github.com/LaykenV/public-parish/actions/runs/34992012793) |
| Plain-language drafting prompts | [#253](https://github.com/LaykenV/public-parish/pull/253) | [35019341910](https://github.com/LaykenV/public-parish/actions/runs/35019341910) |
| Ask loading and final centered conversation layout | [#254](https://github.com/LaykenV/public-parish/pull/254), [#255](https://github.com/LaykenV/public-parish/pull/255), [#256](https://github.com/LaykenV/public-parish/pull/256) | [35025482494](https://github.com/LaykenV/public-parish/actions/runs/35025482494), [35027995293](https://github.com/LaykenV/public-parish/actions/runs/35027995293), [35029656918](https://github.com/LaykenV/public-parish/actions/runs/35029656918) |
| Final Home actions and scrolling | [#257](https://github.com/LaykenV/public-parish/pull/257) through [#260](https://github.com/LaykenV/public-parish/pull/260) | [35038848675](https://github.com/LaykenV/public-parish/actions/runs/35038848675) |

These receipts replace the old "local only" and "awaiting merge" notes. Prompt
release #253 does not mean existing publications were rewritten or that generated
draft quality was measured. The [Ask release receipt](https://github.com/LaykenV/public-parish/pull/248#issuecomment-5681951034)
records the completed production index backfill and a production weekly answer
in 58.766 seconds, compared with 169.022 seconds before. This is one observed
comparison, not a latency guarantee. That receipt and the
[centered Ask release receipt](https://github.com/LaykenV/public-parish/pull/256#issuecomment-5688832283)
record independent production smoke for those exact releases.

## Published evidence and operating limits

The three featured stories, ten amendments and Beaver Lake remain published
with explicit limitations. At the September 21 audit, eight of thirteen bodies
were Degraded, all seven Lafayette bodies and Alexandria City Council. The live
selector reports Lafayette and Rapides as limited and East Baton Rouge as
available. Saved accepted records remain readable. The September 14 Supported
receipt is historical; it is not the current health report.

Ask and source-model allowances were enabled with about $19.90 and $18.87
remaining before the audit's controlled Ask. Both expire October 3 at 05:00 UTC,
covering October 2 Central. This does not verify Firecrawl credit balance or
Convex billing headroom. Thirteen monitoring policies retain the September 11
source cutoff, 24-hour interval, one document and target per run, fifteen calls
per body per day and a global 120-call daily ceiling. Recent incomplete runs
include budget and provider-rate deferrals. See [the audit](submission-audit-2026-09-21.md#diagnose-source-health-and-close-overdue-reviews)
and [operations](operations.md) before diagnosing or changing limits.

The [September 12 production receipt](launch-release-2026-09-12.md#production-email-and-phone-proof)
records verification, update delivery, a grounded reply, management access,
per-follow unsubscribe and the owner phone check. September 17 emails were
delivered in the recorded follow-up tests; a new reply and real inbox layout
confirmation remain unverified. No new email round trip ran in this audit.

## Ongoing maintenance and later improvements

These are follow-up tasks after launch, not a new feature cycle before submission.

- Diagnose degraded source policies and provider pacing within current limits.
  The September 21 audit replaces the missed September 19 status check; it does
  not establish recovery. Reconcile elapsed Meta, SpaceX, Boyce and amendment
  review dates against new official evidence. Keep missing-outcome disclosures.
- Follow the [Meta research leads](meta-morning-report-2026-09-17.md#important-findings-outside-the-published-evidence),
  especially the September 29 Corps deadline. Retrieve and review the actual
  permits and resolve the utility progress report's budget inconsistency before
  adding claims. Further paid retrieval needs a finite allowance after the
  September 17 overrun.
- Repair story and ballot evidence-open telemetry before using that counter to
  evaluate distribution. Do not reconstruct missing historic events or call
  browser identifiers distinct residents. Collect permissioned feedback.
- Preserve the [readability audit](readability-audit-2026-09-15.md) follow-ups,
  including its saved model-evaluation inputs, Lena-Flatwoods stage mismatch and
  the library-tax hearing line. The September 17 broader Meta Ask omitted
  "material" from a transmission-cost condition. A narrower answer passing does
  not close that issue.
- Watch Ask latency in real use. PR #248's production index backfill and benchmark
  are complete; do not replay them from an old checkbox. Confirm the latest
  email citation layout when the owner next replies to the tracked test email.
- After judging, evaluate cheaper models before historical catch-up. Do not
  widen coverage, switch models or publish parish propositions without the
  existing source and independent-review gates. Preserve image provenance until
  reuse permission or a replacement is documented.

## Hackathon artifacts

- [x] Retain the accepted [2:48 video](https://www.youtube.com/watch?v=zuOhc5rGgsQ),
  [master](demo/public-parish-launch-demo.mp4), [captions](demo/public-parish-launch-demo.srt)
  and [export details](demo/README.md). The founder-test email is labeled.
- [x] Retain launch links, confirmed X sponsor mentions, registration and
  eligibility. Signed-out app, repo and video checks passed September 21.
- [x] Prepare [the form copy](submission-entry.md), [screenshots](submission-assets/README.md)
  and the complete chronological [build log](../hackathon.md).
- [ ] Retain the actual vibeapps.dev entry URL after authorized submission.

## History and handoff

[hackathon.md](../hackathon.md) contains the complete build narrative.
[Work history through September 15](archive/work-through-2026-09-15.md) and dated
reports retain detailed receipts. Earlier "pending" sentences describe their
session; this file alone owns current work.

Keep the three-story scope, evidence gates and weekday 90-minute Varholdt sales
block. Read [PLAN](../PLAN.md), [architecture](architecture.md), [sources](sources.md),
[design](design.md) and [operations](operations.md) before changing behavior.
Do not mark a post, official outcome, provider test or submission complete
without evidence.

## Email design, released September 17

Released as `b69b13e`. The [September 17 build log](../hackathon.md#2026-09-17)
retains design previews, the fixture failure and repair, CI, production smoke
and the subsequently requested one-off delivery. Inbox rendering is not certified.

## Email compatibility correction, September 17

Released as `f278f99`. The [September 17 build log](../hackathon.md#2026-09-17)
retains the reproduced owner failure, 90 preview variants, transparent PNG,
contrast result and verified release. Real inbox confirmation remains open.

## Tracked Meta alert recovery, September 17

The [September 17 build log](../hackathon.md#2026-09-17) records the ignored preview
reply, owner-authorized follow and delivered tracked alert. A new reply to that
tracked thread is needed; the ignored preview does not retry automatically.

## Question reply citations, released September 17

Released as `d563bcb`. The [September 17 build log](../hackathon.md#2026-09-17)
records the citation layout, verification and tracked-thread resend. The owner
kept the AgentMail sender name. Latest citation layout confirmation needs a reply.

## Production release reconciliation, September 21

Completed through PRs #264, #265 and #266. The [September 21 build log](../hackathon.md#2026-09-21)
records the earlier working-tree deployments, review, temporary workflow pause,
restoration and successful coordinated release. No new source publication,
model allowance or email delivery was part of that reconciliation.
