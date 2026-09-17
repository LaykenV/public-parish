import { v } from 'convex/values'
import type { AskAnswerResult, AskEvidence } from '../ask/contracts'

export const emailReplyContent = v.object({
  paragraphs: v.array(v.string()),
  citations: v.array(
    v.object({
      number: v.number(),
      title: v.string(),
      location: v.string(),
      excerpt: v.string(),
      sourceHref: v.string(),
      officialUrl: v.string(),
    }),
  ),
  closing: v.string(),
})

// Download endpoints and filenames are identifiers, not readable document titles.
function citationTitle(citation: AskEvidence): string {
  const title = citation.documentTitle.trim()
  const filename =
    /^(?:https?:\/\/|[^\s]*[?=]|[^\s]*%[\da-f]{2})|\.(?:pdf|html?|aspx?)$/i
  if (title && !filename.test(title)) return title
  return citation.bodyName.trim() || 'Official document'
}

export function formatEmailReplyContent(
  answer: Pick<AskAnswerResult, 'kind' | 'answer' | 'citations'>,
  officialContactUrl?: string,
  siteOrigin = 'https://www.publicparish.com',
): typeof emailReplyContent.type {
  const evidence =
    answer.kind === 'answer'
      ? [
          ...new Map(
            answer.citations.map((citation) => [citation.evidenceId, citation]),
          ).values(),
        ]
      : []
  const numbers = new Map(
    evidence.map((citation, index) => [citation.evidenceId, index + 1]),
  )
  const readable = answer.answer.replace(
    /\[([^\]\r\n]+)\]|\(([^)\r\n]+)\)/g,
    (
      reference,
      bracketed: string | undefined,
      parenthesized: string | undefined,
    ) => {
      const ids = (bracketed ?? parenthesized ?? '')
        .split(/[\s,]+/)
        .filter(Boolean)
      return ids.length && ids.every((id) => numbers.has(id))
        ? `[${ids.map((id) => numbers.get(id)).join(', ')}]`
        : reference
    },
  )
  const paragraphs = readable.trim().split(/\n\n+/)
  if (answer.kind === 'not_found') {
    paragraphs.push(
      officialContactUrl
        ? `Official government site: ${officialContactUrl}`
        : 'Check the official source links in the alert above, or contact the government body that published them.',
    )
  }
  return {
    paragraphs,
    citations: evidence.map((citation, index) => ({
      number: index + 1,
      title: citationTitle(citation),
      location: [citation.page ? `Page ${citation.page}` : '', citation.section]
        .filter(Boolean)
        .join(' · '),
      excerpt:
        citation.excerpt.length > 280
          ? `${citation.excerpt.slice(0, 280).trimEnd()}…`
          : citation.excerpt,
      sourceHref: /^https?:\/\//.test(citation.sourceHref)
        ? citation.sourceHref
        : `${siteOrigin.replace(/\/$/, '')}/${citation.sourceHref.replace(/^\//, '')}`,
      officialUrl: citation.officialUrl,
    })),
    closing:
      'Public Parish answers only from published, checked evidence. Reply with another question about this alert to continue.',
  }
}

export function formatEmailReply(
  answer: AskAnswerResult,
  officialContactUrl?: string,
  siteOrigin?: string,
): string {
  const content = formatEmailReplyContent(
    answer,
    officialContactUrl,
    siteOrigin,
  )
  const lines = [content.paragraphs.join('\n\n')]
  if (content.citations.length) {
    lines.push('', 'Cited evidence')
    for (const citation of content.citations) {
      lines.push(
        `[${citation.number}] ${citation.title}: ${citation.sourceHref}`,
      )
      if (citation.location) lines.push(citation.location)
      if (citation.excerpt) lines.push(`"${citation.excerpt}"`)
      lines.push(`Official document: ${citation.officialUrl}`, '')
    }
  }
  lines.push('', content.closing)
  return lines.join('\n')
}
