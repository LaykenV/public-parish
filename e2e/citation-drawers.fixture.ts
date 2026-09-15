import { expect, test } from '@playwright/test'

const pages = [
  ['Meta', '/stories/meta-richland', '.pp-story-citation'],
  ['SpaceX', '/stories/spacex-pecan-island', '.pp-story-citation'],
  ['Boyce', '/stories/applied-digital-boyce', '.pp-story-citation'],
  ...Array.from({ length: 10 }, (_, index) => [
    `Amendment ${index + 1}`,
    `/ballot/2026-amendment-${index + 1}`,
    '.pp-story-citation',
  ] as const),
  ['issue', '/issues/drainage-fee-credit-cap?fixture=preview', '.ev-source'],
  ['decision', '/decisions/CO-022-2026?fixture=preview', '.ev-source'],
  ['meeting', '/meetings/lafayette-city-council-2026-09-08?fixture=preview', '.ev-source'],
  ['Ask', '/ask?fixture=thread', '.ev-source'],
] as const

for (const [kind, path, selector] of pages) {
  test(`${kind} citation reaches the visible bottom when browser bars change`, async ({ page }, info) => {
    test.setTimeout(120_000)
    await page.setViewportSize({ width: 390, height: 844 })
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await page.goto(path)
    const citation = page.locator(selector).first()
    await expect(citation).toBeVisible()
    await page.evaluate(() => document.fonts.ready)
    await citation.scrollIntoViewIfNeeded()
    const before = await page.evaluate(() => scrollY)

    // Reproduce a visible viewport taller than the root layout measurement.
    // The former height clamp left this difference as a gap below the drawer.
    await page.evaluate(() => {
      Object.defineProperty(document.documentElement, 'clientHeight', {
        configurable: true, value: 807,
      })
      visualViewport!.dispatchEvent(new Event('resize'))
    })
    await citation.click()
    const drawer = page.getByRole('dialog', { name: 'Official source', exact: true })
    await expect(drawer).toBeVisible()
    await expect.poll(async () => {
      const box = await drawer.boundingBox()
      return Math.round(box!.y + box!.height)
    }).toBe(844)
    await expect(drawer.getByRole('button', { name: 'Close', exact: true })).toBeInViewport()
    const actions = drawer.locator('.pp-sheet-footer')
    for (const link of await actions.getByRole('link').all()) {
      await expect(link).toBeInViewport()
    }
    const actionPosition = await actions.boundingBox()
    await drawer.locator('.pp-sheet-body').evaluate(element => { element.scrollTop = element.scrollHeight })
    expect((await actions.boundingBox())!.y).toBe(actionPosition!.y)
    await drawer.locator('.pp-sheet-body').evaluate(element => { element.scrollTop = 0 })
    await page.screenshot({ path: info.outputPath(`${kind}-source-expanded.png`) })

    // Follow both directions while the same citation stays open.
    for (const height of [770, 360, 844]) {
      await page.evaluate((visibleHeight) => {
        Object.defineProperty(visualViewport, 'height', { configurable: true, value: visibleHeight })
        visualViewport!.dispatchEvent(new Event('resize'))
      }, height)
      await expect.poll(async () => {
        const box = await drawer.boundingBox()
        return Math.round(box!.y + box!.height)
      }).toBe(height)
      for (const action of await actions.getByRole('link').all()) {
        await expect(action).toBeInViewport()
      }
      const link = drawer.getByRole('link').last()
      await link.scrollIntoViewIfNeeded()
      const linkBounds = await link.boundingBox()
      const drawerBounds = await drawer.boundingBox()
      expect(linkBounds!.y).toBeGreaterThanOrEqual(drawerBounds!.y)
      expect(linkBounds!.y + linkBounds!.height).toBeLessThanOrEqual(height)
      await expect(drawer.getByRole('button', { name: 'Close', exact: true })).toBeInViewport()
    }
    await drawer.getByRole('button', { name: 'Close', exact: true }).click()
    await expect(drawer).toBeHidden()
    await expect(citation).toBeFocused()
    expect(Math.abs(await page.evaluate(() => scrollY) - before)).toBeLessThanOrEqual(1)

    if (selector === '.pp-story-citation') {
      // Inspect every unique source, including those not used by the first
      // inline citation, on a narrower phone with less space for long excerpts.
      await page.evaluate(() => {
        delete (document.documentElement as unknown as Record<string, unknown>).clientHeight
        delete (visualViewport as unknown as Record<string, unknown>).height
      })
      await page.setViewportSize({ width: 320, height: 568 })
      const inventory = page.locator('.pp-story-source-row')
      expect(await inventory.count()).toBeGreaterThan(0)
      for (const source of await inventory.all()) {
        await source.scrollIntoViewIfNeeded()
        const readingPosition = await page.evaluate(() => scrollY)
        await source.click()
        await expect(drawer).toBeVisible()
        await expect.poll(async () => {
          const box = await drawer.boundingBox()
          return Math.round(box!.y + box!.height)
        }).toBe(568)
        const box = await drawer.boundingBox()
        expect(box!.x).toBeGreaterThanOrEqual(0)
        expect(box!.x + box!.width).toBeLessThanOrEqual(320)
        await expect(drawer.locator('blockquote')).not.toBeEmpty()
        const artifact = drawer.getByRole('link').last()
        await artifact.scrollIntoViewIfNeeded()
        await expect(artifact).toBeInViewport()
        await expect(drawer.getByRole('button', { name: 'Close', exact: true })).toBeInViewport()
        await drawer.getByRole('button', { name: 'Close', exact: true }).click()
        await expect(drawer).toBeHidden()
        await expect(source).toBeFocused()
        expect(Math.abs(await page.evaluate(() => scrollY) - readingPosition)).toBeLessThanOrEqual(1)
      }
      await test.info().attach('source inventory', {
        body: `${kind}: ${await inventory.count()} source drawers checked at 320 by 568 pixels`,
        contentType: 'text/plain',
      })
    }
  })
}
