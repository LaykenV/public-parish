import { expect, test } from 'vitest'
import { removeInlineEvidenceIds } from './answer'

test('internal inline evidence markers are removed while prose and ordinary brackets remain', () => {
  expect(removeInlineEvidenceIds('A local vote is required. [story:version:act:0:100]\n\nThe limit is $5 [per year].', ['story:version:act:0:100']))
    .toBe('A local vote is required.\n\nThe limit is $5 [per year].')
  expect(removeInlineEvidenceIds('An unknown [other-id] marker stays visible.', ['known-id'])).toContain('[other-id]')
})
