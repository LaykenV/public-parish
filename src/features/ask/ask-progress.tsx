import {
  CheckIcon,
  CircleIcon,
  FileSearchIcon,
  PenLineIcon,
  SearchIcon,
  ShieldCheckIcon,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import type { AnswerProgress } from '../../../convex/ask/contracts'

const STEPS = [
  {
    phase: 'searching',
    label: 'Finding relevant records',
    detail:
      'Looking through published decisions for evidence that fits your question.',
    icon: SearchIcon,
  },
  {
    phase: 'reading',
    label: 'Reading official sources',
    detail:
      'Opening the official documents behind those records.',
    icon: FileSearchIcon,
  },
  {
    phase: 'writing',
    label: 'Writing your answer',
    detail: 'Using the selected evidence to put an answer together.',
    icon: PenLineIcon,
  },
  {
    phase: 'checking',
    label: 'Checking citations',
    detail: 'Checking that the answer cites the selected, published evidence.',
    icon: ShieldCheckIcon,
  },
] as const

export function AskChecking({ progress }: { progress?: AnswerProgress }) {
  const [mountedAt] = useState(Date.now)
  const [now, setNow] = useState(Date.now)
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])
  const elapsed = Math.max(
    0,
    Math.floor((now - (progress?.startedAt ?? mountedAt)) / 1000),
  )
  const activeIndex = progress
    ? STEPS.findIndex((step) => step.phase === progress.phase)
    : -1
  const active = activeIndex < 0 ? null : STEPS[activeIndex]
  return (
    <section className="ask-checking ask-progress" aria-label="Answer progress">
      <div className="ask-progress-heading">
        <p className="ask-progress-label" role="status">
          {active?.label ?? 'Checking the published record'}
        </p>
        <span className="ask-progress-time" aria-hidden="true">
          {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, '0')}
        </span>
      </div>
      <p className="ask-progress-detail">
        {active?.detail ??
          'Your question is being sent. Progress will appear here.'}
      </p>
      <ol className="ask-progress-steps" aria-hidden="true">
        {STEPS.map((step, index) => {
          const state =
            index < activeIndex
              ? 'done'
              : index === activeIndex
                ? 'active'
                : 'waiting'
          const Icon =
            state === 'done'
              ? CheckIcon
              : state === 'active'
                ? step.icon
                : CircleIcon
          return (
            <li key={step.phase} data-state={state}>
              <Icon />
              <span>{step.label}</span>
            </li>
          )
        })}
      </ol>
      {elapsed >= 20 ? (
        <p className="ask-progress-patience">
          Larger searches take longer. You can keep this open while we check the
          evidence.
        </p>
      ) : null}
    </section>
  )
}
