import { CatchBoundary } from '@tanstack/react-router'
import type { ErrorComponentProps } from '@tanstack/react-router'
import type { ReactNode } from 'react'

import { Button } from '../../components/ui/button'
import { SectionFailure } from '../discovery/notice'
import { ResidentStandalone } from './resident-shell'

export function ResidentRouteError() {
  return (
    <ResidentStandalone>
      <main className="pp-page" id="resident-main">
        <h1>This page could not load.</h1>
        <p>Try loading it again, or return to Home to find published records.</p>
        <div className="blueprint-actions">
          <Button onClick={() => window.location.reload()} size="touch">
            Reload page
          </Button>
          <a className="blueprint-action blueprint-action-secondary" href="/">
            Return home
          </a>
          <a className="blueprint-action blueprint-action-secondary" href="/explore">
            Explore records
          </a>
        </div>
      </main>
    </ResidentStandalone>
  )
}

export function ResidentSectionBoundary({
  children,
  label,
  resetKey,
}: {
  children: ReactNode
  label: string
  resetKey: string
}) {
  return (
    <CatchBoundary
      getResetKey={() => resetKey}
      errorComponent={({ reset }: ErrorComponentProps) => (
        <SectionFailure label={label} onRetry={reset} />
      )}
    >
      {children}
    </CatchBoundary>
  )
}
