import { expect, test } from '@playwright/test'

test('desktop composer starts centered and docks after the first question', async ({
  page,
}, info) => {
  test.skip(
    (page.viewportSize()?.width ?? 1280) <= 768,
    'Desktop layout change',
  )
  await page.goto('/ask?fixture=empty-corpus')
  const composer = page.locator('.ask-composer')
  await expect(composer).toBeVisible()
  const reading = (await page.locator('.ask-reading').boundingBox())!
  await expect(page.locator('.ask-head')).toHaveCount(0)
  await expect(page.locator('.ask-lede')).toHaveCount(0)
  const viewport = page.viewportSize()!
  expect(reading.x).toBeLessThanOrEqual(24)
  expect(reading.width).toBeGreaterThanOrEqual(viewport.width - 48)
  expect(reading.y).toBeLessThanOrEqual(60)
  expect(reading.height).toBeGreaterThanOrEqual(viewport.height - 72)
  const before = (await composer.boundingBox())!
  expect(before.y).toBeGreaterThan(reading.y + reading.height * 0.3)
  expect(before.y + before.height).toBeLessThan(
    reading.y + reading.height * 0.75,
  )
  await page.screenshot({ path: info.outputPath('desktop-ask-empty.png') })
  await page.getByRole('textbox').fill('Who received the truck?')
  await page.getByRole('button', { name: 'Send question', exact: true }).click()
  await expect(page.locator('.ask-page')).not.toHaveAttribute('data-empty')
  await expect(page.locator('.ask-answer')).toBeVisible()
  const after = (await composer.boundingBox())!
  expect(after.y).toBeGreaterThan(before.y)
  expect(reading.y + reading.height - after.y - after.height).toBeLessThan(5)
  await page.screenshot({
    path: info.outputPath('desktop-ask-conversation.png'),
  })
})

for (const outcome of ['loaded', 'expired', 'failed'] as const) {
  test(`Account conversation shows a spinner until ${outcome}`, async ({ page }) => {
    await page.goto('/following?fixture=signed-out')
    const history = page.getByRole('region', { name: 'Conversations on this device', exact: true })
    await expect(history.getByRole('button', { name: /Surplus pickup donations/ })).toBeVisible()
    await page.evaluate(async (result) => {
      const path = '/src/features/ask/fixtures.ts'
      const { getAskFixtureAdapter } = await import(/* @vite-ignore */ path)
      const adapter = getAskFixtureAdapter('empty-corpus')
      const open = adapter.open.bind(adapter)
      adapter.open = async (handle: string) => {
        await new Promise<void>((resolve) => {
          Object.assign(window, { finishAskRestore: resolve })
        })
        if (result === 'failed') throw new Error('Test connection failure')
        if (result === 'expired') return null
        return open(handle)
      }
    }, outcome)
    await history.getByRole('button', { name: /Surplus pickup donations/ }).click()
    const loading = page.getByRole('status').filter({ hasText: 'Loading conversation' })
    await expect(loading).toBeVisible()
    await expect(page.getByRole('textbox')).toHaveCount(0)
    await expect(page.getByText('Try asking', { exact: true })).toHaveCount(0)
    await page.evaluate(() => {
      const target = window as typeof window & { finishAskRestore: () => void }
      target.finishAskRestore()
    })
    await expect(loading).toHaveCount(0)
    if (outcome === 'loaded') {
      await expect(page.locator('.ask-thread')).toContainText('Who received the truck?')
      await expect(page.getByRole('textbox')).toBeVisible()
    } else if (outcome === 'failed') {
      await expect(page.getByRole('alert')).toContainText('This conversation could not open')
      await page.getByRole('textbox').fill('Who received the truck?')
      await page.getByRole('button', { name: 'Send question', exact: true }).click()
      await expect(page.locator('.ask-answer')).toBeVisible()
      await expect(page.getByRole('alert')).toHaveCount(0)
    } else {
      await expect(page.locator('.ask-notice')).toContainText('expired')
    }
  })
}

test('answer wait has one shimmering status above three bouncing dots', async ({ page }, info) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/ask?fixture=checking')
  const progress = page.getByRole('region', { name: 'Answer progress' })
  await expect(progress).toBeVisible()
  await expect(progress.locator('.ask-progress-status svg')).toHaveCount(1)
  await expect(progress.locator('.ask-progress-dots span')).toHaveCount(3)
  await expect(progress.locator('.ask-progress-label')).toHaveCSS('animation-name', 'ask-progress-shimmer')
  await expect(progress.locator('.ask-progress-label')).toHaveCSS('animation-duration', '4s')
  await expect(progress.locator('.ask-progress-dots span').first()).toHaveCSS('animation-name', 'ask-dot-bounce')
  const status = (await progress.locator('.ask-progress-status').boundingBox())!
  const dots = (await progress.locator('.ask-progress-dots').boundingBox())!
  expect(dots.y).toBeGreaterThanOrEqual(status.y + status.height)
  await page.screenshot({ path: info.outputPath('ask-status.png') })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(progress.locator('.ask-progress-label')).toHaveCSS('animation-name', 'none')
  await expect(progress.locator('.ask-progress-dots span').first()).toHaveCSS('animation-name', 'none')
})
