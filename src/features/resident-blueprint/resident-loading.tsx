import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import { useRouterState } from '@tanstack/react-router'

import { Spinner } from '../../components/ui/spinner'

const LoadingContext = createContext<(() => () => void) | null>(null)

export function ResidentLoadingProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState(0)
  const register = useCallback(() => {
    setPending((count) => count + 1)
    return () => setPending((count) => count - 1)
  }, [])
  const navigating = useRouterState({ select: (state) => state.isLoading })
  const loading = navigating || pending > 0

  return (
    <LoadingContext.Provider value={register}>
      {children}
      <div
        className="route-loading-region"
        aria-live="polite"
        aria-atomic="true"
        aria-busy={loading}
        role="status"
      >
        {loading ? (
          <>
            <Spinner aria-hidden="true" />
            <span className="visually-hidden">Loading page</span>
          </>
        ) : null}
      </div>
    </LoadingContext.Provider>
  )
}

// Each loading section registers once. Settling or unmounting releases it,
// including when an error boundary replaces the section.
export function PageLoading() {
  const register = useContext(LoadingContext)
  useEffect(() => register?.(), [register])
  return null
}
