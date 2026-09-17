import { expect, test } from 'vitest'
import { renderEmail } from './emailTemplates'

const base = {
  siteUrl: 'https://www.publicparish.com',
  eyebrow: 'Story update',
  title: 'A published update',
  preview: 'New evidence',
}

test('HTML escapes evidence and rejects unsafe link targets', () => {
  const html = renderEmail({
    ...base,
    title: '<img src=x onerror="alert(1)">',
    paragraphs: ['<script>bad()</script> & "quoted"'],
    action: { label: 'Unsafe', href: 'javascript:alert(1)' },
    sources: [
      'javascript:alert(2)',
      'https://official.example/document?a=1&b=2',
    ],
    managementUrl: 'https://user:password@example.com',
    unsubscribeUrl: 'data:text/html,bad',
  })
  expect(html).toContain(
    '&lt;script&gt;bad()&lt;/script&gt; &amp; &quot;quoted&quot;',
  )
  expect(html).toContain('&lt;img src=x onerror=&quot;alert(1)&quot;&gt;')
  expect(html).not.toMatch(/href="(?:javascript:|data:|https:\/\/user:)/)
  expect(html).toContain('href="https://official.example/document?a=1&amp;b=2"')
})

test('HTML keeps distinct official documents and subscriber controls', () => {
  const urls = [
    'https://official.example/agenda',
    'https://official.example/minutes',
  ]
  const html = renderEmail({
    ...base,
    sources: [...urls, urls[0]],
    managementUrl: `${base.siteUrl}/email/manage/example`,
    unsubscribeUrl: `${base.siteUrl}/coverage/unsubscribe/example`,
  })
  for (const url of urls) expect(html.split(`href="${url}"`)).toHaveLength(2)
  expect(html).toContain(
    'href="https://www.publicparish.com/email/manage/example"',
  )
  expect(html).toContain(
    'href="https://www.publicparish.com/coverage/unsubscribe/example"',
  )
})

test('reply prose retains citation numbers and links without executing generated markup', () => {
  const html = renderEmail({
    ...base,
    paragraphs: [
      'The record says this [1].\n[1] Minutes: https://official.example/minutes?a=1&b=2\n<img src=x>',
    ],
  })
  expect(html).toContain('The record says this [1].<br>[1] Minutes: ')
  expect(html).toContain('href="https://official.example/minutes?a=1&amp;b=2"')
  expect(html).toContain('&lt;img src=x&gt;')
})
