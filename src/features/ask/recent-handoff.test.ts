import { expect, test } from 'vitest'
import { setRecentAskHandoff, takeRecentAskHandoff } from './recent-handoff'

test('a device conversation handoff is consumed once and can be canceled', () => {
  const handle = {
    localHandle: 'private-device-handle',
    scopeLabel: 'Lafayette Parish',
    latestActivityAt: '2026-09-11T12:00:00Z',
    expiresAt: '2026-09-12T12:00:00Z',
  }
  setRecentAskHandoff(handle)
  expect(takeRecentAskHandoff()).toEqual(handle)
  expect(takeRecentAskHandoff()).toBeNull()
  setRecentAskHandoff(handle)
  setRecentAskHandoff(null)
  expect(takeRecentAskHandoff()).toBeNull()
})
