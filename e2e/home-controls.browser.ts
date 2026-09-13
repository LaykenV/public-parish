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
  if (mobile) {
    await page.getByRole('button', { name: 'Filters', exact: true }).click()
    const drawer = page.getByRole('dialog', { name: 'Filter local issues' })
    await drawer.getByRole('radio', { name: 'Pineville City Council' }).check()
    await expect(page).not.toHaveURL(/body=/)
    await page.screenshot({ path: testInfo.outputPath('filter-drawer.png') })
    await drawer.getByRole('button', { name: 'Apply filters' }).click()
    await expect(drawer).not.toBeVisible()
  } else {
    await page.getByRole('combobox', { name: 'Government body' }).focus()
    await page
      .getByRole('combobox', { name: 'Government body' })
      .selectOption('Pineville City Council')
  }
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
      page.getByRole('combobox', { name: 'Government body' }),
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
  await drawer.getByRole('radio', { name: 'Youngsville City Council' }).check()
  await page.keyboard.press('Escape')
  await expect(drawer).not.toBeVisible()
  await expect(opener).toBeFocused()
  await opener.click()
  await expect(
    drawer.getByRole('radio', { name: 'All bodies', exact: true }),
  ).toBeChecked()
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
