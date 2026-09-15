import { locateSourceExcerpt, normalizeForMatch } from '../extraction/textMatch'

// Hash verification happens on the complete stored document before this runs.
// Keep the document header and context around every occurrence of every cited
// excerpt. Highly repeated quotes or failed matching keep the complete source.
export function documentContext(text: string, excerpts: string[]) {
  if (text.length <= 16_000 || !excerpts.length) return { contextKind: 'full_document', text }
  const normalized = normalizeForMatch(text)
  const ranges: Array<{ start: number; end: number }> = [{ start: 0, end: Math.min(2_000, normalized.length) }]
  for (const excerpt of new Set(excerpts)) {
    const match = locateSourceExcerpt(text, excerpt, normalized)
    if (!match) return { contextKind: 'full_document', text }
    const needle = normalized.slice(match.startOffset, match.endOffset)
    let count = 0
    for (let found = normalized.indexOf(needle); found >= 0; found = normalized.indexOf(needle, found + needle.length)) {
      if (++count > 100) return { contextKind: 'full_document', text }
      ranges.push({ start: Math.max(0, found - 2_000), end: Math.min(normalized.length, found + needle.length + 2_000) })
    }
  }
  ranges.sort((a, b) => a.start - b.start)
  const merged: typeof ranges = []
  for (const range of ranges) {
    const previous = merged[merged.length - 1]
    if (merged.length > 0 && range.start <= previous.end) previous.end = Math.max(previous.end, range.end)
    else merged.push({ ...range })
  }
  if (merged.length === 1 && merged[0].end === normalized.length) return { contextKind: 'full_document', text }
  return { contextKind: 'surrounding_passages', passages: merged.map(range => ({ normalizedStart: range.start, normalizedEnd: range.end, text: normalized.slice(range.start, range.end) })) }
}
