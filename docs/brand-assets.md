# Pelican artwork

The owner selected the pelican concept on September 14, 2026. It replaces the
PP placeholder. The illustration is brand artwork, not a depiction of a public
project or evidence for a government claim.

## Files

- `public/brand/pelican-master.png` is the transparent 3D master produced with
  the built-in image generation tool from the selected concept.
- `public/brand/pelican-320.webp` and `pelican-640.webp` are UI exports.
- `public/brand-mark.svg` is a simplified, manually drawn version for headers,
  correction labels and the scalable favicon. Its dark violet tile, light rim
  and lavender bird improve separation on white and at small sizes.
- `public/favicon-32.png`, `favicon.ico` and `apple-touch-icon.png` cover browser
  tabs and saved Home Screen links.
- `public/brand/share.png` is the generic 1200 by 630 share card.

Run `node scripts/generate-brand-assets.mjs` to regenerate the raster exports
from the master and SVG. This uses the installed Playwright Chromium browser
for resizing and the share layout. It makes no model request.

## Extraction prompt

The built-in image generation tool received the owner-selected presentation
as its edit reference and this prompt:

> Edit the supplied owner-approved Public Parish pelican logo presentation into
> one final production asset. Preserve EXACTLY the large 3D pelican's identity,
> pose, proportions, violet and warm limestone colors, folded-paper wing, bill,
> eye, feet, sculpted material and existing lighting. Remove ALL text, the small
> silhouette below, labels, and the broad ground shadow. Keep only the large 3D
> pelican itself, complete head, bill, wing and feet, with crisp clean alpha
> edges. Transparent background with actual alpha, not a checkerboard. Center
> the isolated bird on a square canvas and scale it to fill about 90 percent of
> canvas height with safe padding. No new symbols, no restyling, no tile behind
> it, no typography, no added glow. This is faithful extraction of the approved
> bird, not a redesign.

The UI keeps the name as live text and uses empty alt text for artwork beside
an existing brand name or page heading. The asset's SVG accessible name is
Public Parish pelican when viewed on its own.

## Email templates

The shared HTML template in `convex/follows/emailTemplates.ts` uses the existing
`brand/pelican-email.png` export for the 3D pelican masthead. This 192-pixel
PNG keeps the transparent background of the approved master. It uses the site's
lavender background and purple action color. The smaller masthead and inline
layout styles preserve the reading width when email clients remove presentation
attributes. Button labels use purple text on a pale fill, with an explicit dark
palette for clients that support the color-scheme media query. All text remains readable when
images are blocked. Every delivery retains its plain-text version.

Run `node scripts/preview-emails.mjs` to generate local HTML and Chromium
screenshots for story alerts, decisions, verification, roundups, replies and
coverage notices. Output goes to the ignored `test-results/email-preview/`
directory. Fixtures contain sample content and placeholder access links. The script checks
light and dark layouts, missing presentation attributes, and missing stylesheets
at 320, 390 and 760 pixels. It asserts centering, background fills, transparent
artwork, no horizontal overflow and button contrast with and without its fill.
The script does not query Convex, send email or deploy. Browser previews do
not certify Gmail or Outlook rendering.
