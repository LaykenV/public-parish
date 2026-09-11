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
    await page.evaluate(() => scrollTo(0, 450))
    const readingPosition = await page.evaluate(() => scrollY)
    await trigger.click()
    const chat = page.getByRole('dialog', {
      name: 'Ask Public Parish',
      exact: true,
    })
    const input = chat.getByRole('textbox')
    await input.fill('Who received the truck?')
    await chat.getByRole('button', { name: 'Back to reading', exact: true }).click()
    await expect(trigger).toBeFocused()
    await expect(page.locator('.resident-blueprint')).toHaveCSS('opacity', '1')
    expect(await page.evaluate(() => scrollY)).toBe(readingPosition)
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
    // Every phone entry point renders the same chat screen.
    const container = page.getByRole('dialog', { name: 'Ask Public Parish', exact: true })
    const input = container.getByRole('textbox')
    const initialComposer = await container.locator('.ask-composer').boundingBox()
    expect(initialComposer!.height).toBeLessThan(70)
    // The composer rests at the bottom, under the suggestions and above the
    // privacy note, with the intro filling the space above.
    expect(initialComposer!.y).toBeGreaterThan(600)
    expect(812 - initialComposer!.y - initialComposer!.height).toBeLessThan(80)
    await expect(container.locator('.ask-intro')).toBeVisible()
    const examples = await container.locator('.ask-examples').boundingBox()
    expect(examples!.y + examples!.height).toBeLessThanOrEqual(initialComposer!.y)
    const underlyingPage = page.locator(kind === 'ask' ? '.resident-header' : '.resident-blueprint')
    await expect(underlyingPage).toHaveCSS('opacity', '0')
    await page.screenshot({ path: info.outputPath(`${kind}-chat-resting.png`) })
    const screen = await container.boundingBox()
    expect(screen!.y).toBe(0)
    expect(screen!.height).toBe(812)
    await expect(container.locator('.pp-sheet-grabber')).toHaveCount(0)
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
      await expect(container.locator('.ask-intro')).toBeHidden()
      await expect(container.locator('.ask-examples')).toBeVisible()
      await expect.poll(async () => {
        const box = await container.locator('.ask-composer').boundingBox()
        return box!.y >= bounds.top && box!.y + box!.height <= bounds.top + bounds.height
      }).toBe(true)
      await expect(input).toHaveValue('Keep this keyboard draft')
      await expect(input).toBeFocused()
      await expect(underlyingPage).toHaveCSS('opacity', '0')
      const close = await container.locator('.ask-screen-back').boundingBox()
      expect(close!.y).toBeGreaterThanOrEqual(bounds.top)
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
    await expect(container.locator('.ask-intro')).toBeVisible()
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

test('short mobile chat clamps stale keyboard offsets and keeps long drafts reachable', async ({ page }, info) => {
  await page.setViewportSize({ width: 320, height: 568 })
  for (const path of ['/ask?fixture=empty', records[0][1]]) {
    await page.goto(path)
    if (!path.startsWith('/ask')) await page.getByRole('button', { name: 'Ask Public Parish', exact: true }).click()
    const chat = page.locator('.ask-page').filter({ has: page.getByRole('textbox') })
    await chat.getByRole('textbox').fill('A long draft line\n'.repeat(12))
    for (const viewport of [{ height: 290, top: 70 }, { height: 568, top: 120 }, { height: 650, top: 120 }]) {
      await page.evaluate(({ height, top }) => {
        Object.defineProperties(visualViewport, { height: { configurable: true, value: height }, offsetTop: { configurable: true, value: top } })
        visualViewport!.dispatchEvent(new Event('resize'))
      }, viewport)
      const expectedTop = viewport.height < 568 ? viewport.top : 0
      const expectedBottom = Math.min(568, viewport.height + expectedTop)
      await expect.poll(async () => {
        const box = await chat.locator('.ask-composer').boundingBox()
        return box!.y >= expectedTop && box!.y + box!.height <= expectedBottom
      }).toBe(true)
      // Growing back after the keyboard leaves is eased, so wait for the bar to settle.
      await expect.poll(async () => (await chat.locator('.ask-screen-header').boundingBox())!.y).toBe(expectedTop)
      if (viewport.height === 290) await page.screenshot({ path: info.outputPath(path.startsWith('/ask') ? 'ask-short-keyboard.png' : 'issue-short-keyboard.png') })
    }
  }
})

