import { listRootManifests } from './roots'

export type BodyMunicipality = { slug: string; name: string }

export type PublicBodyLabel = {
  displayName: string
  municipality?: BodyMunicipality
}

const LAFAYETTE: BodyMunicipality = { slug: 'lafayette', name: 'Lafayette' }
const YOUNGSVILLE: BodyMunicipality = {
  slug: 'youngsville',
  name: 'Youngsville',
}
const ALEXANDRIA: BodyMunicipality = { slug: 'alexandria', name: 'Alexandria' }
const PINEVILLE: BodyMunicipality = { slug: 'pineville', name: 'Pineville' }
const BATON_ROUGE: BodyMunicipality = {
  slug: 'baton-rouge',
  name: 'Baton Rouge',
}

/**
 * Public labels keyed by body slug. `governmentBodies.name` stays the identity
 * the manifests, certification artifacts and story sources compare against;
 * this map only decides what residents read. Every label names its place.
 */
export const PUBLIC_BODY_LABELS: Partial<Record<string, PublicBodyLabel>> = {
  'lafayette-city-council': {
    displayName: 'Lafayette City Council',
    municipality: LAFAYETTE,
  },
  'lafayette-city-planning-commission': {
    displayName: 'Lafayette City Planning Commission',
    municipality: LAFAYETTE,
  },
  'lafayette-parish-planning-commission': {
    displayName: 'Lafayette Parish Planning Commission',
  },
  'lafayette-city-zoning-commission': {
    displayName: 'Lafayette City Zoning Commission',
    municipality: LAFAYETTE,
  },
  'lafayette-board-of-zoning-adjustment': {
    displayName: 'Lafayette Board of Zoning Adjustment',
  },
  'lafayette-hearing-examiner': { displayName: 'Lafayette Hearing Examiner' },
  'youngsville-city-council': {
    displayName: 'Youngsville City Council',
    municipality: YOUNGSVILLE,
  },
  'alexandria-city-council': {
    displayName: 'Alexandria City Council',
    municipality: ALEXANDRIA,
  },
  'pineville-city-council': {
    displayName: 'Pineville City Council',
    municipality: PINEVILLE,
  },
  'rapides-parish-police-jury': { displayName: 'Rapides Parish Police Jury' },
  'ebr-metropolitan-council': {
    displayName: 'Baton Rouge Metropolitan Council',
    municipality: BATON_ROUGE,
  },
  'baton-rouge-planning-commission': {
    displayName: 'East Baton Rouge Planning and Zoning Commission',
  },
}

type LabeledBody = { slug: string; name: string; displayName?: string }

/** The label residents read for a body. Never use this for identity checks. */
export function publicBodyLabel(body: LabeledBody): string {
  return (
    body.displayName ?? PUBLIC_BODY_LABELS[body.slug]?.displayName ?? body.name
  )
}

/** Fields the launch seed and coverage promotion store on a body. */
export function publicBodyFields(slug: string): {
  displayName?: string
  municipality?: BodyMunicipality
} {
  const label = PUBLIC_BODY_LABELS[slug]
  if (!label) return {}
  return label.municipality
    ? { displayName: label.displayName, municipality: label.municipality }
    : { displayName: label.displayName }
}

/**
 * Explore links and search filters carry body labels. Older links still use the
 * identity name, so resolve either spelling to the current public label.
 */
export function resolvePublicBodyFilter(value: string): string {
  for (const manifest of listRootManifests()) {
    if (manifest.bodyName === value) {
      return PUBLIC_BODY_LABELS[manifest.bodyKey]?.displayName ?? value
    }
  }
  return value
}
