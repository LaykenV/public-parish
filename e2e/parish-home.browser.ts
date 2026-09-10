import { expect, test } from '@playwright/test'

for (const [slug, name] of [
  ['lafayette-parish', 'Lafayette Parish'],
  ['rapides-parish', 'Rapides Parish'],
] as const) {
  test(`home loads existing evidence for ${name}`, async ({
    page,
  }, testInfo) => {
    await page.addInitScript(
      (area) => localStorage.setItem('public-parish.area.v1', area),
      slug,
    )
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      `Issues in ${name}`,
    )
    const issues = page.locator('#current-issues')
    await expect(issues.locator('a[href^="/issues/"]').first()).toBeVisible()
    await expect(
      page.getByText(
        'No published decision records are available for this area.',
      ),
    ).not.toBeVisible()
    await expect(page.locator('a[href^="/decisions/"]').first()).toBeVisible()
    await page.screenshot({
      path: testInfo.outputPath(`${slug}.png`),
      fullPage: true,
    })
  })
}

test('published parish records remain selectable with coverage limitations', async ({
  page,
}, testInfo) => {
  await page.addInitScript(() =>
    localStorage.setItem('public-parish.area.v1', 'lafayette-parish'),
  )
  await page.goto('/')
  const menu = page.getByRole('button', { name: 'Open menu', exact: true })
  if ((page.viewportSize()?.width ?? 1280) <= 1024) {
    await menu.click()
    await page.getByRole('button', { name: 'Change area', exact: true }).click()
  } else {
    await page
      .getByRole('button', { name: 'Lafayette Parish', exact: true })
      .click()
  }
  const dialog = page.getByRole('dialog', { name: 'Choose a parish or city' })
  await expect(dialog).toBeVisible()
  const choice = dialog.getByRole('button', { name: /Rapides Parish/ })
  await expect(choice).toBeEnabled()
  await page.screenshot({
    path: testInfo.outputPath('coverage-selector.png'),
    fullPage: true,
  })
  await choice.click()
  await expect(dialog).not.toBeVisible()
  if ((page.viewportSize()?.width ?? 1280) <= 1024) {
    await page.getByRole('button', { name: 'Close menu', exact: true }).click()
  }
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Issues in Rapides Parish',
  )
  await expect(
    page.locator('#current-issues a[href^="/issues/"]').first(),
  ).toBeVisible()
})

test('home introduces Louisiana stories and switches to local issues after selection', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.addInitScript(() => {
    if (!sessionStorage.getItem('home-qa-initialized')) {
      localStorage.removeItem('public-parish.area.v1')
      sessionStorage.setItem('home-qa-initialized', 'true')
    }
  })
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'See how local government is changing.',
  )
  await expect(page.locator('.pp-home-relief')).toBeVisible()
  await expect(
    page.locator('#stories a[href^="/stories/"]').first(),
  ).toBeVisible()
  await expect(
    page.locator('#current-issues a[href^="/issues/"]').first(),
  ).toBeVisible()
  expect(
    await page
      .locator('#stories')
      .evaluate((stories) =>
        Boolean(
          stories.compareDocumentPosition(
            document.querySelector('#current-issues')!,
          ) & Node.DOCUMENT_POSITION_FOLLOWING,
        ),
      ),
  ).toBe(true)

  await page
    .getByRole('button', { name: 'Choose a parish or city', exact: true })
    .click()
  const dialog = page.getByRole('dialog', { name: 'Choose a parish or city' })
  await dialog.getByRole('button', { name: /Lafayette Parish/ }).click()
  await expect(dialog).not.toBeVisible()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Issues in Lafayette Parish',
  )
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused()
  await expect(page.locator('.pp-home-hero')).toHaveCount(0)
  await expect(page.locator('.pp-home-relief')).toHaveCount(0)
  await expect(page.locator('#stories article')).toHaveCount(3)
  expect(
    await page
      .locator('#current-issues')
      .evaluate((issues) =>
        Boolean(
          issues.compareDocumentPosition(document.querySelector('#stories')!) &
          Node.DOCUMENT_POSITION_FOLLOWING,
        ),
      ),
  ).toBe(true)
  await expect(
    page.locator('#current-issues a[href^="/issues/"]').first(),
  ).toBeVisible()
  await page.reload()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Issues in Lafayette Parish',
  )
})

test('mobile menu closes with Escape and returns focus to its opener', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/')
  const opener = page.getByRole('button', { name: 'Open menu', exact: true })
  await opener.click()
  const menu = page.getByRole('dialog', { name: 'Menu', exact: true })
  await expect(
    menu.getByRole('link', { name: 'Following', exact: true }),
  ).toBeVisible()
  const close = page.getByRole('button', { name: 'Close menu', exact: true })
  await expect(close).toBeVisible()
  await close.click()
  await expect(menu).not.toBeVisible()
  await opener.click()
  await page.keyboard.press('Escape')
  await expect(menu).not.toBeVisible()
  await expect(opener).toBeFocused()
  await opener.click()
  await menu.getByRole('link', { name: 'Explore', exact: true }).click()
  await expect(menu).not.toBeVisible()
  await expect(page).toHaveURL(/\/explore/)
  await expect(page.locator('.resident-mobile-nav')).toHaveCount(0)
})

