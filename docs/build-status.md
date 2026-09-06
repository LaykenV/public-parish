# Build completion and remaining work

Documentation reviewed September 6, 2026 against production release `4b8927b`.
Runtime observations below are dated September 5; they are not live queue totals.

## Build status

The planned feature build is complete through implementation Slice 9. Evidence
Slices 1 through 4, the complete resident interface, and implementation Slices
6 through 9 are deployed. There is no planned Slice 10. Continue correctness,
source-data, privacy, reliability, accessibility, and demo-blocking repairs.

Slice 9 shipped seven packets as PRs #93 through #99. They deliver bounded
approved-source automation, continuing issue timelines, paginated published
history and corpus Ask, public coverage requests and verified launch notices,
issue share HTML, private operating reports, and resident-loop certification.
PR #100 repaired controlled legacy-publication replay. PR #101 recorded the
initial release. PRs #102 through #105 repaired Lafayette source permissions,
commission identities, production smoke expectations, and queue progress.

The latest application release is [PR #105](https://github.com/LaykenV/public-parish/pull/105),
merge `4b8927bb3d2d1af3c377ad53e91072e6164ba036`.
Its [production workflow](https://github.com/LaykenV/public-parish/actions/runs/33981783575)
and independent production smoke passed. CI passed 483 tests. The smoke checked
the direct and canonical sites, apex redirect, resident routes, exact coverage
identities, search, issue evidence, share HTML, and backend readiness.

Build completion does not mean every source is supported, catch-up is finished,
residents have demonstrated benefit, or the hackathon entry has been submitted.

## Coverage and automation

Twelve bodies are listed. Seven passed their own coverage gates; five Lafayette
planning bodies remain validating. Support covers each named body's approved
agenda and minutes sources, not all parish government or a complete archive.

| Place | Supported bodies | Remaining coverage |
| --- | --- | --- |
| Lafayette | Lafayette City Council; Youngsville City Council | City Planning Commission; Parish Planning Commission; City Zoning Commission; Board of Zoning Adjustment; Hearing Examiner remain validating. |
| Rapides | Alexandria City Council; Pineville City Council; Rapides Parish Police Jury | Available for these named bodies and approved source types. |
| East Baton Rouge | Metropolitan Council; Planning and Zoning Commission | Available for these named bodies and approved source types. |

Lafayette's official event service returned HTTP 502 repeatedly on September 5.
Older meeting-document links returned 404. The checked schedule PDFs establish
cadence, not decisions or outcomes. The [source investigation](source-spikes/lafayette-planning-recheck-2026-09-05.md)
records the evidence. Full Lafayette support remains unfinished and requires
usable agenda/outcome pairs plus passing gates for all five planning bodies.

Only Rapides Parish Police Jury has automatic checks enabled. Its approved
limits remain one document and one target per run, a 24-hour source cadence,
a 30-day meeting window, and 50 daily provider admissions. The other six
supported bodies still have owner-started updates. Expand activation only after
reviewing the canary's progress and each policy's sources, cadence, and budget.

PR #105 gives ready decisions priority over discovery, skips blocked queue
entries within a bounded scan, prioritizes unfinished documents with waiting
items, and preserves retries when the budget is exhausted. During a processing
batch, that policy does no additional source retrieval or discovery. The
15-minute scheduler resumes due work without requiring an owner to start each
item. Provider limits and publication gates still apply.

The September 5 development check processed and published one queued Rapides
item, reducing pending items from 49 to 48 and increasing published items from
30 to 31. Its full card had six citations to stored official evidence. The run
made no discovery or retrieval calls; development monitoring was then paused.
The production check preserved 61 pending targets and four published targets,
made no source calls, and waited for the exhausted window's September 6 reset.
These are release receipts, not proof that production has since drained its
queue. Inspect current operations state before reporting new totals or progress.

## Accepted verification scope

- AI Gateway is the verified provider. Direct OpenAI fallback stays disabled;
  a live direct-provider call was explicitly removed from completion criteria.
- Desktop, keyboard, reduced-motion, and 320- and 375-pixel mobile emulation
  replace the physical iPhone Safari requirement for this release. Do not claim
  a physical-device or screen-reader pass.
- Production proved the controlled email verification, alert, reply, roundup,
  launch-notice, management, and unsubscribe paths. The controlled subscriber
  was unsubscribed. Controlled tests do not establish organic resident benefit.
- Stable issue extension and large-corpus boundary tests have development and
  CI proof. The release record does not claim a new production issue extension
  or a production corpus above those tested scale boundaries.
- Automated validation runs in GitHub Actions. Agent work does not run local
  tests, typechecks, builds, or lint without approval for the exact command.
  Authorized production releases still require independent live smoke.

## Remaining operating and launch work

1. Observe the repaired canary after budget reset, complete initial catch-up,
   inspect rejected items, and verify continued publication without duplicates.
2. Review measured cost and progress before activating the other approved
   bodies. Do not increase limits merely to make a queue look complete.
3. Complete the Lafayette source and coverage work without lowering the gates.
4. Observe real residents finding an issue, inspecting evidence, asking a
   question, following it, and returning for an outcome. The plan's 25 residents,
   10 follows, and 10 substantive questions remain targets until measured.
5. Capture the source-change story and record a product demo under three
   minutes. Repeat public-link and sign-in checks for that demo, and inspect
   actual social-platform previews before using them in posts.
6. Recheck organizer requirements, prepare permissioned public proof and posts,
   and submit the entry only after authorization. No submission is claimed.

## Evidence and operating instructions

- [Initial production certification and follow-up releases](slice-9-production-certification.md)
- [Development certification](slice-9-development-certification.md)
- [Operations runbook](slice-9-operations-runbook.md)
- [Completed Slice 9 execution plan](slice-9-final-build-plan.md)
- [Four-week roadmap, including resident and submission work](build-plan.md)

Dated implementation and design documents preserve the state they described.
This page supplies the current completion boundary; historical fixtures,
counts, blocked integrations, and proposed PR groupings are not new work queues.
