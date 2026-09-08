# Sources and coverage

This document owns source policy, named local coverage, and story evidence
standards. [Work](work.md) owns current status. [Operations](operations.md) owns
paid retrieval and recovery. Publication requires immutable evidence regardless
of how a story was discovered or selected.

## Local coverage contract

The local selector covers defined bodies in three launch parishes. It does not
promise every government entity or a complete historical archive.

| Parish | Named launch bodies |
| --- | --- |
| Lafayette | Lafayette City Council; Lafayette City Planning Commission; Lafayette Parish Planning Commission; City Zoning Commission; Lafayette Board of Zoning Adjustment; Hearing Examiner; Youngsville City Council |
| Rapides | Alexandria City Council; Pineville City Council; Rapides Parish Police Jury |
| East Baton Rouge | Metropolitan Council; Planning and Zoning Commission |

Lafayette Parish Council and unnamed Rapides planning bodies appeared in early
plans. They are not additional certified bodies in this launch list. Never use a
generic Planning Commission label in place of the separate Lafayette bodies.
Youngsville's current limitation is recorded in the work plan and public health
query. Previously accepted dated evidence remains accessible during degradation.

Code-owned approved roots are in `convex/coverage/roots.ts`. The exact current
certification artifacts are in [launch-bodies.v4.json](coverage-gold-sets/launch-bodies.v4.json).
Retain older manifest versions for historical run resolution.

## Official evidence

Use agendas, minutes, ordinances, resolutions, notices, meeting packets, planning
cases, official calendars, and government agreement or spending records. Story
research may require state and federal permits, utility proceedings, official
project announcements and related public records. Register and validate their
source identity and document contract before treating them as publication inputs.

A government announcement supports the fact that an agency announced something.
It does not establish executed agreements, granted permits, completed work, or
realized economic projections unless the cited record supports those claims.
Separate proposed, approved, executed, and completed actions.

News, company marketing, advocacy pages, social posts, search results and agent
summaries can identify leads. They do not independently satisfy this product's
publication evidence policy. Images have their own permission and provenance
requirements; possessing an image does not make its accompanying claims true.

## Approved three-story source work