for (const width of [320, 375]) {
  test(`issue swipe row keeps its height and reports position at ${width}px`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 812 })
    await page.addInitScript(() =>
      localStorage.setItem('public-parish.area.v1', 'lafayette-parish'),
    )
    await page.goto('/')
    const track = page.getByRole('region', { name: 'Issue timelines' })
    const cards = track.locator('article')
    await expect(cards.nth(1)).toBeAttached()
    const count = await cards.count()
    const index = page.locator('.pp-issue-index').getByRole('status')
    await expect(index).toHaveText(`Issue 1 of ${count}`)
    const heights = await cards.evaluateAll((nodes) =>
      nodes.map((node) => node.getBoundingClientRect().height),
    )
    expect(Math.max(...heights) - Math.min(...heights)).toBeLessThan(1)
    const heightBefore = (await track.boundingBox())!.height
    const cardWidth = (await cards.first().boundingBox())!.width
    expect(cardWidth).toBeGreaterThan(width * 0.85)
    await track.evaluate((node) =>
      node.scrollBy({ left: node.clientWidth * 0.8, behavior: 'instant' }),
    )
    await expect(index).toHaveText(`Issue 2 of ${count}`)
    expect((await track.boundingBox())!.height).toBeCloseTo(heightBefore, 0)
    await expect
      .poll(() =>
        cards.nth(1).evaluate((node) => {
          const row = node.parentElement!
          return Math.abs(
            node.getBoundingClientRect().left -
              row.getBoundingClientRect().left -
              parseFloat(getComputedStyle(row).paddingLeft),
          )
        }),
      )
      .toBeLessThan(2)
    await track.evaluate((node) =>
      node.scrollTo({ left: node.scrollWidth, behavior: 'instant' }),
    )
    await expect(index).toHaveText(`Issue ${count} of ${count}`)
    expect((await track.boundingBox())!.height).toBeCloseTo(heightBefore, 0)
    // Load below-the-fold story images before taking full-page evidence.
    for (const image of await page.locator('#stories img').all()) {
      await image.scrollIntoViewIfNeeded()
      await expect
        .poll(() =>
          image.evaluate((node) => (node as HTMLImageElement).naturalWidth),
        )
        .toBeGreaterThan(0)
    }
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.screenshot({
      path: testInfo.outputPath(`home-swipe-${width}.png`),
      fullPage: true,
    })
    for (const wide of [768, 1280]) {
      await page.setViewportSize({ width: wide, height: 900 })
      await expect(page.locator('.pp-issue-index')).toHaveCount(0)
      const dimensions = await cards.evaluateAll((nodes) =>
        nodes.map((node) => node.getBoundingClientRect().height),
      )
      expect(Math.max(...dimensions) - Math.min(...dimensions)).toBeLessThan(1)
      await page.screenshot({
        path: testInfo.outputPath(`home-grid-${wide}.png`),
        fullPage: true,
      })
    }
  })
}

for (const viewport of [
  { width: 375, height: 812 },
  { width: 320, height: 480 },
]) {
  test(`mobile navigation stays available while reading at ${viewport.width}px`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize(viewport)
    await page.goto('/how-it-works')
    const header = page.locator('.resident-header')
    const opener = page.getByRole('button', { name: 'Open menu', exact: true })
    await expect(header).not.toHaveAttribute('data-scrolled')
    await page.evaluate(() => window.scrollTo(0, 650))
    await expect(header).toHaveAttribute('data-scrolled', 'true')
    const scrollY = await page.evaluate(() => window.scrollY)
    expect(scrollY).toBeGreaterThan(0)
    await expect
      .poll(() => header.evaluate((node) => node.getBoundingClientRect().top))
      .toBe(0)
    expect((await header.boundingBox())?.height).toBe(48)
    await page.screenshot({
      path: testInfo.outputPath('mobile-scrolled-header.png'),
    })
    await opener.click()
    const menu = page.getByRole('dialog', { name: 'Menu', exact: true })
    await expect(menu).toBeVisible()
    expect((await menu.boundingBox())?.height).toBe(viewport.height)
    await page.screenshot({ path: testInfo.outputPath('mobile-full-menu.png') })
    await menu.getByRole('button', { name: 'Change area', exact: true }).click()
    const area = page.getByRole('dialog', { name: 'Choose a parish or city' })
    await expect(area).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(area).not.toBeVisible()
    await expect(
      menu.getByRole('button', { name: 'Change area', exact: true }),
    ).toBeFocused()
    await menu
      .getByRole('link', { name: 'Account and notification settings' })
      .focus()
    await page.keyboard.press('Tab')
    await expect(
      menu.getByRole('button', { name: 'Close menu', exact: true }),
    ).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(menu).not.toBeVisible()
    await expect(opener).toBeFocused()
    await expect
      .poll(async () =>
        Math.abs((await page.evaluate(() => window.scrollY)) - scrollY),
      )
      .toBeLessThanOrEqual(1)
    await page.evaluate(() => window.scrollTo(0, 0))
    await expect(header).not.toHaveAttribute('data-scrolled')
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBe(viewport.width)
  })
}
