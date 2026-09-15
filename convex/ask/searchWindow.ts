export type SearchWindow = { field: 'meetingDate' | 'publishedAt'; from: number; to: number; fromDate: string; toDate: string }
const DAY = 86_400_000
const dateOf = (value: number) => new Date(value).toISOString().slice(0, 10)
function chicagoMidnight(date: string) {
  const utc = Date.parse(`${date}T00:00:00Z`)
  const hour = Number(new Intl.DateTimeFormat('en-US', { timeZone: 'America/Chicago', hour: '2-digit', hourCycle: 'h23' }).format(utc + 6 * 3_600_000))
  return utc + (6 - hour) * 3_600_000
}

// Restrict only explicit meeting-calendar or app-publication questions. "What
// decisions changed this week?" is ambiguous about government vs import dates,
// so it continues to inspect the complete compact catalog.
export function chooseSearchWindow(question: string, questionDate: string, hasPrior = false): SearchWindow | undefined {
  if (hasPrior || !/^\d{4}-\d{2}-\d{2}$/.test(questionDate)) return
  const text = question.toLowerCase().trim()
  if (/\b(and|or|compare|versus|before|after|since|history|earlier|previous)\b|\d/.test(text)) return
  const periods = [...text.matchAll(/\b(this week|last week|today|yesterday|this month|last month)\b/g)]
  if (periods.length !== 1) return
  const field = /^(?:what|which) meetings? (?:are|were|is|was) (?:scheduled|held|happening|taking place) (?:this week|last week|today|yesterday|this month|last month)[?.!]*$/.test(text)
    ? 'meetingDate' : /^(?:what|which) (?:records?|decisions?) (?:were|was|have been) (?:published|imported|added to (?:public parish|this site)) (?:this week|last week|today|yesterday|this month|last month)[?.!]*$/.test(text) ? 'publishedAt' : null
  if (!field) return
  let from = Date.parse(`${questionDate}T00:00:00Z`)
  if (!Number.isFinite(from)) return
  let to = from + DAY
  const period = periods[0][0]
  if (period.includes('week')) {
    from -= ((new Date(from).getUTCDay() + 6) % 7) * DAY
    if (period === 'last week') from -= 7 * DAY
    to = from + 7 * DAY
  } else if (period.includes('month')) {
    const date = new Date(from)
    from = Date.UTC(date.getUTCFullYear(), date.getUTCMonth() - (period === 'last month' ? 1 : 0), 1)
    const first = new Date(from)
    to = Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 1)
  } else if (period === 'yesterday') { from -= DAY; to -= DAY }
  const fromDate = dateOf(from)
  const endDate = dateOf(to)
  return { field, from: field === 'meetingDate' ? from : chicagoMidnight(fromDate), to: chicagoMidnight(endDate), fromDate, toDate: dateOf(to - DAY) }
}
