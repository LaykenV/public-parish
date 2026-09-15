import { expect, test } from '@playwright/test'

test.use({ video: 'on' })

test('Explore keeps controls anchored while filter results load', async ({
  page,
}, info) => {
  let hold = true
  const queued: Array<() => void> = []
  await page.routeWebSocket(/convex\.cloud/, (socket) => {
    const server = socket.connectToServer()
    server.onMessage((message) => {
      if (hold) queued.push(() => socket.send(message))
      else socket.send(message)
    })
  })
  const release = () => {
    hold = false
    queued.splice(0).forEach((send) => send())
  }
  await page.goto('/explore')
  const results = page.locator('.pp-explore-results')
  await expect(results.getByRole('status')).toContainText(
    'Loading published records',
  )
  await expect(
    page.getByRole('heading', { name: 'Explore', exact: true }),
  ).toBeVisible()
  await expect(page.locator('.route-loading-region')).toHaveAttribute(
    'aria-busy',
    'false',
  )
  release()
  await expect(results).toHaveAttribute('aria-busy', 'false')
  await expect(results.locator('.pp-result-sequence > *').first()).toBeVisible()

  hold = true
  const place = page.getByRole('button', { name: 'Place', exact: true })
  await place.click()
  const position = await place.boundingBox()
  const scroll = await page.evaluate(() => scrollY)
  await page
    .getByRole('menuitemcheckbox', { name: 'Rapides Parish', exact: true })
    .click()
  const selected = page
    .locator('.pp-pill-row')
    .getByRole('button', { name: 'Rapides Parish' })
  await expect(results).toHaveAttribute('aria-busy', 'true')
  await expect(results.getByRole('status')).toContainText(
    'Loading Rapides Parish records',
  )
  await expect(page.locator('.route-loading-region')).toHaveAttribute(
    'aria-busy',
    'false',
  )
  expect((await selected.boundingBox())!.y).toBe(position!.y)
  expect(await page.evaluate(() => scrollY)).toBe(scroll)
  const menu = page.getByRole('menu')
  await expect(menu).toBeVisible()
  await expect(
    menu.getByRole('menuitemcheckbox', { name: 'Rapides Parish', exact: true }),
  ).toBeChecked()
  expect((await menu.boundingBox())!.y).toBeGreaterThan(position!.y)
  await page.screenshot({
    path: info.outputPath('anchored-filter-loading.png'),
  })
  await page.keyboard.press('Escape')
  await expect(selected).toBeFocused()
  release()
  await expect(results).toHaveAttribute('aria-busy', 'false')

  await selected.click()
  await menu
    .getByRole('menuitemcheckbox', { name: 'Rapides Parish', exact: true })
    .click()
  await expect(place).toBeVisible()
  await expect(page).not.toHaveURL(/place=/)
  await expect(
    menu.getByRole('menuitemcheckbox', { name: 'Rapides Parish', exact: true }),
  ).not.toBeChecked()
  await expect(results).toHaveAttribute('aria-busy', 'false')

  // Selecting another value still replaces the previous selection.
  await menu.getByRole('menuitemcheckbox', { name: 'Lafayette Parish', exact: true }).click()
  await menu.getByRole('menuitemcheckbox', { name: 'Rapides Parish', exact: true }).click()
  await expect(menu.getByRole('menuitemcheckbox', { name: 'Lafayette Parish', exact: true })).not.toBeChecked()
  await expect(menu.getByRole('menuitemcheckbox', { name: 'Rapides Parish', exact: true })).toBeChecked()
  await page.keyboard.press('Escape')
  await expect(results).toHaveAttribute('aria-busy', 'false')

  const more = page.getByRole('button', { name: /More filters/ })
  await more.click()
  const dialog = page.getByRole('dialog', { name: 'More filters', exact: true })
  await expect(dialog).toBeVisible()
  const modalBox = (await dialog.boundingBox())!
  const clearBox = (await dialog
    .getByRole('button', { name: 'Clear', exact: true })
    .boundingBox())!
  expect(clearBox.x).toBeGreaterThanOrEqual(modalBox.x)
  hold = true
  await dialog
    .getByRole('combobox', { name: 'Government body' })
    .selectOption('Pineville City Council')
  await expect(results).toHaveAttribute('aria-busy', 'true')
  await expect(dialog).toBeVisible()
  await page.screenshot({ path: info.outputPath('more-filters-modal.png') })
  await dialog.getByRole('button', { name: 'Show results' }).click()
  await expect(dialog).toBeHidden()
  await expect(more).toBeFocused()
  release()
  await expect(results).toHaveAttribute('aria-busy', 'false')
})

test('Explore cards use two desktop columns and one mobile column', async ({
  page,
}, info) => {
  await page.goto('/explore')
  const cards = page.locator('.pp-result-sequence > *')
  await expect(cards.nth(1)).toBeVisible()
  const first = (await cards.nth(0).boundingBox())!
  const second = (await cards.nth(1).boundingBox())!
  if ((page.viewportSize()?.width ?? 1280) > 1024) {
    expect(second.y).toBe(first.y)
    expect(second.x).toBeGreaterThan(first.x)
    expect(second.width).toBeCloseTo(first.width, 0)
  } else {
    expect(second.y).toBeGreaterThanOrEqual(first.y + first.height)
  }
  await page.screenshot({
    path: info.outputPath('explore-grid.png'),
    fullPage: true,
  })
})

