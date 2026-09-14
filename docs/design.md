# Design and resident experience

This document owns the agreed information flow and the design-review process.
The story functionality and evidence gate has passed. The global design and
founder QA pass is in progress.
[Work](work.md) owns the phase gate and QA ledger. The September 8 Home redesign shipped through PR 197 at `fbda95b`.
CI browser checks and bounded production smoke passed for that release. The owner approved the follow-up below, released through PR 198 at `f7742d5`.
Its 24 CI browser journeys, exact production workflow and independent smoke passed. [Design-system reference](design-system.html) records the existing
visual baseline until the owner changes it during that pass.

## Homepage flow

The September 13 owner correction keeps Louisiana as the default Home. The
hero introduces the app only before the visitor makes an area selection.
Statewide stories appear only in the Louisiana view. Parish Home begins with
local issues and body filters. [Launch upgrade](launch-upgrade.md) records the
slice contracts; [Work](work.md) records release status.

| Order | Louisiana (default) | Parish, city or body focus |
| --- | --- | --- |
| Introduction | Before any saved selection, hero: "Understand what Louisiana's government is deciding." with the selector at left and the 3D Louisiana at right. Returning visitors begin at Across Louisiana | No hero. The issues card contains the navigation links and body filters. On phones, the links stack beside Filters |
| First content | Across Louisiana: Meta lead, SpaceX and Boyce secondary, plus one utility roundup linking individual commission cases | Local issues and body filters. Featured stories are omitted |
| Ballot | "On the November 3 ballot": all published statewide amendments | Compact preview of two statewide amendments, with a link to the full guide |
| Local content | Issues across covered parishes | Issues in the focus, with a desktop body dialog and mobile filter drawer |
| Records | Latest decision records | Latest decision records for the focus |
| Footer | Brand, site links and compact dated voter information linking to the ballot page | Same footer |

Hero body copy: "See the documents behind each decision and follow what
happens next." Keep "Free to read and ask questions. No account needed."
The September 14 owner selection makes the three parish labels on Louisiana
clickable on desktop. The owner correction keeps Louisiana hidden at 48rem
and below. Do not mount the canvas, fallback, labels or their wrapper on mobile.
Keep the hero copy and area picker, with no empty visual space. Labels use the
same coverage availability and saved selection as the area picker. Selecting a
label opens the parish issues and moves keyboard focus to their heading.
Labels remain usable with the SVG fallback. Unknown or validating coverage
keeps a label disabled. The desktop model retains its current size.
Use warm limestone material with muted violet highlights on a transparent canvas. The owner selected warm limestone from the
September 9 color comparison, replacing charcoal. Keep the quiet violet pins
and existing lighting. Remove the entire hero after any explicit area selection.
Store an explicit Louisiana choice so returning statewide never restores the
hero. A missing or invalid stored value starts the Louisiana introduction. The focus
controls Home even when an account has other saved areas. Choosing a focus
filters reading; it does not enroll someone in email alerts. Saved areas
remain in Following.

The selector lists "All of Louisiana" first, then parishes. It does not list
cities or bodies. Home body controls filter issues and decision records within the
selected parish. Every body label names its place, for example "Baton Rouge
Metropolitan Council" and "Lafayette Hearing Examiner". The two Lafayette
planning commissions stay distinct. Body focus stays in the URL and clears back
to the parish. Existing shared city and body links remain valid.

On phones, Choose area sits beneath the statewide story introduction with the
same plain-link treatment as View Statewide Stories. It scrolls with the page.
Choosing an area from the mobile menu closes the picker and menu, then opens
Home with that selection. Dismissing the picker keeps the menu open.
In parish view, the description sits directly under the heading. View Statewide
Stories is a plain link beneath it, with an outlined Filters button to its right.
Home omits Search issues; Explore remains in the main navigation. Keep this
navigation unboxed; the owner rejected the white group and filled filter button.
The filter drawer has a parish summary, Change area, checkboxes for government bodies, Reset and Apply filters.
Choose several bodies to include issues and records from any selected body.
Leave all unchecked to include every body in the parish. Closing without applying
discards the draft. Desktop opens the same choices in a dialog. Its dropdown
sits inline with the issue heading and shows All Government bodies, the selected
body name, or the number of selected Government bodies. View Statewide Stories
stays inside the issues card. The header handles desktop
area changes without a duplicate button above the card.
Filter changes preserve the page, scroll position and control focus. After the
initial page load, pending issue and decision queries show a spinner inside their
own result sections. Single-body, multiple-body and city filters remain shareable
in the URL.

Home issue selection favors current explanations with a cited consequence, a
next documented date or a recent outcome. Source-only stubs stay in Explore. A
limited issue with a supported consequence remains eligible. Each card carries
one cited sentence saying why it matters, or the next date when no cited
rationale exists. Never generate card prose at read time.

The September 13 owner refinement gives every featured story a full-sized card.
Desktop uses two equal columns, with Meta first and the third story on the next
row. All images retain a 16:9 crop. Mobile retains its stacked image and headline
treatment.
Keep accepted titles and summaries, precise geography, reviewed-through dates,
and limitations. All three stories remain discoverable without a carousel,
account or completed location setup. Image subtext remains omitted as requested.

