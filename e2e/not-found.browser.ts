import { expect, test } from '@playwright/test'

test('unknown URLs hydrate the not-found page and allow navigation home', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))

  for (const path of ['/missing-audit-route', '/missing-audit-route/nested']) {
    await page.goto(path)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('This page does not exist.')
    await page.getByRole('link', { name: 'Return home', exact: true }).click()
    await expect(page).toHaveURL('/')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  }

  expect(errors).toEqual([])
})
