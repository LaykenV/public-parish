# Code-freeze corrections and source review

September 14, 2026. Prepared against production commit
`0c0d24c0015abdcf76661e21e7ea5100d1d09500` in a separate worktree. The original
checkout and its unrelated changes remain intact. The
[launch audit](launch-audit-2026-09-14.md) records the starting findings.

## Engineering corrections

All five confirmed audit defects are fixed in production. The unknown-page
hydration warning is fixed too. No feature expansion is needed for freeze.

| Concern | Result |
| --- | --- |
| Anonymous Ask writes | Separate global limits now admit sessions, threads and questions before storage writes. Existing sessions and question replays remain usable. |
| Historical email management links | Subscriber generations revoke every old management token. Both reverification paths handle legacy unsubscribed subscribers. New immediate and weekly links use the current generation. |
| Ballot launch URLs | The hub has its own initial HTML metadata. Trailing-slash hub and detail URLs redirect to canonical URLs. Missing or withdrawn evidence still fails closed. |
| Google follow failures | Initial sign-in failures show retry and email controls. Late failures cannot replace an email form or a reopened chooser. |
| Empty next action | Copy points to the documented timeline instead of claiming no deadline exists. |
| Unknown URLs | A thin catch-all route preserves SPA hydration boundaries and the existing recovery page. |

The Ask limits allow 120 new sessions per minute and 1,000 per day, 240 threads
per minute and 2,000 per day, and 120 questions per minute and 2,000 per day.
An abusive caller can still consume a shared limit. These bounds prevent
unlimited persisted writes; they do not promise availability under an attack.

The token fields are optional for existing data and require no backfill. Old
links remain valid until revocation. Regression tests cover more than 100 old
tokens, same-time unsubscribe and reverification, reads, preference changes,
removal, rotation, and newly generated delivery links.

Root reviewed the security diff. A separate agent reviewed the routing and
resident changes and found no verified regression. Full local verification
passed 754 tests in 98 files, both typechecks, build and lint with the 15 existing
warnings. The subsequent catch-all change passed frontend typecheck, 15 route
contract tests and lint. The rebuilt final frontend passed all 140 resident
browser tests in Chromium and WebKit, including the new failure and recovery
cases. Mobile screenshots of the Google failure controls and ballot copy were
inspected.

The resident suite uses known development records. An initial run against
production stopped after 55 passes and three missing-fixture failures. It did
not reveal a product regression; the expected legacy issue slugs were absent
from that dataset. The complete run used the intended development data without
changing those fixtures. New OAuth tests intercept the start request locally
and send no sign-in request to Convex or Google.

## Official-source review

Fresh Firecrawl retrievals of the two LED SpaceX pages and the England Applied
Digital announcement used three credits. Every retained HTML claim excerpt
still appears in the fresh text after whitespace normalization. Direct downloads
of the five cited PDFs match the accepted SHA-256 hashes byte for byte.
Existing immutable snapshots remain the publication evidence.