Issue cards emphasize title, consequence and next documented date or latest
outcome. Keep evidence limitations readable and actions distinct. Use a soft lavender off-white page, white cards and a near-white desktop issues
section. On phones, remove the outer section panel and nested padding. Give each
statewide issue nearly the full viewport width with a peek of the next card.
Native touch swiping snaps to cards without arrow buttons. Statewide cards share
one height across the row, sized to fit the longest issue. A noninteractive dot
index sits below the row. Announce the current issue count only to screen readers.
When a parish is selected, stack mobile issue cards vertically at their natural
heights with no swipe row or dot index. Keep keyboard access to every card. Decision
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
Explore keeps its search and filter controls visible during initial result loading
and later filter changes. Its spinner stays inside the results section, and URL
filter changes preserve scroll position and dropdown anchors.
Concurrent pending sections share that indicator. Settling or unmounting a
section releases its loading registration. Do not use skeletons. Until all pending
page sections settle, show only the header and spinner. Hide page content and the
footer from view and keyboard access. Keep the spinner container still and rotate
only the icon. Button submissions and Ask
answer generation retain their action-specific feedback.

## Explore, Ask and coverage request, September 13 correction

Explore uses two equal card columns on desktop and one on phones. More filters
opens a centered desktop dialog or the shared mobile drawer. The result controls
remain mounted while filters change. Search fields draw one purple focus border
around the whole control, including its icon, without an inner input outline.

Without filters or an explicit sort, Explore leads with published stories and
the existing consequence-ranked issue selection, then continues through the
paginated search records. Remove duplicate links. Explicit date sorting keeps
the search order. Cards show their type, headline, accepted summary, place,
body and available dates. Story headlines precede their approved images. Issue
cards retain topics, evidence limitations and linked-record context when available.
Meeting and body cards do not inherit a member decision's lifecycle or evidence
status. Body cards open that body's published records.

The empty desktop Ask composer and suggestions sit in the middle of the available
conversation area. The first question moves the composer to the bottom and gives
the conversation its scrolling area. Keep the existing mobile layout.

Request coverage uses a centered desktop column for the title and form. Place
the "One gate for every place" note beneath the form and keep field labels
left-aligned.

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

Keep small verified voter information with outbound official links, linking to
the ballot page once it exists. Ballot-measure pages use the shared story
reading, Ask, Follow and Share patterns and quote the official ballot question
first. They carry the notice that a resident's ballot depends on their precinct
with a link to the Secretary of State sample ballot. Do not build a candidate
comparison, voting recommendation, poll display or prediction interface.

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
background, one 48-pixel bar and a compact composer. The bar holds a plain back
arrow, the record title on one line and "Ask Public Parish" beneath it, with a
hairline below; the conversation scrolls under it. Back restores the reading
position and retains drafts and conversation state. The screen is sized and
positioned from the visible viewport so the composer sits directly above the
keyboard. One viewport measurement drives the screen and its contents. Read the
layout height from the root element, keep keyboard panning offsets, and discard
stale offsets once the keyboard closes. Never reject updates because the zoom
scale differs from one. Keyboard geometry updates without a CSS tween. Every
phone entry point renders this same screen: the Ask route on a phone opens it
in place of the page, with the site header and footer hidden behind it, and
Back plays the same fade-and-slide exit before the previous page returns.
Citations open above the conversation and return
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

On mobile, the composer always rests at the bottom of the chat screen. An empty
conversation centers a short intro in the free space above it: "What do you
want to understand?", or the same question naming the story, issue or meeting,
with the one-line evidence promise beneath. Two example questions sit directly
above the composer. When the keyboard opens, the intro gives way and the
examples stay one tap above the field; they disappear after the first
question. After the first question, Ask uses one scrollable conversation above
the composer. The send control is an up arrow at its lower right with an
accessible name; while an answer is being checked, the spinner replaces the
arrow. The answer wait beneath the question uses three small bouncing dots,
with a static indicator under reduced motion. Drafts and conversations survive leaving and reopening full-screen chat,
and a reopened conversation starts at its latest exchange. The composer starts
as one line and grows with the draft. Standalone mobile Ask uses the same
compact bar and composer. Short screens and keyboard resizing keep the composer
reachable, and a conversation that was scrolled to its latest answer stays
there when the keyboard shrinks the screen. Existing scope, evidence, retry,
expiration and availability rules remain in force.

While mobile chat is open, make the reading document transparent without
removing it. Safari can show document pixels through its keyboard controls beyond
the visual viewport. Restore the document when returning focus and retain the
reading position. Keep the body in its ordinary document position. Base UI owns
the overflow lock; the outer panel clips overflow while the conversation and
textarea own scrolling. Standalone Ask hides the surrounding site header and footer.

## September 11 mobile reading refinements

Account sits at the bottom of the mobile menu above area selection, with its
icon and current-page state. The bottom section scrolls into reach on short
screens. Preserve the approved menu motion.

