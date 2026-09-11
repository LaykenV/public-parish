import { recordCivicEvent } from '../analytics/product-analytics'
import { ExternalLinkIcon, TriangleAlertIcon } from 'lucide-react'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { ElementType, ReactNode } from 'react'

import { formatDate } from '../discovery/format'
import {
  Sheet,
  sheetExitDelay,
  shouldRestoreSheetFocus,
} from '../discovery/sheet'
import {
  citationSummary,
  documentHost,
  evidenceSheetSize,
} from './evidence-model'
import type { CitationData, CitationMap } from './contracts'

import './evidence.css'

type EvidenceContextValue = {
  citations: CitationMap
  panelId: string
  restoreFocus: () => void
  select: (id: string | null, opener?: HTMLElement | null) => void
  selected: string | null
  triggerId: string | null
}

const EvidenceContext = createContext<EvidenceContextValue | null>(null)

function useEvidence(): EvidenceContextValue {
  const value = useContext(EvidenceContext)
  if (!value) throw new Error('Evidence controls need an EvidenceProvider.')
  return value
}

export function EvidenceProvider({
  children,
  citations,
  onSelect,
  selected,
}: {
  children: ReactNode
  citations: CitationMap
  onSelect: (id: string | null) => void
  selected: string | null
}) {
  const panelId = useId()
  const [triggerId, setTriggerId] = useState<string | null>(null)

  const openerRef = useRef<HTMLElement | null>(null)
  const openerCitationRef = useRef<string | null>(null)

  const select = useCallback(
    (id: string | null, opener?: HTMLElement | null) => {
      if (opener) {
        openerRef.current = opener
        openerCitationRef.current = id
        setTriggerId(opener.id)
      }
      if (id) recordCivicEvent('evidence_opened')
      onSelect(id)
    },
    [onSelect],
  )

  const restoreFocus = useCallback(() => {
    openerRef.current?.focus({ preventScroll: true })
    openerRef.current = null
    openerCitationRef.current = null
    setTriggerId(null)
  }, [])

  useEffect(() => {
    if (!selected || openerCitationRef.current === selected) return

    const fallback = Array.from(
      document.querySelectorAll<HTMLElement>('.ev-source'),
    ).find((control) => control.dataset.citationId === selected)

    openerRef.current = fallback ?? null
    openerCitationRef.current = selected
    setTriggerId(fallback?.id ?? null)
  }, [selected])

  const value = useMemo(
    () => ({
      citations,
      panelId,
      restoreFocus,
      select,
      selected,
      triggerId,
    }),
    [citations, panelId, restoreFocus, select, selected, triggerId],
  )

  return (
    <EvidenceContext.Provider value={value}>
      {children}
      <EvidenceSheet />
    </EvidenceContext.Provider>
  )
}

export function Claim({
  children,
  citationId,
  citationIds,
  tag: Tag = 'div',
  wrap = true,
}: {
  children: ReactNode
  citationId?: string
  citationIds?: readonly string[]
  tag?: ElementType
  wrap?: boolean
}) {
  const { selected } = useEvidence()
  const ids = citationIds ?? (citationId ? [citationId] : [])
  const isSelected = selected != null && ids.includes(selected)

  return (
    <Tag className="ev-claim" data-selected={isSelected ? '' : undefined}>
      {wrap ? <div className="ev-claim-body">{children}</div> : children}
      {ids.map((id) => (
        <SourceControl citationId={id} key={id} />
      ))}
    </Tag>
  )
}

/*
  Selects a citation in the existing viewer. Rows outside a claim, such as the
  Ask "Sources used" inventory, use this instead of a second viewer.
*/
export function useEvidenceSelect() {
  return useEvidence().select
}

