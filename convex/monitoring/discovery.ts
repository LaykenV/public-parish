import { isLafayetteEventAttachment } from './lafayette'
import { isPinevilleListing } from './pineville'

export function officialMeetingDate(raw: string): string | undefined {
  let url: URL
  try { url = new URL(raw) } catch { return undefined }
  if (url.protocol !== 'https:' || url.hostname !== 'www.brla.gov' || url.port || url.username || url.password) return undefined
  const match = /^\/AgendaCenter\/ViewFile\/(?:Agenda|Minutes|ArchivedAgenda)\/_(\d{2})(\d{2})(20\d{2})-\d+\/?$/i.exec(url.pathname)
  if (!match) return undefined
  const date = `${match[3]}-${match[1]}-${match[2]}`
  const parsed = Date.parse(date)
  return Number.isFinite(parsed) && new Date(parsed).toISOString().slice(0, 10) === date ? date : undefined
}

/** Only official meeting-date paths or an explicit year can exclude an archive. */
export function isBeforeSourceWindow(raw: string, startsAt: number): boolean {
  const meetingDate = officialMeetingDate(raw)
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
