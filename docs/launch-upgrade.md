# Launch upgrade plan

Owner decision of September 12, 2026, amended September 13 after live UX review.
This document owns the scope and slice contracts for the pre-launch upgrade. [Work](work.md) owns slice status and the
pending queue. [PLAN](../PLAN.md) records the positioning decision. Each slice
below is written so that one agent can take it without further context; every
slice still follows [AGENTS.md](../AGENTS.md), the evidence policy in
[sources](sources.md) and the spending policy in [operations](operations.md).

## Why this upgrade exists

The owner's concern is launching to no interest. The current Home is three
data-center stories over twelve local bodies whose accepted records are mostly
procedural and 730 of 920 are limited. A first-time visitor has little reason
to stay, and the product has not shown a stranger why it beats a newspaper.

The decision is to sharpen what already works rather than widen into datasets
that other sites already publish well. The resident workflow is: understand a
consequential decision, open the document behind it, ask a grounded question,
follow what happens next, and receive the sourced update. Every slice here
makes one of those steps more compelling or gives more people a reason to try
it. Statistics profiles, spending dashboards, candidate profiles, campaign
finance, polls and a "Money" aggregate were considered and are not in this
launch. See the decision record in [PLAN](../PLAN.md#decision-record).

## Public promise

> Understand Louisiana's government decisions. See the documents behind them
> and follow what happens next.

Use this promise, or a shorter form of it, on Home, in social copy and in the
demo. Internal strategy language such as "receipts layer" stays in planning
documents. The editorial stance is to show what the documents establish and
what remains unresolved. Sometimes the record substantiates an announcement;
sometimes it establishes only an early procedural step. Neither outcome is a
target, and the product never frames a story as puncturing or confirming hype.

## Corrections adopted from the second review

- September 16 is real but procedural. The revised LPSC agenda lists two
  procedural motions in U-37882 for discussion and possible vote, not final
  approval of the expansion. Prepare the scheduled items, let people follow
  beforehand, publish the outcome only when an official document supports it,
  and never promise a substantive decision or a next-day record.
- The Secretary of State has published the ten November 3 constitutional
  amendments with ballot wording and Act links. Parish propositions still need
  verification per parish. Selecting a parish must not imply every listed
  proposition appears on that resident's ballot.
- LIMITED is not a rejection label. A limited record can establish a
  consequential fact while leaving another question open. Home favors useful,
  current explanations with supported consequences; source-only stubs belong
  deeper in Explore. A numerical sort still needs inspection for stale items
  and weak explanations.
- Absolute claims about sharing behavior, newspapers and launch failure are
  not part of the case. Resident behavior after launch tests the hypothesis.

## Slice map

| Slice | Outcome | Depends on | Parallel with | Paid work |
| --- | --- | --- | --- | --- |
| U1 | Louisiana is the default Home; a parish is a focus a reader can leave | None | U2, U3, U5, U6 backend | None |
| U2 | Correct public body labels, parish selection, and body filters on Home and Explore | None | U1, U3 | None |
| U3 | Home shows consequential, current local issues with a one-line reason to care | None | U1, U2 | None |
| U4 | September 16 LPSC agenda-to-outcome experience on the Meta story | Meta v4 (published) | Everything | Small, named |
| U5 | Louisiana Public Service Commission as a statewide covered body | U1 for placement | U2, U3, U6 | Yes, bounded |
| U6 | November 3 ballot measures explained from the ballot wording and Act text | U1 for placement | U2, U3, U5 | Small, per measure |
| U7 | Launch content, demo sequence and social previews for the new surfaces | U1 through U6 | None | None |

U1, U2 and U3 all touch Home. Run them on separate branches with one concern
per PR, and rebase in the order U2, U1, U3 when they conflict. U5 and U6
backend work can start in development immediately. U4 is calendar-bound.

Slices do not replace the design and QA gate in [work](work.md#phase-2-global-design-and-full-qa).
The founder pass covers the new surfaces after the slices land.

## U1. Louisiana-first Home

### Outcome

A first visit shows Louisiana: the hero, the three stories, statewide records
once U5 or U6 publish them, then issues and records across covered parishes.
Choosing a parish focuses Home on its local issues and removes the hero and
featured stories. A visible control returns to Louisiana and restores the stories.
The hero stays dismissed after any saved choice, including Louisiana.

### Scope

- `src/features/discovery/area-store.ts`: represent Louisiana explicitly. A
  stored area is a parish slug or the literal Louisiana value; a missing value
  means Louisiana. Do not treat "no area" as a gate anywhere.
- `src/features/discovery/area-selector.tsx`: an "All of Louisiana" row at the
  top of the list, selected when active. Title remains "Choose your area".
  The coverage request link stays in the footer.
- `src/features/discovery/home.tsx` and `home.css`: hero shows on the Louisiana
  view only before a saved selection, with the new promise as the heading.
  Parish view has no hero; its page heading names the focus with a "Back to all of Louisiana" control beside it,
  then local issues and records. Stories appear only in the Louisiana view.
  Returning to Louisiana restores stories while the hero stays dismissed.
  Reserve statewide-records and ballot slots below the stories that render nothing until U5 or U6 supply content.
- Header and mobile menu area control reads "Louisiana" or the parish name.
- Hero copy: heading "Understand what Louisiana's government is deciding."
  Body "See the documents behind each decision and follow what happens next."
  Keep the access line "Free to read and ask questions. No account needed."
- Analytics: area selection telemetry keeps its existing allowlisted values and
  adds the Louisiana value. Reading Louisiana is engagement, not a failed setup.

### Out of scope

Statewide data itself (U5, U6), body focus (U2), issue ranking (U3), any
change to story publication or Ask.

### Acceptance

- First visit at 320, 375, 768 and 1280 pixels shows hero, three stories,
  issues across covered areas and records. No dialog blocks the page.
- Selecting Lafayette removes the hero and stories, shows Lafayette issues
  and records, and offers a return to Louisiana. Returning restores stories
  without the hero. The choice and hero dismissal survive reload.
- Keyboard focus lands on a stable heading after each switch, matching the
  existing collapse behavior. Reduced motion is respected.
- Existing browser journeys for area change, menu focus return and native issue
  snapping still pass. Add journeys for the Louisiana row, return control and
  persistence.

### Documentation

Update the Homepage flow table in [design](design.md#homepage-flow) if the
implementation departs from the contract written there.

## U2. Body labels, parish selection and Home body filters

### Outcome

Every public body label names its place. Residents choose Louisiana or a parish
in the area selector, then filter by body on Home. Explore keeps its body filter.

### Facts

`governmentBodies.name` is an identity value. Story intake and story evidence
compare `body.name` to `bodyName` in manifests, and coverage certification
artifacts under `docs/coverage-gold-sets/` carry `bodyName`. Renaming it breaks
identity checks and historical run resolution. Add a public label instead.

Current labels that lack their place: `Metropolitan Council`, `Planning and
Zoning Commission`, `Hearing Examiner`, `City Zoning Commission`. The full
launch list is in [sources](sources.md#local-coverage-contract).

### Scope

- Schema: add optional `displayName` and optional `municipality` (slug and
  name, or a reference to a municipal jurisdiction) to `governmentBodies`.
  Populate from a code-owned map beside `convex/coverage/roots.ts` through the
  idempotent launch seed. Identity `name` and `slug` do not change.
- Resident projections (`convex/resident/`), search entries, share HTML, follow
  target titles and email copy use `displayName` when present. Owner
  operations keep showing the identity name beside it.
- Labels: "Baton Rouge Metropolitan Council", "East Baton Rouge Planning and
  Zoning Commission", "Lafayette Hearing Examiner", "Lafayette City Zoning
  Commission". Keep the two separate Lafayette planning commissions distinct.
  Never use a generic planning commission label.
- Selector: list Louisiana and parishes only. Parish rows set the area and
  clear any city or body focus. Body choices belong in Home's filter chips.
- Home body focus: chips under the local issues heading list the selected
  parish's bodies; one chip active filters issues and records to that body.
  Reuse the existing `body` search parameter contract from Explore and the
  parser fixed in QA-002 so current names survive URL parsing.
- Explore: body filter options show `displayName` grouped by place.

### Out of scope

New bodies, coverage promotion, follow enrollment changes beyond titles.

### Acceptance

- Public pages, search, share HTML, Following and email previews show the
  place-qualified labels; identity checks and existing tests still pass.
- Choose Rapides in the area selector, then Pineville City Council on Home.
  Keyboard and touch work at 320 pixels without overflow. The selector contains
  no city or body choices; existing shared focus links still resolve.
- A body chip on Home filters both issues and records and is reflected in the
  URL; reload preserves it; clearing returns to the parish view.
- The Pineville Explore link regression from QA-002 remains green.

## U3. Home feed selection and card copy

### Outcome

The first six local issues in any view are the ones a resident would care
about, each with one sentence saying why, and each current.

### Facts

Importance uses cited factors in `convex/issues/scoringV1.ts` and
`importanceAssessments` rows with rationale and citation IDs. Home currently
returns bounded issue timelines without a resident-visible reason. The
[September 12 audit](launch-readiness-2026-09-12.md#local-issues-to-use-for-launch)
names nine issues that must surface in their parish views.

### Scope

- Selection: order Home issues by a deterministic combination of cited
  importance score, presence of a next documented date or recent outcome, and
  recency of the accepted version. Exclude from Home, not from Explore, issues
  whose current version has no supported consequence factor and no next date.
  Limited issues with a supported consequence stay eligible.
- Card copy: add a one-line "why this matters" drawn only from cited
  consequence rationale on the accepted version. When no cited rationale
  exists, show the next documented date or latest outcome instead. Never
  generate new prose at read time.
- Staleness: show the accepted version's reviewed or updated date and a
  neutral notice when the source policy is paused. Do not advance dates.
- Decision records: prefer rows with amounts, deadlines, hearings or votes
  within the bounded result; keep the list honest about being bounded.
- Regression fixtures: the nine audit issues appear in the first six of their
  parish view or the test explains a legitimate reason.

### Out of scope

New model calls, reprocessing limited records, changing importance rubric
weights, editorial hand-ranking.

### Acceptance

- Deterministic ordering has unit coverage with ties and missing factors.
- No Home card shows a claim without a citation on its issue page.
- Explore still lists every accepted issue.
- Founder inspection of all three parish views and the Louisiana view finds
  no source-only stub in the first six.

## U4. September 16 LPSC agenda-to-outcome on the Meta story

### Outcome

Before September 16, the Meta story states exactly what is scheduled and
invites a follow. After the session, when an official LPSC document records
what happened to the two U-37882 motions, a reviewed Meta version publishes
that outcome, followers receive the sourced update, and the demo captures the
live change. If no official document appears in the window, nothing publishes
and the story says the outcome is not yet documented.

### Facts

Meta version 4 already cites the
[revised September 16 agenda](https://lpsc.louisiana.gov/docs/agenda/Sept_16_2026_Agenda_Revised.pdf),
which lists two procedural matters in U-37882 for discussion and possible
vote at 9 a.m. in the Galvez Building. It does not schedule final approval.
The May procedural order's December 16 consideration remains separately
attributed. LPSC is a registered story publisher. All source policies are
paused; this slice uses a named finite allowance, not monitoring.

### Scope

- Before the session: confirm the published Meta next-action copy describes
  the two motions as scheduled procedural items with the exact citation, and
  that Follow is visible near that section on desktop and phone. Publish no
  new version for copy that is already accurate.
- Watch list, checked by an agent or the owner, not a cron: the LPSC agenda
  page for a results or minutes document, the docket for a new order, and
  the audio or video archive as a lead only. Record the exact URLs checked.
- Retrieval: one Firecrawl retrieval per new official document through the
  existing story intake path, retaining bytes, hashes and provenance. Reuse
  the seven existing Meta sources.
- Publication: bundle 8 with exact excerpts, `MODEL_STRONG` draft, `MODEL_FAST`
  review, deterministic checks, owner approval of the exact hashes, and a
  material update event only if the accepted text changes substantively.
- Delivery: verify the follower email, the private management link and one
  grounded reply on the controlled recipient. Record receipts in
  [work](work.md).
- Demo: record the version change landing on an open story page and the
  email arriving. Label any replay explicitly.

### Spend

Name the deliverable, then fund a finite source tranche of at most $2 in model
charges and 10 Firecrawl credits for this slice, with one diagnosed retry.
Stop when the outcome publishes or the window closes on September 19.

### Acceptance

- Either a reviewed version 5 with the official outcome document, followers
  notified once, or a written record that no official document appeared and
  the public story still describes the outcome as undocumented.
- No claim about a vote result without the document that records it.
- No new parish, body promotion or monitoring policy.

## U5. Louisiana Public Service Commission as a statewide body

### Outcome

Statewide readers see current, cited LPSC decisions on the Louisiana Home
view, can open the documents, ask questions, and follow the commission. The
body becomes Supported only by passing the same ten coverage gates as every
local body.

### Facts

The `louisiana` state jurisdiction exists as a candidate. LPSC hosts are
registered for story sources. No LPSC root manifest, registry generation or
gate evaluation exists. LPSC business and executive session agendas are long
PDFs covering many dockets; inventory cost scales with pages.

### Scope

- Root manifest in `convex/coverage/roots.ts` for the LPSC with identity
  evidence URLs, allowed hosts, document hosts and a checked date. Source
  kinds are agenda and minutes for business and executive sessions only.
  Docket filings, testimony and rate-case exhibits are out of scope.
- Jurisdiction: promote `louisiana` through the same status lifecycle as a
  parish. The selector's Louisiana row lists statewide bodies under it after
  U2. Coverage page adds a Statewide group.
- Discovery window: sessions from July 1, 2026 forward. Do not backfill the
  archive.
- Compile in development first with the owner compiler, evaluate the ten
  gates, inspect the run ledger and inventory, and fix manifest defects
  there. Then run the same bounded compile in production under a named
  allowance. Promotion requires ten passes on the current registry generation.
- Home: the "Across Louisiana" slot from U1 lists statewide issues and records
  from supported state bodies with the same card contract as parish content.
- Follows: `government_body` follow for the LPSC once supported, through the
  existing coverage gate on body subscriptions.
- Ask: corpus and issue scopes include accepted LPSC records automatically.

### Spend

Propose two tranches: development compile up to $4 in model charges and 40
Firecrawl credits; production compile up to $6 and 60 credits. The owner sets
the actual allowances through the existing spending guard before any run. Stop
on repeated identical failure, exhausted tranche, or a gate that fails for a
reason a manifest change cannot fix. Report actual use afterward.

### Acceptance

- All ten gates pass in production on the current registry generation, or the
  body remains candidate or validating with the public coverage page saying
  so. Do not label LPSC supported early to fill the statewide slot.
- At least one recent business session has accepted agenda and minutes
  records with exact citations and a readable issue where linking succeeds.
- Story evidence for Meta is unchanged by this work; shared snapshots
  deduplicate rather than duplicate.

## U6. November 3 ballot measures

### Outcome

Residents can read what each of the ten proposed constitutional amendments
would change, quoted from the official ballot wording and the enrolled Act,
ask questions of that text, and follow the measure. Verified parish
propositions for Lafayette, Rapides and East Baton Rouge appear only where
the calling resolution and ballot text are documented.

### Facts

The Secretary of State's
[November 3, 2026 amendments](https://www.sos.la.gov/media/jo2die1s/proposed-constitutional-amendments-2026-nov.pdf)
lists ten measures: Amendment 1 (Act 39 of 2026, disabled veteran exemption
transfer to a surviving spouse), 2 (Act 273, millage rate adjustment), 3 (Act
271, post-conviction bail), 4 (Act 414, governor lifetime term limit), 5 (Act
606, retirement system unfunded liability), 6 (Act 274, exemption for owners
65 and older), 7 (Act 607, public funds for water service lines), 8 (Act 277,
expropriation by foreign adversaries), 9 (Act 220 of 2025, income limit for
the special assessment level) and 10 (Act 272, exemption for rehabilitated
blighted property). Seven of the ten concern property tax. Quote the ballot
questions from the PDF, not from this summary. The Louisiana Legislature is a
registered publisher; the Secretary of State is not yet. Legislative Fiscal
Office notes on legis.la.gov are official documents.

`storyKey` is a literal union of the three launch stories. Stories carry
import, review, immutable versions, Ask scope, follows, share metadata and
update events, all of which a measure needs.

### Scope

- Model: generalize the story registry to a code-owned map with a `kind` of
  `story` or `ballot_measure`, a stable key, placement and, for measures,
  election date, scope (statewide or parish slug), measure number and ballot
  wording citation. Widen `storyKey` validators to the registry keys. The
  three launch stories keep their keys, ranks and Home placement. Featured
  stories on Home remain exactly three.
- Publisher: register `louisiana-secretary-of-state` with `sos.la.gov` as an
  official publisher in code, with identity evidence.
- Content contract per measure, every claim cited: the ballot question
  verbatim from the SOS document; what the Act changes, quoted or closely
  paraphrased from the enrolled Act; who it applies to and the effective
  date; the fiscal note's stated effect when one exists; and what is not
  established. No recommendation, no supporters-and-opponents framing, no
  polling, no reference to campaigns.
- Manifests: one versioned public-safe manifest per measure under
  `docs/story-manifests/`, following the existing import contract. Draft with
  `MODEL_STRONG`, review with `MODEL_FAST`, deterministic checks, exact owner
  approval. Initial publication is a baseline and sends no mail.
- Routes: `/ballot` lists the election date, the ten amendments and any
  verified parish propositions for the focused area with the notice "Your
  ballot depends on your precinct. Check your sample ballot at the Secretary
  of State." `/ballot/$measureSlug` renders the measure with the shared story
  reading, Ask, Follow and Share patterns. Ordinary URLs serve social
  metadata like stories do.
- Home: an "On the November 3 ballot" section below the stories in both
  views, showing statewide amendments and, in a parish view, that parish's
  verified propositions. The footer voter strip links to `/ballot` and
  updates its checked date.
- Parish propositions: verify each launch parish against the Secretary of
  State's local proposition materials. Include a proposition only when its
  ballot text and the calling resolution or ordinance are documented, using
  accepted records where they exist. Otherwise list nothing for that parish
  and say so.
- After November 3, official results from the Secretary of State may publish
  as a material update. That is optional and after judging.

### Spend

One draft and one review per measure through the existing story path. Fund a
finite tranche of at most $4 in model charges and 20 Firecrawl credits for the
SOS document, ten Acts and available fiscal notes. Reuse retained artifacts
across measures. Stop when the ten statewide measures publish or the tranche
is exhausted.

### Acceptance

- Ten statewide measures published as full or limited with the ballot
  question quoted exactly and every statement cited to the SOS document, the
  Act or a fiscal note.
- Story Ask on a measure answers from that measure's evidence and declines
  questions about how to vote or who supports it.
- Follow, management and unsubscribe work for a measure through the existing
  story follow target without a second subscriber system.
- Home and `/ballot` at 320 and 1280 pixels; social previews checked on the
  actual platforms before outreach.
- No candidate, campaign, poll or endorsement content anywhere.

### Owner decisions required

Publish all ten amendments or a subset; whether parish propositions are in the
launch or follow it; confirmation that `PLAN.md` now allows ballot measure
explanations while keeping candidates, finance and polls deferred.

## U7. Launch content, demo and previews for the new surfaces

### Outcome

The launch posts and the demo use the upgraded product and specific,
checkable claims.

### Scope

- Personal Facebook launch: Louisiana Home, the promise, one concrete
  question a reader can ask, and the Meta September 16 scheduled items. If
  U4 published an outcome, lead with what the document records.
- Community posts: match the story or measure to the group. The amendments
  page is suitable for statewide groups; parish issues for local groups.
- X or LinkedIn: the required sponsor-tagged demo, under three minutes, in the
  order Louisiana Home, Meta story, citation to the official document, Ask,
  Follow, the September 16 update landing live, the sourced email and reply,
  the ballot page, then a parish focus.
- Preview checks on Facebook, X and LinkedIn for Home, the three stories,
  `/ballot` and two measures after their metadata exists.
- Update [marketing](marketing.md) and [submission](submission.md) with the
  final sequence. Nothing posts or sends without authorization.

### Acceptance

Drafts exist for each channel with exact URLs, every factual sentence traces to
an accepted version, and previews render the current approved title and image.

## Sequence and calendar

Dates are targets at the owner's pace, not proof.

| Window | Focus | Exit |
| --- | --- | --- |
| September 13 through 15 | U1, U2, U3 on Home; U5 development compile; U6 backend and manifests; U4 pre-session copy check | Louisiana-first Home reviewed locally; LPSC gates evaluated in development; measure drafts reviewed |
| September 16 through 17 | U4 session watch, retrieval and publication; U5 production compile; U6 publication | Outcome published or honestly undocumented; LPSC status known; amendments live |
| September 17 through 19 | Founder design and QA over the new surfaces, private pilot, U7 drafts and previews | Launch gate passed |
| September 18 through 20 | Public launch and outreach, bounded fixes | Live usage observed |
| September 20 through 21 | Demo and submission | Submitted by September 21 with authorization |

If time compresses, protect U1, U2, U3 and U4 first, then U6 statewide
amendments, then U5. Parish propositions are the first cut. Do not label a
body supported or a measure current to hit a date.

## Handoff rules for every slice

- Read `AGENTS.md`, `docs/work.md`, this document and the section of
  `docs/design.md` or `docs/sources.md` the slice cites before starting.
- One concern per PR, real PRs, conventional titles that state the user-facing
  why. Run `npm run verify` locally and report the result.
- Paid work needs the operations work-order fields filled in first and the
  owner's allowance configured through the spending guard. Report actual use.
- Never label a place or body supported, publish a version, send mail, post
  publicly, merge or deploy without the owner's authorization for that action.
  Merging to `main` deploys production.
- Record status, receipts and open findings in `docs/work.md`, not here.
