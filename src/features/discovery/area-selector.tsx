import {
  CheckCircle2Icon,
  ChevronDownIcon,
  Clock3Icon,
  MapIcon,
  SearchIcon,
} from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useRouterState } from '@tanstack/react-router'

import { useRecordAreaSelection } from '../analytics/product-analytics'
import { setArea, useArea } from './area-store'
import { homeFocusArea, parseHomeSearch } from './contracts'
import type { AreaRecord, AreaSlug, HomeCity } from './contracts'
import {
  groupBodiesByPlace,
  useCoverageAreas,
  useCoverageBodies,
} from './live-areas'
import type { CoverageBody } from './live-areas'
import { Sheet } from './sheet'
import { Input } from '../../components/ui/input'

export const LOUISIANA_LABEL = 'All of Louisiana'

type AreaSelectorProps = {
  onOpenChange?: (open: boolean) => void
  open?: boolean
  trigger: (props: React.ComponentProps<'button'>) => React.ReactElement
}

export function AreaSelector({
  open,
  onOpenChange,
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
  trigger,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  trigger: AreaSelectorProps['trigger']
}) {
  const [query, setQuery] = useState('')
  const [expanded, setExpanded] = useState<AreaSlug | null>(null)
  const storedArea = useArea()
  const navigate = useNavigate()
  const location = useRouterState({ select: (state) => state.location })
  const homeSearch =
    location.pathname === '/' ? parseHomeSearch(location.search) : {}
  const area = homeFocusArea(homeSearch, storedArea)
  const currentBody = homeSearch.body
  const currentCity = homeSearch.city
  const recordAreaSelection = useRecordAreaSelection()
  const coverageAreas = useCoverageAreas()
  const coverageBodies = useCoverageBodies()
  const normalized = query.trim().toLowerCase()
  const searching = normalized.length > 0
  const showLouisiana = matches(LOUISIANA_LABEL, normalized)
  const louisianaSelected = area === null

  const places = coverageAreas.flatMap((place) => {
    const bodies = coverageBodies.filter(
      (body) => body.placeSlug === place.slug,
    )
    const visibleBodies = searching
      ? bodies.filter(
          (body) =>
            matches(body.label, normalized) ||
            (body.municipality
              ? matches(body.municipality.name, normalized)
              : false),
        )
      : bodies
    if (
      searching &&
      !matches(place.name, normalized) &&
      visibleBodies.length === 0
    ) {
      return []
    }
    return [{ place, bodies, visibleBodies }]
  })

  // Choosing a parish or Louisiana drops any body focus carried in the Home URL.
  const focusPlace = (slug: AreaSlug | null) => {
    setArea(slug)
    if (location.pathname === '/')
      void navigate({ to: '/', search: { area: slug ?? 'louisiana' } })
    onOpenChange(false)
  }

  const focusBody = (body: CoverageBody) => {
    if (area !== body.placeSlug) {
      setArea(body.placeSlug)
      recordAreaSelection(body.placeSlug)
    }
    void navigate({
      to: '/',
      search: { area: body.placeSlug, body: body.label },
    })
    onOpenChange(false)
  }

  const focusCity = (place: AreaSlug, city: HomeCity) => {
    if (area !== place) recordAreaSelection(place)
    setArea(place)
    void navigate({ to: '/', search: { area: place, city } })
    onOpenChange(false)
  }

  return (
    <Sheet
      className="pp-area-sheet"
      description="Louisiana shows statewide stories and every covered parish. A parish, or one of its bodies, focuses Home on published records; coverage can still be incomplete."
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
          aria-label="Search places and bodies"
          autoComplete="off"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search parishes, cities and bodies"
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
        {places.map(({ place, bodies, visibleBodies }) => {
          const selected = place.slug === area && !currentBody && !currentCity
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
          const bodiesOpen = searching || expanded === place.slug
          const listId = `pp-area-bodies-${place.slug}`
          return (
            <li key={place.slug}>
              <button
                aria-pressed={selected}
                className="pp-area-row"
                data-status={place.status}
                data-selected={selected || undefined}
                onClick={() => {
                  if (!selected && area !== place.slug)
                    recordAreaSelection(place.slug)
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
              {bodies.length > 0 ? (
                <>
                  {searching ? null : (
                    <button
                      aria-controls={listId}
                      aria-expanded={bodiesOpen}
                      className="pp-area-toggle"
                      data-open={bodiesOpen || undefined}
                      onClick={() =>
                        setExpanded(bodiesOpen ? null : place.slug)
                      }
                      type="button"
                    >
                      <ChevronDownIcon aria-hidden="true" />
                      {bodiesOpen ? 'Hide' : 'Show'} {bodies.length}{' '}
                      {bodies.length === 1 ? 'body' : 'bodies'} in {place.name}
                    </button>
                  )}
                  {bodiesOpen ? (
                    <BodyRows
                      city={
                        area === place.slug && !currentBody
                          ? currentCity
                          : undefined
                      }
                      onCity={focusCity}
                      active={area === place.slug ? currentBody : undefined}
                      bodies={visibleBodies}
                      id={listId}
                      onFocus={focusBody}
                      place={place}
                    />
                  ) : null}
                </>
              ) : null}
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

function BodyRows({
  city,
  onCity,
  active,
  bodies,
  id,
  onFocus,
  place,
}: {
  city?: HomeCity
  onCity: (place: AreaSlug, city: HomeCity) => void
  active?: string
  bodies: CoverageBody[]
  id: string
  onFocus: (body: CoverageBody) => void
  place: AreaRecord
}) {
  const groups = groupBodiesByPlace(bodies)
  if (groups.length === 0) return null
  return (
    <ul
      aria-label={`Bodies in ${place.name}`}
      className="pp-area-bodies"
      id={id}
    >
      {groups.map((group) => (
        <li key={group.key}>
          {group.key === 'parish' ? (
            <p className="pp-area-group">{group.name}</p>
          ) : (
            <button
              type="button"
              className="pp-area-row pp-area-city"
              aria-pressed={city === group.key}
              disabled={!group.bodies.some((body) => body.published)}
              onClick={() => onCity(place.slug, group.key as HomeCity)}
            >
              <span className="pp-area-name">{group.name}</span>
              <span className="pp-area-note">All city bodies</span>
            </button>
          )}
          <ul>
            {group.bodies.map((body) => {
              const selected = active === body.label
              if (!body.published) {
                return (
                  <li key={body.slug}>
                    <div
                      aria-disabled="true"
                      className="pp-area-row pp-area-body"
                      data-status="validating"
                    >
                      <span className="pp-area-name">{body.label}</span>
                      <span className="pp-area-status">
                        <Clock3Icon aria-hidden="true" />
                        No records yet
                      </span>
                    </div>
                  </li>
                )
              }
              return (
                <li key={body.slug}>
                  <button
                    aria-pressed={selected}
                    className="pp-area-row pp-area-body"
                    data-selected={selected || undefined}
                    data-status="available"
                    onClick={() => onFocus(body)}
                    type="button"
                  >
                    <span className="pp-area-name">{body.label}</span>
                    <span className="pp-area-status">
                      <CheckCircle2Icon aria-hidden="true" />
                      {selected ? 'Selected' : 'Records available'}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </li>
      ))}
    </ul>
  )
}
