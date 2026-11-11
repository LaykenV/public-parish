# Current work

Updated November 10, 2026. This is the only active status and work queue.

Public Parish launched on September 18, 2026. It is now in maintenance mode as
a Varholdt Labs project. Varholdt Labs is the public name of Varholdt AI LLC.
The app makes no money. The goal is to keep published evidence accurate and
the resident loop working at low cost, not to add features.

## What supported means now

- Weekly source checks for the supported bodies, under a small monthly model
  budget the owner funds by hand. [Operations](operations.md) has the amounts
  and limits.
- Ask, follows and email updates keep working. Breakage there comes before
  anything new.
- No new body, parish or story without the ten coverage gates in
  [sources](sources.md) and an owner decision.

When checks pause or a budget runs out, the app keeps showing the last
accepted records with their dates and limitations.

## Last recorded state

Recorded November 10, 2026. Read live state with the owner tools before
assuming any of this still holds.

- Production runs `openai/gpt-6.1-terra` and `openai/gpt-6-luna`. Both passed
  a strict-JSON-Schema probe on development before the switch.
- The monthly allowances were funded on November 10 with $10 of room for
  sources and $5 for Ask. Both expire December 10 at about 00:02 UTC and do
  not renew.
- All thirteen monitoring policies check weekly. One had finished its first
  full pass on November 10. The rest were catching up.
- From September 19 to October 3 the Firecrawl account had no credits. Those
  HTTP 402 responses produced the high failure counts on six policies. The
  plan is 1,000 credits a month and renews on the 16th.
- Meta was published as `xd783vzec7vkzpg9w25g72wxdx8hz1qc`, reviewed through
  November 9, with the Public Service Commission's September 16 minutes. Next
  review December 17.
- Beaver Lake was published as `xd77k9rfvf5tp1x06p31fa9nc58hzrd2`, reviewed
  through November 9, with the Central Louisiana Regional Port's September 30
  minutes. Next review January 15, 2027.
- SpaceX and Boyce were reviewed against official documents through October
  22, and that review found no substantive change. A November 10 check found
  newer documents for both. The open items below replace that conclusion.
