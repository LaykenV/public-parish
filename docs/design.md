# Design and resident experience

This document owns the agreed information flow and the design-review process.
The story functionality and evidence gate has passed. The global design and
founder QA pass is in progress.
[Work](work.md) owns the phase gate and QA ledger. The September 8 Home redesign shipped through PR 197 at `fbda95b`.
CI browser checks and bounded production smoke passed for that release. The owner approved the follow-up below, released through PR 198 at `f7742d5`.
Its 24 CI browser journeys, exact production workflow and independent smoke passed. [Design-system reference](design-system.html) records the existing
visual baseline until the owner changes it during that pass.

## Homepage flow

The September 10 owner review keeps stories above issues with or without a selected area.

| Order | No area selected | Area selected |
| --- | --- | --- |
| Introduction | "See how local government is changing" with selector at left and existing 3D Louisiana at right | No hero, begin with Across Louisiana |
| First content | Across Louisiana, Meta lead with SpaceX and Boyce secondary | Same three stories |
| Second content | Issues across covered areas | Issues in the selected parish |
| Records | Latest decision records | Latest decision records for the selected parish |
| Footer | Brand, site links and compact dated voter information | Same footer |

On mobile, show the hero copy and selector without Louisiana. Mount the 3D visual only above 48rem.
Use warm limestone material with muted violet highlights on a transparent canvas.
The owner selected warm limestone from the September 9 color comparison,
replacing charcoal. Keep the quiet violet pins and existing lighting.
Remove the entire hero after selection. Remember the chosen
area on return visits. The selected parish controls Home even when an account
has other saved areas. Selecting an area filters reading; it does not enroll
someone in email alerts. Saved areas remain in Following.

The stories section uses one large Meta image and two compact secondary entries.
Desktop places the secondary entries beside Meta. Mobile gives all three stories the same full-width image and headline treatment.
Keep accepted titles and summaries, precise geography, reviewed-through dates,
and limitations. All three stories remain discoverable without a carousel,
account or completed location setup. Image subtext remains omitted as requested.

Issue cards emphasize title, consequence and next documented date or latest
outcome. Keep evidence limitations readable and actions distinct. Use a soft lavender off-white page, white cards and a near-white desktop issues
section. On phones, remove the outer section panel and nested padding. Give each
issue nearly the full viewport width with a peek of the next card. Native touch
swiping snaps to cards without arrow buttons. Cards share one height across the row, sized to fit the longest issue.
A noninteractive dot index sits below the row. Announce the current issue count
only to screen readers. Keep vertical page scrolling and keyboard access to every card. Decision
records use a white list with larger titles, a separate meeting-date column on
desktop, and neutral lifecycle badges. Move the date above the title on phones.
Keep source limitations visible and each full row clickable. Stories, issues and records have separate
failure boundaries.

Desktop navigation retains its links and controls in a 48-pixel sticky header.
Its background uses 80 percent opacity with blur at the top, then the shared
72 percent opacity after scrolling. Controls retain their 44-pixel touch targets.
Mobile uses a 48-pixel sticky header
with the existing brand and a two-line menu button. After scrolling, the header
uses a translucent lavender background, blur and a faint bottom border. Browsers
without blur support retain a solid background. Keep 44-pixel touch targets.

The menu opens as a full-screen modal with large text links for Home, Explore,
Ask, Account and Coverage, each with its navigation icon. The mobile Account
link opens the existing Following page. Desktop labels stay unchanged. A full-width,
56-pixel Change area button sits below the links. Omit the duplicate settings link. A close button occupies the opener's position. Escape closes the menu
and returns focus without losing the reading position. Trap focus and lock page
scrolling while open. The menu body scrolls on short screens; its close control
stays visible. Preserve nested area selection and reduced-motion support.
The menu expands down from the header over 420ms with a cubic ease. Links fade
in with short staggered delays. The two button lines meet, then rotate into an X
over 240ms; closing reverses the sequence. Reduced motion removes the animation.
The scrolled header uses 72 percent background opacity with 20-pixel blur.
There is no bottom navigation or reserved space for it.

One centered global spinner covers navigation and initial page-data loading.
Concurrent pending sections share that indicator. Settling or unmounting a
section releases its loading registration. Do not use skeletons. Existing readable
content stays available while another section loads. Button submissions and Ask
answer generation retain their action-specific feedback.

## Follow controls

The chooser shows the target title once, compact cadence radio choices, and
Google and email buttons. Omit repeated target, cadence and destination rows
until confirmation, and omit explanatory subtext below the buttons. Keep the
email-only account distinction above the email field. Confirmation receipts use
compact rows. Aim to fit the ordinary steps without scrolling on portrait phones;
retain overflow for short screens, text enlargement and long content.

## Story detail

