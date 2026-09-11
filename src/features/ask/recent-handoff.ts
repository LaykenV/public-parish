import type { AskRecentConversation } from './contracts'

// Keep device-local thread handles out of URLs and browser history.
let pending: AskRecentConversation | null = null

export function setRecentAskHandoff(handle: AskRecentConversation | null) {
  pending = handle
}

export function takeRecentAskHandoff() {
  const handle = pending
  pending = null
  return handle
}
