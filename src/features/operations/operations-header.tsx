import { ShieldCheckIcon } from 'lucide-react'
import { Link } from '@tanstack/react-router'

export function OperationsHeader({
  current,
  title,
  children,
}: {
  current: 'coverage' | 'stories'
  title: string
  children: React.ReactNode
}) {
  return (
    <>
      <header className="operations-header">
        <p className="operations-kicker">Owner operations</p>
        <h1>{title}</h1>
        <p className="operations-description">{children}</p>
      </header>
      <nav className="operations-tabs" aria-label="Owner operations">
        <Link
          to="/operations/coverage"
          aria-current={current === 'coverage' ? 'page' : undefined}
        >
          Coverage
        </Link>
        <Link
          to="/operations/stories"
          aria-current={current === 'stories' ? 'page' : undefined}
        >
          Stories
        </Link>
      </nav>
    </>
  )
}

export function OperationsState({
  action,
  detail,
  error,
  title,
}: {
  action?: React.ReactNode
  detail: string
  error?: string | null
  title: string
}) {
  return (
    <main className="coverage-ops coverage-ops-centered" id="resident-main">
      <ShieldCheckIcon aria-hidden="true" />
      <p className="coverage-ops-kicker">Private owner operation</p>
      <h1>{title}</h1>
      <p>{detail}</p>
      {error ? (
        <p className="coverage-ops-error" role="alert">
          {error}
        </p>
      ) : null}
      {action}
    </main>
  )
}
