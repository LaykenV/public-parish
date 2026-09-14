import { useNavigate } from '@tanstack/react-router'

import { useRecordAreaSelection } from '../analytics/product-analytics'
import { setArea } from './area-store'
import { useCoverageAreas } from './live-areas'
import type { AreaSlug } from './contracts'

const PARISH_LABELS: { slug: AreaSlug; label: string; position: string }[] = [
  { slug: 'rapides-parish', label: 'Rapides', position: 'rapides' },
  { slug: 'lafayette-parish', label: 'Lafayette', position: 'lafayette' },
  {
    slug: 'east-baton-rouge-parish',
    label: 'East Baton Rouge',
    position: 'baton-rouge',
  },
]

export function HomeParishLabels() {
  const areas = useCoverageAreas()
  const navigate = useNavigate()
  const recordAreaSelection = useRecordAreaSelection()

  return (
    <div
      className="relief-map-labels"
      role="group"
      aria-label="Choose a parish on Louisiana"
    >
      {PARISH_LABELS.map(({ slug, label, position }) => {
        const area = areas.find((entry) => entry.slug === slug)
        const selectable =
          area?.status === 'available' || area?.status === 'limited'
        return (
          <button
            key={slug}
            className={`relief-map-label relief-map-label-${position}`}
            type="button"
            disabled={!selectable}
            aria-label={`Select ${label} Parish`}
            title={area?.note ?? 'Checking parish coverage.'}
            onClick={() => {
              setArea(slug)
              recordAreaSelection(slug)
              void navigate({ to: '/', search: { area: slug } })
            }}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
