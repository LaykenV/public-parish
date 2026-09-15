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
  expect(reading.width).toBe(768)
  expect(reading.x).toBe((viewport.width - reading.width) / 2)
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

test('answer wait places one shimmering status below the question near the composer', async ({ page }, info) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/ask?fixture=checking')
  const progress = page.getByRole('region', { name: 'Answer progress' })
  await expect(progress).toBeVisible()
  await expect(progress.locator('.ask-progress-status svg')).toHaveCount(1)
  await expect(progress.locator('.ask-progress-dots')).toHaveCount(0)
  await expect(progress.locator('.ask-progress-label')).toHaveCSS('animation-name', 'ask-progress-shimmer')
  await expect(progress.locator('.ask-progress-label')).toHaveCSS('animation-duration', '4s')
  const status = (await progress.locator('.ask-progress-status').boundingBox())!
  const question = (await page.locator('.ask-turn-question').last().boundingBox())!
  const composer = (await page.locator('.ask-composer').boundingBox())!
  const reading = (await page.locator('.ask-reading').boundingBox())!
  expect(status.x).toBe(reading.x)
  expect(status.y - question.y - question.height).toBeGreaterThanOrEqual(12)
  expect(status.y - question.y - question.height).toBeLessThanOrEqual(24)
  expect(composer.y - status.y - status.height).toBeGreaterThan(0)
  expect(composer.y - status.y - status.height).toBeLessThanOrEqual(40)
  await page.screenshot({ path: info.outputPath('ask-status.png') })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(progress.locator('.ask-progress-label')).toHaveCSS('animation-name', 'none')
})


test('short conversations sit above the composer and longer history stays scrollable', async ({ page }, info) => {
  await page.goto('/ask?fixture=not-found')
  const region = page.locator('.ask-thread-region')
  const thread = page.locator('.ask-thread')
  const composer = page.locator('.ask-composer')
  await expect(thread).toBeVisible()
  const shortThread = (await thread.boundingBox())!
  const area = (await region.boundingBox())!
  const input = (await composer.boundingBox())!
  expect(shortThread.y).toBeGreaterThan(area.y + 40)
  expect(input.y - shortThread.y - shortThread.height).toBeGreaterThanOrEqual(0)
  expect(input.y - shortThread.y - shortThread.height).toBeLessThanOrEqual(32)
  await page.screenshot({ path: info.outputPath('ask-bottom-aligned.png') })

  await page.goto('/ask?fixture=thread')
  await expect(page.locator('.ask-turn')).toHaveCount(2)
  // A short viewport forces overflow on desktop as well as phones.
  await page.setViewportSize({ width: page.viewportSize()!.width, height: 500 })
  await expect.poll(() => region.evaluate(el => el.scrollHeight > el.clientHeight)).toBe(true)
  await region.evaluate(el => { el.scrollTop = 0 })
  await expect.poll(async () => {
    const top = (await region.boundingBox())!.y
    return (await page.locator('.ask-turn-question').first().boundingBox())!.y - top
  }).toBeGreaterThanOrEqual(0)
  await region.evaluate(el => { el.scrollTop = el.scrollHeight })
  const lastTurn = (await page.locator('.ask-turn').last().boundingBox())!
  const dock = (await composer.boundingBox())!
  expect(lastTurn.y + lastTurn.height).toBeLessThanOrEqual(dock.y)
})
