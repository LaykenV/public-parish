# Code freeze and launch audit

Audited September 14, 2026 against production commit
`0c0d24c0015abdcf76661e21e7ea5100d1d09500`.

## Decision

Proceed with a mostly frozen codebase and shift the main effort to launch
content and first users. No confirmed P0 or P1 defect emerged from the security,
evidence, resident-interface or operational reviews. The remaining engineering
work fits small corrections. It does not justify another feature cycle, design
campaign, broad backfill or architecture change.

Before broad promotion, close the anonymous-write admission gap and make the
ballot guide's direct links and social preview reliable. Correct the misleading
ballot fallback and Google follow error feedback during that bounded pass.
The management-token edge case deserves a separate security correction.
Content preparation and a small monitored pilot can proceed alongside them.

This is a launch decision based on the checks below, not a claim that every path
or future generated answer is correct. This audit changed documentation only.
It did not fix, commit, push or deploy application code, alter settings, publish
content, send messages or make paid model calls.

## Scope and release identity

The starting checkout is an older `main` at `828de1d` with unrelated uncommitted
work. The audit preserved it. Source review and validation moved to the existing
`public-parish-reading` worktree at the exact released commit. Its application
code was clean; its two existing documentation changes were preserved.

GitHub confirmed the public repository and current main commit. The exact
[production workflow](https://github.com/LaykenV/public-parish/actions/runs/34896086803)
passed release verification, deployment, seed configuration and production smoke.
The audit independently checked both public origins and backend readiness.
These results do not certify the starting checkout as a release candidate.

Three subagents independently reviewed authorization/privacy, evidence/publication,
and resident functionality. The root review covered validation, release automation,
production health, operating allowances, source monitoring and deduplication.

## Verified engineering corrections

P2 means a bounded defect worth fixing during the freeze. None of these is a
confirmed critical outage or current unauthorized disclosure.

### P2. Anonymous Ask storage has no global admission limit

[Session creation](https://github.com/LaykenV/public-parish/blob/0c0d24c0015abdcf76661e21e7ea5100d1d09500/convex/ask/threads.ts#L39)
accepts fresh caller-chosen tokens and creates a persisted session and expiry
job. Thread and question limits are per session, so rotating tokens bypasses
them. The global Ask request limits apply later, when an answer is claimed.

An isolated test created 1,001 sessions without invoking a model or hitting a
limiter. An automated caller can therefore accumulate database, message and
scheduler usage even with paid AI paused. Expiry detaches access but retains
content, as the privacy page discloses.

Add finite global admission before new session, thread and question writes with
the existing rate-limiter component. Preserve session reuse and replay behavior.
A global cap limits cost but does not itself prevent a caller from consuming
everyone's capacity. Fix this before a large public campaign and watch rejections.

### P2. Stop-all unsubscribe can miss historical management tokens

[Token revocation](https://github.com/LaykenV/public-parish/blob/0c0d24c0015abdcf76661e21e7ea5100d1d09500/convex/follows/management.ts#L256)
reads only the first 100 management-token rows, including already revoked rows.
An active later token can escape that scan. Unsubscribed state initially blocks
it, but a newly verified follow restores the subscriber's verified state.
Follow-specific token rotation excludes subscriber-wide alert tokens.

An isolated test with 112 historical tokens reproduced old-token access after
unsubscribe and reverification. This requires sufficient history and possession
of the old token. It does not expose Google credentials or email addresses.

Enforce a subscriber-wide revocation timestamp or generation on management reads
and writes. Issue new tokens against it. Raising the scan limit is not a fix.
The bounded reproduction should become the regression test.

### P2. Ballot direct links with a trailing slash fail

Both production origins return 200 for `/ballot` and
`/ballot/2026-amendment-1`, but 404 and "Story unavailable" for `/ballot/` and
`/ballot/2026-amendment-1/`.
[The HTTP prefix](https://github.com/LaykenV/public-parish/blob/0c0d24c0015abdcf76661e21e7ea5100d1d09500/convex/http.ts#L31)
sends the hub to a story handler that rejects an empty slug or trailing slash.
Add canonical redirects or an exact hub handler and verify direct HTTP requests.
SPA navigation can hide this defect.

The slashless hub also serves generic Home metadata to crawlers. Give its
initial HTML an election-specific title, description and canonical URL as part
of preparing its launch link. Individual amendments already return accepted
titles and canonical metadata. Their text-only preview is not a missing-evidence
defect. Inspect actual platform previews after the correction.

### P2. A ballot fallback contradicts its own cited timeline

Amendment 1 names the November 3 election in its summary and timeline, then says
"No next public action or deadline is established by these sources."
[The shared reader](https://github.com/LaykenV/public-parish/blob/0c0d24c0015abdcf76661e21e7ea5100d1d09500/src/features/stories/story-page.tsx#L288)
uses this sentence when the separate `nextAction` field is absent.

Both live browsers reproduced the contradiction. Hide that empty block for a
measure or say no additional action is recorded beyond its timeline. A neutral
absence-of-field message needs no invented evidence or new ingestion run.

### P2. Initial Google follow failures can have no visible feedback

[The sign-in hook](https://github.com/LaykenV/public-parish/blob/0c0d24c0015abdcf76661e21e7ea5100d1d09500/src/features/auth/google-auth.ts#L37)
catches a startup exception and stores `auth.error`. The follow sheet's error
effect requires a follow intent in the current URL. On the initial click, that
intent exists only in the proposed redirect URL, so the sheet can return to its
unchanged chooser without displaying the failure.

This is a source-verified failure path, not a reproduced live OAuth outage.
Display the hook error in the sheet or enter its existing failure state for a
locally started attempt. Successful sign-in and the email fallback are unaffected.

## Current content and operation

Read-only production queries returned all twelve named parish bodies plus
Louisiana Public Service Commission as Supported. The app discloses that an
owner starts updates. There are twelve monitoring policies, all paused, and no
active source run. Supported certifies the named evidence scope. It does not
mean every body is being watched automatically or that archives are complete.

The three featured stories and ten amendments are active LIMITED publications.
That is an accepted publication mode with explicit evidence gaps.

| Content | Reviewed through | Next review | Launch action |
| --- | --- | --- | --- |
| Meta | September 12 | September 16 | Watch the named commission proceeding and publish only an evidenced outcome |
| SpaceX | September 8 | September 10 | Review the named sources before promoting it as current |
| Boyce | September 7 | September 10 | Review the named sources before promoting it as current |
| Ten amendments | September 14 | September 17 | Keep the planned official-source review |

SpaceX and Boyce are four days past their review dates. This does not prove their
accepted claims false. Recheck sources and use the existing review procedure;
do not advance dates without doing the work. East Baton Rouge Planning also
displays a July 23 expected-minutes date. Reconcile that dated expectation before
describing coverage as current.

The spending guard is enabled. Ask is enabled with $4.829425 remaining against
its $5.123635 total ceiling. It expires at midnight after September 25 Central.
Source spending is disabled at $4.693717 charged against $6.401016. These are
application-ledger amounts, not provider invoice totals or proof of capacity for
a particular number of visitors. Check them daily during promotion.

The September 12
[release receipt](https://github.com/LaykenV/public-parish/blob/0c0d24c0015abdcf76661e21e7ea5100d1d09500/docs/launch-release-2026-09-12.md)
records controlled production verification mail, a material update, an inbound
reply, a grounded response, per-follow unsubscribe and owner phone acceptance.
Those results supersede blanket older "mail untested" entries. They do not claim
a fresh stop-all test, organic usage or today's complete provider round trip.

## Validation evidence

| Check | Result |
| --- | --- |
| Full local `npm run verify` on the release | 744 tests across 97 files, both typechecks and build passed; lint passed with 15 existing warnings |
| Resident browser suite | 132 passed |
| Reading fixture suite | 63 passed, one intentional desktop-only test skipped on mobile |
| Owner fixture suite | 14 passed |
| Independent live browser matrix | 22 route cases across Chromium desktop and WebKit mobile; all fit the viewport and render their intended content or recovery |
| Independent live interactions | Sources and focus return, follow email chooser, report form, parish/statewide selection, scoped Ask entry and mobile draft retention passed |
| Production smoke | Both origins, apex redirect, direct routes, coverage, search, citations, issue share HTML, all three stories, images and metadata passed; backend readiness query passed |
| Production dependency audit | `npm audit --omit=dev` reported zero vulnerabilities |
| Security reproductions | Both isolated synthetic defect reproductions passed, without production attack traffic |

Twenty of the 22 live route cases had no uncaught page error. Both intentionally
unknown routes rendered the correct recovery but logged React hydration error
418. Record that as later recovery polish unless a visible failure appears.
Screenshots of Home, amendment reading, Meta, source drawers and mobile chat
were inspected. No new full design pass is warranted by those views.

The first local attempts encountered the machine's `/tmp` quota. Validation and
browsers ran with a writable home-cache temporary directory. The standalone
production readiness command initially lacked this worktree's deployment
selection and passed after explicit selection. The first reading-fixture run
could not import its client entry; it passed after restarting with the required
public development URL once the other Vite fixture server had finished. These
local setup failures are not production regressions.

## Backend health and scale

The official Convex MCP returned two warning groups over 72 hours, no permanent
transaction conflicts and no document or byte read-limit events:

| Function | Observation | Cause and disposition |
| --- | --- | --- |
| `ai/spendingLedger:reserve` | One recovered conflict | Each reservation updates the shared scope allowance. Keep atomic budget enforcement; no rewrite justified by this one event |
| `analytics/events:recordVisit` | Thirteen recovered conflicts | Global rate-limit counters are shared. Watch this during promotion; consider supported rate-limiter sharding if contention grows |

The bounded log fetch returned 463 entries covering 20:41 through 21:02 UTC,
with no thrown errors. This is a 21-minute sample, not 72 hours of error-free
execution. Separately, the latest 100 Ask receipts contained 21 from the last
72 hours, all succeeded and none running or failed. That status does not certify
the factual quality of the generated text.

Scoped issue and meeting Ask still scans decision records in 25-row pages.
That is unnecessary database work as the corpus grows, but no measured timeout
was found. Optimize those scopes only when observed latency justifies it.
The active answer path uses batched retrieval with a thousand-record test. The
legacy helper's 75-record bound is not an active standalone-Ask failure.

The Convex skill's mechanical score is 75 out of 100 for the backend passes.
The formula is 100 minus five confirmed medium findings at five points each:
two security defects, one HTTP routing defect and two recovered-conflict groups.
There are no high findings in that calculation. Frontend copy, social metadata
and overdue content dates are outside this backend score. It is a tracking
formula, not a probability of a successful launch. Authorization, reviewer,
advisor and recent-log passes all ran; no production mutation pass ran.

## Coverage limits and the freeze plan

The security review enumerated 105 direct public function registrations and
inspected owner, account and capability checks, validators, email verification,
webhook signatures, reply ownership, escaping, privacy and retention. A targeted
scan of 582 tracked text files found no recognizable credential candidates.
That is not a complete historical secret audit.

The evidence review checked source hashes and spans, independent review,
publication pointers, withdrawal, story and amendment scope, citation validation,
coverage gates and failure behavior. It did not independently adjudicate every
legal interpretation in every published amendment or test every future answer.

No new live OAuth round trip, paid Ask generation, email delivery, provider outage,
backup restore, large-load exercise, physical-device or screen-reader session ran.
Fixture owner screens do not prove live owner authorization. Current source
review, prior controlled receipts and new public checks provide distinct evidence.

Use this order during the freeze:

1. Keep content preparation and monitored first-user sessions moving. Recheck
   SpaceX and Boyce and maintain the September 16 and 17 source reviews.
2. Fix anonymous-write admission and the ballot launch-link defects before
   broad promotion. Keep each PR limited to its concern.
3. Correct the ballot fallback, initial Google failure feedback and subscriber
   token revocation in small follow-ups. Recheck the affected paths.
4. Spend remaining time on source-backed launch assets, actual social previews,
   resident feedback and the final demonstration. Monitor Ask allowance and
   failed journeys; do not reopen speculative performance or visual work.

The repository is public and both qualifying and canonical app URLs are usable
without an invitation. The organizer still lists September 22 at noon Pacific
as the deadline and requires a public repo, qualifying live URL, root build log,
video under three minutes and the tagged social post. Those presentation tasks
remain separate from code readiness. Requirements were rechecked on the
[official event page](https://www.convex.dev/hackathons/all-gas).

Local detailed audit reports and validation logs are retained under
`~/.cache/public-parish-audit/`. Raw operational responses are
private local artifacts and are not included in this report.
