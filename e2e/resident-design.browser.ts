import { expect, test } from '@playwright/test'

for (const slug of ['meta-richland', 'spacex-pecan-island', 'applied-digital-boyce']) {
  test(`${slug} keeps story navigation, citations and Ask reachable`, async ({ page }, testInfo) => {
    await page.goto(`/stories/${slug}`)
    const article = page.locator('.pp-story-detail')
    await expect(article.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(article.getByRole('img')).toBeVisible()
    const navigation = page.getByRole('navigation', { name: 'In this story' })
    await navigation.getByRole('link', { name: 'What remains unknown' }).click()
    await expect(page).toHaveURL(/#story-unknowns$/)
    await expect(article.locator('#story-unknowns')).toBeInViewport()

    const citation = article.locator('.pp-story-citation').first()
    await citation.scrollIntoViewIfNeeded()
    const scrollBefore = await page.evaluate(() => window.scrollY)
    await citation.click()
    const source = page.getByRole('dialog', { name: 'Official source', exact: true })
    await expect(source).toBeVisible()
    await expect(source.locator('blockquote')).toBeVisible()
    await expect(source.getByRole('button', { name: 'Close', exact: true })).toBeInViewport()
    const sourceBounds = await source.boundingBox()
    expect(sourceBounds!.x + sourceBounds!.width).toBeLessThanOrEqual(page.viewportSize()!.width + 1)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await page.screenshot({ path: testInfo.outputPath(`${slug}-source.png`) })
    await source.getByRole('button', { name: 'Close', exact: true }).click()
    await expect(source).not.toBeVisible()
    await expect(citation).toBeFocused()
    expect(Math.abs(await page.evaluate(() => window.scrollY) - scrollBefore)).toBeLessThanOrEqual(1)

    if ((page.viewportSize()?.width ?? 1280) <= 768) {
      await article.getByRole('button', { name: 'Ask Public Parish', exact: true }).click()
      const drawer = page.getByRole('dialog', { name: 'Ask Public Parish', exact: true })
      await expect(drawer).toBeVisible()
      await expect(page).toHaveURL(new RegExp(`/stories/${slug}`))
      await expect(drawer.locator('.ask-scope-label')).toHaveText('Answering from this story')
      const question = drawer.getByRole('textbox')
      await question.fill('What does this mean for residents?')
      await drawer.getByRole('button', { name: 'Back to reading', exact: true }).click()
      await expect(article.getByRole('button', { name: 'Ask Public Parish', exact: true })).toBeFocused()
      await article.getByRole('button', { name: 'Ask Public Parish', exact: true }).click()
      await expect(drawer.getByRole('textbox')).toHaveValue('What does this mean for residents?')
    } else {
      await article.getByRole('link', { name: 'Ask about this story', exact: true }).click()
      await expect(page).toHaveURL(new RegExp(`scope=story&story=${slug}`))
      await expect(page.getByRole('heading', { level: 1 })).toHaveText('Ask Public Parish')
    }
  })
}

for (const width of [320, 768, 1280]) {
  test(`supporting pages keep their main controls usable at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 })
    for (const path of ['/explore', '/following', '/coverage/request', '/how-it-works', '/privacy']) {
      await page.goto(path)
      await expect(page.locator('#resident-main').getByRole('heading', { level: 1 })).toBeVisible()
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
      await page.screenshot({ path: testInfo.outputPath(`${path.replaceAll('/', '-')}-${width}.png`), fullPage: true })
    }
  })
}

test('coverage request starts with the form and keeps invalid input local', async ({ page }) => {
  await page.goto('/coverage/request')
  const place = page.getByRole('textbox', { name: 'Parish or municipality', exact: true })
  await page.getByRole('button', { name: 'Request coverage', exact: true }).click()
  await expect(place).toBeFocused()
  await expect(place).toHaveAttribute('aria-invalid', 'true')
  await expect(page.getByText('Name a parish or municipality so Public Parish can record the request.')).toBeVisible()
  if ((page.viewportSize()?.width ?? 1280) < 768) {
    const form = await page.locator('.coverage-request-form').boundingBox()
    const explanation = await page.locator('.coverage-request-assurance').boundingBox()
    expect(form).not.toBeNull()
    expect(explanation).not.toBeNull()
    expect(form!.y).toBeLessThan(explanation!.y)
  }
})

test('coverage definitions are available without displacing the body directory', async ({ page }) => {
  await page.goto('/coverage')
  const key = page.locator('.coverage-key')
  await expect(key).not.toHaveAttribute('open', '')
  await key.locator('summary').press('Enter')
  await expect(key).toHaveAttribute('open', '')
  await expect(key.getByText('The body passed the common source and evidence checks.')).toBeVisible()
  await key.locator('summary').press('Enter')
  await expect(key).not.toHaveAttribute('open', '')
  await expect(page.getByRole('heading', { name: 'Lafayette Parish', exact: true })).toBeVisible()
})

test('Explore retains published-body links and exposes the selected filter', async ({ page }) => {
  const hiddenFocusWarnings: string[] = []
  page.on('console', (message) => {
    if (message.text().includes('Blocked aria-hidden')) hiddenFocusWarnings.push(message.text())
  })
  await page.goto('/explore?body=Pineville%20City%20Council')
  await expect(page).toHaveURL(/body=Pineville(?:%20|\+)City(?:%20|\+)Council/)
  await page.getByRole('button', { name: /More filters/ }).click()
  const body = page.getByRole('combobox', { name: 'Government body' })
  await expect(body).toHaveValue('Pineville City Council')
  await body.selectOption('Youngsville City Council')
  await expect(page).toHaveURL(/body=Youngsville(?:%20|\+)City(?:%20|\+)Council/)
  if ((page.viewportSize()?.width ?? 1280) <= 1024) {
    await page.getByRole('dialog').getByRole('button', { name: 'Close', exact: true }).click()
    await expect(page.getByRole('button', { name: /More filters/ })).toBeFocused()
    expect(hiddenFocusWarnings).toEqual([])
  }
})
