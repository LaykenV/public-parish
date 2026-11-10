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
    await expect(page.getByRole('link', { name: 'See results at the Secretary of State', exact: true })).toHaveAttribute('href', 'https://voterportal.sos.la.gov/graphical')
    await expect(page.getByText('Public Parish has not published the results of this election.')).toBeVisible()
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

test('Home no longer promotes the past election', async ({ page }) => {
  await page.goto('/?area=louisiana')
  await expect(page.locator('.pp-story-grid .pp-story-card')).toHaveCount(3)
  await expect(page.getByRole('heading', { name: 'Utility rates and service', exact: true })).toBeVisible()
  await expect(page.locator('.pp-ballot')).toHaveCount(0)
  await expect(page.locator('.resident-footer')).not.toContainText('Next statewide election')
  for (const parish of ['rapides-parish', 'lafayette-parish']) {
    await page.goto(`/?area=${parish}`)
    await expect(page.locator('.pp-story-grid .pp-story-card')).toHaveCount(0)
    await expect(page.locator('.pp-ballot')).toHaveCount(0)
  }
})


test('commission records link preserves the statewide body filter', async ({ page }) => {
  await page.goto('/?area=louisiana')
  await page.locator('.pp-utility-details summary').click()
  await page.getByRole('link', { name: 'View commission records', exact: true }).click()
  await expect(page).toHaveURL(/body=Louisiana/)
  const cards = page.locator('.pp-explore-card')
  await expect(cards.first()).toBeVisible()
  for (const card of await cards.all()) await expect(card).toContainText('Louisiana Public Service Commission')
})


for (const width of [320, 768, 1025, 1280]) {
  test(`the ballot guide stays reachable by link without a navigation item at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/ballot')
    await expect(page.getByRole('heading', {level: 1})).toHaveText('The November 3 election')
    await expect(page.locator('.pp-ballot-grid li')).toHaveCount(10)
    await expect(page.locator('time[datetime="2026-11-03"]')).toHaveText('November 3, 2026')
    await expect(page.locator('.pp-election-header')).not.toContainText('before you vote')
    for (const link of await page.locator('.pp-election-header a').all()) {
      await expect(link.locator('svg')).toBeVisible()
      await expect(link).toHaveAttribute('target', '_blank')
    }
    if (width <= 1024) await page.getByRole('button', {name: 'Open menu', exact: true}).click()
    await expect(page.getByRole('link', {name: 'Elections', exact: true})).toHaveCount(0)
    if (width <= 1024) await page.keyboard.press('Escape')
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await page.screenshot({path: testInfo.outputPath(`elections-${width}.png`)})
    await page.getByRole('link', {name: 'Read Amendment 1', exact: true}).click()
    await expect(page.getByRole('heading', {level: 1})).toContainText('Amendment 1')
    await expect(page.locator('.pp-ballot-notice')).toContainText('This election was held on November 3, 2026.')
  })
}
