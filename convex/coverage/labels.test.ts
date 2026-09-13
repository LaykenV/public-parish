import { expect, test } from 'vitest'

import {
  PUBLIC_BODY_LABELS,
  publicBodyFields,
  publicBodyLabel,
  resolvePublicBodyFilter,
} from './labels'
import { listRootManifests } from './roots'

test('every current root manifest has a public label that names its place', () => {
  for (const manifest of listRootManifests()) {
    const label = PUBLIC_BODY_LABELS[manifest.bodyKey]
    expect(label, manifest.bodyKey).toBeDefined()
    const place =
      label!.municipality?.name ??
      manifest.jurisdictionName.replace(/ Parish$/, '')
    expect(label!.displayName, manifest.bodyKey).toContain(place)
  }
})

test('the public label never replaces the identity name', () => {
  const body = {
    slug: 'ebr-metropolitan-council',
    name: 'Metropolitan Council',
  }
  expect(publicBodyLabel(body)).toBe('Baton Rouge Metropolitan Council')
  expect(publicBodyLabel({ ...body, displayName: 'Owner label' })).toBe(
    'Owner label',
  )
  expect(publicBodyLabel({ slug: 'unknown-body', name: 'Some Board' })).toBe(
    'Some Board',
  )
  expect(body.name).toBe('Metropolitan Council')
})

test('seed fields carry the municipality only where a body belongs to a city', () => {
  expect(publicBodyFields('pineville-city-council')).toEqual({
    displayName: 'Pineville City Council',
    municipality: { slug: 'pineville', name: 'Pineville' },
  })
  expect(publicBodyFields('rapides-parish-police-jury')).toEqual({
    displayName: 'Rapides Parish Police Jury',
  })
  expect(publicBodyFields('not-a-launch-body')).toEqual({})
})

test('older Explore links written with identity names resolve to the public label', () => {
  expect(resolvePublicBodyFilter('Metropolitan Council')).toBe(
    'Baton Rouge Metropolitan Council',
  )
  expect(resolvePublicBodyFilter('Hearing Examiner')).toBe(
    'Lafayette Hearing Examiner',
  )
  expect(resolvePublicBodyFilter('City Zoning Commission')).toBe(
    'Lafayette City Zoning Commission',
  )
  expect(resolvePublicBodyFilter('Pineville City Council')).toBe(
    'Pineville City Council',
  )
  expect(resolvePublicBodyFilter('Baton Rouge Metropolitan Council')).toBe(
    'Baton Rouge Metropolitan Council',
  )
})
