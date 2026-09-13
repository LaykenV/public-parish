import { useSyncExternalStore } from 'react'

import type { AreaSlug } from './contracts'

const STORAGE_KEY = 'public-parish.area.v1'
const SLUGS: readonly AreaSlug[] = [
  'lafayette-parish',
  'east-baton-rouge-parish',
  'rapides-parish',
]

type AreaSelection = AreaSlug | 'louisiana' | null

function readStoredArea(): AreaSelection {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY)
    return value === 'louisiana' ||
      (value && (SLUGS as readonly string[]).includes(value))
      ? (value as Exclude<AreaSelection, null>)
      : null
  } catch {
    return null
  }
}

let currentSelection = readStoredArea()
const listeners = new Set<() => void>()

function emit() {
  for (const listener of listeners) listener()
}

export function getArea(): AreaSlug | null {
  return currentSelection === 'louisiana' ? null : currentSelection
}

export function setArea(slug: AreaSlug | null) {
  currentSelection = slug ?? 'louisiana'
  try {
    window.localStorage.setItem(STORAGE_KEY, currentSelection)
  } catch {
    // Storage can be unavailable in private modes. The session keeps the area.
  }
  emit()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function useArea(): AreaSlug | null {
  return useSyncExternalStore(subscribe, getArea, () => null)
}

// An explicit Louisiana choice dismisses onboarding just like a parish choice.
export function useHasSelectedArea(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => currentSelection !== null,
    () => false,
  )
}
