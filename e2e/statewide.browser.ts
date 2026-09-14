import { expect, test } from '@playwright/test'

for (const width of [320, 1280]) {
  test(`statewide cards open their evidence and meetings at ${width}px`, async ({
    page,
  }, testInfo) => {
    test.setTimeout(120_000)
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/?area=louisiana')
    const section = page.locator(
      'section[aria-labelledby="statewide-decisions-title"]',
    )
    const cards = section.locator('.pp-card')
    await expect(cards).toHaveCount(4)
    const records = await cards.evaluateAll((elements) =>
      elements.map((element) => ({
        title: element.querySelector('.pp-card-title')!.textContent.trim(),
        href: element
          .querySelector<HTMLAnchorElement>('a[href^="/decisions/"]')!
          .getAttribute('href')!,
      })),
    )
    const grid = section.getByRole('region', { name: 'Commission decisions' })
    if (width < 768) {
      expect(
        await grid.evaluate(
          (element) => element.scrollWidth > element.clientWidth,
        ),
      ).toBe(true)
      await expect(
        section.getByText('Decision 1 of 4', { exact: true }),
      ).toBeVisible()
      await grid.evaluate((element) => {
        element.scrollLeft = element.scrollWidth
      })
      await expect(
        section.getByText('Decision 4 of 4', { exact: true }),
      ).toBeVisible()
    } else {
      const bounds = await cards.evaluateAll((elements) =>
        elements.map((element) => {
          const { x, y } = element.getBoundingClientRect()
          return { x, y }
        }),
      )
      expect(bounds[0].y).toBe(bounds[1].y)
      expect(bounds[2].y).toBe(bounds[3].y)
      expect(bounds[2].y).toBeGreaterThan(bounds[0].y)
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true)
    await grid.evaluate((element) => {
      element.scrollLeft = 0
    })
    await section.evaluate((element) =>
      window.scrollTo({
        top: element.getBoundingClientRect().top + window.scrollY - 100,
      }),
    )
    await page.screenshot({
      path: testInfo.outputPath(`statewide-${width}.png`),
    })
    for (const record of records) {
      await page.goto('/?area=louisiana')
      await section.locator(`a[href="${record.href}"]`).first().click()
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(
        record.title,
      )
      const sourceButton = page
        .getByRole('button', { name: /^Source[, ]/ })
        .first()
      await sourceButton.click()
      const source = page.getByRole('dialog', {
        name: 'Official source',
        exact: true,
      })
      await expect(source).toBeVisible()
      await expect(
        source.getByRole('link', { name: /original|official document/i }),
      ).toHaveAttribute('href', /^https:\/\/lpsc\.(louisiana\.gov|la\.gov)\//)
      await page.keyboard.press('Escape')
      await expect(sourceButton).toBeFocused()
      const meeting = page.locator('a[href^="/meetings/"]').first()
      if (await meeting.count()) {
        await meeting.click()
        await expect(page.getByRole('heading', { level: 1 })).toHaveText(
          'Louisiana Public Service Commission meeting',
        )
        await expect(
          page.getByRole('link', { name: record.title, exact: true }),
        ).toBeVisible()
      }
      await page.goto(record.href)
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(
        record.title,
      )
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true)
    }
  })
}
