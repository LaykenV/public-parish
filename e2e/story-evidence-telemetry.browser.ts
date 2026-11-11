import { expect, test } from '@playwright/test'
import type { BrowserContext } from '@playwright/test'

// Analytics only sends from a production build on a production host without
// webdriver. Serve the local build under the production host name and answer
// /api/analytics here, so no event leaves the browser.
const productionOrigin = 'https://www.publicparish.com'

async function captureAnalytics(context: BrowserContext, localOrigin: string) {
  const events: string[] = []
  await context.addInitScript(() => {
    Object.defineProperty(Navigator.prototype, 'webdriver', { get: () => false })
  })
  await context.route('**/*', async (route) => {
    const url = new URL(route.request().url())
    if (url.origin === productionOrigin) {
      if (url.pathname === '/api/analytics') {
        events.push((JSON.parse(route.request().postData() ?? '{}') as { kind: string }).kind)
        return route.fulfill({ status: 204 })
      }
      const response = await route.fetch({ url: `${localOrigin}${url.pathname}${url.search}` })
      return route.fulfill({ response })
    }
    // Story reads come from Convex. Everything else, including the official
    // source the link opens, stays offline.
    return url.hostname.endsWith('.convex.cloud') ? route.continue() : route.abort()
  })
  // Reads only. Drop any write so the test never changes the deployment.
  await context.routeWebSocket(/\.convex\.cloud\//, (ws) => {
    const server = ws.connectToServer()
    ws.onMessage((message) => {
      const type = typeof message === 'string' ? (JSON.parse(message) as { type?: string }).type : undefined
      if (type !== 'Mutation' && type !== 'Action') server.send(message)
    })
  })
  return events
}

for (const [kind, path] of [
  ['story', '/stories/meta-richland'],
  ['ballot measure', '/ballot/2026-amendment-6'],
] as const) {
  test(`${kind} page records an opened source and an opened official link`, async ({ context, page, baseURL }, info) => {
    const events = await captureAnalytics(context, baseURL!)
    await page.goto(`${productionOrigin}${path}`)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    // The page visit proves capture works before checking the source events.
    await expect.poll(() => events).toContain('app_visit')
    const civic = () => events.filter((event) => event !== 'app_visit')

    await page.locator('.pp-story-citation').first().click()
    const source = page.getByRole('dialog', { name: 'Official source', exact: true })
    await expect(source).toBeVisible()
    await page.screenshot({ path: info.outputPath(`${kind.replace(' ', '-')}-source-open.png`) })
    await expect.poll(civic).toEqual(['evidence_opened'])

    const popup = context.waitForEvent('page')
    await source.getByRole('link', { name: /Open official source at/ }).click()
    await (await popup).close()
    await expect.poll(civic).toEqual(['evidence_opened', 'official_source_opened'])
  })
}