test('standalone Ask source drawers preserve the document lock and release it on exit', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/ask?fixture=thread')
  const source = page.locator('.ask-thread-region .ev-source').first()
  await source.scrollIntoViewIfNeeded()
  const region = page.locator('.ask-thread-region')
  const position = await region.evaluate(el => el.scrollTop)
  await source.click()
  const drawer = page.getByRole('dialog', { name: 'Official source', exact: true })
  await expect(drawer).toBeVisible()
  await drawer.getByRole('button', { name: 'Close', exact: true }).click()
  await expect(source).toBeFocused()
  expect(await region.evaluate(el => el.scrollTop)).toBe(position)
  await expect(page.locator('html')).toHaveCSS('overflow', 'hidden')
  await expect(page.locator('.resident-header')).toHaveCSS('visibility', 'hidden')
  await page.getByRole('button', { name: 'Back to Home', exact: true }).click()
  // The screen plays its exit motion, then the route hands back to Home.
  await expect(page).toHaveURL(/\/$/)
  await expect(page.locator('.ask-page')).toHaveCount(0)
  await expect(page.locator('html')).not.toHaveCSS('overflow', 'hidden')
  await expect(page.locator('.resident-header')).toHaveCSS('visibility', 'visible')
})

test('mobile menu anchors Account with the area controls and keeps it reachable on short screens', async ({ page }, info) => {
  for (const height of [812, 480]) {
    await page.setViewportSize({ width: 375, height })
    await page.goto('/following?fixture=active')
    await page.getByRole('button', { name: 'Open menu', exact: true }).click()
    const menu = page.getByRole('dialog', { name: 'Menu', exact: true })
    const account = menu.getByRole('link', { name: 'Account', exact: true })
    await expect(account).toHaveAttribute('aria-current', 'page')
    await expect(menu.locator('.resident-menu-bottom')).toContainText('Account')
    await account.scrollIntoViewIfNeeded()
    await expect(account).toBeInViewport()
    if (height === 812) {
      expect((await account.boundingBox())!.y).toBeGreaterThan(500)
      await page.screenshot({ path: info.outputPath('menu-account-bottom.png') })
    }
    await account.click()
    await expect(menu).toBeHidden()
  }
})

test('mobile follow cards disclose delivery details and keep their issue links', async ({ page }, info) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/following?fixture=active')
  const card = page.locator('.following-row').first()
  await expect(card.locator('h3 a')).toHaveAttribute('href', /issues/)
  await expect(card.locator('.following-row-ledger')).toBeHidden()
  await expect(card.locator('.following-row-update')).toBeVisible()
  await card.getByText('Details and delivery', { exact: true }).click()
  await expect(card.locator('.following-row-ledger')).toBeVisible()
  await card.getByText('Details and delivery', { exact: true }).click()
  await page.screenshot({ path: info.outputPath('following-compact.png') })
})

