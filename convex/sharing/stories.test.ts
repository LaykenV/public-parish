import { expect, test } from 'vitest'
import { storyShareHtml } from './stories'

test('story share metadata escapes approved prose, image alt and URLs', () => {
  const html = storyShareHtml({ title: '<script>alert(1)</script>', summary: 'A "quoted" proposal & records', canonicalUrl: 'https://example.org/stories/one', shareUrl: 'https://example.org/share/stories/one', imageUrl: 'https://example.org/image?a=1&b=2', imageAlt: 'A "document"', reviewedThrough: '2026-09-07', limited: true })
  expect(html).not.toContain('<script>')
  expect(html).toContain('&lt;script&gt;')
  expect(html).toContain('content="A &quot;document&quot;"')
  expect(html).toContain('image?a=1&amp;b=2')
  expect(html).toContain('Some questions remain unanswered.')
})
