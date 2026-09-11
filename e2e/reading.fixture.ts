import { expect, test } from '@playwright/test'

const records = [
  ['issue', '/issues/drainage-fee-credit-cap?fixture=preview'],
  ['decision', '/decisions/CO-022-2026?fixture=preview'],
  ['meeting', '/meetings/lafayette-city-council-2026-09-08?fixture=preview'],
] as const

for (const [kind, path] of records) {
  test(`${kind} source preserves reading position with regular motion`, async ({
    page,
  }, info) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await page.goto(path)
    await expect(page.locator('.ev-title')).toBeVisible()
    await page.evaluate(() => document.fonts.ready)
    const control = page.locator('.ev-source').last()
    await control.scrollIntoViewIfNeeded()
    const before = await page.evaluate(() => scrollY)
    expect(before).toBeGreaterThan(200)
    await control.click()
    const drawer = page.getByRole('dialog', {
      name: 'Official source',
      exact: true,
    })
    await expect(drawer).toBeVisible()
    await expect(drawer.locator('blockquote')).toBeVisible()
    await page.waitForTimeout(450)
    await page.screenshot({ path: info.outputPath(`${kind}-source.png`) })
    await drawer.getByRole('button', { name: 'Close', exact: true }).click()
    await expect(drawer).not.toBeVisible()
    await expect(control).toBeFocused()
    expect(
      Math.abs((await page.evaluate(() => scrollY)) - before),
    ).toBeLessThanOrEqual(1)
  })

  test(`${kind} mobile conversation keeps composer and nested sources usable`, async ({
    page,
  }, info) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto(path)
    const trigger = page.getByRole('button', {
      name: 'Ask Public Parish',
      exact: true,
    })
    await trigger.click()
    const chat = page.getByRole('dialog', {
      name: 'Ask Public Parish',
      exact: true,
    })
    const input = chat.getByRole('textbox')
    await input.fill('Who received the truck?')
    await chat.getByRole('button', { name: 'Close', exact: true }).click()
    await expect(trigger).toBeFocused()
    await trigger.click()
    await expect(input).toHaveValue('Who received the truck?')
    await chat
      .getByRole('button', { name: 'Send question', exact: true })
      .click()
    await expect(chat.locator('.ask-answer')).toBeVisible()
    await expect(input).toBeVisible()
    await expect(input).toHaveValue('')
    await expect(
      chat.getByRole('heading', { name: 'Try asking', exact: true }),
    ).toHaveCount(0)
    const composer = await chat.locator('.ask-composer').boundingBox()
    const dialog = await chat.boundingBox()
    expect(
      dialog!.y + dialog!.height - composer!.y - composer!.height,
    ).toBeLessThan(40)
    const source = chat.locator('.ev-source').first()
    await source.click()
    const evidence = page.getByRole('dialog', {
      name: 'Official source',
      exact: true,
    })
    await expect(evidence).toBeVisible()
    await evidence.getByRole('button', { name: 'Close', exact: true }).click()
    await expect(evidence).not.toBeVisible()
    await expect(source).toBeFocused()
    await input.fill('A follow-up draft')
    await page.setViewportSize({ width: 320, height: 500 })
    await expect(input).toBeInViewport()
    await expect(
      chat.getByRole('button', { name: 'Send', exact: true }),
    ).toBeInViewport()
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true)
    await page.screenshot({ path: info.outputPath(`${kind}-short-chat.png`) })
  })
}

test('narrow timelines keep every entry and action inside the reading column', async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 320, height: 812 })
  for (const [, path] of records.slice(0, 2)) {
    await page.goto(path)
    const timeline = page.locator(path.includes('issues') ? '.ev-timeline' : '.ev-changes')
    await expect(timeline).toBeVisible()
    for (const item of await timeline.locator('li').all()) {
      const box = await item.boundingBox()
      expect(box!.x).toBeGreaterThanOrEqual(0)
      expect(box!.x + box!.width).toBeLessThanOrEqual(320)
    }
    await timeline.scrollIntoViewIfNeeded()
    await page.screenshot({
      path: info.outputPath(
        `timeline-${path.includes('issues') ? 'issue' : 'decision'}.png`,
      ),
    })
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true)
  }
})

test('Ask keeps the composer below long answers and preserves its thread when inspecting sources', async ({
  page,
}, info) => {
  await page.goto('/ask?fixture=thread')
  await expect(page.locator('.ask-answer').first()).toBeVisible()
  await expect(page.getByRole('textbox')).toBeInViewport()
  await expect(
    page.getByRole('button', { name: 'Send', exact: true }),
  ).toBeInViewport()
  const region = page.locator('.ask-thread-region')
  const source = region.locator('.ev-source').last()
  await source.scrollIntoViewIfNeeded()
  const before = await region.evaluate((el) => el.scrollTop)
  await source.click()
  const drawer = page.getByRole('dialog', {
    name: 'Official source',
    exact: true,
  })
  await expect(drawer).toBeVisible()
  await drawer.getByRole('button', { name: 'Close', exact: true }).click()
  await expect(drawer).not.toBeVisible()
  await expect(source).toBeFocused()
  expect(
    Math.abs((await region.evaluate((el) => el.scrollTop)) - before),
  ).toBeLessThanOrEqual(1)
  await page.screenshot({ path: info.outputPath('ask-conversation.png') })
})

