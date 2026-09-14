import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { AreaRecord } from './contracts'
import { HomeParishLabels } from './home-parish-labels'

const state = vi.hoisted(() => ({ areas: [] as AreaRecord[] }))
vi.mock('./live-areas', () => ({ useCoverageAreas: () => state.areas }))
vi.mock('@tanstack/react-router', () => ({ useNavigate: () => vi.fn() }))
vi.mock('../analytics/product-analytics', () => ({
  useRecordAreaSelection: () => vi.fn(),
}))

beforeEach(() => {
  state.areas = []
})

describe('Home parish labels', () => {
  it('keeps all labels disabled until their coverage is known', () => {
    const html = renderToStaticMarkup(<HomeParishLabels />)
    expect(html.match(/disabled=""/g)).toHaveLength(3)
    expect(html).toContain('Select Rapides Parish')
    expect(html).toContain('Select Lafayette Parish')
    expect(html).toContain('Select East Baton Rouge Parish')
  })

  it('allows limited records without bypassing a validating parish', () => {
    state.areas = [
      { slug: 'rapides-parish', name: 'Rapides Parish', status: 'available' },
      {
        slug: 'lafayette-parish',
        name: 'Lafayette Parish',
        status: 'limited',
        note: 'Newer decisions may be missing.',
      },
      {
        slug: 'east-baton-rouge-parish',
        name: 'East Baton Rouge Parish',
        status: 'validating',
      },
    ]
    const html = renderToStaticMarkup(<HomeParishLabels />)
    expect(html.match(/disabled=""/g)).toHaveLength(1)
    expect(html).toMatch(
      /disabled="" aria-label="Select East Baton Rouge Parish"/,
    )
    expect(html).toContain('Newer decisions may be missing.')
    expect(html).not.toContain('aria-hidden="true"')
  })
})
