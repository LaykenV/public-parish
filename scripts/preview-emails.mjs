import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import ts from 'typescript'
import { chromium } from '@playwright/test'

// Local fixtures only. This script never queries Convex or sends email.
const source = await readFile(
  new URL('../convex/follows/emailTemplates.ts', import.meta.url),
  'utf8',
)
const { outputText } = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
})
const { renderEmail } = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`
)
const output = resolve('test-results/email-preview')
await mkdir(output, { recursive: true })
const base = {
  siteUrl: 'https://www.publicparish.com',
  footer: 'Design preview with sample content. No email was sent.',
}
const controls = {
  managementUrl: `${base.siteUrl}/email/manage/design-preview`,
  unsubscribeUrl: `${base.siteUrl}/coverage/unsubscribe/design-preview`,
}
const fixtures = {
  story: {
    ...controls,
    eyebrow: 'Story update',
    title: "Meta's $50 billion plan and the rules for its power supply",
    preview:
      'A design preview using the historical email supplied for this redesign.',
    paragraphs: [
      'Meta announced a Richland Parish data center expansion exceeding $50 billion. The original power approval includes protections for other Entergy customers. A separate application seeks power resources for an adjacent campus, and the saved records do not establish the results of its September 16 procedural motions.',
    ],
    action: {
      label: 'Read the update',
      href: `${base.siteUrl}/stories/meta-richland`,
    },
    sources: [
      'https://www.opportunitylouisiana.gov/news/meta-commits-more-than-50-billion-for-north-louisiana-project-becoming-one-of-the-largest-data-centers-in-history',
      'https://lpsc.louisiana.gov/docs/agendas/Sept_16_2026_Agenda_Revised.pdf',
    ],
    replyHint:
      'Reply to this email to ask about the story. Answers use its published evidence.',
  },
  verification: {
    eyebrow: 'Email verification',
    title: 'Confirm your email',
    preview:
      'Your code to follow Public Parish updates. Expires in 10 minutes.',
    paragraphs: ['Use this code to follow civic updates from Public Parish.'],
    code: '123456',
    details: [
      'This code expires in 10 minutes.',
      'If you did not request it, ignore this message.',
    ],
  },
  roundup: {
    ...controls,
    eyebrow: 'Your weekly roundup',
    title: '2 updates from your follows',
    preview: 'Sample weekly roundup.',
    items: [
      {
        place: 'Richland Parish',
        title: "Meta's Richland Parish expansion",
        change: 'Story update',
        source: 'https://lpsc.louisiana.gov',
        href: `${base.siteUrl}/stories/meta-richland`,
      },
      {
        place: 'Vermilion Parish',
        title: 'SpaceX project in Vermilion Parish',
        change: 'Story update',
        source: 'https://www.opportunitylouisiana.gov',
        href: `${base.siteUrl}/stories/spacex-pecan-island`,
      },
    ],
    replyHint:
      'Reply with a question about these updates. Answers use published evidence.',
  },
  decision: {
    ...controls,
    eyebrow: 'Decision update',
    title: 'Example local decision',
    preview: 'Sample decision alert.',
    paragraphs: [
      'The accepted summary appears here, with the same text and qualifications as the published decision.',
    ],
    details: ['Current stage: proposed'],
    callout: {
      title: 'Why it matters',
      text: 'The published explanation of the consequence appears here.',
    },
    action: { label: 'Read the update', href: `${base.siteUrl}/explore` },
    sources: ['https://example.gov/official-document'],
  },
  reply: {
    eyebrow: 'Your question',
    title: 'What the records say',
    preview: 'Sample evidence-based reply.',
    paragraphs: [
      'This is where the answer appears with its citation numbers [1].',
      'Cited evidence\n[1] Example document: https://www.publicparish.com/sources/design-preview\nOfficial document: https://example.gov/official-document',
      'Public Parish answers only from published, checked evidence. Reply with another question about this alert to continue.',
    ],
  },
  coverage: {
    ...controls,
    eyebrow: 'Coverage notice',
    title: 'Coverage is available for Example Parish',
    preview: 'Sample coverage notice.',
    paragraphs: [
      "Example Parish now meets Public Parish's coverage checks. Read the exact supported government bodies and limitations on our coverage page.",
      'This is the one launch notice you requested.',
    ],
    action: { label: 'See coverage', href: `${base.siteUrl}/coverage` },
  },
}
let checked = 0
let minimumButtonContrast = Infinity
const browser = await chromium.launch({ headless: true })
try {
  const page = await browser.newPage()
  const localImage = `data:image/png;base64,${(await readFile(resolve('public/brand/pelican-email.png'))).toString('base64')}`
  for (const [name, fixture] of Object.entries(fixtures)) {
    const html = renderEmail({ ...base, ...fixture })
    await writeFile(`${output}/${name}.html`, html)
    for (const width of [760, 390, 320]) {
      for (const mode of [
        'light',
        'dark',
        'stripped-light',
        'stripped-dark',
        'inline-only',
      ]) {
        const dark = mode.endsWith('dark')
        await page.emulateMedia({ colorScheme: dark ? 'dark' : 'light' })
        await page.setViewportSize({ width, height: 900 })
        await page.setContent(
          html.replace(`${base.siteUrl}/brand/pelican-email.png`, localImage),
        )
        // A compatibility stress test, not an emulator of Gmail's sanitizer.
        if (mode.startsWith('stripped') || mode === 'inline-only') {
          await page.evaluate((inlineOnly) => {
            document.querySelectorAll('*').forEach((element) => {
              for (const attribute of [
                'bgcolor',
                'align',
                'valign',
                'width',
                'height',
                'border',
                'cellpadding',
                'cellspacing',
              ])
                element.removeAttribute(attribute)
            })
            if (inlineOnly)
              document
                .querySelectorAll('style')
                .forEach((element) => element.remove())
          }, mode === 'inline-only')
        }
        await page.locator('img').evaluate((image) => image.decode())
        const result = await page.evaluate(
          ({ dark, hasAction }) => {
            const card = document.querySelector('.email-content')
            const cardStyle = getComputedStyle(card)
            const rect = card.getBoundingClientRect()
            function rgb(color) {
              return color
                .match(/[\d.]+/g)
                .slice(0, 3)
                .map(Number)
            }
            function luminance(color) {
              const linear = rgb(color).map((channel) => {
                const value = channel / 255
                return value <= 0.04045
                  ? value / 12.92
                  : ((value + 0.055) / 1.055) ** 2.4
              })
              return (
                linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722
              )
            }
            function contrast(foreground, background) {
              const values = [
                luminance(foreground),
                luminance(background),
              ].sort((a, b) => b - a)
              return (values[0] + 0.05) / (values[1] + 0.05)
            }
            let buttonContrast = null
            let buttonContrastWithoutFill = null
            if (hasAction) {
              const style = getComputedStyle(
                document.querySelector('.email-button'),
              )
              buttonContrast = contrast(style.color, style.backgroundColor)
              buttonContrastWithoutFill = contrast(
                style.color,
                cardStyle.backgroundColor,
              )
            }
            const image = document.querySelector('img')
            const canvas = document.createElement('canvas')
            canvas.width = canvas.height = 192
            const context = canvas.getContext('2d')
            context.drawImage(image, 0, 0, 192, 192)
            return {
              overflow: document.documentElement.scrollWidth > innerWidth,
              centered: Math.abs(rect.left - (innerWidth - rect.right)) < 2,
              pageBackground: getComputedStyle(document.body).backgroundColor,
              expectedPageBackground: dark
                ? 'rgb(25, 23, 30)'
                : 'rgb(247, 246, 250)',
              background: cardStyle.backgroundColor,
              expectedBackground: dark
                ? 'rgb(36, 33, 43)'
                : 'rgb(255, 255, 255)',
              buttonContrast,
              buttonContrastWithoutFill,
              transparentImage: context.getImageData(0, 0, 1, 1).data[3] === 0,
            }
          },
          { dark, hasAction: Boolean(fixture.action) },
        )
        if (
          result.overflow ||
          !result.centered ||
          result.background !== result.expectedBackground ||
          result.pageBackground !== result.expectedPageBackground ||
          !result.transparentImage ||
          (result.buttonContrast !== null &&
            (result.buttonContrast < 4.5 ||
              result.buttonContrastWithoutFill < 4.5))
        )
          throw new Error(
            `${name} ${mode} at ${width}px: ${JSON.stringify(result)}`,
          )
        checked += 1
        if (result.buttonContrast !== null)
          minimumButtonContrast = Math.min(
            minimumButtonContrast,
            result.buttonContrast,
            result.buttonContrastWithoutFill,
          )
        await page.screenshot({
          path: `${output}/${name}-${width}-${mode}.png`,
          fullPage: true,
        })
      }
    }
  }
} finally {
  await browser.close()
}
console.log(
  `${checked} email previews passed. Minimum button contrast, including missing fills: ${minimumButtonContrast.toFixed(2)}:1. Screenshots: ${output}`,
)