Citations use small inline numbered controls across reading pages and chat.
Coarse pointers retain at least a 44-pixel hit area around each visible control.
An issue's Back, Follow and Share actions share one compact mobile row above
the title. Follow cards lead with a linked title and latest change; delivery
metadata lives in an explicit Details and delivery disclosure. Keep source
warnings visible without opening that disclosure.

Meeting source lists group documents by their actual types when more than one
type exists. Do not invent agenda sections or add sticky headings for singleton
groups. Preserve every document link, citation and retrieval date.

Recent conversations live in the Account page's Conversations section, available
without sign-in. Keep device-only storage and the 24-hour expiry. Opening a
conversation restores its evidence scope without putting its private handle in
the URL. The chat screen has no recent-history list or clearing controls.

The September 11 keyboard follow-up examined T3 Code web commit
[18f7254](https://github.com/pingdotgg/t3code/tree/18f7254e0adbd7d642f4d78f9b9c8e6cb569af56/apps/web).
Its thread layout uses bounded flex panes, internal scrolling and a small-viewport
height on phones. Its viewport meta requests `interactive-widget=resizes-content`.
Public Parish adopts that supported-browser hint, stable geometry and one owner
for chat bounds. T3's web code has no visual-viewport keyboard handler to copy;
its native mobile app uses a native keyboard controller. Public Parish still
needs visual-viewport sizing on Safari. Native iPhone acceptance is required.

## Owner operations

Coverage and Stories share owner navigation styled like the Account tabs.
Use the resident page title, Inter text, purple actions and white panels.
Coverage separates source monitoring, incidents, delivery and provider usage;
section links reach the compiler and run ledger. Wide provider tables scroll
within a labeled keyboard-accessible region on phones.

Story intake shows selected bundles and build receipts in lavender with a
written pressed state for assistive technology. Compare exact drafts side by
side on desktop and stack them on phones. Keep hashes and JSON in Geist Mono.
Use the shared Button variants so publication stays purple and withdrawal
retains its destructive styling. All publication and owner-access checks remain.


## Statewide utility roundup

The owner approved one utility roundup as the fourth card in Across Louisiana
on September 14. Preserve the three featured stories and their images. The
roundup links directly to each accepted commission decision, with its docket
and published status. It uses the shared commission follow and Explore filter.
It replaces the separate statewide decision section. Keep the source records
and their citations distinct; the roundup is a reading collection.


## Home story and ballot card refinement

The September 14 owner refinement gives the utility roundup a 16:9 image,
headline and summary matching the three story cards. Its generated illustration
has a visible AI illustration credit. Cases remain available in a native
expandable list, with the existing commission follow and Explore links below.

Homepage ballot cards lead with the actual amendment number, retain their
accepted subject titles and review limitations, and offer Read amendment with
the shared purple arrow-link style. Avoid repeating the number in the visible
title; the accessible link name retains the complete accepted title. The main
Read the ballot guide link uses that same arrow treatment. The full guide keeps
its existing explanations and source access.

## Elections hub and parish preview

The owner approved Elections in the desktop and mobile navigation on September
14. It opens `/ballot` and stays highlighted on amendment pages. Clicking it
from a measure returns to the full guide.

The hub leads with the November 3 election, the date and official voter links.
The large election heading and actual amendment numbers provide the visual
hierarchy. Reuse Inter, the existing purple `#6340a3`, lavender `#f7f6fa`, white
cards, dark text `#242131` and border `#e2ddea`. Keep the introduction beside
voter tools on desktop and stack them on phones. Each amendment retains its
accepted summary, review limitations, source access and reading link.

Statewide Home retains all amendment cards. Parish Home keeps local issues
first and shows the first two amendments in ballot order, with the count and
Read the ballot guide link. These remain labeled statewide amendments.
The hub retains the notice about unverified parish propositions.

Official outbound destinations were checked September 14, 2026:
[voter portal](https://voterportal.sos.la.gov/),
[registration guidance](https://www.sos.la.gov/elections-voting/voter-registration-faqs)
and [election dates](https://www.sos.la.gov/elections-voting/election-dates).
The hub links to the official deadlines rather than copying a new calendar into
the application. The existing published November 3 date is retained.


## Pelican identity, September 14 owner selection

Replace the PP placeholder with the violet pelican and folded-paper wing.
Use `public/brand-mark.svg` for the compact header, standalone pages, correction
labels and scalable browser icon. The compact mark has a dark violet rounded
tile, a light rim and a lavender bird with a limestone wing so its outline stays
visible on white. Keep Public Parish as live text beside it.
The transparent 3D pelican appears at 96 pixels in the shared footer and at
240 pixels beside the How it works introduction, reduced to 144 on phones.
The Home hero retains its existing Louisiana visual and visibility rules.

`public/brand/pelican-master.png` is the clean generated artwork derived from
the owner's approved concept. `scripts/generate-brand-assets.mjs` exports
the WebP sizes, browser icons, Apple touch icon and generic share image.
Story share pages continue to use their accepted story images. The logo is
brand artwork and does not represent official source evidence.
