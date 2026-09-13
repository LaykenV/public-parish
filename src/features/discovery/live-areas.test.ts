import { describe, expect, it } from 'vitest'

import { groupBodiesByPlace, toAreaRecords } from './live-areas'

describe('live coverage areas', () => {
  it('enables only areas the backend marks available', () => {
    const areas = toAreaRecords([
      { slug: 'lafayette-parish', status: 'available' },
      { slug: 'east-baton-rouge-parish', status: 'validating' },
      { slug: 'rapides-parish', status: 'available' },
    ])

    expect(areas.map(({ slug, status }) => ({ slug, status }))).toEqual([
      { slug: 'lafayette-parish', status: 'available' },
      { slug: 'east-baton-rouge-parish', status: 'validating' },
      { slug: 'rapides-parish', status: 'available' },
    ])
  })

  it('keeps every area validating while live status is unavailable', () => {
    expect(
      toAreaRecords(undefined).every((area) => area.status === 'validating'),
    ).toBe(true)
  })
})


it('keeps published history selectable without claiming full coverage', () => {
  const area = toAreaRecords([{ slug: 'lafayette-parish', status: 'limited' }])[0]
  expect(area.status).toBe('limited')
  expect(area.note).toContain('newer decisions may be missing')
  expect(area.note).not.toContain('Every launch body')
})

it('groups a parish\'s bodies by city before parish-wide bodies', () => {
  const body = (slug: string, label: string, municipality: { slug: string; name: string } | null) => ({
    slug,
    label,
    placeSlug: 'lafayette-parish' as const,
    municipality,
    published: true,
  })
  const groups = groupBodiesByPlace([
    body('lafayette-hearing-examiner', 'Lafayette Hearing Examiner', null),
    body('youngsville-city-council', 'Youngsville City Council', { slug: 'youngsville', name: 'Youngsville' }),
    body('lafayette-city-council', 'Lafayette City Council', { slug: 'lafayette', name: 'Lafayette' }),
    body('lafayette-city-zoning-commission', 'Lafayette City Zoning Commission', { slug: 'lafayette', name: 'Lafayette' }),
  ])
  expect(groups.map((group) => [group.name, group.bodies.map((item) => item.slug)])).toEqual([
    ['Lafayette', ['lafayette-city-council', 'lafayette-city-zoning-commission']],
    ['Youngsville', ['youngsville-city-council']],
    ['Parish-wide', ['lafayette-hearing-examiner']],
  ])
})