test('limited notices and status pills keep a plain border and no decorative dots', async ({ page }) => {
  await page.goto('/issues/downtown-late-night-permits?fixture=preview')
  const notice = page.locator('.pp-notice').first()
  await expect(notice).toContainText('Limited information')
  const borders = await notice.evaluate(el => {
    const css = getComputedStyle(el)
    return [css.borderLeftColor, css.borderRightColor, css.borderLeftWidth, css.borderRightWidth]
  })
  expect(borders[0]).toBe(borders[1])
  expect(borders[2]).toBe(borders[3])
  expect(await page.locator('.ev-kicker .ev-state').evaluate(el => getComputedStyle(el, '::before').content)).toBe('none')
})

test('Account tabs have one baseline across every view', async ({ page }, info) => {
  for (const path of ['/following', '/following/areas-and-topics', '/following/notifications']) {
    await page.goto(`${path}?fixture=active`)
    await expect(page.getByRole('navigation', { name: 'Following views' })).toBeVisible()
    const section = page.locator('.following-section').first()
    await expect(section).toBeVisible()
    expect(await section.evaluate(el => getComputedStyle(el).borderTopWidth)).toBe('0px')
    await page.screenshot({ path: info.outputPath(`${path.replaceAll('/', '-')}-tabs.png`) })
  }
})


for (const [kind, path] of [...records, ['story', '/stories/meta-richland'], ['ask', '/ask?fixture=empty']]) {
  test(`${kind} composer follows a keyboard that shrinks and pans only the visual viewport`, async ({ page }, info) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto(path)
    if (kind !== 'ask') await page.getByRole('button', { name: 'Ask Public Parish', exact: true }).click()
    // Simulate the home-indicator padding that desktop browsers do not expose.
    await page.addStyleTag({ content: '.pp-sheet { padding-bottom: 34px; }' })
    const container = kind === 'ask' ? page.locator('.ask-page') : page.getByRole('dialog', { name: 'Ask Public Parish', exact: true })
    const input = container.getByRole('textbox')
    await input.fill('Keep this keyboard draft')
    for (const bounds of [{ height: 360, top: 0 }, { height: 360, top: 120 }, { height: 290, top: 70 }]) {
      await page.evaluate(({ height, top }) => {
        Object.defineProperties(window.visualViewport, {
          height: { configurable: true, value: height },
          offsetTop: { configurable: true, value: top },
        })
        window.visualViewport!.dispatchEvent(new Event('resize'))
        window.visualViewport!.dispatchEvent(new Event('scroll'))
      }, bounds)
      await expect(container.locator('.ask-examples')).toBeHidden()
      await expect.poll(async () => {
        const box = await container.locator('.ask-composer').boundingBox()
        return box!.y >= bounds.top && box!.y + box!.height <= bounds.top + bounds.height
      }).toBe(true)
      await expect(input).toHaveValue('Keep this keyboard draft')
      await expect(input).toBeFocused()
      if (kind !== 'ask') {
        const close = await container.getByRole('button', { name: 'Close', exact: true }).boundingBox()
        expect(close!.y).toBeGreaterThanOrEqual(bounds.top)
      }
    }
    await input.fill('A long draft line\n'.repeat(12))
    const send = await container.getByRole('button', { name: 'Send question', exact: true }).boundingBox()
    expect(send!.y + send!.height).toBeLessThanOrEqual(360)
    await input.fill('Keep this keyboard draft')
    await page.screenshot({ path: info.outputPath(`${kind}-keyboard.png`) })
    await page.evaluate(() => {
      delete (window.visualViewport as unknown as Record<string, unknown>).height
      delete (window.visualViewport as unknown as Record<string, unknown>).offsetTop
      window.visualViewport!.dispatchEvent(new Event('resize'))
    })
    await expect(container.locator('.ask-examples')).toBeVisible()
    await expect(input).toHaveValue('Keep this keyboard draft')
  })
}

test('touch timeline arrows stay at the end of the decision link', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 })
  await page.goto(records[0][1])
  const link = page.locator('.ev-timeline .ev-inline-link').first()
  await expect(link).toBeVisible()
  const arrow = await link.evaluate(el => {
    const css = getComputedStyle(el, '::after')
    return { position: css.position, transform: css.transform, width: css.minWidth }
  })
  expect(arrow).toEqual({ position: 'static', transform: 'none', width: '0px' })
  const box = await link.boundingBox()
  expect(box!.height).toBeGreaterThanOrEqual(44)
})

test('route heading focus stays quiet and follow management is a simple text action', async ({ page }, info) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/following?fixture=active')
  const manage = page.locator('.following-manage').first()
  await expect(manage).toHaveText('Manage follow')
  await manage.click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.getByRole('button', { name: 'Close', exact: true }).click()
  await expect(manage).toBeFocused()
  await page.screenshot({ path: info.outputPath('account-manage.png') })
  const heading = page.locator('h1').first()
  await heading.evaluate(el => { el.setAttribute('tabindex', '-1'); el.focus() })
  await expect(heading).toBeFocused()
  expect(await heading.evaluate(el => getComputedStyle(el).outlineStyle)).toBe('none')
})
