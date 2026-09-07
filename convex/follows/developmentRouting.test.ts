import { afterEach, expect, test, vi } from 'vitest'
import { checkedRecipient, DEVELOPMENT_RECIPIENT } from './developmentRouting'

afterEach(() => vi.unstubAllEnvs())

test('personal development refuses resident recipients and the shared production sender', () => {
  vi.stubEnv('CONVEX_SITE_URL', 'https://woozy-wren-227.convex.site')
  vi.stubEnv('AGENTMAIL_UPDATES_INBOX_ID', 'public-parish-updates@agentmail.to')
  expect(() => checkedRecipient(DEVELOPMENT_RECIPIENT)).toThrow('dedicated sender')
  vi.stubEnv('AGENTMAIL_UPDATES_INBOX_ID', 'public-parish-development@agentmail.to')
  expect(() => checkedRecipient('resident@example.com')).toThrow('controlled recipient')
  expect(checkedRecipient(DEVELOPMENT_RECIPIENT)).toBe(DEVELOPMENT_RECIPIENT)
})

test('the development guard leaves production recipient selection unchanged', () => {
  vi.stubEnv('CONVEX_SITE_URL', 'https://befitting-flamingo-587.convex.site')
  vi.stubEnv('AGENTMAIL_UPDATES_INBOX_ID', 'public-parish-updates@agentmail.to')
  expect(checkedRecipient('verified@example.com')).toBe('verified@example.com')
})
