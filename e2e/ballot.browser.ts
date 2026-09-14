import { expect, test } from '@playwright/test'

for (const width of [320, 1280]) {
  test(`ballot guide lists the ten statewide measures at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/ballot')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('The November 3 election')
    const measures = page.locator('.pp-ballot-grid li')
    await expect(measures).toHaveCount(10)
    for (let number = 1; number <= 10; number++) {
      await expect(measures.nth(number - 1).getByRole('link', { name: `Read Amendment ${number}`, exact: true })).toHaveAttribute('href', `/ballot/2026-amendment-${number}`)
    }
    await expect(page.getByText('No parish propositions have been verified for this guide. This is not a complete sample ballot.')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Check registration and sample ballot', exact: true })).toHaveAttribute('href', 'https://voterportal.sos.la.gov/')
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  })
}

test('measure citation opens the official question and Follow preserves its scope', async ({ page }) => {
  await page.goto('/ballot/2026-amendment-6')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Amendment 6')
  const question = page.locator('section').filter({ has: page.getByRole('heading', { name: 'Ballot question', exact: true }) })
  await expect(question).toContainText('Do you support an amendment')
  const sourceButton = question.getByRole('button').first()
  await sourceButton.click()
  const source = page.getByRole('dialog', { name: 'Official source', exact: true })
  await expect(source).toBeVisible()
  await expect(source).toContainText('Do you support an amendment')
  await expect(source.getByRole('link', { name: /Open official source at/ })).toHaveAttribute('href', /sos\.la\.gov\/.*proposed-constitutional-amendments-2026-nov\.pdf/)
  await page.keyboard.press('Escape')
  await expect(sourceButton).toBeFocused()
  await page.getByRole('button', { name: 'Follow this measure', exact: true }).first().click()
  const follow = page.getByRole('dialog', { name: 'Get updates about this measure', exact: true })
  await expect(follow).toContainText('Amendment 6')
  await follow.getByRole('radio', { name: 'Weekly roundup', exact: true }).check()
  await follow.getByRole('button', { name: 'Use email only' }).click()
  await expect(follow.getByRole('textbox', { name: 'Email address' })).toBeVisible()
  await page.keyboard.press('Escape')
  if ((page.viewportSize()?.width ?? 1280) < 768) {
    await page.getByRole('button', { name: 'Ask Public Parish', exact: true }).click()
    await expect(page.getByRole('dialog', { name: 'Ask Public Parish', exact: true })).toBeVisible()
    await expect(page.getByRole('dialog', { name: 'Ask Public Parish', exact: true })).toContainText('Amendment 6')
  } else {
    await expect(page.getByRole('link', { name: 'Ask about this measure', exact: true })).toHaveAttribute('href', /story=2026-amendment-6/)
  }
})

test('a measure without a separate next action preserves its documented election date', async ({ page }) => {
  await page.goto('/ballot/2026-amendment-1')
  const timeline = page.locator('#story-timeline')
  await expect(timeline).toContainText('Nov 3, 2026')
  const nextAction = page.locator('#story-next-action')
  await expect(nextAction).toContainText('Check the timeline above for documented dates.')
  await expect(nextAction).not.toContainText('No next public action or deadline is established')
  await expect(nextAction.getByRole('button', { name: 'Follow this measure', exact: true })).toBeVisible()
})

test('statewide Home keeps three featured stories and parish Home retains the ballot guide', async ({ page }) => {
  await page.goto('/?area=louisiana')
  await expect(page.locator('.pp-story-grid .pp-story-card')).toHaveCount(3)
  await expect(page.getByRole('heading', { name: 'Utility rates and service', exact: true })).toBeVisible()
  await expect(page.locator('.pp-ballot-grid li')).toHaveCount(10)
  for (const parish of ['rapides-parish', 'lafayette-parish']) {
  await page.goto(`/?area=${parish}`)
  await expect(page.locator('.pp-ballot-grid li')).toHaveCount(2)
  await expect(page.locator('.pp-ballot[data-compact]')).toContainText('Previewing 2 of 10 statewide amendments.')
  await expect(page.locator('.pp-story-grid .pp-story-card')).toHaveCount(0)
  await expect(page.getByRole('heading', { name: 'Utility rates and service', exact: true })).toHaveCount(0)
  }
})


test('commission records link preserves the statewide body filter', async ({ page }) => {
  await page.goto('/?area=louisiana')
  await page.getByRole('link', { name: 'View commission records', exact: true }).click()
  await expect(page).toHaveURL(/body=Louisiana/)
  const cards = page.locator('.pp-explore-card')
  await expect(cards.first()).toBeVisible()
  for (const card of await cards.all()) await expect(card).toContainText('Louisiana Public Service Commission')
})


for (const width of [320, 1280]) {
  test(`Home ballot cards have numbered reading links at ${width}px`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/?area=louisiana')
    const ballot = page.locator('.pp-ballot[data-home]')
    const cards = ballot.locator('.pp-ballot-grid li')
    await expect(cards).toHaveCount(10)
    await expect(cards.first()).toBeVisible()
    for (let number = 1; number <= 10; number++) {
      const card = cards.nth(number - 1)
      await expect(card.locator('.pp-ballot-number')).toHaveText(String(number))
      const link = card.getByRole('link', {
        name: `Read Amendment ${number}`,
        exact: true,
      })
      await expect(link).toHaveAttribute(
        'href',
        `/ballot/2026-amendment-${number}`,
      )
      await expect(link.locator('svg')).toBeVisible()
      await expect(card).toContainText('Reviewed through')
    }
    const boxes = await cards.evaluateAll((elements) =>
      elements.map((element) => {
        const { x, y } = element.getBoundingClientRect()
        return { x, y }
      }),
    )
    if (width < 768) expect(boxes[1].y).toBeGreaterThan(boxes[0].y)
    else {
      expect(boxes[1].y).toBe(boxes[0].y)
      expect(boxes[1].x).toBeGreaterThan(boxes[0].x)
    }
    const guide = ballot.getByRole('link', {
      name: 'Read the ballot guide',
      exact: true,
    })
    await expect(guide.locator('svg')).toBeVisible()
    expect(
      await guide.evaluate((element) => getComputedStyle(element).color),
    ).toBe(
      await page
        .locator('.pp-story-read')
        .first()
        .evaluate((element) => getComputedStyle(element).color),
    )
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true)
    await ballot.evaluate((element) =>
      window.scrollTo({
        top: element.getBoundingClientRect().top + window.scrollY - 90,
      }),
    )
    await page.screenshot({
      path: testInfo.outputPath(`ballot-home-${width}.png`),
    })
    await cards
      .last()
      .getByRole('link', { name: 'Read Amendment 10', exact: true })
      .click()
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      'Amendment 10',
    )
    await page.goto('/?area=louisiana')
    await guide.click()
    await expect(page).toHaveURL(/\/ballot$/)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'The November 3 election',
    )
  })
}

for (const width of [320, 768, 1025, 1280]) {
  test(`Elections navigation opens the hub and returns from a measure at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/?area=east-baton-rouge-parish')
    await expect(page.locator('.pp-ballot[data-compact] .pp-ballot-grid li')).toHaveCount(2)
    await page.locator('.pp-ballot').evaluate(element => window.scrollTo({top: element.getBoundingClientRect().top + scrollY - 70}))
    await page.screenshot({path: testInfo.outputPath(`parish-ballot-${width}.png`)})
    const navigateToElections = async () => {
      if (width <= 1024) await page.getByRole('button', {name: 'Open menu', exact: true}).click()
      await page.getByRole('link', {name: 'Elections', exact: true}).filter({visible: true}).click()
      await expect(page).toHaveURL(/\/ballot$/)
      await expect(page.getByRole('heading', {level: 1})).toHaveText('The November 3 election')
    }
    await navigateToElections()
    await expect(page.locator('.pp-ballot-grid li')).toHaveCount(10)
    await expect(page.locator('time[datetime="2026-11-03"]')).toHaveText('November 3, 2026')
    await expect(page.getByRole('link', {name: 'Election dates and deadlines', exact: true})).toHaveAttribute('href', 'https://www.sos.la.gov/elections-voting/election-dates')
    await expect(page.getByRole('link', {name: 'How to register or update your registration', exact: true})).toHaveAttribute('href', 'https://www.sos.la.gov/elections-voting/voter-registration-faqs')
    for (const link of await page.locator('.pp-election-header a').all()) {
      await expect(link.locator('svg')).toBeVisible()
      await expect(link).toHaveAttribute('target', '_blank')
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await page.screenshot({path: testInfo.outputPath(`elections-${width}.png`)})
    await page.getByRole('link', {name: 'Read Amendment 1', exact: true}).click()
    await expect(page.getByRole('heading', {level: 1})).toContainText('Amendment 1')
    if (width <= 1024) await page.getByRole('button', {name: 'Open menu', exact: true}).click()
    const active = page.getByRole('link', {name: 'Elections', exact: true}).filter({visible: true})
    await expect(active).toHaveAttribute('aria-current', 'page')
    await active.click()
    await expect(page).toHaveURL(/\/ballot$/)
    await expect(page.getByRole('heading', {level: 1})).toHaveText('The November 3 election')
    await page.goto('/?area=louisiana')
    await expect(page.locator('.pp-ballot-grid li')).toHaveCount(10)
    await expect(page.locator('.pp-ballot[data-compact]')).toHaveCount(0)
  })
}
