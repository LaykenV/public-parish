export type AreaSlug =
  'lafayette-parish' | 'east-baton-rouge-parish' | 'rapides-parish'

export type AreaStatus = 'available' | 'limited' | 'validating'

export type AreaRecord = {
  name: string
  slug: AreaSlug
  status: AreaStatus
  note?: string
}

export type LifecycleState =
  | 'Developing'
  | 'Scheduled'
  | 'In progress'
  | 'Postponed'
  | 'Decided'
  | 'Canceled'
  | 'Completed'
  | 'Status not stated'

export type EvidenceStatus =
  | 'Evidence available'
  | 'Limited information'
  | 'Source delayed'
  | 'Outcome not posted'

export type IssueCardData = {
  body: string
  evidence: {
    checked: string
    note?: string
    status: EvidenceStatus
  }
  latestOutcome?: {
    date: string
    label: string
  }
  nextDate?: {
    date: string
    label: string
  }
  place: string
  placeSlug: AreaSlug
  href?: string
  primaryActionLabel?: string
  showSecondaryActions?: boolean
  slug: string
  state: LifecycleState
  title: string
  topics: string[]
  whyMatter?: string
}

export type UpcomingItemData = {
  body: string
  date: string
  detail: string
  href: string
  kind: 'meeting' | 'issue'
  place: string
  placeSlug: AreaSlug
  title: string
}

export type UpdateKind =
  | 'Government update'
  | 'More information posted'
  | 'Public Parish correction'
  | 'Outcome'

export type UpdateEntryData = {
  date: string
  issueSlug?: string
  issueTitle?: string
  kind: UpdateKind
  text: string
}

export type ResultRowData = {
  summary?: string
  checked?: string
  reviewedThrough?: string
  topics?: string[]
  image?: { url: string; alt: string }
  body?: string
  coverage?: 'Supported' | 'Validating sources'
  date?: string
  href: string
  id?: string
  kind:
    | 'Story'
    | 'Decision record'
    | 'Meeting'
    | 'Government body'
    | 'Routine record'
  meta?: string
  place?: string
  sourceStatus?: EvidenceStatus
  state?: LifecycleState
  title: string
}

export type ExploreSearch = {
  body?: string
  date?: string
  fixture?: ExploreScenario
  lifecycle?: string
  place?: string
  q?: string
  sort?: 'newest' | 'oldest'
  source?: string
  topic?: string
  type?: string
}

export type HomeScenario =
  'no-issues' | 'degraded' | 'signed-in' | 'section-failure' | 'update'

export type ExploreScenario = 'no-results' | 'section-failure' | 'update'

// Hero design candidates under owner review. Home keeps the current hero
// unless a candidate is named in the URL.
export type HeroVariant = 'plinth' | 'horizon' | 'record'

export const HERO_VARIANTS: readonly HeroVariant[] = [
  'plinth',
  'horizon',
  'record',
]

export const HOME_SCENARIOS: readonly HomeScenario[] = [
  'no-issues',
  'degraded',
  'signed-in',
  'section-failure',
  'update',
]

export const EXPLORE_SCENARIOS: readonly ExploreScenario[] = [
  'no-results',
  'section-failure',
  'update',
]

export const TOPIC_OPTIONS = [
  'Public money',
  'Public assets',
  'Public safety',
  'Housing',
  'Drainage',
] as const

export const DATE_OPTIONS = [
  { label: 'Any time', value: '' },
  { label: 'Next 30 days', value: 'next-30' },
  { label: 'Past 30 days', value: 'past-30' },
  { label: 'Past year', value: 'past-year' },
] as const

