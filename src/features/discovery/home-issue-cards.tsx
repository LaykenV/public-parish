import { useEffect, useRef, useState } from 'react'

import type { IssueCardData } from './contracts'
import { useMediaQuery } from './hooks'
import { IssueCard } from './issue-card'

export function HomeIssueCards({ issues }: { issues: IssueCardData[] }) {
  const mobile = useMediaQuery('(max-width: 47.999rem)')
  const trackRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)

  useEffect(() => {
    const track = trackRef.current
    if (!track || !mobile) return
    const cards = Array.from(track.children) as HTMLElement[]
    let frame = 0
    const measure = () => {
      const start = cards[0]?.offsetLeft ?? 0
      let nearest = 0
      for (let index = 1; index < cards.length; index++) {
        if (
          Math.abs(cards[index].offsetLeft - start - track.scrollLeft) <
          Math.abs(cards[nearest].offsetLeft - start - track.scrollLeft)
        )
          nearest = index
      }
      setActive(nearest)
    }
    const schedule = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(measure)
    }
    const observer = new ResizeObserver(schedule)
    observer.observe(track)
    track.addEventListener('scroll', schedule, { passive: true })
    measure()
    return () => {
      observer.disconnect()
      track.removeEventListener('scroll', schedule)
      cancelAnimationFrame(frame)
    }
  }, [mobile, issues])

  return (
    <>
      <div
        className="pp-card-grid"
        ref={trackRef}
        role="region"
        aria-label="Issue timelines"
        tabIndex={mobile ? 0 : undefined}
        onFocusCapture={(event) => {
          if (!mobile) return
          const track = trackRef.current
          const first = track?.firstElementChild as HTMLElement | null
          const card = (event.target as HTMLElement).closest<HTMLElement>(
            '.pp-card',
          )
          if (track && first && card)
            track.scrollTo({
              left: card.offsetLeft - first.offsetLeft,
              behavior: 'instant',
            })
        }}
      >
        {issues.map((issue) => (
          <IssueCard issue={issue} key={issue.slug} />
        ))}
      </div>
      {mobile && issues.length > 1 ? (
        <div className="pp-issue-index">
          <div className="pp-issue-index-dots" aria-hidden="true">
            {issues.map((issue, index) => (
              <span
                key={issue.slug}
                data-active={index === active ? '' : undefined}
              />
            ))}
          </div>
          <p className="visually-hidden" role="status" aria-atomic="true">
            Issue {Math.min(active + 1, issues.length)} of {issues.length}
          </p>
        </div>
      ) : null}
    </>
  )
}
