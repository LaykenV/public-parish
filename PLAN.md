# Business and product plan

Owner decisions updated November 9, 2026. Current status and all
unfinished work live in [the work plan](docs/work.md). Technical contracts live
in [architecture](docs/architecture.md). The pre-launch upgrade slices live in
[the launch upgrade plan](docs/launch-upgrade.md).

## Purpose

Public Parish is a free, open-source, nonpartisan Louisiana civic application.
Varholdt Labs (Varholdt AI LLC) builds, maintains and pays for it. It is not
affiliated with any government body, candidate or campaign. It helps residents understand consequential government decisions, inspect the
official evidence, ask questions, follow a subject, and learn what changed.

Government records are scattered across agendas, minutes, permits, notices,
agreement documents, and agency websites. Public Parish connects those records
into explanations a resident can inspect. It does not replace the official
record, legal notice, or an agency's answer.

## Audience and positioning

Louisiana is the default Home. Introduce Public Parish with the Louisiana hero,
the three stories and one statewide utility roundup, then issues across covered parishes.
The area selector offers Louisiana and parishes. Parish Home hides the stories
and begins with local issues and body filters. Any saved selection dismisses
the hero, including when the reader returns to Louisiana. Reading and Ask
require no account. Google sign-in supports saved interests and managed follows. Verified email subscriptions are a separate
account-free delivery path.

The product promise is "Understand Louisiana's government decisions. See the
documents behind them and follow what happens next." The story feature is
deployed; [Work](docs/work.md) records its proof and limits.

Public Parish is not a civic data aggregator. It sharpens one workflow:
understand a consequential decision, open the document behind it, ask a
grounded question, follow what happens next, and receive the sourced update.
Statistics profiles, spending dashboards, candidate profiles, campaign finance
and polls were considered on September 12 and are not in this launch.

Stories-first is an adoption hypothesis. Measure whether visitors inspect
sources, ask useful questions, follow, and return. Interest in a familiar project
does not establish approval or opposition to that project.

## Approved launch scope

Launch with exactly these three featured stories on Home:

| Placement | Story | Geographic label |
| --- | --- | --- |
| Lead | Meta data center | Richland Parish, northeast Louisiana |
| Secondary | SpaceX project | Vermilion Parish |
| Secondary | Applied Digital / Boyce data center | Rapides Parish |

Use verified project names in published copy. "Monroe data center" can identify
a research lead, but it does not replace the precise project geography. The
legacy SpaceX research key and route contain Pecan Island; the accepted evidence
does not establish that precise site location.

All three stories and the complete story functionality passed before the
founder's global design and full QA pass. The continuing contract includes
owner-controlled source intake and review, versioned publication, images,
citations, story-scoped Ask, story follows and sourced updates, email replies,
sharing, search, and related local records. A collection of static articles does
not close this phase. The [work plan](docs/work.md) owns acceptance and order.

The local product continues to cover the named bodies in Lafayette, Rapides,
and East Baton Rouge defined in [sources](docs/sources.md). A story may span
several agencies or places. Its publication does not certify continuous coverage
of those agencies or add their parishes to the local selector.

### Approved launch upgrade

The September 12 upgrade adds, in slices defined in
[the launch upgrade plan](docs/launch-upgrade.md):

- Louisiana-first Home with parish selection, Home body filters and correct
  place-qualified body labels.
- Consequence-first selection of local issues with a cited one-line reason.
- The September 16 LPSC agenda-to-outcome experience on the Meta story.
- The Louisiana Public Service Commission as a statewide body, supported only
  after the same ten coverage gates.
- Sourced explanations of the ten November 3 constitutional amendments, and
  verified parish propositions where documented, with Ask and follows and
  without recommendations or candidate content.

The featured story set stays at three. The upgrade does not add a fourth story.

## Delivery stage

Public Parish launched on September 18, confirmed by the owner. It is now in
maintenance mode. The work is keeping what is published accurate and the
resident loop working, not new features.

Supported now means:

- Weekly source checks for the supported bodies, under a small monthly model
  budget the owner funds by hand. [Operations](docs/operations.md) has the
  amounts and limits.
- Ask, follows and email updates keep working. Breakage there comes first.
- No new body, parish or story without the ten coverage gates and an owner
  decision.

Launch completion does not establish a new government outcome or an organic
resident result. The hackathon submission result is not recorded in this
repository. [Work](docs/work.md) owns the queue and receipts.

Functional verification remains required for later changes. A documentation
update does not authorize sending, posting or publication of an unreviewed
government claim.

## Trust contract

- Every published factual claim resolves to an immutable official-source
  snapshot and precise citation, including story headlines, captions, and
  previews when they make factual claims.
- Preserve atomic decisions and single-body issue identities. Stories organize
  accepted evidence across bodies without replacing those records.
- Missing evidence produces a limited explanation or withheld publication.
  Independent review cannot turn absent evidence into a fact.
- Explain consequence, process, uncertainty, and public actions without advocacy.
  Do not infer political motives or public consensus.
- Separate editorial placement from deterministic importance and coverage
  confidence. A featured story gets no stronger evidence status from attention.