| Story | Evidence questions to resolve | Starting point |
| --- | --- | --- |
| Meta, Richland Parish | What is announced, which government or utility actions are documented, what agreements or permits are settled, and what remains unknown? | Checked government records and utility proceedings; company information is a discovery lead |
| SpaceX, Pecan Island, Vermilion Parish | Which official actions and project boundaries are documented, what approvals remain, and what public steps are actually listed? | [Louisiana Economic Development announcement](https://www.opportunitylouisiana.gov/news/spacex-launches-new-era-of-commercial-spaceflight-with-100-billion-louisiana-campus), followed by underlying official records |
| Applied Digital / Boyce, Rapides Parish | What do the term sheet, agreement drafting and project announcement establish, and is there a later supported action? | [Existing accepted issue](https://www.publicparish.com/issues/applied-digital-tax-incentive-term-sheet-cea-drafting-and-delta-forge--763577cb) and its immutable citations |

These questions are research assignments, not claims about project status. The
three story packages passed the development gate and were published as LIMITED versions after exact owner approval. Meta is the
lead story; SpaceX and Boyce are secondary. A future CCS story is outside this
launch set.

A reviewed story can cite bounded official evidence from a body that has not
passed continuous local-coverage certification. Its source identity and every
published claim must still pass the evidence gates. Keep that body candidate or
validating as appropriate; publishing the story never marks the parish supported,
adds it to the selector, or starts broad monitoring. Explain the story's reviewed
scope and next planned review separately from local coverage health.

## Source dossier and import contract

Each dossier must identify:

- Stable story key, precise place names, selected topic and research questions.
- Official body, URL, redirect destination, artifact title, document type, date,
  retrieval provenance and complete stored artifact reference.
- Existing snapshot and accepted publication references where available.
- Exact excerpts, page or section evidence, and the specific claims they support.
- Proposed timeline links and the official evidence for each relationship.
- Unanswered questions, contradictory or superseded records, and missing outcomes.
- Media source, permission or license, caption, alt text and rendering status.
- Required additional retrieval, expected cost and a bounded stop condition.

The owner can assemble this through computer use and a versioned JSON manifest.
JSON upload is not publication. The implemented importer enforces the same
source checks, immutable storage, extraction, review and publication policy as
other evidence. No free-form research prose becomes accepted data by import.

Firecrawl is the normal discovery, retrieval, rendering and PDF/OCR engine.
Computer use can find exact links and inspect records. If a complete downloaded
artifact needs a file-import path, document the repeated retrieval failure and
preserve real provenance, bytes, hashes, completeness and page evidence. Do not
replace a source with a screenshot of a summary or fabricate Firecrawl metadata.
A new intake path needs implementation and verification before use.

## Owner-selected rendering exception

On September 8, the owner approved publication of the three supplied renderings
with unverified reuse rights. This exception covers only the exact story and file
hashes in `convex/stories/ownerMedia.ts`. It is not a copyright license or verified
rightsholder permission. Unknown original sources remain null. Captions identify
renderings and disclose uncertain project attribution. These illustrations do
not support factual claims about completed facilities.

The owner-only correction path verifies storage hashes, retains the accepted
story text and evidence, runs fresh independent review, and requires exact-hash
approval of a new immutable version. The normal manifest permission gate stays
in force for other images. Image-only changes send no material update.

## Coverage gates

A body becomes supported only when the current evaluator proves all ten:

1. Retrieve every exact representative artifact in the checked manifest.
2. Restrict the registry to checked official hosts and document paths.
3. Separate current and historical records.
4. Resolve every accepted material fact to a precise source citation.
5. Publish no unsupported name, date, amount, vote, deadline or status.
6. Preserve source changes or agenda-to-outcome changes as immutable snapshots
   and publication versions.
7. Limit or withhold incomplete and failed evidence.
8. Use an expected schedule to detect stale or missing coverage.
9. Have successful agenda and minutes runs for the same record within the last
   60 days.
10. Check that every representative official URL answers from the production
    backend.

Promotion and recovery require current registry-generation evidence. A passing
HTTP response, model verdict, completed queue or developer replay alone does not
satisfy these gates. There is no weaker beta evidence standard.

## Retrieval and freshness

Start with exact known URLs and stored artifacts. Use broad discovery only for
approved onboarding, structural change or a diagnosed repair. Check each redirect
against the approved host and tenant path. A shared Municode or document host
must not grant access to every tenant.

Use official dates and schedules where available. Label inferred cadence as an
estimate. The retrieval timestamp is not the meeting date or proof that a later
outcome exists. Detect stale listing pages against source-printed document dates
and expected artifacts. Preserve missing outcomes visibly.

A story has a reviewed-through date and a next review responsibility. Scheduled
checks and owner-triggered review must be described accurately. Local records
can remain readable while their source is degraded or paused. A consequential
story can remain limited if its supported claims are useful, but the lead cannot
consist of an unexplained source-only stub.

## Evidence assets to preserve

- [Initial gold set](gold-sets/lafayette-city-council.v1.json).
- [Current coverage gold set](coverage-gold-sets/launch-bodies.v4.json) and prior
  versions in the same directory.
- [Initial production batch](production-batches/launch-data-2026-08-31.v1.json).
- [Lafayette source recovery](source-spikes/lafayette-planning-recovery-2026-09-06.md),
  [Pineville investigation](source-spikes/pineville-current-documents-2026-09-06.md),
  and the other dated source investigations in that directory.
- [Archived production certification](archive/pre-stories-2026-09-07/docs/slice-9-production-certification.md).

Keep these machine-consumed paths stable. New story manifests should be small,
versioned, public-safe and explicit about unknown facts. Store bulky artifacts
in the existing evidence storage rather than copying raw application data into Git.