export function SourceControl({ citationId }: { citationId: string }) {
  const { citations, panelId, select, selected } = useEvidence()
  const controlId = useId()
  const citation = citations[citationId]
  if (!citation) return null

  const isSelected = selected === citationId

  return (
    <button
      aria-controls={panelId}
      aria-expanded={isSelected}
      aria-haspopup="dialog"
      className="ev-source pp-source-control"
      data-citation-id={citationId}
      data-selected={isSelected ? '' : undefined}
      id={controlId}
      onClick={(event) =>
        select(isSelected ? null : citationId, event.currentTarget)
      }
      type="button"
    >
      <span aria-hidden="true">
        [{Object.keys(citations).indexOf(citationId) + 1}]
      </span>
      <span className="visually-hidden">
        Source, {citationSummary(citation)}, {citation.body}
      </span>
    </button>
  )
}

function EvidenceSheet() {
  const { citations, panelId, restoreFocus, select, selected, triggerId } =
    useEvidence()
  const citation = selected ? citations[selected] : undefined
  const focusReturnTimerRef = useRef<number | null>(null)
  const lastCitationRef = useRef<CitationData | undefined>(citation)

  useEffect(() => {
    if (!citation) return
    lastCitationRef.current = citation
    if (focusReturnTimerRef.current !== null) {
      window.clearTimeout(focusReturnTimerRef.current)
      focusReturnTimerRef.current = null
    }
  }, [citation])
  useEffect(
    () => () => {
      if (focusReturnTimerRef.current !== null) {
        window.clearTimeout(focusReturnTimerRef.current)
      }
    },
    [],
  )

  const renderedCitation = citation ?? lastCitationRef.current

  return (
    <Sheet
      className="ev-sheet"
      onOpenChange={(open) => {
        if (!open) {
          select(null)
          if (focusReturnTimerRef.current !== null) {
            window.clearTimeout(focusReturnTimerRef.current)
          }
          focusReturnTimerRef.current = window.setTimeout(() => {
            if (shouldRestoreSheetFocus()) restoreFocus()
            lastCitationRef.current = undefined
            focusReturnTimerRef.current = null
          }, sheetExitDelay())
        }
      }}
      open={Boolean(citation)}
      popupId={panelId}
      size={renderedCitation ? evidenceSheetSize(renderedCitation) : 'medium'}
      title="Official source"
      triggerId={triggerId}
    >
      {renderedCitation ? <EvidenceBody citation={renderedCitation} /> : null}
    </Sheet>
  )
}

function EvidenceBody({ citation }: { citation: CitationData }) {
  const noteId = useId()
  const place =
    citation.section ?? (citation.page ? `Page ${citation.page}` : undefined)

  return (
    <div className="ev-viewer">
      <p className="ev-viewer-meta">
        <span>{citation.documentKind}</span>
        {place ? <span>{place}</span> : null}
        <span>Retrieved {formatDate(citation.retrievedAt)}</span>
      </p>
      <h3 className="ev-viewer-title">{citation.documentTitle}</h3>
      <p className="ev-viewer-body">{citation.body}</p>

      {citation.warning ? (
        <p className="ev-viewer-warning">
          <TriangleAlertIcon aria-hidden="true" />
          <span>{citation.warning}</span>
        </p>
      ) : null}

      <blockquote aria-describedby={noteId} className="ev-quote">
        {citation.excerpt.before ? (
          <span className="ev-quote-context">{citation.excerpt.before} </span>
        ) : null}
        <mark className="ev-quote-support">{citation.excerpt.quote}</mark>
        {citation.excerpt.after ? (
          <span className="ev-quote-context"> {citation.excerpt.after}</span>
        ) : null}
      </blockquote>
      <p className="ev-quote-note" id={noteId}>
        The darker words are the exact text that supports this claim. The
        lighter words are the sentences around it in the same document.
      </p>

      <a
        className="ev-viewer-open"
        href={citation.officialUrl}
        onClick={() => recordCivicEvent('official_source_opened')}
        rel="noreferrer"
        target="_blank"
      >
        <ExternalLinkIcon aria-hidden="true" />
        <span>Open official document</span>
        <span className="ev-viewer-host">
          {documentHost(citation.officialUrl)}
        </span>
      </a>
    </div>
  )
}
