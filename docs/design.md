# Design and resident experience

This document owns the agreed information flow and the design-review process.
The complete story functionality and all three accepted stories come first.
[Work](work.md) owns the phase gate and QA ledger. The global redesign has not
started. [Design-system reference](design-system.html) records the existing
visual baseline until the owner changes it during that pass.

## Homepage flow

Use a compact introduction and a story-led first screen. Avoid a tall separate
marketing hero that pushes the lead story below the fold. Integrate the product
promise with the featured-story area.

```text
Navigation and Public Parish identity
Compact introduction, free access and evidence promise
Meta lead story with a relevant image and clear read action
SpaceX secondary story | Boyce secondary story
Local section heading and parish or city selector
Issues for the selected area, with coverage limitations
Recent atomic decision records and Explore link
Small dated official voter-information strip
Method, coverage, privacy and open-source links
```

Desktop can place the Meta lead beside the two secondary stories. Mobile stacks
Meta, SpaceX and Boyce in that order. All three remain discoverable without a
carousel, horizontal-only rail, account, or completed location setup.

On a first visit, the local section offers the selector and a way to browse the
existing launch-area evidence. After selection, its heading and issue feed name
the chosen area and retain the selection. Signed-in saved areas remain usable.
Keep Change area visible in the local section. Changing an area does not remove
or reorder the featured Louisiana stories.

Give returning visitors a direct jump to local issues or Following so they do
not have to scroll through the entire introduction on each visit. Preserve Home,
Explore, Ask, Following and Coverage access. A Stories navigation entry may link
to Home's story section; a separate story index is not required for three stories.
Keep the exact navigation presentation for the owner design pass.

During implementation, functional pages use existing components. The final
layout, colors and typography are design-pass decisions. Do not claim the new
homepage exists because its structure is documented.

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
sizes, reserved dimensions, useful crops, readable mobile captions and a fallback
when an image fails. The share image should match the approved story version.

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

Current baseline uses Inter, Geist Mono for compact metadata, neutral paper and
ink, blue actions, green success and amber limitations. These are current design
facts, not restrictions on the coming owner-directed redesign.

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

PR 181 restored the existing 3D Louisiana relief in the Home introduction.
The owner corrected that placement. Keep the compact introduction and featured
stories first, then the relief beside the region selector. Keep the relief
visible after an area is selected. PR 182 implements this placement and passed
CI and development browser layout checks. It deployed through PR 182, and
production inspection confirmed the relief beside local selection.
The owner-selected renderings are published after independent review under the
explicit three-file exception. The owner requested removal of all visible image
subtext on Home and story pages. Keep descriptive alt text on the images and
preserve captions, attribution and rights records in owner review. Do not treat image changes
as material story updates.

PR 180 makes ordinary story URLs provide approved social metadata and open the
interactive story directly. Legacy share links redirect. Verify actual
Facebook previews before outreach; raw HTML inspection alone is not that proof.
