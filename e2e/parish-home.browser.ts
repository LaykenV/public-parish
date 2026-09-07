import { expect, test } from '@playwright/test'

for (const [slug, name] of [['lafayette-parish', 'Lafayette Parish'], ['rapides-parish', 'Rapides Parish']] as const) {
  test(`home loads existing evidence for ${name}`, async ({ page }, testInfo) => {
    await page.addInitScript(area => localStorage.setItem('public-parish.area.v1', area), slug)
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toContainText(`Watching ${name}`)
    const issues = page.locator('#current-issues')
    await expect(issues.locator('a[href^="/issues/"]').first()).toBeVisible()
    await expect(page.getByText('No published decision records are available for this area.')).not.toBeVisible()
    await expect(page.locator('a[href^="/decisions/"]').first()).toBeVisible()
    await page.screenshot({ path: testInfo.outputPath(`${slug}.png`), fullPage: true })
  })
}
