const DATE_FORMAT = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'short',
  timeZone: 'America/Chicago',
  year: 'numeric',
})

const DAY_FORMAT = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'short',
  timeZone: 'America/Chicago',
})

const TIME_FORMAT = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: '2-digit',
  timeZone: 'America/Chicago',
  timeZoneName: 'short',
})

function parseDate(value: string): Date | null {
  // Evidence can retain the source's printed date, such as "at Noon".
  // Format ISO values only; leave other wording intact instead of guessing.
  if (!/^\d{4}-\d{2}-\d{2}(?:T|$)/.test(value)) return null
  const withTime = value.includes('T') ? value : `${value}T12:00:00-06:00`
  const date = new Date(withTime)
  return Number.isFinite(date.getTime()) ? date : null
}

function formatValue(value: string, formatter: Intl.DateTimeFormat): string {
  const date = parseDate(value)
  return date ? formatter.format(date) : value.trim() || 'Date not stated'
}

export function formatDate(iso: string): string {
  return formatValue(iso, DATE_FORMAT)
}

export function formatDay(iso: string): string {
  return formatValue(iso, DAY_FORMAT)
}

export function formatTime(iso: string): string {
  return formatValue(iso, TIME_FORMAT)
}
