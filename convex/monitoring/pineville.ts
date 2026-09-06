function parse(raw: string): URL | null {
  try { return new URL(raw) } catch { return null }
}

export function isPinevilleListing(raw: string): boolean {
  const url = parse(raw)
  return url?.origin === 'https://www.pineville.net' && !url.username && !url.password && url.pathname === '/egov/apps/document/center.egov'
}

export function isPinevilleItemListing(raw: string): boolean {
  if (!isPinevilleListing(raw)) return false
  const url = new URL(raw)
  return url.searchParams.get('view') === 'item' && /^\d+$/.test(url.searchParams.get('id') ?? '')
}

/** The approved Pineville MuniDocs collection uses product 31105. */
export function pinevilleDownloadUrl(raw: string): string | null {
  const url = parse(raw)
  if (url?.origin !== 'https://library.municode.com' || url.username || url.password || url.pathname !== '/la/pineville/munidocs/munidocs') return null
  const node = url.searchParams.get('nodeId')
  if (!node || !/^[a-f0-9]{13}$/i.test(node) || url.searchParams.getAll('nodeId').length !== 1) return null
  return `https://mcclibraryfunctions.azurewebsites.us/api/munidocDownload/31105/${node}/pdf`
}