test('mobile reading uses small citations with touch areas and groups meeting documents', async ({ page }, info) => {
  await page.setViewportSize({ width: 320, height: 568 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  for (const [, path] of records) {
    await page.goto(path)
    const source = page.locator('.ev-source').first()
    await source.scrollIntoViewIfNeeded()
    const box = await source.boundingBox()
    expect(box!.height).toBeLessThan(35)
    const touchArea = await source.evaluate(el => {
      if (!matchMedia('(pointer: coarse)').matches) return null
      const style = getComputedStyle(el, '::after')
      return { width: parseFloat(style.width), height: parseFloat(style.height) }
    })
    if (touchArea) {
      expect(touchArea.width).toBeGreaterThanOrEqual(44)
      expect(touchArea.height).toBeGreaterThanOrEqual(44)
    }
    await source.click()
    await expect(page.getByRole('dialog', { name: 'Official source', exact: true })).toBeVisible()
    await page.getByRole('button', { name: 'Close', exact: true }).click()
  }
  await page.goto('/meetings/lafayette-city-parish-council-2026-04-21?fixture=preview')
  await expect(page.locator('.ev-document-group').first()).toBeAttached()
  await page.locator('.ev-document-groups').scrollIntoViewIfNeeded()
  await page.screenshot({ path: info.outputPath('meeting-document-groups.png') })
  await page.goto(records[0][1])
  const toolbar = page.locator('.ev-record-toolbar')
  await expect(toolbar.getByRole('link', { name: 'Back to Home', exact: true })).toBeVisible()
  await expect(toolbar.getByRole('button', { name: 'Follow this issue', exact: true })).toBeVisible()
  expect(await toolbar.evaluate(el => el.scrollWidth)).toBeLessThanOrEqual(288)
  await page.screenshot({ path: info.outputPath('issue-compact-header.png') })
})

test('Account opens and clears device conversations without putting history in the chat', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/following?fixture=signed-out')
  const history = page.getByRole('region', { name: 'Conversations on this device', exact: true })
  await expect(history).toContainText('No sign-in needed')
  await history.getByRole('button', { name: /Surplus pickup donations/ }).click()
  const chat = page.getByRole('dialog', { name: 'Ask Public Parish', exact: true })
  await expect(chat.locator('.ask-thread')).toContainText('Who received the truck?')
  await expect(page).toHaveURL(/scope=issue/)
  expect(page.url()).not.toContain('ask-fixture-thread')
  await expect(chat.locator('.ask-recent')).toHaveCount(0)
  await chat.getByRole('button', { name: 'Back to reading', exact: true }).click()
  await expect(chat).toBeHidden()
  await expect(page.locator('body')).not.toHaveCSS('position', 'fixed')
  await page.goto('/following?fixture=signed-out')
  await history.getByRole('button', { name: 'Clear recent conversations' }).click()
  await history.getByRole('button', { name: 'Clear', exact: true }).click()
  await expect(history).toContainText('No recent conversations on this device')
})

test('menu Ask keeps the outer screen fixed with saved device history and a panned keyboard', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/following?fixture=signed-out')
  await page.getByRole('button', { name: 'Open menu', exact: true }).click()
  const menu = page.getByRole('dialog', { name: 'Menu', exact: true })
  // This is a local-only handle. Opening Ask must not fetch its private history.
  await page.evaluate(() => localStorage.setItem('public-parish.ask.thread-handles.v1', JSON.stringify([
    { threadId: 'device-history-test', scopeKey: 'corpus', expiresAt: Date.now() + 86400000, lastActivityAt: Date.now() },
  ])))
  await menu.getByRole('link', { name: 'Ask', exact: true }).click()
  const chat = page.getByRole('dialog', { name: 'Ask Public Parish', exact: true })
  await expect(chat.getByRole('textbox')).toBeVisible()
  await expect(chat.locator('.ask-recent')).toHaveCount(0)
  await expect(page.locator('body')).toHaveCSS('position', 'fixed')
  await chat.getByRole('textbox').fill('A question with the keyboard open')
  await page.evaluate(() => {
    Object.defineProperties(visualViewport, {
      height: { configurable: true, value: 290 },
      offsetTop: { configurable: true, value: 120 },
    })
    visualViewport!.dispatchEvent(new Event('resize'))
    window.scrollTo(0, 500)
    document.querySelector('.mobile-chat-screen')!.scrollTop = 500
  })
  await expect.poll(async () => (await chat.locator('.ask-screen-header').boundingBox())!.y).toBe(120)
  expect(await chat.evaluate(el => el.scrollTop)).toBe(0)
  const composer = await chat.locator('.ask-composer').boundingBox()
  expect(composer!.y + composer!.height).toBeLessThanOrEqual(410)
  await page.evaluate(() => {
    delete (visualViewport as unknown as Record<string, unknown>).height
    delete (visualViewport as unknown as Record<string, unknown>).offsetTop
    visualViewport!.dispatchEvent(new Event('resize'))
  })
  await chat.getByRole('button', { name: 'Back to Home', exact: true }).click()
  await expect(page).toHaveURL(/\/$/)
  await expect(page.locator('body')).not.toHaveCSS('position', 'fixed')
})

test('answer wait uses three dots and keeps the send spinner', async ({ page }, info) => {
  await page.goto('/ask?fixture=checking')
  await expect(page.locator('.ask-typing > span')).toHaveCount(3)
  await expect(page.locator('.ask-checking svg')).toHaveCount(0)
  await expect(page.locator('.ask-checking')).not.toContainText('The answer will appear')
  await expect(page.locator('.ask-send')).toHaveAttribute('data-loading')
  await expect(page.locator('.ask-typing > span').first()).toHaveCSS('animation-name', 'none')
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await expect(page.locator('.ask-typing > span').first()).toHaveCSS('animation-name', 'ask-typing')
  await page.screenshot({ path: info.outputPath('answer-wait-dots.png') })
})