Lead with title, precise location, a short supported explanation, reviewed-through
date, and useful image. Follow with the current evidence-backed situation, known
unknowns, cross-body timeline, next documented action, and related local issues.
Keep source controls close to claims. Ask and Follow must describe the whole
story scope and its owner-reviewed update cadence.

Preserve deep links to the original issues, atomic decisions, and official
sources. A reader should distinguish an announcement, proposed agreement,
authorization, vote and completed action without learning internal pipeline terms.

Changing the current story version should update its public reading state
without resetting focus or discarding an unsent question. Explain stale evidence,
withdrawal and unavailable answers. Never make limited evidence look complete
through color or reassuring copy.

## Images

Stories get images first. Keep routine decision rows compact unless a particular
image helps explain their evidence. Use a relevant lead photograph, approved
rendering or legible source detail. Avoid decorative stock imagery for every
record and generated depictions that look like documentary photographs.

Store source, permission or license, caption and alt text. Label renderings as
renderings. Captions that state project facts need evidence. Use responsive image
sizes, reserved dimensions, useful crops and a fallback when an image fails.
The owner requested no visible image subtext on Home or story pages. Retain
descriptive alt text and review metadata, including captions and rights records.
The share image should match the approved story version.

## Global pass

After story acceptance, review the shared system before individual pages:

- Color roles and contrast, typography, reading width, spacing and density.
- Primary, secondary, quiet and destructive actions; hover, focus, disabled,
  loading and success behavior.
- Navigation, mobile menu, local selector, cards, filters and form controls.
- Status text and icons, evidence controls, desktop evidence panel and mobile
  sheet, empty states and recovery notices.
- Image treatment, captions and social preview composition.

Use Home and story detail as reference pages. Update shared components and
`design-system.html` together once the owner chooses the new system. Retain the
existing brand mark unless the owner changes it. One coherent light theme is
sufficient for the hackathon; theme expansion is not a requirement.

The approved system uses Inter for headings and body text, with Geist Mono for
technical metadata. Background is `#F7F6FA`, cards are `#FFFFFF`, headings are
`#242131`, reading text is `#494352` and secondary text is `#6B6575`. Primary
purple is `#6340A3`, hover purple is `#4F2F89` and selection lavender is `#EEE8F7`.
Use `#FDFCFE` for the desktop issues section. The header, page and footer share
`#F7F6FA` without shell border lines.
Evidence labels and missing-date notices use the reading font. Missing dates
remain neutral; actual dates may use purple.
Purple marks actions, selection and focus. Green remains success and amber marks
limitations. An approved government action is not a success judgment.

Shared controls use Coss components on Base UI. The Home pass adds the Coss Popover, Sheet,
Scroll Area and Input registry components to the existing Button and Badge.
The design reference records the same palette and layout. Visual, contrast,
keyboard and responsive QA remain pending until actually inspected.

## Page-by-page pass

Review desktop and mobile for each page before moving on:

1. Home and all three story details.
2. Explore and search filters, pagination and story result types.
3. Issue timeline, atomic decision, meeting and evidence views.
4. Ask and context changes, conversation continuity and refusal states.
5. Following, saved setup, sign-in, email enrollment, preferences, management
   and unsubscribe.
6. Coverage, requests, private reports, method, privacy and voter links.

Record functional defects separately from design preferences in the work-plan
ledger. After global changes, recheck affected journeys across pages rather than
assuming a shared component works everywhere.

## Responsive and accessibility contract

Use at least narrow 320- and 375-pixel mobile views, a wider phone or tablet,
and desktop. Inspect long headlines, captions, source excerpts, screen keyboards,
menus and sheets. No horizontal overflow may hide controls or evidence.

Keep semantic headings, landmarks, clear labels, visible focus, contrast, reduced
motion, keyboard navigation and focus return. Mobile sheets need written openers
and an explicit close control. Status cannot depend on color. Source links must
identify their destination, and dates must preserve the source's stated precision.

The earlier release accepted desktop, keyboard, reduced-motion and mobile
emulation instead of requiring physical iPhone Safari or screen-reader testing.
Use an actual phone when available in the founder pass, but do not invent a new
mandatory device gate or claim a pass that did not occur. Record the browsers and
devices actually checked.

## Required states

Inspect loading, empty, error, partial success, limited evidence, delayed source,
withdrawn story, unavailable image, exhausted Ask allowance, unsupported question,
expired anonymous thread, signed-out and signed-in controls, lost connectivity,
changed coverage, and email recovery. A paid-service failure must not erase
previously accepted readable evidence.

Keep small verified voter information with outbound official links. Do not build
an election guide, candidate comparison, voting recommendation or prediction
interface during this design pass.

## Owner corrections after story publication

