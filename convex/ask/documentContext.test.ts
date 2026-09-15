import { expect, test } from 'vitest'
import { documentContext } from './documentContext'

test('keeps the header, qualifiers and repeated quote contexts while removing unrelated text', () => {
  const quote = 'The council approved the drainage agreement subject to the listed conditions.'
  const text = 'Official minutes, September 15, 2026. ' + 'Unrelated first item. '.repeat(1000) + 'Only if the parish obtains matching funds. ' + quote + ' Work cannot begin before the permit. ' + 'Unrelated second item. '.repeat(1000) + 'The earlier September 1 proceeding said: ' + quote + ' That vote was later rescinded.'
  const context = documentContext(text, [quote])
  const prompt = JSON.stringify(context)
  expect(context.contextKind).toBe('surrounding_passages')
  for (const expected of ['Official minutes, September 15', 'matching funds', 'before the permit', 'earlier September 1', 'later rescinded']) expect(prompt).toContain(expected)
  expect(prompt.length).toBeLessThan(text.length / 2)
})

test('missing and short excerpts keep complete context', () => {
  const text = 'Yes. '.repeat(5000)
  expect(documentContext(text, ['Missing text'])).toEqual({ contextKind: 'full_document', text })
  expect(documentContext(text, ['Yes.'])).toEqual({ contextKind: 'full_document', text })
})