test('search focus belongs to the whole field, including the icon', async ({
  page,
}, info) => {
  await page.goto('/explore')
  const search = page.getByRole('searchbox', {
    name: 'Search stories, issues and records',
  })
  await search.focus()
  await expect(search).toHaveCSS('outline-style', 'none')
  const field = page.locator('.pp-search-field')
  const primary = await field.evaluate((node) => {
    const probe = document.createElement('span')
    probe.style.color = 'var(--primary)'
    node.append(probe)
    const color = getComputedStyle(probe).color
    probe.remove()
    return color
  })
  await expect(field).toHaveCSS('border-top-color', primary)
  await page.screenshot({ path: info.outputPath('explore-focus.png') })
  if ((page.viewportSize()?.width ?? 1280) <= 768) {
    await page.getByRole('button', { name: 'Open menu', exact: true }).click()
    await page.getByRole('button', { name: 'Change area', exact: true }).click()
  } else {
    await page.locator('.resident-context-control').click()
  }
  const areas = page.getByRole('dialog', { name: 'Choose your area' })
  await expect(
    areas.getByRole('button', { name: 'Close', exact: true }),
  ).toBeFocused()
  const areaSearch = areas.getByRole('searchbox')
  await areaSearch.fill('Lafayette')
  await expect(areaSearch).toHaveCSS('outline-style', 'none')
  await expect(areas.locator('.pp-area-search')).toHaveCSS(
    'border-top-color',
    primary,
  )
  await page.screenshot({ path: info.outputPath('area-search-focus.png') })
})

test('coverage request keeps the form centered with assurance below it', async ({
  page,
}, info) => {
  await page.goto('/coverage/request')
  const form = page.locator('.coverage-request-form')
  await expect(form).toBeVisible()
  const box = (await form.boundingBox())!
  const width = page.viewportSize()!.width
  expect(Math.abs(box.x + box.width / 2 - width / 2)).toBeLessThan(2)
  const assurance = (await page
    .locator('.coverage-request-assurance')
    .boundingBox())!
  expect(assurance.y).toBeGreaterThanOrEqual(box.y + box.height)
  await page.screenshot({
    path: info.outputPath('coverage-request.png'),
    fullPage: true,
  })
})

test('Explore leads with explanations and renders the details for each record type', async ({
  page,
}, info) => {
  await page.goto('/explore')
  const cards = page.locator('.pp-explore-card')
  await expect(cards.first()).toHaveAttribute('data-kind', 'Story')
  await expect(page.locator('.pp-result-count')).toContainText(
    'Stories and consequential issues first',
  )
  await expect(cards.first().locator('img')).toBeVisible()
  await expect(
    cards.first().locator('.pp-explore-card-summary'),
  ).not.toBeEmpty()
  const hrefs = await cards.evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute('href')),
  )
  expect(new Set(hrefs).size).toBe(hrefs.length)
  const kinds = await cards.evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute('data-kind')),
  )
  expect(kinds.indexOf('Issue')).toBeGreaterThan(0)
  expect(kinds.indexOf('Issue')).toBeLessThan(kinds.indexOf('Decision record'))
  await page.screenshot({
    path: info.outputPath('recommended-explore.png'),
    fullPage: true,
  })
  for (const [type, label] of [
    ['story', 'Story'],
    ['issue', 'Issue'],
    ['decision', 'Decision record'],
    ['meeting', 'Meeting'],
    ['body', 'Government body'],
  ]) {
    await page.goto(`/explore?type=${type}`)
    await expect(page.locator('.pp-explore-results')).toHaveAttribute(
      'aria-busy',
      'false',
    )
    await expect(cards.first()).toHaveAttribute('data-kind', label)
    if (type === 'meeting' || type === 'body') {
      await expect(cards.first().locator('.pp-explore-card-state')).toHaveCount(
        0,
      )
      await expect(cards.first()).not.toContainText('Evidence available')
    }
    await page.screenshot({ path: info.outputPath(`explore-${type}.png`) })
    if (type === 'body') {
      await cards.first().click()
      await expect(page).toHaveURL(/body=/)
    }
  }
  await page.goto('/explore?sort=newest')
  await expect(page.locator('.pp-result-count')).not.toContainText(
    'Stories and consequential issues first',
  )
})


test('Explore clears selected topic and date filters with the keyboard', async ({ page }) => {
  await page.goto('/explore')
  const menu = page.getByRole('menu')
  for (const [label, option, key] of [
    ['Topic', 'Public money', 'topic'],
    ['Date', 'Past year', 'date'],
  ]) {
    const trigger = page.getByRole('button', { name: label, exact: true })
    await trigger.click()
    const item = menu.getByRole('menuitemcheckbox', { name: option, exact: true })
    await item.click()
    await expect(item).toBeChecked()
    await expect(page).toHaveURL(new RegExp(`${key}=`))
    await item.focus()
    await page.keyboard.press('Space')
    await expect(item).not.toBeChecked()
    await expect(page).not.toHaveURL(new RegExp(`${key}=`))
    await page.keyboard.press('Escape')
    await expect(trigger).toBeFocused()
  }
  await page.getByRole('button', { name: 'Sort', exact: true }).click()
  const oldest = menu.getByRole('menuitemcheckbox', { name: 'Oldest first', exact: true })
  await oldest.click()
  await expect(oldest).toBeChecked()
  await oldest.click()
  await expect(oldest).not.toBeChecked()
  await expect(menu.getByRole('menuitemcheckbox', { name: 'Newest first', exact: true })).toBeChecked()
  await expect(page).toHaveURL(/sort=newest/)
})
