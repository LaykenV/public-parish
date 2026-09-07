import schema from '../../docs/story-manifests/import-contract-v1.json'
import type { StoryManifest } from './manifestTypes'

export const STORY_CONTRACT_VERSION = '1.0.0'
export const MAX_MANIFEST_BYTES = 250_000
export const LAUNCH_STORIES = {
  'meta-richland': { rank: 0, placement: 'lead', parish: 'Richland Parish' },
  'spacex-pecan-island': { rank: 1, placement: 'secondary', parish: 'Vermilion Parish' },
  'applied-digital-boyce': { rank: 2, placement: 'secondary', parish: 'Rapides Parish' },
} as const

type JsonRule = {
  type?: string | string[]
  const?: unknown
  enum?: unknown[]
  anyOf?: JsonRule[]
  properties?: Record<string, JsonRule>
  required?: string[]
  additionalProperties?: boolean
  items?: JsonRule
  maxItems?: number
  maxLength?: number
  minimum?: number
  maximum?: number
  pattern?: string
}

// This evaluator covers every keyword used by the frozen import schema.
// It validates research only. Official identity, bytes, and publication need
// separate server checks; passing this function is never acceptance.
function checkShape(value: unknown, rule: JsonRule, path: string): void {
  if ('const' in rule && value !== rule.const) throw new Error(`${path}: unsupported value`)
  if (rule.enum && !rule.enum.includes(value)) throw new Error(`${path}: unsupported value`)
  if (rule.anyOf) {
    for (const option of rule.anyOf) {
      try { checkShape(value, option, path); return } catch { /* Try the next union member. */ }
    }
    throw new Error(`${path}: invalid union value`)
  }
  if (rule.type) {
    const types = Array.isArray(rule.type) ? rule.type : [rule.type]
    const actual = value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value
    if (!types.includes(actual) && !(types.includes('integer') && Number.isInteger(value))) {
      throw new Error(`${path}: invalid type`)
    }
  }
  if (typeof value === 'number') {
    if (!Number.isFinite(value) || (rule.minimum !== undefined && value < rule.minimum) ||
      (rule.maximum !== undefined && value > rule.maximum)) throw new Error(`${path}: number out of bounds`)
  }
  if (typeof value === 'string') {
    if ((rule.maxLength !== undefined && value.length > rule.maxLength) ||
      (rule.pattern && !new RegExp(rule.pattern).test(value))) throw new Error(`${path}: invalid string`)
  }
  if (Array.isArray(value)) {
    if (rule.maxItems !== undefined && value.length > rule.maxItems) throw new Error(`${path}: too many entries`)
    if (rule.items) value.forEach((item, index) => checkShape(item, rule.items!, `${path}/${index}`))
  } else if (value !== null && typeof value === 'object') {
    const object = value as Record<string, unknown>
    for (const key of rule.required ?? []) {
      if (!Object.prototype.hasOwnProperty.call(object, key)) throw new Error(`${path}/${key}: required`)
    }
    for (const [key, item] of Object.entries(object)) {
      const child = Object.prototype.hasOwnProperty.call(rule.properties ?? {}, key) ? rule.properties?.[key] : undefined
      if (!child && rule.additionalProperties === false) throw new Error(`${path}/${key}: unknown field`)
      if (child) checkShape(item, child, `${path}/${key}`)
    }
  }
}

function unique(keys: string[], label: string) {
  if (new Set(keys).size !== keys.length) throw new Error(`${label}: duplicate stable key`)
}

function https(value: string) {
  const url = new URL(value)
  if (url.protocol !== 'https:' || url.username || url.password || url.hash || (url.port && url.port !== '443')) {
    throw new Error('Source URLs must use HTTPS without credentials, fragments, or custom ports')
  }
}

function date(value: string | null, precision: string) {
  if (precision === 'unknown') {
    if (value !== null) throw new Error('Unknown dates must be null')
    return
  }
  const pattern = precision === 'day' ? /^\d{4}-\d{2}-\d{2}$/ : precision === 'month' ? /^\d{4}-\d{2}$/ : /^\d{4}$/
  if (value === null || !pattern.test(value)) throw new Error('Date precision mismatch')
  const expanded = precision === 'day' ? value : precision === 'month' ? `${value}-01` : `${value}-01-01`
  const parsed = new Date(`${expanded}T00:00:00Z`)
  if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== expanded) throw new Error('Invalid calendar date')
}

