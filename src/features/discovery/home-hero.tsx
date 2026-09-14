import { ArrowUpRightIcon, SearchIcon } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'

import { Button } from '../../components/ui/button'
import { LouisianaRelief } from '../landing/louisiana-relief'
import type { ReliefFraming } from '../landing/louisiana-relief'
import { AreaSelector } from './area-selector'
import { BODY_GROUPS } from './contracts'
import type { HeroVariant } from './contracts'
import { useMediaQuery } from './hooks'

import './home-hero.css'

// Three hero candidates for owner review. The shipped hero stays the default
// until one is chosen; `?hero=` previews the others without changing Home.
export function FirstVisitHero({ variant }: { variant?: HeroVariant }) {
  switch (variant) {
    case 'plinth':
      return <PlinthHero />
    case 'horizon':
      return <HorizonHero />
    case 'record':
      return <RecordHero />
    default:
      return <CurrentHero />
  }
}

function HeroCopy({ children }: { children?: ReactNode }) {
  return (
    <>
      <h1 id="home-title" tabIndex={-1}>
        Understand what Louisiana's government is deciding.
      </h1>
      <p>
        See the documents behind each decision and follow what happens next.
      </p>
      {children}
    </>
  )
}

function HeroActions({ light = false }: { light?: boolean }) {
  return (
    <div className="pp-home-hero-actions">
      <AreaSelector
        trigger={(props) => (
          <Button
            {...props}
            className={light ? 'pp-home-hero-action-light' : undefined}
            size="touch"
          >
            <SearchIcon aria-hidden="true" /> Focus on a parish
          </Button>
        )}
      />
      <a href="#stories">
        Browse Louisiana stories <ArrowUpRightIcon aria-hidden="true" />
      </a>
    </div>
  )
}

function HeroAccess() {
  return (
    <p className="pp-home-access">
      Free to read and ask questions. No account needed.
    </p>
  )
}

function CurrentHero() {
  const desktop = useMediaQuery('(min-width: 48.001rem)')
  return (
    <section
      className="pp-home-hero"
      aria-labelledby="home-title"
      data-relief-interaction
    >
      <div className="pp-home-hero-copy">
        <HeroCopy>
          <HeroActions />
          <HeroAccess />
        </HeroCopy>
      </div>
      <div className="pp-home-relief">
        {desktop ? <LouisianaRelief /> : null}
      </div>
    </section>
  )
}

// Plinth: the state as a lit object in a dark gallery. Centered copy above,
// the relief below on a plum field that runs the full viewport width.
function PlinthHero() {
  return (
    <section
      className="pp-home-hero pp-hero-plinth"
      aria-labelledby="home-title"
      data-relief-interaction
    >
      <div className="pp-hero-plinth-inner">
        <div className="pp-home-hero-copy">
          <HeroCopy>
            <HeroActions light />
            <HeroAccess />
          </HeroCopy>
        </div>
        <div className="pp-home-relief pp-hero-plinth-relief">
          <LouisianaRelief framing={{ zoom: 0.84, offsetY: 0.02 }} />
        </div>
      </div>
    </section>
  )
}

// A positive pitch leans the Gulf coast toward the viewer.
const HORIZON_FRAMING: ReliefFraming = {
  zoom: 0.6,
  offsetY: 0.02,
  pitch: 0.3,
}

// Phones get the same low view but pulled back so the whole state fits.
const HORIZON_FRAMING_NARROW: ReliefFraming = {
  zoom: 0.86,
  offsetY: 0.02,
  pitch: 0.3,
}

// Horizon: one wide headline, then the state seen low across the land like an
// atlas plate, with the covered parishes named beneath as places to focus.
function HorizonHero() {
  const desktop = useMediaQuery('(min-width: 48.001rem)')
  return (
    <section
      className="pp-home-hero pp-hero-horizon"
      aria-labelledby="home-title"
      data-relief-interaction
    >
      <div className="pp-home-hero-copy">
        <h1 id="home-title" tabIndex={-1}>
          Understand what Louisiana's government is deciding.
        </h1>
      </div>
      <div className="pp-hero-horizon-row">
        <p>
          See the documents behind each decision and follow what happens next.
        </p>
        <div>
          <HeroActions />
          <HeroAccess />
        </div>
      </div>
      <div className="pp-hero-horizon-plate">
        <div className="pp-home-relief pp-hero-horizon-relief">
          <LouisianaRelief
            framing={desktop ? HORIZON_FRAMING : HORIZON_FRAMING_NARROW}
            labels={false}
          />
        </div>
        <ul className="pp-hero-legend" aria-label="Covered parishes">
          {BODY_GROUPS.map((group) => (
            <li key={group.slug}>
              <Link to="/" search={{ area: group.slug }}>
                {group.place}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

const COVERED_BODY_COUNT = BODY_GROUPS.reduce(
  (count, group) => count + group.bodies.length,
  0,
)

// Record: the state mounted on an exhibit card whose caption is the actual
// coverage list, so the frame carries information rather than decoration.
function RecordHero() {
  return (
    <section
      className="pp-home-hero pp-hero-record"
      aria-labelledby="home-title"
    >
      <div className="pp-home-hero-copy">
        <HeroCopy>
          <HeroActions />
          <HeroAccess />
        </HeroCopy>
      </div>
      <figure className="pp-hero-record-card" data-relief-interaction>
        <div className="pp-home-relief pp-hero-record-relief">
          <LouisianaRelief
            framing={{ zoom: 0.88, offsetY: 0.03 }}
            labels={false}
          />
        </div>
        <figcaption className="pp-hero-record-caption">
          <p>
            Public Parish reads {COVERED_BODY_COUNT} government bodies in{' '}
            {BODY_GROUPS.length} parishes.
          </p>
          <ul>
            {BODY_GROUPS.map((group) => (
              <li key={group.slug}>
                <Link to="/" search={{ area: group.slug }}>
                  {group.place}
                </Link>
                <span>{group.bodies.length} bodies</span>
              </li>
            ))}
          </ul>
        </figcaption>
      </figure>
    </section>
  )
}
