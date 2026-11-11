import { isLafayetteEventAttachment } from './lafayette'
import { isPinevilleListing } from './pineville'

const BRLA_FILE = /^\/AgendaCenter\/ViewFile\/(?:Agenda|Minutes|ArchivedAgenda|ArchivedMinutes)\/_(\d{2})(\d{2})(20\d{2})-\d+\/?$/i
// The Agenda Center links each meeting's version history as a listing page,
// for example /AgendaCenter/PreviousVersions/_01052026-2284.
const BRLA_PREVIOUS_VERSIONS = /^\/AgendaCenter\/PreviousVersions\/_(\d{2})(\d{2})(20\d{2})-\d+\/?$/i

export function officialMeetingDate(raw: string): string | undefined {
  return meetingDateFromPath(raw, BRLA_FILE)
}

function meetingDateFromPath(raw: string, brlaPath: RegExp): string | undefined {
  let url: URL
  try { url = new URL(raw) } catch { return undefined }
  if (url.protocol !== 'https:' || url.port || url.username || url.password) return undefined
  let date: string | undefined
  if (url.hostname === 'www.brla.gov') {
    const match = brlaPath.exec(url.pathname)
    if (match) date = `${match[3]}-${match[1]}-${match[2]}`
  } else if (isLafayetteEventAttachment(raw)) {
    date = /^\/default\/Detail\/(20\d{2}-\d{2}-\d{2})-\d{4}-/i.exec(url.pathname)?.[1]
  }
  if (!date) return undefined
  const parsed = Date.parse(date)
  return Number.isFinite(parsed) && new Date(parsed).toISOString().slice(0, 10) === date ? date : undefined
}

/** Only official meeting-date paths or an explicit year can exclude an archive. */
export function isBeforeSourceWindow(raw: string, startsAt: number): boolean {
  // A version-history page dates a listing, not a document, so it never sets
  // a document's sourceMeetingDate.
  const meetingDate = officialMeetingDate(raw) ?? meetingDateFromPath(raw, BRLA_PREVIOUS_VERSIONS)
  if (meetingDate) return meetingDate < new Date(startsAt).toISOString().slice(0, 10)
  let path: string
  try { path = new URL(raw).pathname } catch { return true }
  const years = [...path.matchAll(/(?:^|[/_-])(20\d{2})(?=[/_.-]|$)/g)].map(match => Number(match[1]))
  return years.length > 0 && Math.max(...years) < new Date(startsAt).getUTCFullYear()
}
export function isDocumentUrl(url: string): boolean {
  if (isPinevilleListing(url)) return false
  return isLafayetteEventAttachment(url) || /(?:\.(?:pdf|docx)(?:\?|$)|ViewFile|munidocDownload|\/Document\/|adaHtmlDocument)/i.test(url)
}
