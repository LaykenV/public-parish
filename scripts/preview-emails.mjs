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
    title:
      "Meta's Richland Parish expansion and the September 16 utility agenda",
    preview:
      'A design preview using the historical email supplied for this redesign.',
    paragraphs: [
      "A revised Louisiana Public Service Commission agenda lists two procedural motions in docket U-37882 for its Sept. 16, 2026 business and executive session. Separately, Louisiana Economic Development announced in July that Meta was committing more than $50 billion to expand its Richland Parish data-center project; the announcement's employment figures are projections.",
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
const browser = await chromium.launch({ headless: true })
try {
  const page = await browser.newPage()
  await page.route(
    'https://www.publicparish.com/apple-touch-icon.png',
    (route) =>
      route.fulfill({
        path: resolve('public/apple-touch-icon.png'),
        contentType: 'image/png',
      }),
  )
  for (const [name, fixture] of Object.entries(fixtures)) {
    const html = renderEmail({ ...base, ...fixture })
    await writeFile(`${output}/${name}.html`, html)
    for (const width of [760, 390, 320]) {
      await page.setViewportSize({ width, height: 900 })
      await page.setContent(html)
      await page.locator('img').evaluate((image) => image.decode())
      if (
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        )
      )
        throw new Error(`${name} overflows at ${width}px`)
      await page.screenshot({
        path: `${output}/${name}-${width}.png`,
        fullPage: true,
      })
    }
  }
} finally {
  await browser.close()
}
console.log(`Email previews and screenshots: ${output}`)
