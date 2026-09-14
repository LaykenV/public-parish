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
