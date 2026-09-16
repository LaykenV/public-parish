# Monday morning report, September 14

Historical receipt. The September 16 owner sign-off closes founder design and
QA. Later releases supersede the unfinished release tasks in this report.
[Current work](work.md) owns the remaining LPSC follow-up and launch posts.
Keep the dated evidence below; do not replay its work orders or allowances.

This report records the overnight development session before the owner
authorized production deployment. Current release status is in `docs/work.md`.

U5 and the ten statewide U6 amendments are implemented and populated in development.
U4's pre-session work is ready. Its outcome must wait for an official record
after the September 16 LPSC session. Your Tuesday launch is September 15, so it
can show the scheduled motions and invite follows, but cannot promise the result.

The work is on `upgrade/overnight-u4-u6` in
`/home/layken-varholdt/projects/public-parish-upgrade-data`, based on `0badfa3`.
It is uncommitted. The original checkout and its unrelated changes are intact.
Production has not changed. No real email, outreach, PR, commit or push occurred.

## Start your QA here

Open [development Home](https://woozy-wren-227.convex.site/?area=louisiana),
then [the ballot guide](https://woozy-wren-227.convex.site/ballot).

1. On Louisiana Home, check the three featured stories, the new commission
   records and the ballot section. Choose Rapides Parish and confirm local
   issues lead, featured stories disappear and the statewide amendments remain.
2. Open [Amendment 6](https://woozy-wren-227.convex.site/ballot/2026-amendment-6).
   Read the official question, open its source and ask whether the statewide
   vote alone makes the exemption apply in your parish. The answer must preserve
   the separate local-election condition.
3. Read [Amendment 3](https://woozy-wren-227.convex.site/ballot/2026-amendment-3)
   and [Amendment 5](https://woozy-wren-227.convex.site/ballot/2026-amendment-5).
   The former now includes the referenced statutory definition. The latter
   includes the actuarial note, which materially improves the explanation.
4. Open the commission records from Home. Inspect Cleco's consultant budget,
   Magnolia Water's audit consultant and the L & R water/wastewater settlement.
   Open each source. Ask whether the Cleco consultant vote approved customer rates.
5. Open [Meta](https://woozy-wren-227.convex.site/stories/meta-richland), jump to
   Next action and check Follow on your phone. Its accepted prose matches production.
6. Check all ten measure titles and summaries for clarity. Open a measure's
   Follow dialog and return from Ask. A real mailbox test and social-platform
   previews remain release checks with a controlled recipient.

## What is ready

| Slice | Development result | Remaining release work |
| --- | --- | --- |
| U4 | Current Meta evidence and prose restored; Follow beside the next action; source and browser checks | Official September 16 outcome, reviewed material update, authorized follower delivery and demo capture |
| U5 | LPSC passed all ten unchanged coverage gates; dev support promoted; four accepted records; Home, Explore, Ask and body Follow wired | Authorized bounded production compile and ten passes on its production registry generation |
| U6 | Ten independently reviewed measures published as limited baselines; exact numbered SOS questions, Acts, fiscal evidence; shared source, Ask, Follow and Share flows | Review and release code, transfer retained artifacts, approve exact production drafts, then production smoke and platform previews |

## U5 data quality

The compile used only three official session documents within the July 1 onward
scope. Discovery initially found no candidates. The repaired root manifest uses
three checked official URLs as seeds, then applies the existing classification,
retrieval and ten-gate checks. It does not make a reachable page sufficient for
support. The gate receipt is in [development evidence](upgrade-development-evidence.json).

| Record | What residents can learn | Evidence limit |
| --- | --- | --- |
| U-37775, L & R Utilities | The August minutes record acceptance of the uncontested settlement concerning retail water/wastewater rates and a borrowing request | The accepted agenda remains a separate earlier version; the minutes are current |
| U-37969, Cleco | The commission retained UPC with $450,000 in fees, $5,000 in expenses and a $455,000 total ceiling | This consultant vote does not establish approval of customer rates |
| X-38036, Magnolia Water | The commission retained Eisner Advisory Group for its billing, customer-service and acquisition-practices audit, with a $137,500 ceiling | This is an audit consultant decision, not an audit finding |
| R-37871, nuclear exploration program | A September agenda item identifies the program | Limited card only. PDF table ordering prevented complete exact citations; no final-rule outcome is claimed |

The sources are the [August agenda](https://lpsc.louisiana.gov/docs/agenda/Aug_12_2026_Agenda.pdf),
[August minutes](https://lpsc.louisiana.gov/docs/minutes/August_12_2026_Minutes.pdf)
and [revised September agenda](https://lpsc.louisiana.gov/docs/agenda/Sept_16_2026_Agenda_Revised.pdf).
No archive backfill, docket-exhibit intake or recurring monitoring was added.
No linked LPSC issue was accepted, so Home shows the atomic decision records.
The records are distinct subjects and should not be forced into one issue.

I repaired two source-processing problems found by actual runs. The extractor
and reviewer now distinguish a consultant vote from disposition of the broader
application. Exact matching also handles the source's HTML apostrophe encoding
without changing other words, amounts or source offsets. Incorrect excerpts
still fail validation. One Cleco title repair initially failed because its
lifecycle citation joined table rows; a diagnosed retry passed.

## U6 evidence and resident value

Each page starts with the exact SOS ballot question and binds it to the printed
amendment number. A draft cannot swap questions between measures, paraphrase
that question or omit its citation. The original three featured stories keep
their identity, order, images and Home placement.

| Amendment | Subject |
| --- | --- |
| 1 | One-time disabled-veteran exemption transfer for a qualifying surviving spouse |
| 2 | Retaining a lower local property-tax rate |
| 3 | Post-conviction bail for aggravated offenses against minors |
| 4 | Lifetime limits on election as governor |
| 5 | How retirement systems apply nonrecurring state money |
| 6 | An additional exemption for qualifying older homeowners |
| 7 | Public funds for drinking-water service lines |
| 8 | Expropriation by foreign adversaries |
| 9 | A higher income limit for the special assessment level |
| 10 | Tax exemptions for rehabilitated blighted property |

The retained set has the [SOS question document](https://www.sos.la.gov/media/jo2die1s/proposed-constitutional-amendments-2026-nov.pdf),
ten enrolled Acts, seven available enrolled fiscal notes, the HB27 actuarial
note and the statute referenced by Amendment 3. That is 20 distinct source
documents. Versioned manifests preserve the research and corrections. Final
manifests and accepted draft/review hashes are listed in the evidence receipt.

All ten remain limited where the sources leave a real question open. Examples
include household-specific tax effects, unquantified local costs, a separate
effective date not established by the retained text, and details assigned to
future legislation. Amendment 2 warns that normalized Act text does not preserve
strikeout and underline distinctions. The saved PDF remains available for review.

The live Ask checks covered a one-time transfer, local-election requirements,
bail scope, statutory offense examples and retirement benefits. It declined
voting advice, supporters/opponents questions and a personal tax estimate.
The commission check correctly separated its consultant budget from rate approval.
I fixed a response that exposed internal citation IDs in prose; citations remain
separate, readable controls.

Initial measure publication used baseline intent. The development audit found
zero new notification delivery rows. Automated tests cover hash approval,
withdrawal from Ask, account follows, email verification, management and
unsubscribe. These tests use synthetic recipients and do not prove delivery to
a real mailbox.

## Parish propositions

None was published. The guide says it has not verified parish propositions and
links residents to the Secretary of State's precinct-specific sample ballot.
This does not mean the parishes have no propositions.

| Parish | Research result and remaining gap |
| --- | --- |
| East Baton Rouge | [May 13 minutes](https://www.brla.gov/AgendaCenter/ViewFile/Minutes/_05132026-2376), printed pages 34 through 39, contain Resolution 59376 and proposed November 3 wording for a 0.50-mill mosquito/rodent-control renewal for 2027 through 2036. This is a concrete follow-up candidate. SOS confirmation and immutable publication intake/review remain pending |
| Rapides | The [official November 3 announcement](https://rppj.com/november-03-2026-election/) is a research lead. This session did not establish matching SOS proposition wording and a calling resolution |
| Lafayette | Bounded official-source searches did not establish a matching November 3 proposition package. Older library-tax references were excluded rather than treated as this election's wording |

My recommendation is to launch the complete statewide guide first and keep
parish propositions out until the same evidence chain is complete. This is the
first scope cut in the approved upgrade plan, not a claim of complete ballots.

## Validation and delivery

Development upload `e61bed45-46a7-489c-a5df-6322ad95e2fc` serves the locally
validated build. It is not a CI artifact or a production release.

| Check | Result |
| --- | --- |
| `npm run verify` | 738 tests in 96 files, both typechecks, build and lint passed. Lint has 15 existing warnings |
| Resident browser suite | All 108 Chromium/WebKit cases passed, including ten new ballot and commission-filter checks. One live-data loading timeout passed its targeted rerun |
| Reading/chat fixtures | 57 passed, one intentional desktop-only case skipped on mobile |
| Owner browser suite | All 14 cases passed |
| Hosted browser checks | 26 passed, including all ten rendered ballot questions and 320px/1280px source, Follow, Ask and Home journeys. Inspected final screenshots |
| Original story images | All three loaded at both phone and desktop widths |
| Hosted files | All 76 HTML, JavaScript and CSS files matched the local build by SHA-256 |
| Direct routes and metadata | Eight routes, all ten measure metadata responses and their 304 cache validation passed. Invalid measures return 404; legacy measure paths redirect correctly |
| Retained evidence | All 38 source snapshots passed raw and normalized artifact hash checks. A private backup retains all 13 accepted stories/measures and 76 verified artifact reads |
| Live Ask | Nine ballot checks and one commission check completed with the expected answer or refusal |
| Email audit | Zero new notification delivery rows. Real email delivery remains an authorized release check |

The initial Chromium runs hit `ERR_INSUFFICIENT_RESOURCES` during repeated
navigation. This machine keeps `/tmp` in RAM. Setting
`TMPDIR=/home/layken-varholdt/.cache/public-parish-overnight-browser` moved browser
temporary files to disk and cleared the repeated failures. Existing owner and
reading cases passed their targeted reruns with that setting. I fixed the
actual commission-filter bug and updated browser selectors for the additional
Home section; no evidence or authorization check was relaxed.

The durable private evidence directory is
`/home/layken-varholdt/.local/state/public-parish/upgrade-2026-09-14`.
The working copy is `/tmp/public-parish-upgrade-data-evidence`. They retain logs, traces, screenshots,
model receipts and `accepted-development-backup`. It contains private operational
material and must not be committed or shared publicly. The durable copy also
contains a patch and copies of the new task files. Preserve it through release
transfer; it survives cleanup of the RAM-backed temporary directory. The public-safe hashes and gate
results are in [the evidence receipt](upgrade-development-evidence.json).

## Spending

The initial development model ledger already contained $0.568943 for sources
and $0.080800 for Ask. Overnight incremental use was $1.536084 for sources and
$0.105129 for Ask, totaling $1.641213 in estimated model charges.

Firecrawl reported 113 retrieval credits across 46 calls: 34 for U5 and 79 for
U6. Discovery map/search calls had no reported credit amounts in the compiler
ledger, so this is not an invoice total. The original U6 estimate of 20 credits
could not cover ten Acts through the immutable PDF path. The documented work
order set an 80-credit U6 ceiling under your instruction to prepare all ten at
high quality. No broad backfill ran.

The model guard remained enabled. I closed the source allowance after processing finished. No pipeline run or
monitoring policy is active. Ask remains available for QA within its separate
allowance. It has $0.144871 remaining and expires September 15 at 11:46 p.m.
Central. Production spending and monitoring settings did not change. The
[work order](upgrade-development-work-order.md) records the limits and stop rules.

## What still separates this from launch

The active checklist is [docs/work.md](work.md). Founder QA and tweaks are next.
The code still needs review and an authorized production release. U5 must pass
its gates in production. U6 needs its reviewed production publications. The
release must pass the exact deployment smoke check, a controlled real email
journey and actual-platform social previews before outreach.

U7 launch content, the short demo and the private resident pilot remain open.
Use the [U4 watch procedure](upgrade-u4-watch.md) after September 16. Do not hold
Tuesday's launch for an outcome that cannot be documented beforehand.
