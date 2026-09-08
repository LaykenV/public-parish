import { expect, test } from 'vitest'
import { storyShareHtml, storyAppHtml } from './stories'

test('story share metadata escapes approved prose, image alt and URLs', () => {
  const html = storyShareHtml({ title: '<script>alert(1)</script>', summary: 'A "quoted" proposal & records', canonicalUrl: 'https://example.org/stories/one', shareUrl: 'https://example.org/share/stories/one', imageUrl: 'https://example.org/image?a=1&b=2', imageAlt: 'A "document"', reviewedThrough: '2026-09-07', limited: true })
  expect(html).not.toContain('<script>')
  expect(html).toContain('&lt;script&gt;')
  expect(html).toContain('content="A &quot;document&quot;"')
  expect(html).toContain('image?a=1&amp;b=2')
  expect(html).toContain('Some questions remain unanswered.')
})


test('ordinary story HTML retains the app while replacing generic metadata', () => {
  const shell = '<html><head><title>Generic</title><meta name="description" content="Generic"><meta property="og:title" content="Generic"><link rel="canonical" href="/"><link rel="stylesheet" href="/assets/app.css"><script type="module" src="/assets/app.js"></script></head><body><div id="root"></div></body></html>'
  const metadata = storyShareHtml({ title: 'Reviewed story', summary: 'Approved summary', canonicalUrl: 'https://example.org/stories/one', shareUrl: 'https://example.org/stories/one', imageUrl: null, imageAlt: '', reviewedThrough: '2026-09-07', limited: true })
  const result = storyAppHtml(shell, metadata)
  expect(result).not.toContain('Generic')
  expect(result).toContain('/assets/app.js')
  expect(result).toContain('/assets/app.css')
  expect(result).toContain('<div id="root">')
  expect(result.match(/property="og:title"/g)).toHaveLength(1)
  expect(result).toContain('content="https://example.org/stories/one"')
})