PRs 181 and 182 restored and repositioned the existing 3D Louisiana. The
September 8 owner decision above supersedes their placement and selected-area
visibility rules.
The owner-selected renderings are published after independent review under the
explicit three-file exception. The owner requested removal of all visible image
subtext on Home and story pages. Keep descriptive alt text on the images and
preserve captions, attribution and rights records in owner review. Do not treat image changes
as material story updates.

PR 180 makes ordinary story URLs provide approved social metadata and open the
interactive story directly. Legacy share links redirect. Verify actual
Facebook previews before outreach; raw HTML inspection alone is not that proof.

## Home fixture URLs

Development fixtures run only on the local dev server. They replace issues and
decision rows with sample data and omit the statewide story section. Use the
normal Home URL for the complete layout and current published stories.

| URL | Preview |
| --- | --- |
| `/?fixture=no-issues` | Empty issues with decision records below |
| `/?fixture=degraded` | Delayed-source notice |
| `/?fixture=signed-in` | Sample saved-area layout, without authenticating |
| `/?fixture=section-failure` | Issue-section failure and retry |
| `/?fixture=update` | New-record update notice and refresh |

The saved parish still filters fixture content. With no parish saved, the
signed-in fixture uses Lafayette and East Baton Rouge as sample saved areas.


## Resident-page pass, September 9

The overnight working tree extends the approved Home system to stories, Explore,
Ask, evidence pages, Following, email management, Coverage, request/report forms,
Privacy, How it works, recovery and owner tools. This is a local implementation,
not a released design checkpoint. See the
[morning inspection report](design-morning-report-2026-09-09.md).

Use the shared page-title size and page spacing tokens. Keep resident metadata
in Inter, reserve monospace for technical owner values, and reuse Home's purple
actions, lavender selections, white cards and readable body color. Long titles
must wrap without shrinking the controls. Government outcomes use neutral status
colors; evidence health retains its written status and distinct warning colors.

Story pages put Ask, Follow and Share together and provide section links to the
timeline, next action, unknowns and evidence. A citation opens its exact source in a drawer and preserves the reading position. Accepted text, citations and image policy stay intact.
Coverage definitions expand on demand. Coverage request forms precede supporting
explanation on phones. Private source reports use the full drawer height.
Account copy distinguishes saved areas from the Home parish selector.

Manual checks covered native Chrome desktop, narrow phones and selected tablet
views. CI, authenticated owner views, physical-device and screen-reader checks
remain pending. Keep their status in `docs/work.md`.


## Mobile reading and chat, September 11 owner correction

On phone-sized story, issue, decision and meeting pages, a circular purple chat button
sits at the bottom right. It opens a full-screen conversation with an opaque
background, one Back/title bar and a compact composer. Back restores the reading
position and retains drafts and conversation state. Citations open above the conversation and return
focus to their source control. Desktop keeps the existing Ask entry points.
Decisions retain their existing linked-issue scope, or the published corpus when
there is no linked issue. Do not imply a new decision-only evidence scope.

Mobile sources use small rectangular controls. Timeline links say "View decision"
instead of exposing a long record key. Following uses visible route tabs on
phones and desktop, with an underline on the current view and no View dropdown.

Do not use a colored strip on the left edge of a card. Use a plain border,
written status and restrained text or background emphasis. This applies to Ask
scope cards, notices, cadence choices and owner selections as well as reading
pages. Ordinary neutral timeline rules and quotation indentation are distinct
from an accent strip on a card.

## September 10 reading and Ask corrections

Use compact numbered source buttons after claims on every screen. Keep the
exact quotation, original document link and available saved story artifact in
a drawer. Opening or closing a source must retain the page and conversation
scroll positions. Desktop sources slide in from the right; phone sources rise
from the bottom. Use the header menu's 420ms cubic easing, preserve swipe close
on phones and remove transitions for reduced motion. Keep explicit close buttons.

Timelines use a single column on phones with the date above each event, readable
status and a separate decision link. Pills never inherit metadata separator dots.
Notices have a plain border without a colored left edge. Account tabs have one
baseline and an active underline, without a second rule above the first section.

On mobile, an empty Ask conversation centers its suggestions and composer.
After the first question, Ask uses one scrollable conversation above a composer
at the bottom. The send
control is an up arrow at its lower right with an accessible name. Empty-state
suggestions appear above the composer and disappear after the first question.
Drafts and conversations survive leaving and reopening full-screen chat.
The composer starts as one line and grows with the draft. Standalone mobile Ask
uses the same compact header and composer.
Short screens and keyboard resizing keep the composer reachable. Existing
scope, evidence, retry, expiration and availability rules remain in force.

While mobile chat is open, make the reading document transparent without
removing it. Safari can show document pixels through its keyboard controls beyond
the visual viewport. Restore the document when returning focus and retain the
reading position. Standalone Ask hides the surrounding site header and footer.
