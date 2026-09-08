# Morning report, September 8, 2026

Production is ready to begin the global design and founder QA pass. The targeted Lafayette catch-up is published, Meta and SpaceX have stronger accepted evidence, and the release checks passed. Boyce remains published with its existing supported claims and explicit gaps. Full archive completion and founder QA are not claimed.

## Lafayette catch-up

The pipeline published five LIMITED versions across four distinct Youngsville decisions:

- [Ordinance 517-2026](https://www.publicparish.com/decisions/1ce6d711902444c99ecf9e8157de98b59b4ac131d09e447c75396a04bee496bc). The August minutes establish introduction of gas-station regulations. The September agenda supplies the later scheduled hearing and final-adoption item. It does not prove the future vote occurred.
- [Resolution 2026-25](https://www.publicparish.com/decisions/7cf8f7a77bfd0f77db3d0adc6fc42681146a896a17d7eb8a6c4f4a02f9af6478), a proposed $50,000 road-funding agreement.
- [Resolution 2026-24](https://www.publicparish.com/decisions/b6d3363924f76215434168266bdb94f394ddf26df94571d68f8e2ff14080e4f3), a proposed $200,000 road-funding agreement.
- [Ordinance 518-2026](https://www.publicparish.com/decisions/e218db72c049bd0249182c8acedfab9934ed929e598fdc7f410a6cdc10950aae), introduction of a proposed 196.778-acre annexation.

All four anonymous public queries returned current LIMITED records. All four canonical routes returned HTTP 200. These are atomic decision records, not four new issue timelines.

The retained official sources are the [August 13 minutes](https://www.youngsville.us/wp-content/uploads/2026/08/8.13.26-minutes.pdf) and [September 10 agenda packet](https://www.youngsville.us/wp-content/uploads/2026/09/9.10.26-Agenda-Packet.pdf). The pipeline retained all five and 28 pages respectively. Downloaded raw and normalized storage bytes matched their hashes.

Two initial extractions failed because Firecrawl retained `&amp;` while model excerpts used the visible ampersand. PR 186 preserves stored offsets while accepting that exact encoding difference. Its regression cases reject changed amounts, changed names and double encoding. After release, the two failed targets and the September hearing entry all passed extraction, independent review and LIMITED publication without another scrape.

The live coverage query returned Supported for all seven Lafayette bodies and all twelve launch bodies. This certifies the named source types and publication path. It does not claim a complete archive or continuous monitoring of every body.

## Statewide story evidence

Meta bundle v5 adds the [August 20, 2025 LPSC minutes](https://lpsc.louisiana.gov/docs/minutes/August-20-2025-Minutes.pdf). Exhibit 5 connects the U-37425 utility settlement to Meta's Holly Ridge data center and records a 4-to-1 vote. The [August 12, 2026 minutes](https://lpsc.louisiana.gov/docs/minutes/August_12_2026_Minutes.pdf) separately record a 3-to-1 subpoena ruling in U-37882. That ruling does not approve the underlying expansion application. The exact retained draft and image passed 23 development checks and 23 final production checks before publication.

SpaceX bundle v3 adds [Act 874 of 2026](https://www.legis.la.gov/legis/ViewDocument.aspx?d=1481505). The revised story explains the acreage and authorization conditions and the stated exceptions. It does not claim the proposed site qualifies. Its title uses the officially supported Vermilion Parish location. Fresh review identified an ambiguous place reference in the retained image caption; the corrected caption now says the depicted project and attribution are unverified. The combined development and final production candidates each passed all 28 checks before publication.

Both revisions retain the owner's exact image bytes and their existing rights disclosures. PR 187 lets an owner retain the current accepted image when source evidence changes. PR 188 permits a bounded caption correction. Both paths require fresh independent review and copy no approval or review into the new candidate.

Production reused every unchanged source. Signed transfers moved only the three missing official artifacts and retained their original retrieval times. Hash verification covered raw and normalized bytes. Production used signed accepted writing, then ran its own independent reviews.

For Boyce, the [England Authority minutes index](https://englandairpark.org/england-authority/commission-minutes/) still lists June 25 as the latest regular-session minutes. The current research does not establish an executed project agreement. No paid Boyce reprocessing was justified.

All three stories remain LIMITED. Missing permits, executed agreements, surveyed boundaries and measured outcomes remain explicit gaps. The LDEQ Laidley air-permit notice is a research lead, not a granted Meta permit. SpaceX's project-specific FAA and environmental approvals remain unproven. These gaps prevent stronger claims, not a design and QA pass on the supported resident experience.

## Release and verification

| Change | Production release | Exact workflow |
| --- | --- | --- |
| Encoded-ampersand citations, PR 186 | `ff685b5` | [34241772687](https://github.com/LaykenV/public-parish/actions/runs/34241772687) |
| Retain accepted images, PR 187 | `a9918af` | [34242433456](https://github.com/LaykenV/public-parish/actions/runs/34242433456) |
| Reviewed caption corrections, PR 188 | `bfb14f5` | [34243346222](https://github.com/LaykenV/public-parish/actions/runs/34243346222) |
| Preserve Ask qualifiers, PR 189 | `61fe72e` | [34244890498](https://github.com/LaykenV/public-parish/actions/runs/34244890498) |

Each listed release passed current-head PR checks, review, its exact production workflow and an independent `npm run smoke:production`. PR 188 CI passed 640 tests across 81 files, typechecking, build, lint and desktop/mobile browser journeys. No local automated validation ran.

Anonymous reads confirmed the three accepted stories in homepage order. All direct story pages carried the current accepted title. The three current image hashes and fourteen distinct raw source-artifact hashes matched their accepted evidence. The four Youngsville decision routes and anonymous queries passed.

The first anonymous Ask pass answered the new Meta settlement question and refused to invent a SpaceX FAA license number. Manual review caught a missing participant qualifier in the Act 874 exceptions answer despite its correct citation. PR 189 tightens qualifier preservation and increments the recorded answer-prompt version. After release, two fresh anonymous answers preserved the participant limitation, federal authorization condition, and ownership and occupancy of twenty thousand contiguous acres. Their attempt receipts record `ask-answer-v5`. One answer displayed a raw public citation marker, recorded as P2 formatting work for the design and QA pass.

## Budget

The owner chose relevance over broad catch-up and asked to keep spending low. This pass had a $2 model ceiling and a 100-credit Firecrawl ceiling. Final recorded charges were:

| Provider scope | This pass |
| --- | --- |
| Production source models | $0.419922 |
| Development source models | $0.142983 |
| Production Ask verification | $0.037898 |
| Total model ledger | $0.600803 |
| Firecrawl | 86 credits |

The separate earlier overnight source report recorded $0.047483 and 18 Firecrawl credits. Across those two reports, the recorded totals are $0.648286 and 104 credits. The 100-credit ceiling applied to this continuation, which used 86.

Firecrawl used 86 credits, leaving 548 credits in the recorded period. Both PDF retrieval passes count. Production reused the existing artifacts for all retries and signed story transfers. No retrieval credits were needed after the initial batch.

The source guard reserves image data conservatively before the provider reports actual tokens. One Meta review was denied before a provider call because its reservation exceeded the temporary development allocation. The operator moved unused allowance between environments within the combined task ceiling, then retried the unchanged request. No consumed charges were reset.

The original $2 development and $4 production source ceilings and their expiries are restored. Production source charges total $4.401016, so the restored source allowance is exhausted. Metropolitan Council's prior enabled setting is restored, but the exhausted allowance blocks new paid source processing. Ask retains its separate $0.50 ceiling with $0.123635 charged and $0.376365 remaining at the final read. Its existing expiry is September 14 UTC. No new notification-delivery records appeared during this work. No Lafayette policy was enabled and no broad backfill restarted.

Model ledger charges are estimates, not a complete provider invoice. Firecrawl credits are reported separately. These figures exclude Codex usage, GitHub review-bot costs and infrastructure charges that this ledger does not expose.

## Design and QA handoff

The approved next phase is the global design pass and founder QA. Keep production email verification, real social previews, Google sign-in and follow management, desktop/mobile journeys, source limitations, stale updates and unavailable evidence on that checklist. Founder QA and private-pilot results remain unclaimed. They still gate launch and outreach.

The starting inventory had 170 pending decisions and six failures. East Baton Rouge accounted for 169 pending decisions; Rapides had one. Lafayette had none in its existing inventories. These counts do not imply that newer documents were already inventoried. The owner chose relevant Lafayette and story work, so this pass did not restart the older East Baton Rouge queue.

Missing official permits and executed agreements remain research gaps. Unsupported claims remain unpublished. Broader archive completion, submission funding through judging, the founder pass and organic resident usefulness remain distinct work in [the active queue](work.md).

Detailed private receipts are retained in `public-parish-catchup-evidence-20260908`. Frozen successor bundles and reviewed text are in `public-parish-story-handoff/catchup-20260908`. Predecessor bundles, the earlier overnight checkout and concurrent worktrees remain intact.

## Final handoff deployment

PR 190 published this report at `864d405277c3bca6d809fb0e184910621be8adb4`.
Production workflow [34246165533](https://github.com/LaykenV/public-parish/actions/runs/34246165533)
and independent `npm run smoke:production` passed. This documentation release
changed no source evidence, publication version or provider allowance.
