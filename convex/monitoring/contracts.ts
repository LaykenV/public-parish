import { v } from 'convex/values'

import { normalizeForMatch } from '../extraction/textMatch'
import { sourceKindUnion } from '../pipeline/state'

export const MONITOR_VERSION = 'monitor-v2'
export const DAY_MS = 86_400_000
export const INVENTORY_CHARS = 45_000
export const MAX_DOCUMENT_CHARS = 450_000
export const MAX_TARGETS_PER_CHUNK = 100
export const monitorState = v.union(
  v.literal('running'), v.literal('completed'), v.literal('incomplete'),
  v.literal('stopped'), v.literal('failed'),
)
export const targetState = v.union(
  v.literal('pending'), v.literal('running'), v.literal('published'),
  v.literal('withheld'), v.literal('failed'), v.literal('not_found'),
)
export const inventoryTarget = v.object({
  printedId: v.union(v.string(), v.null()),
  title: v.string(),
  excerpt: v.string(),
})
export const inventoryResult = v.object({
  complete: v.boolean(),
  reason: v.optional(v.string()),
  bodyName: v.string(),
  sourceKind: sourceKindUnion,
  meetingDate: v.union(v.string(), v.null()),
  dateExcerpt: v.union(v.string(), v.null()),
  targets: v.array(inventoryTarget),
})
export type InventoryResult = typeof inventoryResult.type

export function inventoryContract(value: InventoryResult, source: string, bodyName: string, priorLocators: string[] = [], allowedSourceKinds?: string[], startsAt?: number): string | null {
  if (!value.complete) return `Document inventory is incomplete. ${value.reason ?? ''}`
  if (value.bodyName !== bodyName) return 'Inventory changed the government body.'
  if (value.targets.length && allowedSourceKinds && !allowedSourceKinds.includes(value.sourceKind)) return 'This source kind is outside the approved inventory scope. Preserve its actual source kind and return no targets for background documents; do not relabel them as agendas or minutes.'
  if (value.targets.length > MAX_TARGETS_PER_CHUNK) return 'Inventory target overflow.'
  if ((value.targets.length && !value.meetingDate) || (value.meetingDate !== null && (!/^\d{4}-\d{2}-\d{2}$/.test(value.meetingDate) || !Number.isFinite(Date.parse(value.meetingDate)) || new Date(value.meetingDate).toISOString().slice(0, 10) !== value.meetingDate))) {
    return 'Decision inventory needs a real source-backed meeting date in YYYY-MM-DD format. Normalize the printed date into that format and keep its exact original text in dateExcerpt. Use null only for an empty inventory when no meeting date is established.'
  }
  const normalized = normalizeForMatch(source)
  if (value.meetingDate && (!value.dateExcerpt || !normalized.includes(normalizeForMatch(value.dateExcerpt)))) return 'Inventory date citation does not resolve.'
  if (startsAt !== undefined && value.meetingDate && allowedSourceKinds?.includes(value.sourceKind) && isBeforeMeetingWindow(value.meetingDate, startsAt) && !hasHeaderMeetingDate(value, source)) return 'Excluding an old meeting requires its exact date excerpt in the first 2000 source characters, with a printed date matching meetingDate. Do not use a date from referenced older business.'
  const identities = new Set<string>()
  for (const target of value.targets) {
    if (!target.title.trim() || target.title.length > 300 || target.excerpt.length > 240 || !target.excerpt.trim() || !normalized.includes(normalizeForMatch(target.excerpt))) return `Inventory target citation does not resolve for ${JSON.stringify(target.title.slice(0, 120))}. Copy a contiguous source excerpt at most 240 characters, without omissions or ellipses. Rejected excerpt: ${JSON.stringify(target.excerpt.slice(0, 240))}`
    if (target.printedId !== null && (!target.printedId.trim() || target.printedId.length > 100 || /[\r\n]/.test(target.printedId) || !normalizeForMatch(target.excerpt).includes(normalizeForMatch(target.printedId)))) return `Printed identifier ${JSON.stringify(target.printedId)} is not in its cited item. Use null when the chosen excerpt does not contain the complete printed identifier, or choose a contiguous excerpt that includes it. Never reconstruct the identifier.`
    const locator = normalizeForMatch(target.excerpt)
    if (priorLocators.some(prior => { const accepted = normalizeForMatch(prior); return accepted.includes(locator) || locator.includes(accepted) })) return 'Inventory repeats an already accepted target from a previous section. Return only new decisions; previous targets count toward completeness.'
    const identity = target.printedId ?? target.title
    if (identities.has(identity)) return 'Inventory contains ambiguous duplicate targets.'
    identities.add(identity)
  }
  return null
}

