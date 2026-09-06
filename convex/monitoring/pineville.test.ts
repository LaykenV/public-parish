import { expect, test } from 'vitest'
import { isDocumentUrl } from './discovery'
import { isPinevilleItemListing, pinevilleDownloadUrl } from './pineville'

test('Pineville city wrappers are listings, and only item routes are traversed', () => {
  const root = 'https://www.pineville.net/egov/apps/document/center.egov'
  expect(isDocumentUrl(`${root}?id=2309&view=item`)).toBe(false)
  expect(isPinevilleItemListing(`${root}?view=item&id=2309`)).toBe(true)
  for (const url of [`${root}?view=login`, `${root}?id=2309&view=detail`, `${root}?view=item&id=not-a-number`, root.replace('pineville.net', 'pineville.net.example.org')]) expect(isPinevilleItemListing(url)).toBe(false)
})

test('only a verified Pineville MuniDocs node maps to its approved PDF endpoint', () => {
  const source = 'https://library.municode.com/la/pineville/munidocs/munidocs?nodeId=9734ade6364fa'
  expect(pinevilleDownloadUrl(source)).toBe('https://mcclibraryfunctions.azurewebsites.us/api/munidocDownload/31105/9734ade6364fa/pdf')
  for (const url of [source.replace('/pineville/', '/another-city/'), source.replace('library.municode.com', 'library.municode.com.example.org'), source.replace('https:', 'http:'), `${source}&nodeId=966943aa7ac8b`, source.replace('9734ade6364fa', '../other'), 'https://example.org/news/story']) expect(pinevilleDownloadUrl(url)).toBeNull()
})
