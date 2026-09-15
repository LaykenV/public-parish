// Deterministic Home ordering for published issue timelines. Inputs are facts
// already accepted on the current version; nothing here invents a date or a
// consequence. Explore keeps listing every accepted issue regardless.

export type HomeIssueSignals = {
  slug: string
  /** Cited importance points on the accepted version. */
  importanceScore: number
  /** Documented next action date, or null when none is cited. */
  nextAt: string | null
  /** Latest linked meeting date, or null. */
  latestMeetingAt: string | null
  /** When the accepted version was created. */
  acceptedAt: number
  /** True when at least one consequence factor is supported and still cited. */
  hasSupportedFactor: boolean
}

export const RECENT_OUTCOME_DAYS = 60
const UPCOMING_PRIORITY = 2
const RECENT_OUTCOME_PRIORITY = 1
const DAY = 86_400_000

/** Reads a client-supplied `YYYY-MM-DD` day; anything else means no clock. */
export function parseHomeDay(value: string | undefined): number | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const parsed = Date.parse(value)
  return Number.isNaN(parsed) ? null : parsed
}

export function homeEligible(signals: HomeIssueSignals): boolean {
  return signals.hasSupportedFactor || signals.nextAt !== null
}

/**
 * Reads the day out of a documented date. Accepted next actions keep the
 * source wording ("September 29, 2026, at Noon"), so the parser looks for an
 * ISO day or a "Month D, YYYY" phrase before giving up.
 */
export function documentedDay(value: string | null): number {
  if (!value) return Number.NaN
  const iso = /^\d{4}-\d{2}-\d{2}/.exec(value)
  if (iso) return Date.parse(iso[0])
  const phrase = /[A-Z][a-z]+\.? \d{1,2},? \d{4}/.exec(value)
  if (phrase) return Date.parse(`${phrase[0]} UTC`)
  return Number.NaN
}

export function homeRecencyPriority(signals: HomeIssueSignals, day: number | null): number {
  const next = documentedDay(signals.nextAt)
  if (!Number.isNaN(next) && (day === null || next >= day))
    return UPCOMING_PRIORITY
  const latest = documentedDay(signals.latestMeetingAt)
  if (
    !Number.isNaN(latest) &&
    (day === null || (latest <= day && latest >= day - RECENT_OUTCOME_DAYS * DAY))
  ) {
    return RECENT_OUTCOME_PRIORITY
  }
  return 0
}

export function compareHomeIssues(day: number | null) {
  return (left: HomeIssueSignals, right: HomeIssueSignals): number =>
    right.importanceScore - left.importanceScore ||
    homeRecencyPriority(right, day) - homeRecencyPriority(left, day) ||
    right.acceptedAt - left.acceptedAt ||
    left.slug.localeCompare(right.slug)
}

export function rankHomeIssues<T extends HomeIssueSignals>(
  issues: T[],
  day: number | null,
): T[] {
  return issues.filter(homeEligible).sort(compareHomeIssues(day))
}
