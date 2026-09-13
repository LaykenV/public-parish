import { expect, test } from '@playwright/test'

test('body changes keep the page visible while only results load', async ({
  page,
}, testInfo) => {
  let hold = false
  const queued: Array<() => void> = []
  await page.routeWebSocket(/convex\.cloud/, (socket) => {
    const server = socket.connectToServer()
    server.onMessage((message) => {
      if (hold) queued.push(() => socket.send(message))
      else socket.send(message)
    })
  })
  await page.goto('/?area=rapides-parish')
  await expect(page.locator('#current-issues article').first()).toBeVisible()
  const mobile = (page.viewportSize()?.width ?? 1280) < 768
  hold = true
  await page
    .getByRole('button', {
      name: mobile ? /^Filters/ : /^Filter government bodies/,
    })
    .click()
  const drawer = page.getByRole('dialog', { name: 'Filter local issues' })
  await drawer.getByRole('checkbox', { name: 'Pineville City Council' }).check()
  await expect(page).not.toHaveURL(/body=/)
  await page.screenshot({ path: testInfo.outputPath('filter-drawer.png') })
  await drawer.getByRole('button', { name: 'Apply filters' }).click()
  await expect(drawer).not.toBeVisible()
  await expect(
    page
      .locator('#current-issues')
      .getByRole('status', { name: '', exact: true })
      .filter({ hasText: 'Updating issues' }),
  ).toBeVisible()
  await expect(page.locator('.route-loading-region')).toHaveAttribute(
    'aria-busy',
    'false',
  )
  await expect(page.locator('#resident-main')).toBeVisible()
  await expect(page.locator('.resident-footer')).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'View Statewide Stories' }),
  ).toBeVisible()
  await page.screenshot({ path: testInfo.outputPath('filter-loading.png') })
  hold = false
  queued.splice(0).forEach((send) => send())
  await expect(
    page.locator('#current-issues .pp-home-results'),
  ).toHaveAttribute('aria-busy', 'false')
  await expect(
    page.locator('#current-issues .pp-card-place').first(),
  ).toContainText('Pineville City Council')
  if (mobile) await expect(page.locator('#home-filter-trigger')).toBeFocused()
  else
    await expect(
      page.getByRole('button', { name: /^Filter government bodies/ }),
    ).toBeFocused()
  await page.goBack()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Issues in Rapides Parish',
  )
})

test('floating controls select an area, discard drafts and change parishes', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 320, height: 640 })
  await page.goto('/?area=louisiana')
  await page.getByRole('button', { name: 'Choose area', exact: true }).click()
  const areas = page.getByRole('dialog', { name: 'Choose your area' })
  await areas.getByRole('button', { name: /^Lafayette Parish/ }).click()
  const opener = page.getByRole('button', { name: 'Filters', exact: true })
  await expect(opener).toBeVisible()
  await opener.click()
  const drawer = page.getByRole('dialog', { name: 'Filter local issues' })
  await drawer
    .getByRole('checkbox', { name: 'Youngsville City Council' })
    .check()
  await page.keyboard.press('Escape')
  await expect(drawer).not.toBeVisible()
  await expect(opener).toBeFocused()
  await opener.click()
  await expect(
    drawer.getByRole('checkbox', { name: 'Youngsville City Council' }),
  ).not.toBeChecked()
  await page.screenshot({ path: testInfo.outputPath('narrow-filters.png') })
  await drawer.getByRole('button', { name: 'Change area', exact: true }).click()
  await page.keyboard.press('Escape')
  await expect(areas).not.toBeVisible()
  await expect(drawer).toBeVisible()
  await expect(
    drawer.getByRole('button', { name: 'Change area', exact: true }),
  ).toBeFocused()
  await drawer.getByRole('button', { name: 'Change area', exact: true }).click()
  await areas.getByRole('button', { name: /^Rapides Parish/ }).click()
  await expect(drawer).not.toBeVisible()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Issues in Rapides Parish',
  )
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    320,
  )
  await page.screenshot({
    path: testInfo.outputPath('narrow-parish.png'),
    fullPage: true,
  })
})

