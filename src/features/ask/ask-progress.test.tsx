import { renderToStaticMarkup } from 'react-dom/server'
import { expect, test } from 'vitest'
import { AskChecking } from './ask-progress'

test.each([
  ['searching', 'Finding relevant records', 'search'],
  ['reading', 'Reading official sources', 'file-search'],
  ['writing', 'Writing your answer', 'pen-line'],
  ['checking', 'Checking citations', 'shield-check'],
] as const)('shows only the reported %s stage and its icon', (phase, label, icon) => {
  const html = renderToStaticMarkup(
    <AskChecking progress={{ phase, startedAt: 1000 }} />,
  )
  expect(html).toContain(label)
  expect(html).toContain(`lucide-${icon}`)
  expect(html.match(/role="status"/g)).toHaveLength(1)
  expect(html).not.toContain('<ol')
  expect(html).not.toContain('ask-progress-time')
})

test('no backend update uses a neutral status without claiming a stage', () => {
  const html = renderToStaticMarkup(<AskChecking />)
  expect(html).toContain('Checking the published record')
  expect(html).not.toContain('Finding relevant records')
  expect(html).not.toContain('ask-progress-dots')
})


test('an unfamiliar backend stage retains a neutral loading status', () => {
  const html = renderToStaticMarkup(
    // @ts-expect-error A newer backend can introduce a stage before this tab reloads.
    <AskChecking progress={{ phase: 'preparing', startedAt: 1000 }} />,
  )
  expect(html).toContain('Checking the published record')
  expect(html).toContain('ask-progress-label')
})
