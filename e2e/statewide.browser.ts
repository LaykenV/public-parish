import { expect, test } from '@playwright/test'

for (const width of [320, 1280]) {
  test(`utility roundup opens every case and its evidence at ${width}px`, async ({
    page,
  }, testInfo) => {
    test.setTimeout(120_000)
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/?area=louisiana')
    const section = page.getByRole('article', {
      name: 'Utility rates and service',
    })
    const cases = section.locator('.pp-utility-cases li')
    await expect(cases).toHaveCount(4)
    await expect(section).toBeVisible()
    const illustration = section.getByRole('img')
    await illustration.scrollIntoViewIfNeeded()
    await expect
      .poll(() =>
        illustration.evaluate(
          (node) => (node as HTMLImageElement).naturalWidth,
        ),
      )
      .toBeGreaterThan(0)
    const imageBox = await illustration.boundingBox()
    expect(imageBox!.width / imageBox!.height).toBeCloseTo(16 / 9, 1)
    await expect(
      section.getByText('AI illustration', { exact: true }),
    ).toBeVisible()
    await expect(section.locator('details')).not.toHaveAttribute('open')
    const records = await cases.evaluateAll((elements) =>
      elements.map((element) => ({
        title: element
          .querySelector('.pp-utility-case-title')!
          .textContent.trim(),
        href: element
          .querySelector<HTMLAnchorElement>('a')!
          .getAttribute('href')!,
      })),
    )
    await expect(page.locator('.pp-story-grid > article')).toHaveCount(4)
    await expect(page.locator('.pp-story-grid > .pp-story-card')).toHaveCount(3)
    await expect(
      page.getByRole('heading', { name: 'Statewide decisions', exact: true }),
    ).toHaveCount(0)
    if (width >= 1025) {
      const bounds = await page
        .locator('.pp-story-grid > article')
        .evaluateAll((elements) =>
          elements.map((element) => {
            const { x, y } = element.getBoundingClientRect()
            return { x, y }
          }),
        )
      expect(bounds[2].y).toBe(bounds[3].y)
      expect(bounds[3].x).toBeGreaterThan(bounds[2].x)
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true)
    await section.evaluate((element) =>
      window.scrollTo({
        top: element.getBoundingClientRect().top + window.scrollY - 100,
      }),
    )
    await page.screenshot({
      path: testInfo.outputPath(`statewide-${width}.png`),
    })
    await section
      .getByRole('button', { name: 'Follow utility updates', exact: true })
      .click()
    const follow = page.getByRole('dialog', {
      name: 'Get updates about this government body',
      exact: true,
    })
    await expect(follow).toContainText('Louisiana Public Service Commission')
    await page.keyboard.press('Escape')
    for (const record of records) {
      await page.goto('/?area=louisiana')
      await section.locator('summary').click()
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
        source.getByRole('link', { name: /Open official source at/ }),
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
