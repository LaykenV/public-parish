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
  const dialog = page.getByRole('dialog', { name: 'Choose your area' })
  await expect(dialog).toBeVisible()
  const choice = dialog.getByRole('button', { name: /^Rapides Parish/ })
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

test('Home hides stories in a parish and never repeats the hero after selection', async ({
  page,
}, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.addInitScript(() => {
    if (!sessionStorage.getItem('home-qa-initialized')) {
      localStorage.removeItem('public-parish.area.v1')
      sessionStorage.setItem('home-qa-initialized', 'true')
    }
  })
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    "Understand what Louisiana's government is deciding.",
  )
  if ((page.viewportSize()?.width ?? 1280) > 768) {
    await expect(page.locator('.pp-home-relief')).toBeVisible()
  } else {
    await expect(page.locator('.pp-home-relief')).not.toBeVisible()
    await expect(page.locator('.pp-home-relief canvas')).toHaveCount(0)
  }
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
    .getByRole('button', { name: 'Focus on a parish', exact: true })
    .click()
  const dialog = page.getByRole('dialog', { name: 'Choose your area' })
  await dialog.getByRole('button', { name: /^Lafayette Parish/ }).click()
  await expect(dialog).not.toBeVisible()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Issues in Lafayette Parish',
  )
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused()
  await expect(page.locator('.pp-home-hero')).toHaveCount(0)
  await expect(page.locator('.pp-home-relief')).toHaveCount(0)
  await expect(page.locator('#stories')).toHaveCount(0)
  await page.screenshot({
    path: testInfo.outputPath('parish-without-stories.png'),
    fullPage: true,
  })
  await expect(
    page.locator('#current-issues a[href^="/issues/"]').first(),
  ).toBeVisible()
  await page.reload()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Issues in Lafayette Parish',
  )

  await page
    .getByRole('button', { name: 'Back to all of Louisiana', exact: true })
    .click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Across Louisiana',
  )
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused()
  await expect(page.locator('.pp-home-hero')).toHaveCount(0)
  await expect(
    page.getByRole('heading', { name: 'Issues across covered parishes' }),
  ).toBeVisible()
  await expect(page.locator('#stories article')).toHaveCount(3)
  expect(
    await page.evaluate(() => localStorage.getItem('public-parish.area.v1')),
  ).toBe('louisiana')
  await page.reload()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Across Louisiana',
  )
  await expect(page.locator('.pp-home-hero')).toHaveCount(0)
  await page.goto('/')
  await expect(page.locator('.pp-home-hero')).toHaveCount(0)
  await expect(page.locator('#stories article')).toHaveCount(3)
  for (const image of await page.locator('#stories img').all()) {
    await image.scrollIntoViewIfNeeded()
    await expect
      .poll(() =>
        image.evaluate(
          (node) =>
            (node as HTMLImageElement).complete &&
            (node as HTMLImageElement).naturalWidth > 0,
        ),
      )
      .toBe(true)
  }
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.screenshot({
    path: testInfo.outputPath('returning-louisiana-without-hero.png'),
    fullPage: true,
  })
})

test('the area selector returns to Louisiana from a parish focus', async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem('public-parish.area.v1', 'rapides-parish'),
  )
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Issues in Rapides Parish',
  )
  const menu = page.getByRole('button', { name: 'Open menu', exact: true })
  if ((page.viewportSize()?.width ?? 1280) <= 1024) {
    await menu.click()
    await expect(page.getByText('Showing Rapides Parish')).toBeVisible()
    await page.getByRole('button', { name: 'Change area', exact: true }).click()
  } else {
    await page
      .getByRole('button', { name: 'Rapides Parish', exact: true })
      .click()
  }
  const dialog = page.getByRole('dialog', { name: 'Choose your area' })
  const louisiana = dialog.getByRole('button', { name: /All of Louisiana/ })
  await expect(louisiana).toHaveAttribute('aria-pressed', 'false')
  await expect(
    dialog.getByRole('button', { name: /^Rapides Parish/ }),
  ).toHaveAttribute('aria-pressed', 'true')
  await louisiana.click()
  await expect(dialog).not.toBeVisible()
  if ((page.viewportSize()?.width ?? 1280) <= 1024) {
    await page.getByRole('button', { name: 'Close menu', exact: true }).click()
  } else {
    await expect(
      page.getByRole('button', { name: 'Louisiana', exact: true }),
    ).toBeVisible()
  }
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Across Louisiana',
  )
  await expect(
    page.locator('#current-issues a[href^="/issues/"]').first(),
  ).toBeVisible()
  expect(
    await page.evaluate(() => localStorage.getItem('public-parish.area.v1')),
  ).toBe('louisiana')
})

