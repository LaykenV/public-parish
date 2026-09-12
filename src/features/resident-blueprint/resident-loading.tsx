import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import { useRouterState } from '@tanstack/react-router'

import { Spinner } from '../../components/ui/spinner'

const LoadingStateContext = createContext(false)

export function usePageLoading() {
  return useContext(LoadingStateContext)
}

// Keep queries mounted while their content is hidden so they can finish loading.
export function ResidentLoadingContent({ children }: { children: ReactNode }) {
  const loading = usePageLoading()
  return (
    <div className="resident-loading-content" hidden={loading} inert={loading}>
      {children}
    </div>
  )
}

const LoadingContext = createContext<(() => () => void) | null>(null)

export function ResidentLoadingProvider({ children }: { children: ReactNode }) {
  const [initializing, setInitializing] = useState(true)
  useLayoutEffect(() => setInitializing(false), [])
  const [pending, setPending] = useState(0)
  const register = useCallback(() => {
    setPending((count) => count + 1)
    return () => setPending((count) => count - 1)
  }, [])
  // Same-page URL changes open sources and jump to sections. Their data
  // loading is registered separately, without collapsing the reading document.
  const navigating = useRouterState({
    select: (state) =>
      state.isLoading &&
      state.location.pathname !== state.resolvedLocation?.pathname,
  })
  const loading = initializing || navigating || pending > 0

  return (
    <LoadingContext.Provider value={register}>
      <LoadingStateContext.Provider value={loading}>
        {children}
      </LoadingStateContext.Provider>
      <div
        className="route-loading-region"
        aria-live="polite"
        aria-atomic="true"
        aria-busy={loading}
        role="status"
      >
        {loading ? (
          <>
            <div className="route-loading-indicator">
              <Spinner aria-hidden="true" />
            </div>
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
  useLayoutEffect(() => register?.(), [register])
  return null
}
