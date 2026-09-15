import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { OfficialSourceLink, SourceActions } from './source-actions'

describe('official source links', () => {
  it('identifies the official host and retains the source destination', () => {
    const html = renderToStaticMarkup(<OfficialSourceLink url="https://example.gov/record?page=2#decision" />)
    expect(html).toContain('href="https://example.gov/record?page=2#decision"')
    expect(html).toContain('Open official source at example.gov')
  })

  it.each(['not a URL', '', '/record', 'javascript:alert(1)', 'data:text/html,hello'])('keeps the saved evidence readable when the URL is invalid: %s', url => {
    const html = renderToStaticMarkup(
      <section><blockquote>Accepted source excerpt</blockquote><SourceActions officialUrl={url} snapshotUrl="https://example.gov/snapshot" /></section>,
    )
    expect(html).toContain('Accepted source excerpt')
    expect(html).toContain('Official source link is unavailable.')
    expect(html).toContain('View saved copy')
    expect(html).toContain('href="https://example.gov/snapshot"')
    expect(html).not.toContain('Open official source')
  })
})