test('a body chip narrows Home to one body and survives a reload', async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem('public-parish.area.v1', 'lafayette-parish'),
  )
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Issues in Lafayette Parish',
  )
  const chips = page.getByRole('navigation', { name: 'Government bodies' })
  await expect(chips.getByRole('link', { name: 'All bodies' })).toHaveAttribute(
    'aria-current',
    'page',
  )
  const chip = chips.getByRole('link', { name: 'Lafayette City Council' })
  await chip.click()
  await expect(page).toHaveURL(/body=Lafayette(\+|%20)City(\+|%20)Council/)
  await expect(chip).toHaveAttribute('aria-current', 'page')
  expect(
    await chip.evaluate((node) => getComputedStyle(node).backgroundColor),
  ).not.toBe(
    await chips
      .getByRole('link', { name: 'All bodies' })
      .evaluate((node) => getComputedStyle(node).backgroundColor),
  )
  await expect(
    chips.getByRole('link', { name: 'All bodies' }),
  ).not.toHaveAttribute('aria-current')
  const cards = page.locator('#current-issues article')
  await expect(cards.first()).toBeVisible()
  for (const card of await cards.all()) {
    await expect(card).toContainText('Lafayette City Council')
  }
  const rows = page.locator('#decision-records .pp-row-list > *')
  await expect(rows.first()).toBeVisible()
  for (const row of await rows.all()) {
    await expect(row).toContainText('Lafayette City Council')
  }
  await page.reload()
  await expect(
    page
      .getByRole('navigation', { name: 'Government bodies' })
      .getByRole('link', { name: 'Lafayette City Council' }),
  ).toHaveAttribute('aria-current', 'page')
  await page
    .getByRole('navigation', { name: 'Government bodies' })
    .getByRole('link', { name: 'All bodies' })
    .click()
  await expect(page).not.toHaveURL(/body=/)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Issues in Lafayette Parish',
  )
})

test('the area selector lists parishes and body filtering stays on Home', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 320, height: 640 })
  await page.goto('/')
  await page
    .getByRole('button', { name: 'Focus on a parish', exact: true })
    .click()
  const dialog = page.getByRole('dialog', { name: 'Choose your area' })
  await expect(
    dialog.getByRole('button', { name: /^Rapides Parish/ }),
  ).toBeEnabled()
  await expect(dialog.locator('.pp-area-list button')).toHaveCount(4)
  await expect(
    dialog.getByRole('button', {
      name: /City Council|Show .* bodies|All city bodies/,
    }),
  ).toHaveCount(0)
  const search = dialog.getByRole('searchbox', { name: 'Search parishes' })
  await search.fill('Pineville')
  await expect(
    dialog.getByText('No listed place matches "Pineville".'),
  ).toBeVisible()
  await search.fill('Rapides')
  await expect(dialog.locator('.pp-area-list button')).toHaveCount(1)
  await search.fill('')
  await page.screenshot({
    path: testInfo.outputPath('parish-only-selector.png'),
    fullPage: true,
  })
  await dialog.getByRole('button', { name: /^Rapides Parish/ }).focus()
  await page.keyboard.press('Enter')
  await expect(dialog).not.toBeVisible()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Issues in Rapides Parish',
  )
  await expect(page.locator('#stories')).toHaveCount(0)
  const body = page
    .getByRole('navigation', { name: 'Government bodies' })
    .getByRole('link', { name: 'Pineville City Council' })
  await body.click()
  await expect(body).toHaveAttribute('aria-current', 'page')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Issues from Pineville City Council',
  )
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    320,
  )
  expect(
    await page.evaluate(() => localStorage.getItem('public-parish.area.v1')),
  ).toBe('rapides-parish')
})

