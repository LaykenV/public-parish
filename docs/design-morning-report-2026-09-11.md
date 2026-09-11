# Resident reading and Ask, morning report

The September 10 review requested one consistent experience across stories,
issues, decisions and meetings. This pass keeps the approved Public Parish
colors and typography and changes the reading, sources and conversation layouts.
The delivery target is development for owner review. Production remains on the
approved header release until the owner approves this pass.

## Changes from the review

| Owner note | Result |
| --- | --- |
| Stories above issues even with a selected region | Home always shows the three featured stories before local issues. Selecting a parish still filters issues and decisions and removes the introductory hero. |
| Meeting floating Ask and drawer | Mobile meeting pages have the same floating control and persistent chat drawer as stories, issues and decisions. Meeting questions retain the existing meeting scope. |
| Remove colored left edges | Removed the remaining warning-card accent and the selected-claim accent. Notices retain their written limitations and a plain border. |
| Broken phone timelines | Removed the cramped marker grid. Dates, events and decision links follow a single column. Decision change history uses the same readable width. |
| Source drawer resets reading position | Citation navigation no longer resets page scrolling. Closing returns focus without scrolling. Sources opened from chat retain the conversation's own scroll position. |
| No dots in pills | Status pills no longer inherit the metadata separator. Removed decorative dots from meeting artifact statuses. |
| Sources like stories across the app | Compact numbered controls replace the citation margin. They open drawers on phones and desktop. Story sources open the exact excerpt and original and saved-document links in a drawer instead of jumping to the page bottom. |
| Chat composer and send control | The composer stays below a separately scrolling conversation, including after sending. Empty suggestions sit above it. An accessible up-arrow button sits at the lower right. Drafts survive closing and reopening. |
| Account double lines | Removed the extra section rule beneath the tabs. The tabs keep their baseline and active underline. |
| Louisiana desktop only | Phones no longer mount the 3D model. Desktop retains it before area selection. |
| Drawer animation | Shared drawers use the approved menu's 420ms cubic easing. Sources rise from the bottom on phones and enter from the right on desktop. Reduced motion removes the transition. |
| Redesign /ask | Simplified the scope header, separated questions from sourced answers, removed the citation margin, and anchored the composer. Long conversations scroll above the input. |

## Design choices

Retained the lavender page `#f7f6fa`, white cards, charcoal text `#242131`,
body text `#494352`, purple actions `#6340a3`, and soft borders `#e2ddea`.
Inter remains the heading and reading face; technical owner values retain the
existing monospace role. Numbered sources are the shared identifying detail.

The drawer reference is [Apple's sheet guidance](https://developer.apple.com/design/human-interface-guidelines/sheets)
and the Apple menu motion measured during the approved header work. This pass
reuses that motion with an explicit Close control and retained reading position.
The conversation layout follows the familiar chat pattern of questions and
answers above a persistent composer, using Public Parish's existing evidence
and availability rules.

## Validation

Local validation passed 685 application tests, both TypeScript checks, the
production build and lint. Lint has 15 existing backend warnings and no errors.
All 66 browser journeys passed, 46 against the production build and 20 against
development presentation fixtures. The final PR comment will record the exact
head, CI run, development artifact and hosted checks. Browser evidence includes
screenshots and videos for normal drawer motion, sources, chat and Account tabs.

Checks cover Chromium and WebKit, widths down to 320px, short screens, normal
and reduced motion, keyboard focus, all three stories, issue and decision
histories, meeting chat, nested sources, preserved drafts and content order.
Fixture chat checks exercise presentation and interaction without paid model
calls. They do not claim a new live provider or email certification.

PR #205 review caught two small regressions. Warning text retains its status
color without a dot, and inventory source buttons expose their full visible
page and section details to screen readers. Both were corrected.

A real-content check caught a long URL widening the SpaceX source drawer and
pushing Close off-screen. The drawer now constrains its grid width and wraps
long source text. The regression checks require Close to remain in the viewport.

Physical iPhone keyboard and screen-reader testing remain owner checks. Automated
WebKit, touch emulation and short-viewport checks are recorded separately.
