import { ArrowUpRightIcon, FileClockIcon, FileTextIcon } from 'lucide-react'

function sourceUrl(value: string | null): URL | null {
  try {
    const url = new URL(value ?? '')
    return url.protocol === 'https:' || url.protocol === 'http:' ? url : null
  } catch {
    return null
  }
}

export function OfficialSourceLink({ url, onOpen }: { url: string; onOpen?: () => void }) {
  const source = sourceUrl(url)
  if (!source) return <p className="ev-source-unavailable">Official source link is unavailable.</p>

  return (
    <a
      className="ev-source-action ev-source-action-primary"
      aria-label={`Open official source at ${source.hostname}, in a new tab`}
      href={source.href}
      onClick={onOpen}
      target="_blank"
      rel="noreferrer"
    >
      <FileTextIcon aria-hidden="true" />
      <span className="ev-source-action-text">
        <span>Open official source</span>
        <span className="ev-source-action-host">{source.hostname}</span>
      </span>
      <ArrowUpRightIcon aria-hidden="true" />
    </a>
  )
}

export function SourceActions({
  officialUrl,
  snapshotUrl,
  onOfficialOpen,
}: {
  officialUrl: string
  snapshotUrl?: string | null
  onOfficialOpen?: () => void
}) {
  const snapshot = snapshotUrl === undefined ? undefined : sourceUrl(snapshotUrl)
  return (
    <div className="ev-source-actions">
      <OfficialSourceLink url={officialUrl} onOpen={onOfficialOpen} />
      {snapshot ? (
        <a className="ev-source-action ev-source-action-saved" href={snapshot.href} target="_blank" rel="noreferrer" aria-label="View saved copy, in a new tab">
          <FileClockIcon aria-hidden="true" />
          <span className="ev-source-action-text">View saved copy</span>
          <ArrowUpRightIcon aria-hidden="true" />
        </a>
      ) : snapshot === null ? (
        <p className="ev-source-unavailable">Saved source copy is unavailable.</p>
      ) : null}
    </div>
  )
}