- Story and ballot pages send source-open and official-link-open events
  since [PR #281](https://github.com/LaykenV/public-parish/pull/281) deployed
  on November 10. Production counts have not been checked yet. Opens before
  that release were never counted, so the earlier zero is a gap, not a
  measurement.
- The latest application release recorded here is `0b2d0e6` through
  [PR #282](https://github.com/LaykenV/public-parish/pull/282). It merged
  last and includes #281 and #283.

## Open items

None of these are done.

- [ ] Fund the next month's allowances before December 10, or paid work
  stops. Only the owner does this.
- [ ] Watch Firecrawl credits. The catch-up burst used 336 credits in its
  first hour. If steady use stays above 1,000 a month, choose between a larger
  plan and fetching less.
- [ ] Ballot pages state no result. On November 10 the Secretary of State
  still marked the November 3 results unofficial. Add outcomes only from
  official results, with citations, and keep the no-recommendation rule. The
  ten amendment summaries still read in future tense until then.
- [ ] `events.lafayettela.gov` answers direct downloads with HTTP 403. Four
  Lafayette bodies get only documents hosted on `www.lafayettela.gov`. The
  owner decided not to work around the block. Full coverage needs the city to
  allow the fetches.
- [ ] Three Pineville listing pages redirect to `library.municode.com`, which
  answers automated requests with a bot check. They are set aside after three
  failures in a pass and tried again the next week.
- [ ] Twelve targets are failed in production: nine East Baton Rouge
  Planning and Zoning and three Metropolitan Council. All twelve failed
  deterministic validation, not retrieval. Five Planning and Zoning targets
  failed only `citation_not_found`.
  [PR #283](https://github.com/LaykenV/public-parish/pull/283) fixes the cause
  read in three of them: a quote that starts inside a bold agenda heading and
  crosses a line break. The quotes for the other two were not read. Failed
  targets stay failed until the owner retries them with
  `monitoring/ledger:retryTarget`, which spends the sources allowance.
- [ ] Two Planning and Zoning agenda items, CUP-4-26 and CUP-2-26, fail
  `agenda_outcome_unsupported` on each agenda snapshot, four targets so far.
  The agenda itself prints a withdrawal or a deferral, and the rule lets no
  agenda produce an outcome. Each new snapshot spends up to three extraction
  attempts on them. The owner decides whether the rule changes.
- [ ] The three failed Metropolitan Council targets ran on processor v1.19 in
  September with `citation_not_found`. Their cause on the current version is
  not confirmed.
- [ ] After the first Metropolitan Council run on
  [PR #282](https://github.com/LaykenV/public-parish/pull/282), check that the
  saved discovery pass closed. On November 10 it held 23 version-history pages
  for meetings before the window.
- [ ] Meta's limitations list the permit set, incentive agreement and tax
  rebates twice. Remove the repeat at the December 17 review.
- [ ] Weekly monitoring fetches the same September 16 commission minutes the
  Meta story cites. If a fetch returns different text, the story moves to
  "needs review" and leaves Home. Check after each commission run.
- [ ] Boyce needs a story update. The England Authority posted a form of
  PILOT lease with APLD AEX-01 LLC for introduction on its
  [October 22 agenda](https://englandairpark.org/wp-content/uploads/2026/10/Notice-and-Agenda-FINAL-10.22.2026-public-page.pdf)
  and its
  [November 9 special meeting packet](https://englandairpark.org/wp-content/uploads/2026/11/1.1a-Notice-and-Agenda-11.9.2026.pdf). The form has a payment schedule
  and payments for the Town of Boyce marked subject to final negotiations. No
  adoption is recorded, and no October 22 or November 9 minutes were posted on
  November 10. Publish these as proposed terms only, and wait for the minutes
  before saying anything was approved.
- [ ] SpaceX had no substantive change on November 10. The
  [September 16 Vermilion Police Jury minutes](https://www.vppj.org/PDFforms/minutes/2026/PJ%20Minutes%2009-16-26.pdf)
  only approve planning a visit to SpaceX in Brownsville. The jury's own
  [notice](https://www.vppj.org/PDFforms/Notices/SpaceX_Community_Town_Hall_September_24.pdf)
  gives a September 24 town hall, so the published limitation about a missing
  town-hall date is stale. A
  [November 4 committee agenda](https://www.vppj.org/PDFforms/Agendas/Agendas%202026/11.Nov2026/CR%20CH%20PR%20PW%20FC%20Agendas%20Website%2011-04-26.pdf)
  lists an executive session on a lawsuit that names the
  Industrial Development Board and the Police Jury. The agenda does not say
  what the suit is about, and news reports are leads only. Look for the
  board's records and the court filing.
- [ ] These links are leads for the next review. No snapshot of these
  documents was saved, so a story update fetches them again through the
  normal intake.
- [ ] Production shows SpaceX and Boyce as reviewed through September 14 with
  a next review of September 18. The October 22 review did not move those
  dates.
- [ ] Follow the
  [Meta research leads](meta-morning-report-2026-09-17.md#important-findings-outside-the-published-evidence)
  before adding story claims. Do not turn public authorizations into a claim
  of completed spending.
- [ ] The follow and email path has not been tested end to end since the
  model switch. It needs a recipient the owner authorizes.
- [ ] Audit the fixed bills the model ledger does not cap: Convex, Firecrawl,
  AgentMail and the domain.
- [ ] Read the evidence-open counter after a week of real traffic. No test
  event was sent to production.
- [ ] `convex/emailReplies.test.ts` and `convex/issues.test.ts` each failed
  once under full-suite load on November 10 and passed when run alone. Not
  diagnosed.
- [ ] Keep the [readability audit](readability-audit-2026-09-15.md) follow-ups,
  including the broader Meta Ask that dropped "material" from a
  transmission-cost condition.
- [ ] Confirm the latest email citation layout the next time the owner replies
  to the tracked test email.
- [ ] Keep image provenance disclosures until reuse permission or a
  replacement is documented.

## History

The [launch queue through November 9](archive/work-through-2026-11-09.md) keeps
the launch receipts, release table, September 21 audit and hackathon checklist.
The hackathon submission result is not recorded in this repository. The old
queue left the vibeapps.dev entry open, and no entry URL or confirmation was
retained. It is history now, not open work. [hackathon.md](../hackathon.md)
keeps the build log. [Work history through September 15](archive/work-through-2026-09-15.md)
and the dated reports keep older receipts.

Do not mark a post, official outcome, provider test or submission complete
without evidence in this repository.
