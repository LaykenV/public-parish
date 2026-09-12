import { expect, test } from '@playwright/test'

test.use({ video: 'on' })

for (const path of ['/', '/coverage', '/stories/meta-richland']) {
  test(`${path} shows only the header and spinner until page data arrives`, async ({
    page,
  }, testInfo) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    let release!: () => void
    const waiting = new Promise<void>((resolve) => {
      release = resolve
    })
    await page.routeWebSocket(/convex\.cloud/, async (socket) => {
      await waiting
      socket.connectToServer()
    })
    await page.goto(path)
    const loading = page.locator('.route-loading-region')
    await expect(loading).toHaveAttribute('aria-busy', 'true')
    await expect(page.locator('.resident-header')).toBeVisible()
    await expect(page.locator('#resident-main')).toBeHidden()
    await expect(page.locator('.resident-footer')).toBeHidden()
    await expect(page.locator('.resident-loading-content')).toHaveAttribute(
      'inert',
      '',
    )
    await expect(loading.locator('svg')).toHaveCount(1)
    await expect(loading.locator('.route-loading-indicator')).toHaveCSS(
      'animation-name',
      'none',
    )
    await expect(loading.locator('svg')).toHaveCSS('animation-name', 'spin')
    await expect(loading.locator('svg')).toHaveCSS('box-shadow', 'none')
    await page.screenshot({ path: testInfo.outputPath('loading.png') })
    release()
    await expect(loading).toHaveAttribute('aria-busy', 'false')
    await expect(page.locator('#resident-main')).toBeVisible()
    await expect(page.locator('.resident-loading-content')).not.toHaveAttribute(
      'inert',
    )
    await expect(page.locator('.resident-footer')).toBeVisible()
    await expect(loading.locator('svg')).toHaveCount(0)
  })
}

test('leaving a pending page releases loading for a static page', async ({
  page,
}) => {
  await page.routeWebSocket(/convex\.cloud/, () => {})
  await page.goto('/coverage')
  await expect(page.locator('.route-loading-region')).toHaveAttribute(
    'aria-busy',
    'true',
  )
  // Exercise client-side navigation while the previous page is still pending.
  await page.locator('.resident-footer a[href="/privacy"]').evaluate((link) => {
    ;(link as HTMLAnchorElement).click()
  })
  await expect(page).toHaveURL(/\/privacy$/)
  await expect(page.locator('.route-loading-region')).toHaveAttribute(
    'aria-busy',
    'false',
  )
  await expect(page.locator('#resident-main')).toBeVisible()
})

test('offline loading keeps a reconnect notice in the header', async ({
  page,
  context,
}) => {
  await page.routeWebSocket(/convex\.cloud/, () => {})
  await page.goto('/coverage')
  await expect(page.locator('.route-loading-region')).toHaveAttribute(
    'aria-busy',
    'true',
  )
  await context.setOffline(true)
  await expect(page.locator('.resident-header').getByRole('status')).toHaveText(
    'You are offline. Reconnect to load this page.',
  )
  await expect(page.locator('#resident-main')).toBeHidden()
  await expect(page.locator('.resident-footer')).toBeHidden()
})
