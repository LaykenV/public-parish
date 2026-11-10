import { describe, expect, it } from 'vitest'
import { isProviderCreditExhausted, isProviderRateLimit, providerPause } from './providerPacing'

describe('monitoring provider throttling', () => {
  it('recognizes the Firecrawl API status after action error wrapping', () => {
    expect(isProviderRateLimit(new Error('Uncaught ConvexError: Firecrawl /v2/scrape failed (429): Rate limit exceeded.'))).toBe(true)
  })

  it('keeps government source failures separate from provider throttling', () => {
    for (const message of [
      'Failed to retrieve https://example.gov/ordinance-429',
      'Government source returned 429 Too Many Requests',
      'Firecrawl /v2/scrape failed (500): Source returned 429',
      'Rate limit exceeded for a government source',
    ]) expect(isProviderRateLimit(new Error(message))).toBe(false)
  })

  it('treats a Firecrawl 402 as an account pause, not a source failure', () => {
    const outOfCredits = new Error('ConvexError: Uncaught ConvexError: {"code":"firecrawl_request_failed","status":402,"path":"/v2/scrape","message":"Firecrawl /v2/scrape failed (402): Insufficient credits to perform this request."}')
    expect(isProviderCreditExhausted(outOfCredits)).toBe(true)
    expect(providerPause(outOfCredits)).toBe('monitoring_provider_credits')
    expect(providerPause(new Error('Firecrawl /v2/scrape failed (429): Rate limit exceeded.'))).toBe('monitoring_provider_rate_limit')
    for (const message of [
      'Official raw artifact returned HTTP 402: https://example.gov/agenda.pdf',
      'Firecrawl /v2/scrape failed (500): Source returned 402',
    ]) expect(providerPause(new Error(message))).toBeNull()
  })
})
