import {
  FileSearchIcon,
  PenLineIcon,
  SearchIcon,
  ShieldCheckIcon,
} from 'lucide-react'
import type { AnswerProgress } from '../../../convex/ask/contracts'

const STEPS = {
  searching: { label: 'Finding relevant records', icon: SearchIcon },
  reading: { label: 'Reading official sources', icon: FileSearchIcon },
  writing: { label: 'Writing your answer', icon: PenLineIcon },
  checking: { label: 'Checking citations', icon: ShieldCheckIcon },
} as const

export function AskChecking({ progress }: { progress?: AnswerProgress }) {
  const active = (progress && STEPS[progress.phase]) ?? {
    label: 'Checking the published record',
    icon: SearchIcon,
  }
  const Icon = active.icon

  return (
    <section className="ask-checking ask-progress" aria-label="Answer progress">
      <p className="ask-progress-status" role="status">
        <Icon aria-hidden="true" />
        <span className="ask-progress-label">{active.label}</span>
      </p>
      <div className="ask-progress-dots" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
    </section>
  )
}
