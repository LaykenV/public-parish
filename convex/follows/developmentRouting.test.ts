import { afterEach, expect, test, vi } from 'vitest'
import { checkedRecipient, DEVELOPMENT_RECIPIENT, labelDevelopmentStoryMail } from './developmentRouting'

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

test('historical development messages identify the exercise without relabeling production mail', () => {
  const message = { subject: 'Story update: Official record added', text: 'Accepted evidence and source links.' }
  vi.stubEnv('CONVEX_SITE_URL', 'https://woozy-wren-227.convex.site')
  const labeled = labelDevelopmentStoryMail(message)
  expect(labeled.subject).toBe(`[Development verification] ${message.subject}`)
  expect(labeled.text).toContain('not new government actions')
  expect(labeled.text).toContain(message.text)
  vi.stubEnv('CONVEX_SITE_URL', 'https://befitting-flamingo-587.convex.site')
  expect(labelDevelopmentStoryMail(message)).toEqual(message)
})
