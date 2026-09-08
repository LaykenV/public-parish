export function StoryOfficialSourceLink({ url }: { url: string }) {
  let source: URL
  try {
    source = new URL(url)
    if (source.protocol !== 'https:' && source.protocol !== 'http:') {
      return <p>Official source link is unavailable.</p>
    }
  } catch {
    return <p>Official source link is unavailable.</p>
  }

  return (
    <a href={source.href} target="_blank" rel="noreferrer">
      Open official source at {source.hostname}
    </a>
  )
}
