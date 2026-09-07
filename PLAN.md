# Business and product plan

Owner decisions updated September 7, 2026. Current delivery status and all
unfinished work live in [the work plan](docs/work.md). Technical contracts live
in [architecture](docs/architecture.md).

## Purpose

Public Parish is a free, open-source, nonpartisan Louisiana civic application.
It helps residents understand consequential government decisions, inspect the
official evidence, ask questions, follow a subject, and learn what changed.

Government records are scattered across agendas, minutes, permits, notices,
agreement documents, and agency websites. Public Parish connects those records
into explanations a resident can inspect. It does not replace the official
record, legal notice, or an agency's answer.

## Audience and positioning

Lead with recognizable Louisiana stories. Give a visitor a reason to read before
asking them to configure local coverage. Then offer the decisions affecting their
selected area. Reading and Ask require no account. Google sign-in supports saved
interests and managed follows. Verified email subscriptions are a separate
account-free delivery path.

The working product promise is "Understand Louisiana's consequential stories,
with the official evidence." This is proposed positioning for the coming design
pass, not a claim that the story feature has shipped.

Stories-first is an adoption hypothesis. Measure whether visitors inspect
sources, ask useful questions, follow, and return. Interest in a familiar project
does not establish approval or opposition to that project.

## Approved launch scope

Launch with exactly these three featured stories on Home:

| Placement | Story | Geographic label |
| --- | --- | --- |
| Lead | Meta data center | Richland Parish, northeast Louisiana |
| Secondary | SpaceX project | Pecan Island, Vermilion Parish |
| Secondary | Applied Digital / Boyce data center | Rapides Parish |

Use verified project names in published copy. "Monroe data center" can identify
a research lead, but it does not replace the precise project geography.

All three stories and the complete story functionality must work before the
founder's global design and full QA pass begins. Required functionality includes
owner-controlled source intake and review, versioned publication, photos,
citations, story-scoped Ask, story follows and sourced updates, email replies,
sharing, search, and related local records. A collection of static articles does
not close this phase. The [work plan](docs/work.md) owns acceptance and order.

The local product continues to cover the named bodies in Lafayette, Rapides,
and East Baton Rouge defined in [sources](docs/sources.md). A story may span
several agencies or places. Its publication does not certify continuous coverage
of those agencies or add their parishes to the local selector.

## Delivery order

1. Finish story functionality and publish the three accepted launch stories.
2. Complete global design changes, then page-by-page desktop and mobile design
   and functional QA. Fix blocking findings.
3. Launch publicly, conduct outreach, publish content, observe residents, and
   make bounded fixes. Record the demo and submit with the owner's authorization.

Functional verification during implementation is still required. The full
founder design and QA campaign starts after the story acceptance gate. Broad
promotion waits for the public launch gate. Preparing source dossiers and draft
outreach materials does not authorize sending or publishing them.

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

The owner permits additional targeted spending over the remaining hackathon
period when it improves the three stories, resident reliability, design and QA
proof, launch operation, or the submission. The earlier $10 catch-up maximum was
a containment measure after an excessive backfill run. It is not the total budget
for the rest of the project.

This is not permission for unlimited scraping, archive completion, all-body
reactivation, or repeated retries without diagnosis. The [operations policy](docs/operations.md)
requires finite task allowances, expected benefit, reuse of stored evidence,
provider-cost accounting, and stop conditions. No new numeric allowance or
production setting is established by this documentation change.

Public Parish remains a bounded civic-service experiment and a public technical
case study. Protect the weekday 90-minute Varholdt sales block. Resident use and
hackathon attention do not count as commercial leads, paid diagnostics, proposals,
or deposits. Prize money is uncertain and cannot be treated as revenue.

The app stays free and open source during the hackathon. There is no paid civic
tier, advertising product, paid placement, or sale of resident data in scope.
After judging, compare resident usefulness, operating cost, and maintenance time
before deciding its ongoing pace. Do not promise perpetual statewide service.

## Evidence of success

Aim for 25 permissioned or recruited residents, 10 follows, 10 substantive
questions, several return visits, and a sourced update somebody finds useful.
These are working targets, not measured results or conditions for inventing
activity. Keep anonymous browser counts separate from known residents.

A persuasive demo shows an understandable story, an exact receipt, a grounded
question, a follow, and an evidence-backed update. Sponsor integrations must do
real work. [Marketing](docs/marketing.md) owns distribution and measurement;
[submission](docs/submission.md) owns organizer requirements and demo artifacts.

## Deferred scope

Do not add a fourth launch story, broad CCS coverage, candidate comparisons,
election predictions, a ballot database, maps, public discussion, testimony
writing, public-records request automation, procurement tools, video
transcription, a government staff portal, FAQ aggregation, a public corrections
workflow, public-triggered compilation, live public compiler progress, or
cross-device chat history for this launch.

Keep the small dated voter-information strip with official outbound links.
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
