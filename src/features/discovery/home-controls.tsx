import {
  ArrowUpRightIcon,
  ChevronDownIcon,
  MapPinIcon,
  SlidersHorizontalIcon,
} from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'

import { Button } from '../../components/ui/button'
import { AreaSelector } from './area-selector'
import { setArea } from './area-store'
import { areaName } from './contracts'
import type { AreaSlug, HomeCity } from './contracts'
import { useCoverageBodies } from './live-areas'
import { Sheet } from './sheet'
import { useMediaQuery } from './hooks'

type BodyFilterProps = { area: AreaSlug; bodies: string[]; city?: HomeCity }

export function StatewideStoriesButton({
  className = '',
}: {
  className?: string
}) {
  const navigate = useNavigate()
  return (
    <Button
      className={`pp-home-statewide ${className}`}
      variant="ghost"
      size="touch"
      onClick={() => {
        setArea(null)
        void navigate({ to: '/', search: { area: 'louisiana' } })
      }}
    >
      View Statewide Stories <ArrowUpRightIcon aria-hidden="true" />
    </Button>
  )
}

export function HomeBodyFilter(props: BodyFilterProps) {
  const mobile = useMediaQuery('(max-width: 47.999rem)')
  return <BodyFilters {...props} mobile={mobile} />
}

export function HomeControls({ area }: { area: AreaSlug | null }) {
  const mobile = useMediaQuery('(max-width: 47.999rem)')
  if (!mobile || area) return null
  return (
    <AreaSelector
      trigger={(props) => (
        <Button {...props} className="pp-home-floating" size="touch">
          <MapPinIcon aria-hidden="true" /> Choose area
        </Button>
      )}
    />
  )
}

function BodyFilters({
  area,
  bodies,
  city,
  mobile = false,
}: BodyFilterProps & { mobile?: boolean }) {
  const available = useCoverageBodies().filter(
    (entry) => entry.placeSlug === area && entry.published,
  )
  const current = bodies.length
    ? bodies
    : city
      ? available
          .filter((entry) => entry.municipality?.slug === city)
          .map((entry) => entry.label)
      : []
  // Keep accepted shared links visible while coverage metadata loads.
  const options = [
    ...new Set([...available.map((entry) => entry.label), ...current]),
  ]
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(current)
  const navigate = useNavigate()
  const triggerId = mobile ? 'home-filter-trigger' : 'home-body-filter-trigger'
  const summary =
    current.length === 1
      ? current[0]
      : current.length
        ? `${current.length} Government bodies`
        : 'All Government bodies'
  return (
    <Sheet
      className="pp-home-filter-sheet"
      title="Filter local issues"
      description="Choose any government bodies for issues and decision records. Leave all unchecked to include every body."
      open={open}
      onOpenChange={(next) => {
        setDraft(current)
        setOpen(next)
      }}
      triggerId={triggerId}
      trigger={(props) =>
        mobile ? (
          <Button
            {...props}
            id={triggerId}
            className="pp-home-inline-filter"
            variant="outline"
            size="touch"
          >
            <SlidersHorizontalIcon aria-hidden="true" /> Filters
            {current.length ? (
              <span className="pp-home-filter-count">{current.length}</span>
            ) : null}
          </Button>
        ) : (
          <Button
            {...props}
            id={triggerId}
            className="pp-home-body-filter"
            variant="outline"
            size="touch"
            aria-label={`Filter government bodies: ${summary}`}
          >
            <span>{summary}</span>
            <ChevronDownIcon aria-hidden="true" />
          </Button>
        )
      }
      footer={
        <div className="pp-home-filter-footer">
          <Button variant="ghost" size="touch" onClick={() => setDraft([])}>
            Reset
          </Button>
          <Button
            size="touch"
            onClick={() => {
              setOpen(false)
              // Keep familiar single-body links; multiple choices use an array.
              void navigate({
                to: '/',
                resetScroll: false,
                search: {
                  area,
                  ...(draft.length === 1
                    ? { body: draft[0] }
                    : draft.length
                      ? { bodies: [...draft].sort() }
                      : {}),
                },
              })
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
        <legend>Government bodies</legend>
        {options.map((label) => (
          <label key={label} data-selected={draft.includes(label) || undefined}>
            <input
              type="checkbox"
              name="home-body"
              value={label}
              checked={draft.includes(label)}
              onChange={(event) => {
                setDraft((selected) =>
                  event.target.checked
                    ? [...selected, label]
                    : selected.filter((value) => value !== label),
                )
              }}
            />
            <span>{label}</span>
          </label>
        ))}
      </fieldset>
    </Sheet>
  )
}