// Public body labels, grouped by place. They mirror `convex/coverage/labels.ts`.
export const BODY_GROUPS = [
  {
    place: 'Lafayette Parish',
    slug: 'lafayette-parish',
    bodies: [
      'Lafayette City Council',
      'Lafayette City Planning Commission',
      'Lafayette Parish Planning Commission',
      'Lafayette City Zoning Commission',
      'Lafayette Board of Zoning Adjustment',
      'Lafayette Hearing Examiner',
      'Youngsville City Council',
    ],
  },
  {
    place: 'Rapides Parish',
    slug: 'rapides-parish',
    bodies: [
      'Rapides Parish Police Jury',
      'Alexandria City Council',
      'Pineville City Council',
    ],
  },
  {
    place: 'East Baton Rouge Parish',
    slug: 'east-baton-rouge-parish',
    bodies: [
      'Baton Rouge Metropolitan Council',
      'East Baton Rouge Planning and Zoning Commission',
    ],
  },
] as const

export const BODY_OPTIONS = BODY_GROUPS.flatMap((group) => group.bodies)

// Keep older public links and development fixtures readable. The backend maps
// identity names to their public labels.
export const LEGACY_BODY_OPTIONS = [
  'Lafayette City-Parish Council',
  'City Zoning Commission',
  'Hearing Examiner',
  'Metropolitan Council',
  'Planning and Zoning Commission',
] as const

export const LIFECYCLE_OPTIONS = [
  'Scheduled',
  'In progress',
  'Postponed',
  'Decided',
] as const

export const SOURCE_OPTIONS = [
  'Evidence available',
  'Limited information',
  'Source delayed',
] as const

export const TYPE_OPTIONS = [
  { label: 'Stories', value: 'story' },
  { label: 'Issues', value: 'issue' },
  { label: 'Decision records', value: 'decision' },
  { label: 'Meetings', value: 'meeting' },
  { label: 'Government bodies', value: 'body' },
] as const

export const PLACE_OPTIONS = [
  { label: 'All places', value: '' },
  { label: 'Lafayette Parish', value: 'Lafayette Parish' },
  { label: 'East Baton Rouge Parish', value: 'East Baton Rouge Parish' },
  { label: 'Rapides Parish', value: 'Rapides Parish' },
] as const

export const SORT_OPTIONS = [
  { label: 'Newest first', value: 'newest' },
  { label: 'Oldest first', value: 'oldest' },
] as const

// A missing stored area means the statewide Louisiana view, not an unfinished setup.
export function focusName(slug: AreaSlug | null): string {
  return slug ? areaName(slug) : 'Louisiana'
}

export function areaName(slug: AreaSlug): string {
  switch (slug) {
    case 'lafayette-parish':
      return 'Lafayette Parish'
    case 'east-baton-rouge-parish':
      return 'East Baton Rouge Parish'
    case 'rapides-parish':
      return 'Rapides Parish'
  }
}

export function isDiscoveryFixtureEnabled(
  scenario: string | undefined,
): boolean {
  return import.meta.env.DEV && scenario !== undefined
}

export function getActiveDiscoveryFixture<T extends string>(
  scenario: T | undefined,
): T | undefined {
  return isDiscoveryFixtureEnabled(scenario) ? scenario : undefined
}

function pick<T extends string>(
  value: unknown,
  allowed: readonly T[],
): T | undefined {
  return typeof value === 'string' &&
    (allowed as readonly string[]).includes(value)
    ? (value as T)
    : undefined
}

function pickText(value: unknown): string | undefined {
  const text = typeof value === 'string' ? value.trim() : ''
  return text.length > 0 ? text : undefined
}

export const HOME_CITIES = {
  lafayette: { name: 'Lafayette', area: 'lafayette-parish' },
  youngsville: { name: 'Youngsville', area: 'lafayette-parish' },
  alexandria: { name: 'Alexandria', area: 'rapides-parish' },
  pineville: { name: 'Pineville', area: 'rapides-parish' },
  'baton-rouge': { name: 'Baton Rouge', area: 'east-baton-rouge-parish' },
} as const
export type HomeCity = keyof typeof HOME_CITIES
export type HomeSearch = {
  area?: AreaSlug | 'louisiana'
  city?: HomeCity
  body?: string
  bodies?: string[]
  fixture?: HomeScenario
  hero?: HeroVariant
}

