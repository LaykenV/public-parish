# Source operations, September 6, 2026

## Automatic processing and catch-up

Rapides made progress through scheduled runs after its September 6 budget reset,
before the owner-started catch-up checks in this session. The approved temporary
limit then rose from 50 to 500 daily provider admissions. Catch-up checks used
the normal monitoring workflow with one document and one target per run.

At 10:53 a.m. Central, the Rapides ledger contained 42 published targets, one
withheld target, and 22 pending targets. The prior September 5 checkpoint had
four published and 61 pending targets. That cleared 39 pending targets, with
38 more published and one withheld. These are inventory-target counts, not
counts of distinct resident cards or issue timelines.

The 500-admission bucket has zero remaining admissions. Its next window begins
September 7 at approximately 7:13 a.m. Central. The policy remains enabled and
its next check points at that reset. No allowance beyond the approved 500 was added.
The initial backlog is not finished. Its pending work includes 18 targets from
the incomplete August 10 minutes inventory. Restore the normal daily limit of
50 after catch-up finishes and the budget window permits the reduction.

The independent review withheld one target. Other attempts failed exact-citation
or reviewer-contract checks and stayed retryable within the normal attempt
bounds. Budget pauses do not consume a target's failure allowance.

## Expanded automation

All seven previously supported bodies now have enabled production policies.
The six newly activated policies use 50 admissions per day, at most three
documents and five targets per run, a 24-hour source cadence, and a 30-day
initial meeting window. Initial backfill does not send resident alerts.
The global daily limit remains unchanged.

Scheduled checks ran after activation. At the 11:28 a.m. Central checkpoint:

| Body | Published inventory targets | Pending targets | Completed document inventories |
| --- | --- | --- | --- |
| Rapides Parish Police Jury | 42 | 22 | 6 |
| Alexandria City Council | 6 | 44 | 2 |
| Lafayette City Council | 4 | 30 | 2 |
| Youngsville City Council | 0 | 0 | 4 |
| Pineville City Council | 0 | 0 | 8 |
| Metropolitan Council | 0 | 169 | 0 |
| East Baton Rouge Planning and Zoning Commission | 0 | 11 | 2 |

Zero targets does not mean a body has no decisions. Some checked documents are
historical samples outside the policy's meeting window, while later documents
remain queued. Pending targets on incomplete inventories cannot start extraction.

Alexandria, Metropolitan Council, and East Baton Rouge Planning and Zoning
reached their daily limits. Other inventory failures included an unresolved
date, locator quotes that did not match the snapshot, and an agenda item whose
matter text was missing. These failures remain visible in operations. No source
or publication gate was lowered to clear a queue.

## Lafayette certification

PR #106 adds recovered official agenda and outcome samples for all five planning
bodies. The [source investigation](source-spikes/lafayette-planning-recovery-2026-09-06.md)
records how event attachments and hyperlinks inside PDFs supplied the documents.
All five passed all ten development coverage gates through the normal pipeline.
All five then passed all ten production gates and were promoted. The public
coverage API reports all twelve launch bodies supported. The selector query
reports Lafayette, Rapides, and East Baton Rouge available.

Production review exposed a City Zoning name mismatch. Its agenda prints
"City Zoning Commission", while the registry included a Lafayette prefix.
PR #108 corrects the versioned root name and preserves the same parish,
body key, and source permissions. Earlier manifest versions remain resolvable.

The City Zoning missing-record probe exposed a separate targeting defect. It
used an operator routing label, allowing extraction to select an unrelated real
case. Independent review withheld the result. PR #107 changes negative probes
to require the literal printed identifier. The development replay returned
`not_found` with no candidate. CI and review passed before production release.
Production replay independently returned `not_found` with no candidate. The release workflow and independent
production smoke passed.
City Zoning then passed production certification and was promoted at
11:37 a.m. Central.

| Planning body | Checked case | Production evidence |
| --- | --- | --- |
| Lafayette City Planning Commission | `2026-4-VAC` | Limited current publication; two immutable snapshots. |
| Lafayette Parish Planning Commission | `2026-37-PC` | Full current publication; earlier limited revision retained. |
| City Zoning Commission | `2026-16-REZ` | Limited agenda publication; incomplete outcome withheld. |
| Lafayette Board of Zoning Adjustment | `2026-29-BOZ` | Limited agenda publication; incomplete outcome withheld. |
| Hearing Examiner | `2026-57-HE` | Limited publications from both checked snapshots. |

These are representative certification records, not a complete meeting archive.
Withheld revisions remain internal history and do not replace accepted evidence.

The five planning bodies do not yet have automatic monitoring policies.
Their recovered finite samples do not prove future discovery of opaque event
attachments or outcome links embedded in PDFs. Coverage certification and
unattended discovery are separate operating claims.


## Release verification

| Release | Merge | Production workflow |
| --- | --- | --- |
| [PR #106](https://github.com/LaykenV/public-parish/pull/106) | `30f3b0b` | [Passed](https://github.com/LaykenV/public-parish/actions/runs/34044017537) |
| [PR #107](https://github.com/LaykenV/public-parish/pull/107) | `a710a95` | [Passed](https://github.com/LaykenV/public-parish/actions/runs/34045416290) |
| [PR #108](https://github.com/LaykenV/public-parish/pull/108) | `55a9158` | [Passed](https://github.com/LaykenV/public-parish/actions/runs/34045717299) |

Each release passed independent production smoke after its exact deployment.
The final PR passed 486 tests and desktop/mobile emulation in CI. No local
unit tests, typechecks, builds, or lint ran during agent work. Development used
AI Gateway; direct OpenAI fallback remains disabled.

The manual Chrome review saw the first four planning promotions on the public
coverage page. The browser connection then became unavailable before the final
City Zoning visual recheck. Public coverage and selector queries verified the
final promotion, and production smoke passed. No final manual selector click
is claimed.
