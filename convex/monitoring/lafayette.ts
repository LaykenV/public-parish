import { canonicalizeCandidateUrl } from '../coverage/candidates'
import { classifyHost } from '../coverage/rootGate'
import type { CoverageRootManifest } from '../coverage/roots'

// The official planning pages link this shared calendar. Only these five
// separately certified bodies use it; month listings never become evidence.
const bodySlugs: Record<string, string> = {
  'lafayette-city-planning-commission': 'city-planning-commission',
  'lafayette-parish-planning-commission': 'parish-planning-commission',
  'lafayette-city-zoning-commission': 'city-zoning-commission',
  'lafayette-board-of-zoning-adjustment': 'board-of-zoning-adjustment',
  'lafayette-hearing-examiner': 'hearing-examiner',
}
export function usesLafayetteEvents(bodyKey: string): boolean { return bodyKey in bodySlugs }

export function lafayetteCalendarUrls(bodyKey: string, startsAt: number, now: number): string[] {
  if (!usesLafayetteEvents(bodyKey)) return []
  const start = new Date(Math.max(startsAt, now - 366 * 86_400_000))
  const end = new Date(now)
  const urls: string[] = []
  for (let at = Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1); at <= Date.UTC(end.getUTCFullYear(), end.getUTCMonth() + 1, 1);) {
    const month = new Date(at)
    urls.push(`https://events.lafayettela.gov/default/Month?StartDate=${String(month.getUTCMonth() + 1).padStart(2, '0')}/01/${month.getUTCFullYear()}`)
    if (urls.length > 15) throw new Error('monitoring_calendar_capacity')
    at = Date.UTC(month.getUTCFullYear(), month.getUTCMonth() + 1, 1)
  }
  return urls.reverse()
}

export function isLafayetteEventAttachment(raw: string): boolean {
  const url = canonicalizeCandidateUrl(raw)
  if (!url) return false
  const parsed = new URL(url)
  return parsed.hostname === 'events.lafayettela.gov' && /^\/default\/Detail\/[^/]+\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(parsed.pathname)
}

export function matchesLafayetteBody(bodyKey: string, raw: string): boolean {
  if (!usesLafayetteEvents(bodyKey)) return true
  const url = canonicalizeCandidateUrl(raw)
  if (!url) return false
  const parsed = new URL(url)
  if (parsed.hostname !== 'events.lafayettela.gov') return true
  const slug = /^\/default\/Detail\/(\d{4}-\d{2}-\d{2}-\d{4}-.+?)(?:\/[a-f0-9-]{36})?$/i.exec(parsed.pathname)?.[1]
  return Boolean(slug?.toLowerCase().includes(bodySlugs[bodyKey]))
}

export function monitoringListingAllowed(manifest: CoverageRootManifest, raw: string, startsAt: number, now: number): boolean {
  const url = canonicalizeCandidateUrl(raw)
  if (!url) return false
  if (lafayetteCalendarUrls(manifest.bodyKey, startsAt, now).some(calendar => canonicalizeCandidateUrl(calendar) === url)) return true
  return classifyHost(manifest, url) !== 'unapproved' && matchesLafayetteBody(manifest.bodyKey, url)
}
