import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, expect, test, vi } from 'vitest'
import { AskChecking } from './ask-progress'

afterEach(() => vi.restoreAllMocks())

test('elapsed time never advances the reported backend stage', () => {
  vi.spyOn(Date, 'now').mockReturnValue(121_000)
  const html = renderToStaticMarkup(
    <AskChecking progress={{ phase: 'searching', startedAt: 1000 }} />,
  )
  expect(html).toContain('2:00')
  expect(html).toContain('Larger searches take longer')
  expect(html).not.toContain('data-state="done"')
  expect(html).toContain('role="status">Finding relevant records')
})

test('only stages preceding the reported phase are complete', () => {
  const html = renderToStaticMarkup(
    <AskChecking progress={{ phase: 'writing', startedAt: Date.now() }} />,
  )
  expect(html.match(/data-state="done"/g)).toHaveLength(2)
  expect(html.match(/data-state="active"/g)).toHaveLength(1)
  expect(html.match(/data-state="waiting"/g)).toHaveLength(1)
  expect(html).toContain('role="status">Writing your answer')
})

test('no backend update leaves every stage unconfirmed', () => {
  const html = renderToStaticMarkup(<AskChecking />)
  expect(html).toContain('Checking the published record')
  expect(html).not.toContain('data-state="done"')
  expect(html).not.toContain('data-state="active"')
})
