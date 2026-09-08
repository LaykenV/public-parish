import { env } from '../_generated/server'

export const DEVELOPMENT_RECIPIENT = 'public-parish-reports@agentmail.to'
const DEVELOPMENT_SENDER = 'public-parish-development@agentmail.to'

export function isStoryDevelopment(): boolean {
  return ['https://woozy-wren-227.convex.site', 'https://woozy-wren-227.convex.site/'].includes(env.CONVEX_SITE_URL)
}

// The shared personal deployment may contain older subscriptions. Verification
// must never deliver to those addresses or use the production sender.
export function checkedRecipient(recipient: string): string {
  if (isStoryDevelopment() && (recipient.trim().toLowerCase() !== DEVELOPMENT_RECIPIENT || env.AGENTMAIL_UPDATES_INBOX_ID?.trim() !== DEVELOPMENT_SENDER)) {
    throw new Error('Development mail requires the dedicated sender and controlled recipient')
  }
  return recipient
}

export function labelDevelopmentStoryMail(message: { subject: string; text: string }) {
  return isStoryDevelopment() ? {
    subject: `[Development verification] ${message.subject}`,
    text: `Controlled development verification using accepted official records. Historical evidence progressions are test updates, not new government actions.\n\n${message.text}`,
  } : message
}
