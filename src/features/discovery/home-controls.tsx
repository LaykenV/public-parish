import {
  ArrowUpRightIcon,
  MapPinIcon,
  SlidersHorizontalIcon,
} from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'

import { Button } from '../../components/ui/button'
import { AreaSelector } from './area-selector'
import { setArea } from './area-store'
import { areaName, HOME_CITIES } from './contracts'
import type { AreaSlug, HomeCity } from './contracts'
import { useCoverageBodies } from './live-areas'
import { Sheet } from './sheet'
import { useMediaQuery } from './hooks'

function useBodyOptions(area: AreaSlug, body?: string, city?: HomeCity) {
  const bodies = useCoverageBodies().filter(
    (entry) => entry.placeSlug === area && entry.published,
  )
  const options = [
    { value: '', label: 'All bodies' },
    ...(city
      ? [{ value: `city:${city}`, label: `${HOME_CITIES[city].name} bodies` }]
      : []),
    ...bodies.map((entry) => ({ value: entry.label, label: entry.label })),
  ]
  // A shared link may name a body before its coverage query has loaded.
  if (body && !options.some((option) => option.value === body)) {
    options.push({ value: body, label: body })
  }
  return options
}

function useApplyBody(area: AreaSlug) {
  const navigate = useNavigate()
  return (value: string) =>
    void navigate({
      to: '/',
      resetScroll: false,
      search: value.startsWith('city:')
        ? { area, city: value.slice(5) as HomeCity }
        : { area, body: value || undefined },
    })
}

export function HomeBodyFilter({
  area,
  body,
  city,
}: {
  area: AreaSlug
  body?: string
  city?: HomeCity
}) {
  const options = useBodyOptions(area, body, city)
  const apply = useApplyBody(area)
  return (
    <label className="pp-home-body-filter">
      <span>Government body</span>
      <select
        value={body ?? (city ? `city:${city}` : '')}
        onChange={(event) => apply(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

export function HomeControls({
  area,
  body,
  city,
}: {
  area: AreaSlug | null
  body?: string
  city?: HomeCity
}) {
  const navigate = useNavigate()
  const mobile = useMediaQuery('(max-width: 47.999rem)')
  return (
    <>
      {area ? (
        <nav className="pp-home-view-controls" aria-label="Home view">
          <AreaSelector
            trigger={(props) => (
              <Button
                {...props}
                className="pp-home-change-area"
                variant="ghost"
                size="touch"
              >
                <MapPinIcon aria-hidden="true" /> Change area
              </Button>
            )}
          />
          <Button
            className="pp-home-statewide"
            variant="ghost"
            size="touch"
            onClick={() => {
              setArea(null)
              void navigate({ to: '/', search: { area: 'louisiana' } })
            }}
          >
            View Statewide Stories <ArrowUpRightIcon aria-hidden="true" />
          </Button>
        </nav>
      ) : null}
      {mobile ? (
        area ? (
          <MobileHomeFilters key={area} area={area} body={body} city={city} />
        ) : (
          <AreaSelector
            trigger={(props) => (
              <Button {...props} className="pp-home-floating" size="touch">
                <MapPinIcon aria-hidden="true" /> Choose area
              </Button>
            )}
          />
        )
      ) : null}
    </>
  )
}

function MobileHomeFilters({
  area,
  body,
  city,
}: {
  area: AreaSlug
  body?: string
  city?: HomeCity
}) {
  const [open, setOpen] = useState(false)
  const current = body ?? (city ? `city:${city}` : '')
  const [draft, setDraft] = useState(current)
  const options = useBodyOptions(area, body, city)
  const apply = useApplyBody(area)
  return (
    <Sheet
      className="pp-home-filter-sheet"
      title="Filter local issues"
      description="Choose a government body for issues and decision records."
      open={open}
      onOpenChange={(next) => {
        setDraft(current)
        setOpen(next)
      }}
      triggerId="home-filter-trigger"
      trigger={(props) => (
        <Button
          {...props}
          id="home-filter-trigger"
          className="pp-home-floating"
          size="touch"
        >
          <SlidersHorizontalIcon aria-hidden="true" /> Filters
          {current ? <span className="pp-home-filter-count">1</span> : null}
        </Button>
      )}
      footer={
        <div className="pp-home-filter-footer">
          <Button variant="ghost" size="touch" onClick={() => setDraft('')}>
            Reset
          </Button>
          <Button
            size="touch"
            onClick={() => {
              setOpen(false)
              apply(draft)
            }}
          >
            Apply filters
          </Button>
        </div>
      }
    >
      <div className="pp-home-filter-area">
        <div>
          <span>Parish</span>
          <strong>{areaName(area)}</strong>
        </div>
        <AreaSelector
          trigger={(props) => (
            <Button {...props} variant="outline" size="touch">
              Change area
            </Button>
          )}
        />
      </div>
      <fieldset className="pp-home-filter-options">
        <legend>Government body</legend>
        {options.map((option) => (
          <label
            key={option.value}
            data-selected={draft === option.value || undefined}
          >
            <input
              type="radio"
              name="home-body"
              value={option.value}
              checked={draft === option.value}
              onChange={() => setDraft(option.value)}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </fieldset>
    </Sheet>
  )
}
