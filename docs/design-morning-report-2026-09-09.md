# Morning design report, September 9

The rest of the app now follows the approved Home design in the local working
tree. The work is on `design/resident-app-home-patterns`, based on `f7742d5`.
Nothing from this pass has been committed, pushed or deployed.

The main improvement is consistency. Long evidence pages have readable titles,
clear actions and calmer metadata. Forms and account settings use the same white
cards, purple controls, lavender background and Inter type as Home.

## What changed

| Area | Result |
| --- | --- |
| All three stories | Clear Ask, Follow and Share actions, readable review dates, section navigation, a dated timeline and distinct evidence and uncertainty sections. Citation links open and focus their exact source |
| Issues, decisions and meetings | Smaller long titles, clearer status panels, compact source controls and readable quote context. Government outcomes keep neutral colors |
| Ask | More readable answers, quieter metadata, consistent suggestions and a white composer. Source inspection retains the existing drawer and dialog behavior |
| Explore | Larger search and result rows. The government-body selector includes all twelve launch bodies and preserves older accepted links. Previously, the parser silently discarded Pineville and other current body filters |
| Following, areas, topics and notifications | Consistent account navigation, cards, cadence controls and mobile actions. Copy distinguishes saved account areas from the parish selected on Home |
| Email management | Consistent recovery and cadence controls. Destination details stack on narrow phones instead of splitting the email across small columns |
| Coverage | The body directory appears sooner. Status definitions expand on demand. Cards have more room and ISO check dates use readable dates |
| Coverage requests and source reports | The request form precedes its explanation on phones. Source reports use the full mobile drawer height and readable fields |
| How it works and Privacy | Shorter headings, clearer reading widths, white data panels and consistent links |
| Recovery and owner tools | Shared recovery cards and loading treatment. Owner forms, ledgers and long technical values have responsive styling |
| Shared sheets | Focus leaves a closing popup before it becomes hidden. Escape and Close return focus to the opener without the reproduced Chrome hidden-focus warning |

Accepted story text, evidence, images and publication gates remain intact. The
homepage layout remains the reference. No backend function, provider setting,
source allowance or delivery policy changed.

## Manual checks

I inspected the local frontend in native Chrome. Phone and tablet checks used
Chrome responsive mode. These are visual and interaction checks, not physical
phone or WebKit results. Development fixtures supplied account and error states
without sending emails or changing user records.

| Pages or views | Observed checks |
| --- | --- |
| Meta, SpaceX and Boyce stories | Desktop and narrow-phone reading layouts for all three, including 320 and 375 pixels. Meta also at 768. Exact source expansion and focus, source excerpts and artifact controls |
| Issue, decision and meeting | Desktop and 375-pixel fixture layouts, long headings, status panels and source controls |
| Ask | 375-pixel answer and source drawer. Source close returns focus. Desktop retryable-error view and mobile cooldown fixture |
| Explore | Desktop and 375-pixel results and empty state. Pineville URL retained and correct live records returned. Desktop selector shows Pineville. Mobile filter sheet shows compact body select and reachable result action |
| Following | Desktop active view, plus 320 and 375-pixel active and signed-out views. Areas/topics and Add area dialog at 375, areas/topics at 768. Notifications at desktop and 375 |
| Email management | Valid management view at 320 and 375. Corrected destination layout rechecked at 320. Expired-link form at 375 |
| Coverage | Desktop and 375-pixel directory, status disclosure open/close. Degraded fixture at 414 |
| Coverage request | Desktop layout and empty-submit validation with focus returned to the place field. Form-first layout rechecked at 320 after the initial 375-pixel inspection |
| Private source report | 375-pixel full-height form. Empty submission stayed local and focused the description field |
| How it works and Privacy | Desktop and 320-pixel reading layouts |
| Recovery | Unavailable story at 375 and unknown route at 768 |
| Owner operations | Desktop access gates. Local Google sign-in returned a failure message. Protected owner forms received static review, not authenticated runtime certification |
| Shared sheet focus | Final 375-pixel filter sheet checked with Escape and Close. Both restored opener focus without a new hidden-focus warning |

The visual review found and repaired the body-filter link loss, short source
report drawer, cramped email destination and closing-sheet focus issue.
`git diff --check` passed during the final static review.

## Checks still required

Repository instructions prohibit local automated validation unless an exact
command is authorized. No test runner, typecheck, build or linter ran locally.
The frontend dev server was used for manual inspection without deploying Convex.

Nine new browser tests cover the three story journeys, 320/768/1280-pixel
supporting pages, coverage form validation, the status disclosure and body-filter
navigation with focus return. The existing two-project configuration will run
these in Chromium and WebKit. A unit regression covers the body URL parser, and
one existing copy assertion was updated. All of these await CI.

This pass does not certify every state of every authenticated workflow. The
remaining evidence includes authenticated owner views, real Google follow
persistence, provider email delivery, physical-device and screen-reader checks,
image failure and offline behavior, and final founder acceptance. Existing
QA-001, the raw marker in a production story answer, remains open. No paid Ask
call or provider email was sent to repeat that check.

The next release needs PR CI and review, followed by an authorized production
merge, its exact deployment workflow and independent production smoke.
[Current work](work.md) remains the only pending-work queue.

## Workspace handoff

Pre-existing generated Convex declarations and edits to `docs/design.md`,
`docs/work.md` and `hackathon.md` were preserved. This pass adds to those documents
without claiming their earlier edits as new work. The updated
[design reference](design-system.html) describes the resident-page conventions.

The frontend preview remains at `http://localhost:3000`. It uses the local
frontend and existing development data.

## Owner corrections after the first review

Louisiana now uses charcoal shading with muted violet pins and edges. Colored
left-edge strips were removed from cards, including the Ask scope card.

Stories, issues and decisions now open Ask from a floating purple mobile button.
The drawer keeps the reading URL and preserves a draft when closed and reopened.
Source controls and decision links have compact neutral borders. Following uses
visible tabs on mobile instead of the View dropdown.

The dedicated browser preview confirmed the story drawer and draft preservation,
a local decision-fixture answer and its nested source drawer, focus return, and
Following navigation at 320 pixels. The WebGPU homepage relief rendered in its
new neutral colors. No paid Ask call was sent. A transient development hot-reload
context error cleared after fresh navigation. Automated checks still await CI,
and physical mobile keyboard behavior remains unverified.