export const inventoryJsonSchema = {
  type: 'object', additionalProperties: false,
  required: ['complete', 'reason', 'bodyName', 'sourceKind', 'meetingDate', 'dateExcerpt', 'targets'],
  properties: {
    complete: { type: 'boolean' }, reason: { type: 'string', maxLength: 500 }, bodyName: { type: 'string' },
    sourceKind: { type: 'string', enum: ['agenda', 'minutes', 'ordinance', 'resolution', 'notice', 'calendar', 'packet', 'planning_case', 'other'] },
    meetingDate: { type: ['string', 'null'], pattern: '^\\d{4}-\\d{2}-\\d{2}$', description: 'The source-backed meeting date normalized as YYYY-MM-DD. Preserve the original printed date in dateExcerpt. Null is allowed when no meeting date is established for an empty inventory.' }, dateExcerpt: { type: ['string', 'null'] },
    targets: { type: 'array', items: { type: 'object', additionalProperties: false,
      required: ['printedId', 'title', 'excerpt'], properties: {
        printedId: { type: ['string', 'null'], maxLength: 100 }, title: { type: 'string', maxLength: 300 }, excerpt: { type: 'string', maxLength: 240 },
      } } },
  },
}

export function inventoryIdentity(date: string, target: typeof inventoryTarget.type): { key: string; sourcePrinted: boolean } {
  const sourcePrinted = target.printedId !== null && /(?:19|20)\d{2}/.test(target.printedId)
  // Local item numbers can move when an agenda is revised. Only a printed
  // year-bearing identifier can bridge changed text; other locators stay separate.
  return { key: sourcePrinted ? target.printedId! : `${date}:${normalizeForMatch(target.excerpt)}`, sourcePrinted }
}

export function inventorySourceSection(text: string, chunk: number): { source: string; dateAndBodyContext: string | undefined } {
  const sectionStart = Math.max(0, chunk * INVENTORY_CHARS - 2_000)
  const paragraphStart = text.lastIndexOf('\n\n', sectionStart)
  return {
    source: text.slice(paragraphStart >= sectionStart - 3_000 ? Math.max(0, paragraphStart) : sectionStart, (chunk + 1) * INVENTORY_CHARS + 2_000),
    dateAndBodyContext: chunk > 0 ? text.slice(0, 1_000) : undefined,
  }
}


export function isBeforeMeetingWindow(meetingDate: string, startsAt: number): boolean {
  // Official meeting dates have day precision, including the owner's first day.
  return Date.parse(meetingDate) < new Date(startsAt).setUTCHours(0, 0, 0, 0)
}


export function hasHeaderMeetingDate(value: Pick<InventoryResult, 'meetingDate' | 'dateExcerpt'>, source: string): boolean {
  if (!value.meetingDate || !value.dateExcerpt || !normalizeForMatch(source.slice(0, 2000)).includes(normalizeForMatch(value.dateExcerpt))) return false
  const excerpt = value.dateExcerpt
  const dates = [...excerpt.matchAll(/\b(20\d{2})-(\d{2})-(\d{2})\b/g)].map(match => `${match[1]}-${match[2]}-${match[3]}`)
  for (const match of excerpt.matchAll(/\b(\d{1,2})\/(\d{1,2})\/(20\d{2})\b/g)) dates.push(`${match[3]}-${match[1].padStart(2, '0')}-${match[2].padStart(2, '0')}`)
  const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
  for (const match of excerpt.matchAll(/\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2})(?:st|nd|rd|th)?[,]?\s+(20\d{2})\b/gi)) dates.push(`${match[3]}-${String(months.indexOf(match[1].toLowerCase()) + 1).padStart(2, '0')}-${match[2].padStart(2, '0')}`)
  return dates.includes(value.meetingDate)
}