test('mobile menu closes with Escape and returns focus to its opener', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/')
  const opener = page.getByRole('button', { name: 'Open menu', exact: true })
  await opener.click()
  const menu = page.getByRole('dialog', { name: 'Menu', exact: true })
  await expect(
    menu.getByRole('link', { name: 'Account', exact: true }),
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
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'How Public Parish works',
    )
    // Font swapping changes paragraph heights independently of menu scrolling.
    await page.evaluate(() => document.fonts.ready)
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
    const area = page.getByRole('dialog', { name: 'Choose your area' })
    await expect(area).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(area).not.toBeVisible()
    await expect(
      menu.getByRole('button', { name: 'Change area', exact: true }),
    ).toBeFocused()
    await menu.getByRole('button', { name: 'Change area', exact: true }).focus()
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

for (const stored of [null, 'lafayette-parish']) {
  test(`shared Pineville body focus overrides saved area ${stored}`, async ({
    page,
  }) => {
    await page.addInitScript((area) => {
      if (area) localStorage.setItem('public-parish.area.v1', area)
      else localStorage.removeItem('public-parish.area.v1')
    }, stored)
    await page.goto('/?body=Pineville%20City%20Council')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Issues from Pineville City Council',
    )
    await expect(page.locator('.pp-home-hero')).toHaveCount(0)
    await expect(
      page.locator('#current-issues .pp-card-place').first(),
    ).toContainText('Pineville City Council')
    await page
      .getByRole('button', { name: 'Back to all of Louisiana', exact: true })
      .click()
    await expect(page).not.toHaveURL(/body=/)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Across Louisiana',
    )
    await expect(page.locator('.pp-home-hero')).toHaveCount(0)
  })
}

test('existing city links still filter Home at 320 pixels', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 320, height: 640 })
  await page.goto('/?city=pineville')
  await expect(page.locator('#stories')).toHaveCount(0)
  await expect(page).toHaveURL(/city=pineville/)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Issues in Pineville',
  )
  await expect(
    page.locator('#current-issues .pp-card-place').first(),
  ).toContainText('Pineville City Council')
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    320,
  )
  await page.screenshot({
    path: testInfo.outputPath('pineville-city-focus.png'),
    fullPage: true,
  })
  await page.evaluate(() => localStorage.removeItem('public-parish.area.v1'))
  await page.reload()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Issues in Pineville',
  )
  await page.getByRole('link', { name: 'All bodies', exact: true }).click()
  await expect(page).not.toHaveURL(/city=/)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Issues in Rapides Parish',
  )
})

for (const stored of [null, 'invalid-area', 'louisiana']) {
  test(`hero introduction respects stored choice ${stored}`, async ({
    page,
  }) => {
    if (stored)
      await page.addInitScript(
        (value) => localStorage.setItem('public-parish.area.v1', value),
        stored,
      )
    await page.goto('/')
    await expect(page.locator('.pp-home-hero')).toHaveCount(
      stored === 'louisiana' ? 0 : 1,
    )
    await expect(page.locator('#stories article')).toHaveCount(3)
    if (stored !== 'louisiana') {
      await page
        .getByRole('button', { name: 'Focus on a parish', exact: true })
        .click()
      await page
        .getByRole('dialog', { name: 'Choose your area' })
        .getByRole('button', { name: /All of Louisiana/ })
        .click()
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(
        'Across Louisiana',
      )
      await expect(page.getByRole('heading', { level: 1 })).toBeFocused()
      await expect(page.locator('.pp-home-hero')).toHaveCount(0)
    }
  })
}

test('area choice dismisses the hero for the session when saving fails', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const save = Storage.prototype.setItem
    Storage.prototype.setItem = function (key, value) {
      if (key === 'public-parish.area.v1')
        throw new DOMException('Storage full', 'QuotaExceededError')
      save.call(this, key, value)
    }
  })
  await page.goto('/')
  await expect(page.locator('.pp-home-hero')).toHaveCount(1)
  await page
    .getByRole('button', { name: 'Focus on a parish', exact: true })
    .click()
  await page
    .getByRole('dialog', { name: 'Choose your area' })
    .getByRole('button', { name: /^Rapides Parish/ })
    .click()
  await expect(page.locator('.pp-home-hero')).toHaveCount(0)
  await expect(page.locator('#stories')).toHaveCount(0)
  await page
    .getByRole('button', { name: 'Back to all of Louisiana', exact: true })
    .click()
  await expect(page.locator('.pp-home-hero')).toHaveCount(0)
  await expect(page.locator('#stories article')).toHaveCount(3)
})
