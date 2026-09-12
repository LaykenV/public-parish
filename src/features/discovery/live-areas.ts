import { useQuery } from 'convex/react'
import type { FunctionReturnType } from 'convex/server'

import { api } from '../../../convex/_generated/api'
import type { AreaRecord } from './contracts'
import { AREA_FIXTURES } from './fixtures'

type CoverageArea = FunctionReturnType<
  typeof api.resident.discovery.listCoverageAreas
>[number]

export type CoverageBody = FunctionReturnType<
  typeof api.resident.discovery.listCoverageBodies
>[number]

export function useCoverageAreas(): AreaRecord[] {
  return toAreaRecords(useQuery(api.resident.discovery.listCoverageAreas))
}

export function useCoverageBodies(): CoverageBody[] {
  return useQuery(api.resident.discovery.listCoverageBodies) ?? []
}

export type BodyGroup = {
  key: string
  name: string
  bodies: CoverageBody[]
}

// Cities first, then parish-wide bodies, so a reader moves parish, city, body.
export function groupBodiesByPlace(bodies: CoverageBody[]): BodyGroup[] {
  const groups = new Map<string, BodyGroup>()
  for (const body of bodies) {
    const key = body.municipality?.slug ?? 'parish'
    const group = groups.get(key) ?? {
      key,
      name: body.municipality?.name ?? 'Parish-wide',
      bodies: [],
    }
    group.bodies.push(body)
    groups.set(key, group)
  }
  return [...groups.values()].sort((left, right) =>
    left.key === 'parish' ? 1 : right.key === 'parish' ? -1 : left.name.localeCompare(right.name),
  )
}

export function toAreaRecords(
  coverage: CoverageArea[] | undefined,
): AreaRecord[] {
  const statusBySlug = new Map(
    coverage?.map((area) => [area.slug, area.status] as const) ?? [],
  )
  return AREA_FIXTURES.map((area) => {
    const status = statusBySlug.get(area.slug) ?? 'validating'
    return {
      ...area,
      status,
      note:
        status === 'available'
          ? 'Every launch body in this parish passed the publication and coverage gates.'
          : status === 'limited'
            ? 'Published records are available. Coverage is incomplete or updates are paused; newer decisions may be missing.'
            : 'This area opens after every launch body passes the same evidence gate.',
    }
  })
}
