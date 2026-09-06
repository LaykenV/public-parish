import { expect, test } from 'vitest'
import { municodeDeclaredHtmlType } from './municodeHtml'

const url = 'https://meetings.municode.com/adaHtmlDocument/index?cc=YOUNGSVILA&me=official-meeting'
const html = '<!DOCTYPE html><html lang="en"><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"></head><body>Meeting</body></html>'

test('requires the official endpoint and an explicit HTML head declaration', () => {
  expect(municodeDeclaredHtmlType(url, html)).toBe('text/html; charset=utf-8')
  for (const other of [url.replace('municode.com', 'municode.com.example.org'), url.replace('YOUNGSVILA', 'OTHER'), url.replace('/adaHtmlDocument/', '/unapproved/'), url.replace('https:', 'http:')]) expect(municodeDeclaredHtmlType(other, html)).toBeNull()
  for (const body of [undefined, '<html><body>Meeting</body></html>', html.replace('<!DOCTYPE html>', ''), html.replace('text/html', 'application/pdf'), html.replace('<head>', '<head></head><body>'), html.replace('</head>', '<meta http-equiv="Content-Type" content="application/pdf"></head>')]) expect(municodeDeclaredHtmlType(url, body)).toBeNull()
})