test('all featured stories have full images in a two-column desktop grid', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/?area=louisiana')
  const cards = page.locator('#stories article')
  await expect(cards).toHaveCount(3)
  const boxes = await cards.evaluateAll((nodes) =>
    nodes.map((node) => {
      const card = node.getBoundingClientRect()
      const img = node.querySelector('img')!.getBoundingClientRect()
      return {
        x: card.x,
        y: card.y,
        width: card.width,
        imageWidth: img.width,
        imageHeight: img.height,
      }
    }),
  )
  expect(boxes[0].y).toBe(boxes[1].y)
  expect(boxes[2].y).toBeGreaterThan(boxes[0].y)
  expect(boxes[0].width).toBeCloseTo(boxes[1].width, 0)
  for (const box of boxes) {
    expect(box.imageWidth).toBeCloseTo(box.width, 0)
    expect(box.imageWidth / box.imageHeight).toBeCloseTo(16 / 9, 1)
  }
  for (const image of await cards.locator('img').all()) {
    await image.scrollIntoViewIfNeeded()
    await expect
      .poll(() =>
        image.evaluate((node) => (node as HTMLImageElement).naturalWidth),
      )
      .toBeGreaterThan(0)
  }
  await page.evaluate(() => {
    ;(document.activeElement as HTMLElement | null)?.blur()
    window.scrollTo(0, 0)
  })
  await expect(page.locator('.resident-header')).not.toHaveAttribute(
    'data-scrolled',
  )
  await page.screenshot({
    path: testInfo.outputPath('desktop-stories.png'),
    fullPage: true,
  })
})

test('parish issues stack vertically and multiple filters survive reload', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/?area=rapides-parish')
  const cards = page.locator('#current-issues article')
  await expect(cards.nth(1)).toBeVisible()
  const first = (await cards.nth(0).boundingBox())!
  const second = (await cards.nth(1).boundingBox())!
  expect(second.y).toBeGreaterThanOrEqual(first.y + first.height)
  expect(second.x).toBe(first.x)
  await expect(page.locator('.pp-issue-index')).toHaveCount(0)
  const search = (await page
    .getByRole('link', { name: 'Search issues' })
    .boundingBox())!
  const statewide = (await page
    .getByRole('button', { name: 'View Statewide Stories' })
    .boundingBox())!
  expect(Math.abs(search.y - statewide.y)).toBeLessThan(2)
  expect(statewide.x).toBeGreaterThan(search.x)
  await page.getByRole('button', { name: /^Filters/ }).click()
  const drawer = page.getByRole('dialog', { name: 'Filter local issues' })
  for (const name of ['Pineville City Council', 'Rapides Parish Police Jury'])
    await drawer.getByRole('checkbox', { name, exact: true }).check()
  await page.screenshot({ path: testInfo.outputPath('multiple-filters.png') })
  await drawer.getByRole('button', { name: 'Apply filters' }).click()
  await expect(page).toHaveURL(/bodies=/)
  await expect(
    page.locator('#current-issues .pp-home-results'),
  ).toHaveAttribute('aria-busy', 'false')
  const places = await cards.locator('.pp-card-place').allTextContents()
  expect(places.length).toBeGreaterThan(0)
  expect(
    places.every((place) =>
      /Pineville City Council|Rapides Parish Police Jury/.test(place),
    ),
  ).toBe(true)
  for (const name of ['Pineville City Council', 'Rapides Parish Police Jury'])
    expect(places.some((place) => place.includes(name))).toBe(true)
  await page.reload()
  await page.getByRole('button', { name: /^Filters/ }).click()
  for (const name of ['Pineville City Council', 'Rapides Parish Police Jury'])
    await expect(
      drawer.getByRole('checkbox', { name, exact: true }),
    ).toBeChecked()
  await drawer
    .getByRole('checkbox', { name: 'Pineville City Council', exact: true })
    .uncheck()
  await drawer.getByRole('button', { name: 'Apply filters' }).click()
  await expect(page).not.toHaveURL(/bodies=/)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Issues from Rapides Parish Police Jury',
  )
  await page.getByRole('button', { name: /^Filters/ }).click()
  await drawer.getByRole('button', { name: 'Reset', exact: true }).click()
  await drawer.getByRole('button', { name: 'Apply filters' }).click()
  await expect(page).not.toHaveURL(/body=/)
  await expect(
    page.locator('#current-issues .pp-home-results'),
  ).toHaveAttribute('aria-busy', 'false')
  await expect(
    page.locator('#decision-records .pp-home-results'),
  ).toHaveAttribute('aria-busy', 'false')
  await page.setViewportSize({ width: 320, height: 812 })
  const narrowSearch = (await page
    .getByRole('link', { name: 'Search issues' })
    .boundingBox())!
  const narrowStatewide = (await page
    .getByRole('button', { name: 'View Statewide Stories' })
    .boundingBox())!
  expect(Math.abs(narrowSearch.y - narrowStatewide.y)).toBeLessThan(2)
  expect(narrowStatewide.x).toBeGreaterThanOrEqual(
    narrowSearch.x + narrowSearch.width,
  )
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    320,
  )
  await page.screenshot({
    path: testInfo.outputPath('parish-vertical.png'),
    fullPage: true,
  })
})
