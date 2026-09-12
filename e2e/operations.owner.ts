import { expect, test } from '@playwright/test'

for (const width of [320, 375, 768, 1280]) {
  test(`owner screens fit at ${width}px and preserve review controls`, async ({
    page,
  }, info) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/operations/coverage')
    await expect(
      page.getByRole('heading', { name: 'Coverage operations', exact: true }),
    ).toBeVisible()
    await expect(
      page.getByRole('link', { name: 'Coverage', exact: true }),
    ).toHaveAttribute('aria-current', 'page')
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true)
    await expect(
      page.getByText('Synthetic source could not be checked.'),
    ).toBeVisible()
    await page.screenshot({
      path: info.outputPath(`coverage-${width}.png`),
      fullPage: true,
    })
    const usage = page.getByRole('region', { name: 'Provider usage details' })
    await usage.focus()
    await expect(usage).toBeFocused()
    await page.getByRole('link', { name: 'Stories', exact: true }).click()
    await expect(
      page.getByRole('link', { name: 'Stories', exact: true }),
    ).toHaveAttribute('aria-current', 'page')
    const bundle = page.getByRole('button', { name: /applied digital boyce/ })
    await bundle.click()
    await expect(bundle).toHaveAttribute('aria-pressed', 'true')
    await page.getByRole('button', { name: /reviewed/ }).click()
    const publish = page.getByRole('button', {
      name: 'Approve and publish exact version',
    })
    await expect(publish).toBeDisabled()
    await page.getByRole('checkbox').check()
    await expect(publish).toBeEnabled()
    const withdraw = page.getByRole('button', {
      name: 'Withdraw current story',
    })
    await expect(withdraw).toBeDisabled()
    await page
      .getByRole('textbox', { name: 'Public withdrawal reason' })
      .fill('Synthetic reason')
    await expect(withdraw).toBeEnabled()
    expect(
      await withdraw.evaluate((el) => getComputedStyle(el).color),
    ).not.toEqual(await publish.evaluate((el) => getComputedStyle(el).color))
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true)
    await page.screenshot({
      path: info.outputPath(`stories-${width}.png`),
      fullPage: true,
    })
  })
}

test('owner gates and empty states remain explicit', async ({ page }) => {
  for (const route of ['coverage', 'stories']) {
    await page.goto(`/operations/${route}?auth=signed-out`)
    await expect(
      page.getByRole('heading', { name: 'Owner sign-in required' }),
    ).toBeVisible()
    await expect(
      page.getByRole('navigation', { name: 'Owner operations' }),
    ).toHaveCount(0)
    await page.goto(`/operations/${route}?auth=non-owner`)
    await expect(
      page.getByRole('heading', { name: 'This account is not the owner' }),
    ).toBeVisible()
    await expect(
      page.getByRole('navigation', { name: 'Owner operations' }),
    ).toHaveCount(0)
  }
  await page.goto('/operations/stories?empty')
  await expect(
    page.getByText('No imports yet. Stage a source manifest to begin.'),
  ).toBeVisible()
  await page.goto('/operations/coverage?empty')
  await expect(
    page.getByText('No approved sources are available for monitoring.'),
  ).toBeVisible()
})

test('source operations disable during submission and show failures', async ({
  page,
}) => {
  await page.goto('/operations/coverage')
  const pause = page.getByRole('button', { name: 'Pause checks' })
  await pause.click()
  await expect(pause).toBeDisabled()
  await expect(page.locator('.operations-notice')).toContainText(
    'Synthetic operation refused.',
  )
  await expect(pause).toBeEnabled()
})
