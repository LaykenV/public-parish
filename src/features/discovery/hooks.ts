import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react'

let overlayCount = 0
const overlayListeners = new Set<() => void>()

function emitOverlay() {
  for (const listener of overlayListeners) listener()
}

function startOverlay() {
  overlayCount += 1
  emitOverlay()
  return () => {
    overlayCount = Math.max(0, overlayCount - 1)
    emitOverlay()
  }
}

function subscribeOverlay(listener: () => void) {
  overlayListeners.add(listener)
  return () => {
    overlayListeners.delete(listener)
  }
}

function getOverlayOpen(): boolean {
  return overlayCount > 0
}

export function useOverlay(open: boolean) {
  useEffect(() => {
    if (!open) return
    return startOverlay()
  }, [open])
}

export function useOverlayOpen(): boolean {
  return useSyncExternalStore(subscribeOverlay, getOverlayOpen, () => false)
}

export type VisualViewportBounds = {
  height: number | undefined
  top: number
  keyboardOpen: boolean
}

// Safari can resize innerHeight while its layout viewport stays taller. Read
// the root's clientHeight for layout coordinates. Always accept viewport
// updates, including zoom, and distinguish zoom from keyboard occlusion.
export function useVisualViewport(enabled = true): VisualViewportBounds {
  const [bounds, setBounds] = useState<VisualViewportBounds>({ height: undefined, top: 0, keyboardOpen: false })
  useLayoutEffect(() => {
    if (!enabled) return
    const viewport = window.visualViewport
    if (!viewport) return
    const update = () => {
      const layoutHeight = document.documentElement.clientHeight
      const height = Math.min(viewport.height, layoutHeight)
      // Pinching reduces CSS-pixel height without a keyboard. Normalize only
      // the occlusion check; keep the actual CSS pixels for panel geometry.
      const keyboardOpen = layoutHeight - viewport.height * viewport.scale > 100
      // During keyboard panning Safari may expose an area beyond the layout
      // viewport's original bottom. Follow that real offset while it is open.
      // Once it closes, discard any stale offset rather than leaving a gap.
      const top = keyboardOpen
        ? Math.max(0, viewport.offsetTop)
        : Math.max(0, Math.min(viewport.offsetTop, layoutHeight - height))
      setBounds({ height, top, keyboardOpen })
    }
    viewport.addEventListener('resize', update)
    viewport.addEventListener('scroll', update)
    viewport.addEventListener('scrollend', update)
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update)
    update()
    return () => {
      viewport.removeEventListener('resize', update)
      viewport.removeEventListener('scroll', update)
      viewport.removeEventListener('scrollend', update)
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update)
    }
  }, [enabled])
  return bounds
}

export function useKeyboardOpen(): boolean {
  return useVisualViewport().keyboardOpen
}

type ConnectivityRequest = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<unknown>

export async function canReachOrigin(
  request: ConnectivityRequest = fetch,
): Promise<boolean> {
  try {
    await request('/brand-mark.svg', { cache: 'no-store', method: 'HEAD' })
    return true
  } catch {
    return false
  }
}

export function useOnline(): boolean {
  const [online, setOnline] = useState(true)

  useEffect(() => {
    let probe = 0
    const markOnline = () => {
      probe += 1
      setOnline(true)
    }
    const update = () => {
      if (navigator.onLine) {
        markOnline()
        return
      }
      const currentProbe = ++probe
      void canReachOrigin().then((reachable) => {
        if (currentProbe === probe) setOnline(reachable)
      })
    }
    const updateWhenVisible = () => {
      if (document.visibilityState === 'visible') update()
    }
    window.addEventListener('online', update)
    window.addEventListener('offline', update)
    window.addEventListener('focus', update)
    window.addEventListener('pageshow', update)
    document.addEventListener('visibilitychange', updateWhenVisible)
    update()
    return () => {
      probe += 1
      window.removeEventListener('online', update)
      window.removeEventListener('offline', update)
      window.removeEventListener('focus', update)
      window.removeEventListener('pageshow', update)
      document.removeEventListener('visibilitychange', updateWhenVisible)
    }
  }, [])

  return online
}

export function useRepeatedAnnouncement(message: string) {
  const [announcement, setAnnouncement] = useState('')
  const frameRef = useRef(0)

  useEffect(() => () => window.cancelAnimationFrame(frameRef.current), [])

  const announce = () => {
    window.cancelAnimationFrame(frameRef.current)
    setAnnouncement('')
    frameRef.current = window.requestAnimationFrame(() => {
      setAnnouncement(message)
    })
  }

  return [announcement, announce] as const
}

export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (listener) => {
      const list = window.matchMedia(query)
      list.addEventListener('change', listener)
      return () => list.removeEventListener('change', listener)
    },
    () => window.matchMedia(query).matches,
    () => false,
  )
}
