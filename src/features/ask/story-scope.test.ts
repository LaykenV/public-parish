import { expect, test } from 'vitest'
import { askScopeIdentity, askScopeKey, parseAskSearch, routeSearchFromScopeKey } from './contracts'

test('story Ask route identity survives navigation without turning into corpus scope', () => {
  const search = parseAskSearch({ scope: 'story', story: 'meta-richland', returnTo: '/stories/meta-richland' })
  expect(askScopeKey(search)).toBe('story:meta-richland')
  expect(routeSearchFromScopeKey(askScopeKey(search))).toEqual({ scope: 'story', story: 'meta-richland' })
  expect(askScopeIdentity({ kind: 'story', storySlug: 'meta-richland', label: 'Story', recordTitle: 'Meta', returnTo: '/stories/meta-richland' })).toBe('story:meta-richland')
  expect(search.returnTo).toBe('/stories/meta-richland')
})
