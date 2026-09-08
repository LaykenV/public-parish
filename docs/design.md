# Design and resident experience

This document owns the agreed information flow and the design-review process.
The story functionality and evidence gate has passed. The global design and
founder QA pass is next.
[Work](work.md) owns the phase gate and QA ledger. The September 8 Home redesign is implemented locally and awaits owner visual QA
and PR validation. [Design-system reference](design-system.html) records the existing
visual baseline until the owner changes it during that pass.

## Homepage flow

The owner approved the following Home system on September 8. This supersedes
always placing stories above local setup and issues.

| Order | No area selected | Area selected |
| --- | --- | --- |
| Introduction | "See how local government is changing" with selector at left and existing 3D Louisiana at right | "Showing X Parish" and Change area |
| First content | Across Louisiana, Meta lead with SpaceX and Boyce secondary | Issues in the selected parish |
| Second content | Issues across covered areas | Across Louisiana with all three stories |
| Records | Latest decision records | Latest decision records for the selected parish |
| Footer | Brand, site links and compact dated voter information | Same footer |

On mobile, stack the hero copy and selector above a short Louisiana visual.
Hide the visual when the hero collapses after selection. Remember the chosen
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
A noninteractive dot index and current issue count sit below the row. Keep vertical page scrolling and keyboard access to every card. Decision
records retain their compact layout. Stories, issues and records have separate
failure boundaries.

Desktop navigation retains its arrangement. Mobile has the brand and a top-right
hamburger button opening a Coss right-side Sheet. The menu contains Home, Explore,
Ask, Following, Coverage, area selection and account settings. Omit the visible menu brand header. Anchor
area and account controls at the bottom, separate from the scrolling navigation.
Close, Escape,
backdrop dismissal and focus return remain available. Remove bottom navigation
and its reserved space, including the Ask composer offset.

One centered global spinner covers navigation and initial page-data loading.
Concurrent pending sections share that indicator. Settling or unmounting a
section releases its loading registration. Do not use skeletons. Existing readable
content stays available while another section loads. Button submissions and Ask
answer generation retain their action-specific feedback.

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
Use `#FDFCFE` for the desktop issues section and `#EEEAF4` for the footer.
Evidence labels and missing-date notices use the reading font. Missing dates
remain neutral; actual dates may use purple.
Purple marks actions, selection and focus. Green remains success and amber marks
limitations. An approved government action is not a success judgment.

Shared controls use Coss components on Base UI. The Home pass adds the Coss Sheet,
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