export function parseStoryManifest(json: string): StoryManifest {
  if (new TextEncoder().encode(json).byteLength > MAX_MANIFEST_BYTES) throw new Error('Manifest exceeds 250000 bytes')
  const value: unknown = JSON.parse(json)
  checkShape(value, schema, 'manifest')
  const manifest = value as StoryManifest
  const expected = LAUNCH_STORIES[manifest.story.storyKey]
  if (manifest.story.slug !== manifest.story.storyKey || manifest.story.rank !== expected.rank ||
    manifest.story.placement !== expected.placement ||
    !manifest.story.geography.some(place => place.parish === expected.parish)) {
    throw new Error('Launch story identity, geography, or placement mismatch')
  }
  const sources = new Map(manifest.sources.map(source => [source.sourceKey, source]))
  unique(manifest.sources.map(source => source.sourceKey), 'sources')
  unique(manifest.research.claims.map(claim => claim.claimKey), 'claims')
  unique(manifest.research.relationships.map(link => link.relationshipKey), 'relationships')
  unique(manifest.research.timeline.map(event => event.eventKey), 'timeline')
  unique(manifest.media.map(media => media.mediaKey), 'media')
  const claims = new Set(manifest.research.claims.map(claim => claim.claimKey))
  const checkClaims = (keys: string[]) => {
    unique(keys, 'claim references')
    if (keys.some(key => !claims.has(key))) throw new Error('Unknown claim reference')
  }
  const checkSpan = (span: StoryManifest['research']['claims'][number]['supports'][number]) => {
    const source = sources.get(span.sourceKey)
    if (!source || source.normalizedArtifact.sha256 !== span.normalizedSha256) throw new Error('Unknown source or mismatched span hash')
    if (!span.excerpt.trim() || span.end <= span.start || span.end - span.start !== span.excerpt.length) throw new Error('Invalid exact span bounds')
    if (span.page !== null && !source.retrieval.pageMap.some(page => page.page === span.page && page.start <= span.start && page.end >= span.end)) {
      throw new Error('Citation page is not proven by the supplied page map')
    }
  }
  for (const source of manifest.sources) {
    https(source.url); https(source.finalUrl)
    source.retrieval.redirectChain.forEach(https)
    date(source.documentDate, source.datePrecision)
    if (!Number.isFinite(Date.parse(source.retrieval.retrievedAt))) throw new Error('Invalid retrieval timestamp')
    unique(source.retrieval.pageMap.map(page => String(page.page)), 'page map')
    for (const page of source.retrieval.pageMap) if (page.end <= page.start) throw new Error('Invalid page bounds')
    for (const reference of source.existingPublicationReferences) {
      if (reference.sourceHash !== source.rawArtifact.sha256) throw new Error('Publication hint source hash mismatch')
    }
  }
  for (const claim of manifest.research.claims) {
    if (!claim.text.trim() || !claim.supports.length) throw new Error('Proposed claims require text and source spans')
    claim.supports.forEach(checkSpan)
  }
  for (const link of manifest.research.relationships) {
    if (!sources.has(link.fromSourceKey) || !sources.has(link.toSourceKey) || !link.supports.length) throw new Error('Relationship requires sources and evidence')
    link.supports.forEach(checkSpan)
  }
  for (const event of manifest.research.timeline) { date(event.date, event.datePrecision); checkClaims(event.claimKeys) }
  checkClaims(manifest.research.nextActionClaimKeys)
  for (const question of manifest.research.supportedQuestions) {
    if (!question.claimKeys.length) throw new Error('Supported questions require claims')
    checkClaims(question.claimKeys)
  }
  for (const media of manifest.media) { https(media.originalUrl); checkClaims(media.captionClaimKeys) }
  for (const retrieval of manifest.additionalRetrieval) { https(retrieval.url); checkClaims(retrieval.requiredForClaimKeys) }
  date(manifest.research.reviewedThrough, 'day'); date(manifest.research.nextReviewAt, 'day')
  if (manifest.research.nextReviewAt <= manifest.research.reviewedThrough) throw new Error('Next review must follow the reviewed-through date')
  return manifest
}

export function researchBlockers(manifest: StoryManifest): string[] {
  const blockers = ['Independent source verification, model review, and exact-version owner approval are required.']
  if (manifest.purpose === 'fixture') blockers.push('Fixtures cannot be published.')
  if (!manifest.sources.length || !manifest.research.claims.length) blockers.push('Evidence and supported claims are missing.')
  for (const source of manifest.sources) {
    if (source.retrieval.completeness !== 'complete') blockers.push(`${source.sourceKey}: complete artifact required.`)
    if (source.retrieval.method === 'manual_file' && source.retrieval.failureEvidence.length < 2) blockers.push(`${source.sourceKey}: repeated retrieval failure documentation required.`)
  }
  if (!manifest.media.length) blockers.push('An approved story image is missing.')
  for (const media of manifest.media) if (media.permission.status === 'unresolved') blockers.push(`${media.mediaKey}: image permission unresolved.`)
  return blockers
}
