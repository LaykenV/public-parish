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
  22. Neither had a substantive change.
- The latest application release recorded here is `2be3dc4` through
  [PR #279](https://github.com/LaykenV/public-parish/pull/279).

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
- [ ] Baton Rouge Metropolitan Council discovery spends calls on
  "PreviousVersions" pages for meetings before the window, because the
  `_MMDDYYYY` date in those URLs is not recognized.
- [ ] Six East Baton Rouge Planning and Zoning decisions failed after three
  attempts. The cause is not diagnosed.
- [ ] Meta's limitations list the permit set, incentive agreement and tax
  rebates twice. Remove the repeat at the December 17 review.
- [ ] Weekly monitoring fetches the same September 16 commission minutes the
  Meta story cites. If a fetch returns different text, the story moves to
  "needs review" and leaves Home. Check after each commission run.
- [ ] Next story reviews: SpaceX should look for the September 16 Vermilion
  Police Jury minutes. Boyce should check the November England Authority
  minutes. Follow the
  [Meta research leads](meta-morning-report-2026-09-17.md#important-findings-outside-the-published-evidence)
  before adding claims. Do not turn public authorizations into a claim of
  completed spending.
- [ ] The follow and email path has not been tested end to end since the
  model switch. It needs a recipient the owner authorizes.
- [ ] Audit the fixed bills the model ledger does not cap: Convex, Firecrawl,
  AgentMail and the domain.
- [ ] Repair story and ballot evidence-open telemetry before using that counter.
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
