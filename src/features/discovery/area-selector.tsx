import { CheckCircle2Icon, Clock3Icon, MapIcon, SearchIcon } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useRouterState } from '@tanstack/react-router'

import { useRecordAreaSelection } from '../analytics/product-analytics'
import { setArea, useArea } from './area-store'
import { homeFocusArea, parseHomeSearch } from './contracts'
import type { AreaSlug } from './contracts'
import { useCoverageAreas } from './live-areas'
import { Sheet } from './sheet'
import { Input } from '../../components/ui/input'

export const LOUISIANA_LABEL = 'All of Louisiana'

type AreaSelectorProps = {
  onSelect?: (area: AreaSlug | null) => void
  onOpenChange?: (open: boolean) => void
  open?: boolean
  trigger: (props: React.ComponentProps<'button'>) => React.ReactElement
}

export function AreaSelector({
  open,
  onOpenChange,
  onSelect,
  trigger,
}: AreaSelectorProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isOpen = open ?? internalOpen
  const setOpen = (next: boolean) => {
    onOpenChange?.(next)
    if (open === undefined) setInternalOpen(next)
  }

  return (
    <AreaSelectorDialog
      onSelect={onSelect}
      onOpenChange={setOpen}
      open={isOpen}
      trigger={trigger}
    />
  )
}

function matches(value: string, normalized: string) {
  return value.toLowerCase().includes(normalized)
}

function AreaSelectorDialog({
  open,
  onOpenChange,
  onSelect,
  trigger,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: AreaSelectorProps['onSelect']
  trigger: AreaSelectorProps['trigger']
}) {
  const [query, setQuery] = useState('')
  const storedArea = useArea()
  const navigate = useNavigate()
  const location = useRouterState({ select: (state) => state.location })
  const homeSearch =
    location.pathname === '/' ? parseHomeSearch(location.search) : {}
  const area = homeFocusArea(homeSearch, storedArea)
  const recordAreaSelection = useRecordAreaSelection()
  const coverageAreas = useCoverageAreas()
  const normalized = query.trim().toLowerCase()
  const showLouisiana = matches(LOUISIANA_LABEL, normalized)
  const louisianaSelected = area === null

  const places = coverageAreas.filter((place) =>
    matches(place.name, normalized),
  )

  // Choosing a parish or Louisiana drops any body focus carried in the Home URL.
  const focusPlace = (slug: AreaSlug | null) => {
    setArea(slug)
    onOpenChange(false)
    if (onSelect) onSelect(slug)
    else if (location.pathname === '/')
      void navigate({ to: '/', search: { area: slug ?? 'louisiana' } })
  }

  return (
    <Sheet
      className="pp-area-sheet"
      description="Louisiana shows statewide stories and every covered parish. Choose a parish for local issues and records. Filter by government body on Home."
      footer={
        <Link
          className="pp-area-request"
          onClick={() => onOpenChange(false)}
          to="/coverage/request"
        >
          Not seeing your area? Request coverage.
        </Link>
      }
      onOpenChange={onOpenChange}
      open={open}
      size="tall"
      title="Choose your area"
      trigger={trigger}
    >
      <div className="pp-area-search">
        <SearchIcon aria-hidden="true" />
        <Input
          unstyled
          aria-label="Search parishes"
          autoComplete="off"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search parishes"
          type="search"
          value={query}
        />
      </div>
      <ul className="pp-area-list">
        {showLouisiana ? (
          <li>
            <button
              aria-pressed={louisianaSelected}
              className="pp-area-row"
              data-status="available"
              data-selected={louisianaSelected || undefined}
              onClick={() => focusPlace(null)}
              type="button"
            >
              <span className="pp-area-name">{LOUISIANA_LABEL}</span>
              <span className="pp-area-status">
                <MapIcon aria-hidden="true" />
                {louisianaSelected ? 'Selected' : 'Statewide view'}
              </span>
              <span className="pp-area-note">
                Louisiana stories and issues across every covered parish.
              </span>
            </button>
          </li>
        ) : null}
        {places.map((place) => {
          const selected = place.slug === area
          if (place.status === 'validating') {
            return (
              <li key={place.slug}>
                <div
                  aria-disabled="true"
                  className="pp-area-row"
                  data-status="validating"
                >
                  <span className="pp-area-name">{place.name}</span>
                  <span className="pp-area-status">
                    <Clock3Icon aria-hidden="true" />
                    Validating sources
                  </span>
                  {place.note ? (
                    <span className="pp-area-note">{place.note}</span>
                  ) : null}
                </div>
              </li>
            )
          }
          return (
            <li key={place.slug}>
              <button
                aria-pressed={selected}
                className="pp-area-row"
                data-status={place.status}
                data-selected={selected || undefined}
                onClick={() => {
                  if (!selected) recordAreaSelection(place.slug)
                  focusPlace(place.slug)
                }}
                type="button"
              >
                <span className="pp-area-name">{place.name}</span>
                <span className="pp-area-status">
                  {place.status === 'limited' ? (
                    <Clock3Icon aria-hidden="true" />
                  ) : (
                    <CheckCircle2Icon aria-hidden="true" />
                  )}
                  {selected ? 'Selected' : 'Records available'}
                </span>
                {place.note ? (
                  <span className="pp-area-note">{place.note}</span>
                ) : null}
              </button>
            </li>
          )
        })}
        {places.length === 0 && !showLouisiana ? (
          <li className="pp-area-empty">No listed place matches "{query}".</li>
        ) : null}
      </ul>
    </Sheet>
  )
}
