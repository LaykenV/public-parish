import { expect, test } from 'vitest'
import { hashStoryValue } from './hashing'
test('approval hashes survive object-key reordering but fence changed facts and array order', async () => {
  const first = await hashStoryValue({ title: { text: 'Proposal', evidenceKeys: ['a', 'b'] }, limits: [] })
  expect(await hashStoryValue({ limits: [], title: { evidenceKeys: ['a', 'b'], text: 'Proposal' } })).toBe(first)
  expect(await hashStoryValue({ title: { text: 'Approved', evidenceKeys: ['a', 'b'] }, limits: [] })).not.toBe(first)
  expect(await hashStoryValue({ title: { text: 'Proposal', evidenceKeys: ['b', 'a'] }, limits: [] })).not.toBe(first)
})
