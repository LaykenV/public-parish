import { expect, test } from '@playwright/test'
import type { Page, WebSocketRoute } from '@playwright/test'

// Only the OAuth-start mutation is intercepted. It never reaches Convex or
// Google; published reading queries still use the normal backend.
async function interceptGoogleStart(page: Page, hold = false) {
  const redirects: string[] = []
  let rejectPending = () => {}
  await page.routeWebSocket('**/api/**/sync', (socket) => {
    const server = socket.connectToServer()
    server.onMessage((message) => socket.send(message))
    socket.onMessage((message) => {
      const request = JSON.parse(message.toString()) as {
        type: string
        udfPath?: string
        requestId: number
        args?: Array<{ redirectTo: string }>
      }
      if (
        request.type === 'Mutation' &&
        request.udfPath === 'auth:startSignInGoogle'
      ) {
        redirects.push(request.args?.[0]?.redirectTo ?? '')
        rejectPending = () => rejectGoogleStart(socket, request.requestId)
        if (!hold) rejectPending()
      } else {
        server.send(message)
      }
    })
  })
  return { redirects, rejectPending: () => rejectPending() }
}

function rejectGoogleStart(socket: WebSocketRoute, requestId: number) {
  socket.send(
    JSON.stringify({
      type: 'MutationResponse',
      requestId,
      success: false,
      result: 'Simulated sign-in start failure',
      logLines: [],
    }),
  )
}

const path = '/ballot/2026-amendment-1'

test('initial Google follow failure offers retry and email with the chosen cadence', async ({
  page,
}) => {
  const google = await interceptGoogleStart(page)
  await page.goto(path)
  const trigger = page
    .getByRole('button', { name: 'Follow this measure', exact: true })
    .first()
  await trigger.click()
  const follow = page.getByRole('dialog', {
    name: 'Get updates about this measure',
    exact: true,
  })
  await follow
    .getByRole('radio', { name: 'Weekly roundup', exact: true })
    .check()
  await follow
    .getByRole('button', { name: 'Continue with Google', exact: true })
    .click()
  await expect(follow.getByRole('alert')).toContainText(
    'Your follow was not created.',
  )
  await expect(page).toHaveURL(new RegExp(`${path}$`))
  expect(google.redirects).toHaveLength(1)
  expect(new URL(google.redirects[0]).searchParams.get('followCadence')).toBe(
    'weekly',
  )
  expect(new URL(google.redirects[0]).searchParams.get('followKey')).toBe(
    '2026-amendment-1',
  )

  await follow
    .getByRole('button', { name: 'Try Google again', exact: true })
    .click()
  await expect.poll(() => google.redirects.length).toBe(2)
  await expect(follow.getByRole('alert')).toContainText(
    'Your follow was not created.',
  )
  expect(google.redirects[1]).toBe(google.redirects[0])
  await follow
    .getByRole('button', { name: 'Use email only', exact: true })
    .click()
  await expect(
    follow.getByRole('textbox', { name: 'Email address' }),
  ).toBeVisible()
  await follow.getByRole('button', { name: 'Change delivery choice' }).click()
  await expect(
    follow.getByRole('radio', { name: 'Weekly roundup', exact: true }),
  ).toBeChecked()
  await expect(follow.getByRole('alert')).toHaveCount(0)
})

test('a late Google failure does not replace email entry or a reopened chooser', async ({
  page,
}) => {
  const google = await interceptGoogleStart(page, true)
  await page.goto(path)
  const trigger = page
    .getByRole('button', { name: 'Follow this measure', exact: true })
    .first()
  const follow = page.getByRole('dialog', {
    name: 'Get updates about this measure',
    exact: true,
  })
  for (const dismiss of ['email', 'close'] as const) {
    await trigger.click()
    const before = google.redirects.length
    await follow
      .getByRole('button', { name: 'Continue with Google', exact: true })
      .click()
    await expect.poll(() => google.redirects.length).toBe(before + 1)
    if (dismiss === 'email') {
      await follow
        .getByRole('button', { name: 'Use email only', exact: true })
        .click()
      google.rejectPending()
      await expect(
        follow.getByRole('textbox', { name: 'Email address' }),
      ).toBeVisible()
      await follow
        .getByRole('button', { name: 'Change delivery choice' })
        .click()
    } else {
      await follow.getByRole('button', { name: 'Close', exact: true }).click()
      google.rejectPending()
      await trigger.click()
    }
    await expect(
      follow.getByRole('button', { name: 'Continue with Google', exact: true }),
    ).toBeEnabled()
    await expect(follow.getByRole('alert')).toHaveCount(0)
    await follow.getByRole('button', { name: 'Close', exact: true }).click()
  }
})
