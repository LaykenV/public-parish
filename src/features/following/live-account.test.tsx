import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, expect, test, vi } from 'vitest'

import { FollowingPage } from './following-page'

const state = vi.hoisted(() => ({
  account: undefined as
    { email: string; name?: string; picture?: string } | null | undefined,
  authenticated: true,
  savedSetup: vi.fn(),
  follows: vi.fn(),
  notifications: vi.fn(),
}))
vi.mock('convex/react', () => ({ useQuery: () => state.account }))
vi.mock('../auth/google-auth', () => ({
  AUTH_RETURN_KEY: 'test-return',
  useGoogleAuth: () => ({
    isAuthenticated: state.authenticated,
    isLoading: false,
    isSigningIn: false,
    error: null,
    signInGoogle: vi.fn(),
    signOut: vi.fn(),
  }),
}))
vi.mock('./live-saved-setup', () => ({
  useSavedSetup: state.savedSetup,
  useSavedSetupMutations: () => ({}),
}))
vi.mock('./live-follows', () => ({
  useGoogleFollows: state.follows,
  useNotificationSettings: state.notifications,
  useGoogleFollowMutations: () => ({}),
  useNotificationSettingsMutation: () => vi.fn(),
}))
vi.mock('@tanstack/react-router', () => ({
  Link: ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
  ),
}))
vi.mock('../resident-blueprint/resident-loading', () => ({
  PageLoading: () => <p>Loading account</p>,
}))

beforeEach(() => {
  state.account = undefined
  state.authenticated = true
  state.savedSetup.mockReset().mockReturnValue({ areas: [], topics: [] })
  state.follows.mockReset().mockReturnValue([])
  state.notifications
    .mockReset()
    .mockReturnValue({ defaultCadence: 'immediate', deliveries: [] })
})

function renderAccount() {
  return renderToStaticMarkup(
    <FollowingPage
      view="following"
      data={{
        available: true,
        mode: 'live',
        signedIn: false,
        areas: [],
        topics: [],
        targets: [],
        notificationsAvailable: true,
      }}
    />,
  )
}

test('waits for the backend profile before loading private account data', () => {
  expect(renderAccount()).toContain('Loading account')
  expect(state.savedSetup).toHaveBeenCalledWith(false)
  expect(state.follows).toHaveBeenCalledWith(false)
  expect(state.notifications).toHaveBeenCalledWith(false)
})

test('a session without a resident profile shows sign-in recovery', () => {
  state.account = null
  const html = renderAccount()
  expect(html).toContain('Your account could not be restored')
  expect(html).not.toContain('Signed in as')
  expect(state.savedSetup).toHaveBeenCalledWith(false)
})

test('shows the confirmed account identity with private data enabled', () => {
  state.account = {
    name: 'Test Resident',
    email: 'resident@example.com',
    picture: 'https://example.com/google-avatar.png',
  }
  const html = renderAccount()
  expect(html).toContain('Test Resident')
  expect(html).toContain('resident@example.com')
  expect(html).toContain('Signed in as')
  expect(html).toContain('https://example.com/google-avatar.png')
  expect(html).toContain('account-sign-out')
  expect(state.savedSetup).toHaveBeenCalledWith(true)
})

test('sign-out hides stale profile data', () => {
  state.authenticated = false
  state.account = { email: 'resident@example.com' }
  expect(renderAccount()).not.toContain('resident@example.com')
  expect(state.follows).toHaveBeenCalledWith(false)
})