// Keep single-body links readable; multi-select uses a bounded list of labels.
export function parseHomeSearch(search: Record<string, unknown>): HomeSearch {
  return {
    area: pick(search.area, [
      'louisiana',
      'lafayette-parish',
      'rapides-parish',
      'east-baton-rouge-parish',
    ]),
    city: pick(search.city, Object.keys(HOME_CITIES) as HomeCity[]),
    body: pick(search.body, [...BODY_OPTIONS, ...LEGACY_BODY_OPTIONS]),
    bodies: parseHomeBodies(search.bodies),
    fixture: pick(search.fixture, HOME_SCENARIOS),
    hero: pick(search.hero, HERO_VARIANTS),
  }
}

function parseHomeBodies(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined
  const labels = [...new Set(value.slice(0, 25)
    .map((entry) => pick(entry, [...BODY_OPTIONS, ...LEGACY_BODY_OPTIONS]))
    .filter((entry) => entry !== undefined)
    .map(homeBodyLabel))]
  return labels.length ? labels : undefined
}

export function homeBodySelection(search: Pick<HomeSearch, 'body' | 'bodies'>, area: AreaSlug | null): string[] {
  const labels = search.bodies ?? (search.body ? [search.body] : [])
  const allowed: readonly string[] = BODY_GROUPS.find((group) => group.slug === area)?.bodies ?? []
  return [...new Set(labels.map(homeBodyLabel))].filter((label) => allowed.includes(label))
}

export function parseExploreSearch(
  search: Record<string, unknown>,
): ExploreSearch {
  return {
    body: pick(search.body, [...BODY_OPTIONS, ...LEGACY_BODY_OPTIONS]),
    date: pick(
      search.date,
      DATE_OPTIONS.map((option) => option.value).filter(
        Boolean,
      ) as unknown as readonly string[],
    ),
    fixture: pick(search.fixture, EXPLORE_SCENARIOS),
    lifecycle: pick(search.lifecycle, LIFECYCLE_OPTIONS),
    place: pick(
      search.place,
      PLACE_OPTIONS.map((option) => option.value).filter(
        Boolean,
      ) as unknown as readonly string[],
    ),
    q: pickText(search.q)?.slice(0, 300),
    sort: pick(search.sort, ['newest', 'oldest'] as const),
    source: pick(search.source, SOURCE_OPTIONS),
    topic: pick(search.topic, TOPIC_OPTIONS),
    type: pick(
      search.type,
      TYPE_OPTIONS.map(
        (option) => option.value,
      ) as unknown as readonly string[],
    ),
  }
}

// The URL determines shared focus. Stored preferences apply only without one.
export function homeFocusArea(
  search: HomeSearch,
  stored: AreaSlug | null,
): AreaSlug | null {
  const firstBody = search.bodies?.[0] ?? search.body
  if (firstBody) {
    const label = homeBodyLabel(firstBody)
    const group = BODY_GROUPS.find((item) =>
      (item.bodies as readonly string[]).includes(label),
    )
    if (group) return group.slug
  }
  if (search.city) return HOME_CITIES[search.city].area
  if (search.area) return search.area === 'louisiana' ? null : search.area
  return stored
}

export function homeBodyLabel(body: string): string {
  const aliases: Record<string, string> = {
    'Metropolitan Council': 'Baton Rouge Metropolitan Council',
    'Planning and Zoning Commission':
      'East Baton Rouge Planning and Zoning Commission',
    'City Zoning Commission': 'Lafayette City Zoning Commission',
    'Hearing Examiner': 'Lafayette Hearing Examiner',
    'Lafayette City-Parish Council': 'Lafayette City Council',
  }
  return aliases[body] ?? body
}