The [LED project page](https://www.opportunitylouisiana.gov/spacex) and
[announcement](https://www.opportunitylouisiana.gov/news/spacex-launches-new-era-of-commercial-spaceflight-with-100-billion-louisiana-campus)
still distinguish the announced SpaceX project from completed construction or
project-specific regulatory approvals. The bounded review included the
[Vermilion Police Jury site](https://www.vppj.org/) and its August 19 minutes.
The reviewed sources did not resolve the missing executed agreements, permit
decisions or dated public hearing. Retain those limitations.

Boyce review included the [England minutes](https://englandairpark.org/england-authority/commission-minutes/)
through July 23, its August 27 final agenda, and
[Rapides records](https://rppj.com/2026-police-jury-meetings/) through the
September 14 agenda. The June 9 England budget presentation mentions Applied
Digital among new leases. It does not establish final CEA or PILOT terms or a
vote approving those terms. An August 10 Rapides public comment is not a
government approval. These records do not require a rewrite of the current
narrower claims.

Fresh builds use versioned research bundles, exact retained source bindings,
independent review and exact-version approval. Initial generated drafts failed
validation and stayed unpublished. The accepted factual text is retained through
the owner correction path. Image retention also receives a fresh review.

Both final candidates passed independent review and exact-version approval in
production on `befitting-flamingo-587`.

| Story | Accepted version | Reviewed through | Next review | Result |
| --- | --- | --- | --- | --- |
| SpaceX | 4 | September 14 | September 18 | LIMITED, 28 supported review paths |
| Boyce | 3 | September 14 | September 18 | LIMITED, 21 supported review paths |

Both accepted payload hashes, source bindings, evidence spans, related records
and image hashes match their prior versions. SpaceX image alt text now describes
one visible rocket rather than asserting multiple vehicles. The final reviewer
classified both changes as cosmetic. Neither accepted version created an update
event or a notification fanout.

The completed batch added $0.192740 to the application source-spending ledger
and used three Firecrawl credits. Source spending is disabled again with its
prior $6.401016 ceiling and September 26 at 05:00 UTC expiry restored. The final
source charge is $4.886457. Ask settings were not changed. Application ledger
figures are not provider invoices.

Independent `npm run smoke:production` passed after approval, including both
origins, all three stories, evidence links, images, metadata and backend readiness.
Eight live browser checks covered both refreshed stories on both origins in
Chromium and WebKit. All showed the new review dates and existing limitations,
with no page errors or horizontal overflow. Mobile screenshots were inspected.

## EBR Planning expectation

The July 23 expected-minutes date is stale inventory metadata. The
[official index](https://www.brla.gov/agendacenter/planning-commission-12/)
links July 20 full minutes. August 17 minutes are not linked, and their expected
URL returned 404 during this review. The August 17 agenda with results records
approval of the July minutes.

No existing owner operation updates just that expectation safely. The apparent
single-document retry starts a policy workflow that can dispatch other pending
work and discover more documents. Even inventorying July 20 would produce an
August 27 estimate, still past today. No future date was invented, no direct
database patch was made and no broad update started. Keep the next bounded EBR
inventory review in the operating queue. This does not block the code freeze.

## Production release

The owner authorized shipment. Five focused PRs passed CI and clean GLM and
Muse reviews on their exact heads, then merged:

| PR | Correction |
| --- | --- |
| [237](https://github.com/LaykenV/public-parish/pull/237) | Ballot launch links, metadata and next-action copy |
| [238](https://github.com/LaykenV/public-parish/pull/238) | Anonymous Ask write admission |
| [239](https://github.com/LaykenV/public-parish/pull/239) | Subscriber-wide management-token revocation |
| [240](https://github.com/LaykenV/public-parish/pull/240) | Initial Google follow failures |
| [241](https://github.com/LaykenV/public-parish/pull/241) | Unknown-page hydration |

The combined application at `7d2b467974a8a659ce1b5cde8235dab01278b10e` matches
all 26 changed application and test files in the validated local candidate.
Its [production workflow](https://github.com/LaykenV/public-parish/actions/runs/34903301247)
passed 754 tests across 98 files, both typechecks, build, lint with 15 existing
warnings, backend and frontend deployment, source configuration and smoke.
Independent `npm run smoke:production` passed afterward.

Live HTTP checks passed ballot hub metadata, canonical redirects with query
parameters, ETag responses and unknown-measure rejection on both public origins.
The Google and recovery PRs passed their full CI browser matrices. All 56 fresh
production browser checks passed in Chromium and WebKit. They cover ballot
reading, citations, navigation and unknown-page recovery on both origins, plus
Google failure and retry controls on the canonical domain. OAuth-start requests
were intercepted locally; no live sign-in or email enrollment was attempted.

An earlier deployment of `d44f6bc` failed because Convex returned 503 while
resolving the deployment key, before the backend upload. The existing app stayed
available. The later combined release passed; no code workaround or rollback
was needed. GitHub's deployment queue superseded the intermediate pending
security runs. Their changes are included in the verified combined release.

The original dirty checkout remains intact. Application changes shipped through
isolated branches; no unrelated local product changes entered this release.

The previous audit already verified production email delivery and phone
acceptance against the September 12 release receipt. This pass adds targeted
regressions; it does not claim a new OAuth success, email round trip or phone
keyboard test.

Shift the main effort to launch content and residents. Keep the September 16 Meta watch, September 17 amendment review, daily
Ask allowance and error checks, and the final demonstration in the launch queue.
