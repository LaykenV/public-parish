import { expect, test } from '@playwright/test'

for (const [slug, name] of [
  ['rapides-parish', 'Rapides Parish'],
  ['lafayette-parish', 'Lafayette Parish'],
  ['east-baton-rouge-parish', 'East Baton Rouge Parish'],
]) {
  test(`Home parish selection opens ${name} and remembers the selection`, async ({
    page,
  }, testInfo) => {
    await page.goto('/?area=louisiana')
    const hero = page.locator('.pp-home-hero')
    await expect(hero).toBeVisible()
    await page.screenshot({ path: testInfo.outputPath('home-hero.png') })
    const mobile = (page.viewportSize()?.width ?? 1280) <= 768
    if (mobile) {
      await expect(page.locator('.pp-home-relief')).toHaveCount(0)
      await page.getByRole('button', { name: 'Choose a parish' }).click()
    }
    const choice = mobile
      ? page
          .getByRole('dialog', { name: 'Choose your area' })
          .getByRole('button', { name: new RegExp(`^${name}`) })
      : hero.getByRole('button', { name: `Select ${name}`, exact: true })
    await expect(choice).toBeEnabled()
    await page.screenshot({
      path: testInfo.outputPath('clickable-parish-labels.png'),
    })
    await choice.focus()
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(new RegExp(`area=${slug}`))
    const heading = page.getByRole('heading', {
      level: 1,
      name: `Issues in ${name}`,
    })
    await expect(heading).toBeVisible()
    await expect(heading).toBeFocused()
    await expect(hero).toHaveCount(0)
    expect(
      await page.evaluate(() => localStorage.getItem('public-parish.area.v1')),
    ).toBe(slug)
    await page.reload()
    await expect(heading).toBeVisible()
    await page
      .getByRole('button', { name: 'View Statewide Stories', exact: true })
      .click()
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Across Louisiana',
    )
    await expect(hero).toHaveCount(0)
  })
}

test('Louisiana mounts only above mobile widths and keeps desktop fallback selection', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'gpu', {
      value: undefined,
      configurable: true,
    })
  })
  await page.goto('/')
  const relief = page.locator('.relief-viewport')
  for (const width of [320, 375, 768, 769, 1024, 1440, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    if (width <= 768) {
      await expect(page.locator('.pp-home-relief')).toHaveCount(0)
      await expect(relief).toHaveCount(0)
      await expect(
        page.locator('.relief-canvas, .relief-fallback, .relief-map-label'),
      ).toHaveCount(0)
      await expect(
        page.getByRole('button', { name: 'Choose a parish' }),
      ).toBeVisible()
      const hero = (await page.locator('.pp-home-hero').boundingBox())!
      const copy = (await page.locator('.pp-home-hero-copy').boundingBox())!
      expect(hero.y + hero.height).toBeCloseTo(copy.y + copy.height, 0)
      continue
    }
    await expect(relief).toHaveAttribute('data-render-state', 'fallback')
    const labels = page
      .getByRole('group', { name: 'Choose a parish on Louisiana' })
      .getByRole('button')
    await expect(labels).toHaveCount(3)
    for (const label of await labels.all()) {
      await expect(label).toBeVisible()
      const bounds = (await label.boundingBox())!
      expect(bounds.x).toBeGreaterThanOrEqual(0)
      expect(bounds.x + bounds.width).toBeLessThanOrEqual(width)
    }
    if (width === 1440) {
      const model = (await page.locator('.pp-home-relief').boundingBox())!
      expect(model.width).toBe(522)
      expect(model.height).toBe(448)
    }
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBe(width)
  }
  await page
    .getByRole('button', { name: 'Select Rapides Parish', exact: true })
    .click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Issues in Rapides Parish',
  )
})
