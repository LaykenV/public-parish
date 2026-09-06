import { describe, expect, it } from 'vitest'
import { isProviderRateLimit } from './providerPacing'

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
})