- Keep private questions, messages, email addresses, and resident records out of
  public docs, analytics payloads, screenshots, and demos.

## Spending and business boundaries

The app makes no money. Routine paid work stays inside the monthly maintenance
budget in [operations](docs/operations.md). Allowances expire and never renew
by themselves. Work beyond the budget needs its own finite allowance and stop
condition from the owner.

This is not permission for unlimited scraping, archive completion, all-body
reactivation, or repeated retries without diagnosis. The operations policy
requires finite task allowances, expected benefit, reuse of stored evidence,
provider-cost accounting, and stop conditions.

Public Parish is a bounded civic service and a public technical case study.
Protect the weekday 90-minute Varholdt sales block. Resident use does not count
as commercial leads, paid diagnostics, proposals, or deposits.

The app stays free and open source under the MIT license. There is no paid
civic tier, advertising product, paid placement, or sale of resident data in
scope. Do not promise perpetual statewide service.

## Evidence of success

Aim for 25 permissioned or recruited residents, 10 follows, 10 substantive
questions, several return visits, and a sourced update somebody finds useful.
These are working targets, not measured results or conditions for inventing
activity. Keep anonymous browser counts separate from known residents.

[Marketing](docs/marketing.md) owns distribution and measurement. The
hackathon [submission](docs/submission.md) notes are history.

## Deferred scope

Do not add a fourth launch story, broad CCS coverage, candidate profiles or
comparisons, campaign finance, polls, endorsements, election predictions, a
candidate database, population or economic statistics profiles, budget or
spending dashboards, a money aggregate over decisions, maps, public discussion,
testimony writing, public-records request automation, procurement tools, video
transcription, a government staff portal, FAQ aggregation, a public corrections
workflow, public-triggered compilation, live public compiler progress, or
cross-device chat history for this launch.

Sourced ballot-measure explanations are in scope under the launch upgrade.
They quote the official ballot wording and the Act, never recommend a vote, and
never describe campaigns. Keep the small dated voter-information strip with
official outbound links; it links to the published ballot page.
Keep private source-problem reports and public coverage requests. Reports and
requests do not launch paid source work.

## Decision record

On September 7 the owner approved consolidating documentation, leading Home with
Louisiana stories, and retaining local issues below them. The owner then fixed
the launch set as Meta, SpaceX, and Boyce, required story completion before the
full design and QA pass, and replaced a catch-up-only spending restriction with
purposeful spending on hackathon outcomes. Older slice plans and the optional
story-follow fallback are superseded by this scope.

[Historical plans and release evidence](docs/archive/README.md) remain available.
Do not use their unfinished checkboxes as the current work queue.

On September 8 the owner approved restoring the original Home hero, changing
content order after area selection, deep purple and lavender shared colors,
a mobile hamburger menu, and compact election information. The Home QA follow-up
moves election information into the footer, uses a lavender off-white page with
a white issues section, and gives mobile issues a horizontal row. All three
mobile stories use full-sized images.
After selection, remove the hero and Louisiana visual. A single centered global spinner
replaces skeleton loading. The September 10 owner review restores stories before issues for every area selection.

The next Home refinement matches Louisiana lighting to purple on a transparent
canvas, shares the page background through the header and footer, and shows only
dots below mobile issues. Follow enrollment uses compact choices. The mobile
menu floats below the animated hamburger button using the portfolio pattern.

On September 10 the owner requested a shared reading experience across stories,
issues, decisions and meetings. Stories stay above local issues with an area
selected. The 3D Louisiana is desktop-only. Sources open in drawers without
moving the reading position, and chat keeps its composer below the conversation.

On September 12 the owner reviewed five proposals to make the launch more
compelling: a statewide default with parish focus, a parish-city-body selector
with corrected labels, spending data, statistics, and midterm candidate data.
Two agent reviews agreed on the direction recorded above. The owner adopted
Louisiana-first Home, selector and label work, consequence-first issue
selection, the September 16 LPSC outcome experience, bounded LPSC coverage and
ballot-measure explanations. The owner cut spending data, statistics, candidate
and poll data and a proposed money aggregate. The stance is to show what the
documents establish and what remains unresolved, not to confirm or puncture an
announcement. [The launch upgrade plan](docs/launch-upgrade.md) owns the slices.

On September 16 the owner confirmed that design and QA were complete and
considered Public Parish ready for launch. At that checkpoint, the queue still
included the LPSC outcome follow-up and launch posts. This decision superseded
the earlier private-pilot prerequisite. Demo recording and hackathon submission
were separate deliverables. That sign-off established neither organic usage
nor submission. The September 18 decision below supersedes this launch status.

On September 18 the owner confirmed public launch, accepted the finished demo
for submission and reported all planned launch posts published, including the
first five Facebook groups. This supersedes the September 16 launch queue.
Follow-up distribution and source maintenance continue after launch. The final
hackathon submission remains a separate action until its confirmation exists.

On November 9 the owner moved Public Parish to low-cost maintenance as a
Varholdt Labs project. Weekly source checks under a small monthly budget,
working Ask and email, and the ten coverage gates define support. Hackathon
rules are retired. This supersedes the September 18 delivery queue.
