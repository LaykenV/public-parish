import { Dialog } from '@base-ui/react/dialog'
import { ResidentLoadingContent, usePageLoading } from './resident-loading'
import { VoterFooter } from './voter-footer'
import {
  CircleUserRoundIcon,
  HouseIcon,
  MapPinIcon,
  MessageCircleQuestionIcon,
  SearchIcon,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { ComponentType, ReactNode, SVGProps } from 'react'
import { Link, useRouterState } from '@tanstack/react-router'

import { AreaSelector } from '../discovery/area-selector'
import { useArea } from '../discovery/area-store'
import { areaName } from '../discovery/contracts'
import {
  useKeyboardOpen,
  useMediaQuery,
  useOnline,
  useOverlay,
  useOverlayOpen,
} from '../discovery/hooks'
import { parseResidentReturnTo } from '../resident-handoff/navigation'

import { Button } from '../../components/ui/button'

import { LOUISIANA_OUTLINE_PATH } from '../landing/louisiana-path'

import './resident-blueprint.css'
import '../discovery/discovery.css'

type NavigationItem = {
  href: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
  label: string
}

const PRIMARY_NAVIGATION: NavigationItem[] = [
  { href: '/', icon: HouseIcon, label: 'Home' },
  { href: '/explore', icon: SearchIcon, label: 'Explore' },
  { href: '/ask', icon: MessageCircleQuestionIcon, label: 'Ask' },
  { href: '/coverage', icon: LouisianaIcon, label: 'Coverage' },
]

const STATIC_ROUTE_LABELS: Record<string, string> = {
  '/': 'Home',
  '/ask': 'Ask Public Parish',
  '/coverage': 'Coverage',
  '/coverage/request': 'Request coverage',
  '/explore': 'Explore',
  '/following': 'Following',
  '/following/areas-and-topics': 'Areas and topics',
  '/following/notifications': 'Notifications',
  '/for-you': 'Home',
  '/how-it-works': 'How Public Parish works',
  '/issues': 'Home',
  '/privacy': 'Privacy',
}

export function residentRouteLabel(pathname: string): string {
  const staticLabel = STATIC_ROUTE_LABELS[pathname]
  if (staticLabel) return staticLabel
  if (pathname.startsWith('/decisions/')) return 'Decision record'
  if (pathname.startsWith('/email/manage/')) return 'Manage this follow'
  if (pathname.startsWith('/issues/')) return 'Issue'
  if (pathname.startsWith('/meetings/')) return 'Meeting'
  return 'Page'
}

export function residentDocumentTitle(
  pathname: string,
  headingText: string | null | undefined,
): string {
  const heading = headingText?.trim()
  return heading
    ? `${heading} | Public Parish`
    : `${residentRouteLabel(pathname)} | Public Parish`
}

export function ResidentRouteAccessibility() {
  const { isLoading, pathname } = useRouterState({
    select: (state) => ({
      isLoading: state.isLoading,
      pathname: state.location.pathname,
    }),
  })
  const pageLoading = usePageLoading()
  const previousPath = useRef<string | null>(null)
  const [announcement, setAnnouncement] = useState('')

  useEffect(() => {
    if (isLoading || pageLoading) return

    const updateDocumentTitle = () => {
      const heading = document.querySelector<HTMLElement>('#resident-main h1')
      document.title = residentDocumentTitle(pathname, heading?.textContent)
    }

    updateDocumentTitle()
    const observer = new MutationObserver(updateDocumentTitle)
    observer.observe(document.body, {
      characterData: true,
      childList: true,
      subtree: true,
    })

    return () => observer.disconnect()
  }, [isLoading, pageLoading, pathname])

  useEffect(() => {
    if (isLoading || pageLoading) return

    const fallbackLabel = residentRouteLabel(pathname)
    let innerFrame = 0
    const frame = window.requestAnimationFrame(() => {
      innerFrame = window.requestAnimationFrame(() => {
        const heading = document.querySelector<HTMLElement>('#resident-main h1')

        if (
          previousPath.current !== null &&
          previousPath.current !== pathname
        ) {
          // Moving focus to the heading already reads it aloud. Announcing the
          // same text again would say the page name twice, so the live region
          // only speaks when there is no heading to land on.
          if (heading) {
            heading.setAttribute('tabindex', '-1')
            heading.addEventListener(
              'blur',
              () => heading.removeAttribute('tabindex'),
              { once: true },
            )
            heading.focus({ preventScroll: true })
            setAnnouncement('')
          } else {
            setAnnouncement(`${fallbackLabel} page loaded.`)
          }
        }
        previousPath.current = pathname
      })
    })

    return () => {
      window.cancelAnimationFrame(frame)
      window.cancelAnimationFrame(innerFrame)
    }
  }, [isLoading, pageLoading, pathname])

  return (
    <p
      aria-atomic="true"
      aria-live="polite"
      className="visually-hidden"
      role="status"
    >
      {announcement}
    </p>
  )
}

function LouisianaIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 260 240" {...props}>
      <path
        d={LOUISIANA_OUTLINE_PATH}
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="14"
      />
    </svg>
  )
}

export function ResidentShell({ children }: { children: ReactNode }) {
  const { currentHref, pathname } = useRouterState({
    select: (state) => ({
      currentHref: state.location.href,
      pathname: state.location.pathname,
    }),
  })
  const area = useArea()
  const keyboardOpen = useKeyboardOpen()
  const overlayOpen = useOverlayOpen()
  const online = useOnline()
  const pageLoading = usePageLoading()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const updateScrolled = () => setScrolled(window.scrollY > 8)
    updateScrolled()
    window.addEventListener('scroll', updateScrolled, { passive: true })
    return () => window.removeEventListener('scroll', updateScrolled)
  }, [])

  return (
    <div
      className="resident-blueprint"
      data-keyboard-open={keyboardOpen ? '' : undefined}
      data-offline={online ? undefined : ''}
      data-overlay-open={overlayOpen ? '' : undefined}
    >
      <a className="resident-skip-link" href="#resident-main">
        Skip to content
      </a>

      <header className="resident-header" data-scrolled={scrolled || undefined}>
        <div className="resident-header-inner">
          <Link
            aria-current={pathname === '/' ? 'page' : undefined}
            className="resident-brand"
            to="/"
            aria-label="Public Parish home"
          >
            <img src="/brand-mark.svg" alt="" width="32" height="32" />
            <span>Public Parish</span>
          </Link>

          <nav className="resident-desktop-nav" aria-label="Primary navigation">
            {PRIMARY_NAVIGATION.map((item) => (
              <ResidentNavigationLink
                item={item}
                key={item.href}
                pathname={pathname}
              />
            ))}
          </nav>

          <div className="resident-context-controls">
            <AreaSelector
              trigger={(props) => (
                <button
                  {...props}
                  className="resident-context-control"
                  type="button"
                >
                  <MapPinIcon aria-hidden="true" />
                  <span className="resident-context-label">
                    {area ? areaName(area) : 'Choose area'}
                  </span>
                </button>
              )}
            />
            <Link
              className="resident-account-control"
              search={{
                returnTo: pathname.startsWith('/following')
                  ? undefined
                  : parseResidentReturnTo(currentHref),
              }}
              to="/following"
              aria-label="Open account and following"
            >
              <CircleUserRoundIcon aria-hidden="true" />
            </Link>
          </div>
          <MobileNavigation pathname={pathname} />
        </div>
        {online ? null : (
          <div className="pp-offline-bar" role="status">
            {pageLoading
              ? 'You are offline. Reconnect to load this page.'
              : 'You are offline. Showing the information already loaded.'}
          </div>
        )}
      </header>

      <ResidentLoadingContent>
        {children}

        <footer className="resident-footer">
          <div className="resident-footer-inner">
            <Link
              className="resident-brand"
              to="/"
              aria-label="Public Parish home"
            >
              <img src="/brand-mark.svg" alt="" width="32" height="32" />
              <span>Public Parish</span>
            </Link>
            <nav aria-label="About Public Parish">
              <Link to="/how-it-works">How it works</Link>
              <Link to="/coverage">Coverage</Link>
              <Link to="/privacy">Privacy</Link>
              <a
                href="https://github.com/LaykenV/public-parish"
                rel="noreferrer"
                target="_blank"
              >
                Source code
              </a>
            </nav>
            <VoterFooter />
            <p>Official evidence is public. Resident activity stays private.</p>
          </div>
        </footer>
      </ResidentLoadingContent>
    </div>
  )
}

function MobileNavigation({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false)
  const [areaOpen, setAreaOpen] = useState(false)
  const area = useArea()
  const desktop = useMediaQuery('(min-width: 64.0625rem)')
  useOverlay(open)

  useEffect(() => {
    setOpen(false)
    setAreaOpen(false)
  }, [pathname, desktop])

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next, details) => {
        // The area drawer has its own portal and focus manager. Keep its
        // containing menu mounted while focus moves into that drawer.
        if (!next && areaOpen) {
          details.cancel()
          return
        }
        setOpen(next)
      }}
    >
      <Dialog.Trigger
        render={
          <Button
            className="resident-menu-trigger"
            size="icon-xl"
            variant="ghost"
          />
        }
        aria-label="Open menu"
        data-open={open ? '' : undefined}
      >
        <MobileMenuIcon />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Popup className="resident-menu">
          <Dialog.Title className="visually-hidden">Menu</Dialog.Title>
          <div className="resident-menu-head">
            <Dialog.Close
              aria-label="Close menu"
              className="resident-menu-trigger"
              render={<Button size="icon-xl" variant="ghost" />}
              data-open
            >
              <MobileMenuIcon />
            </Dialog.Close>
          </div>
          <div className="resident-menu-body">
            <nav
              aria-label="Primary navigation"
              className="resident-menu-links"
            >
              {PRIMARY_NAVIGATION.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={
                    pathname === item.href ||
                    pathname.startsWith(`${item.href}/`)
                      ? 'page'
                      : undefined
                  }
                >
                  <item.icon aria-hidden="true" />
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="resident-menu-bottom">
              <Link
                className="resident-menu-account"
                to="/following"
                onClick={() => setOpen(false)}
                aria-current={
                  pathname.startsWith('/following') ? 'page' : undefined
                }
              >
                <CircleUserRoundIcon aria-hidden="true" />
                Account
              </Link>
              <div className="resident-menu-area">
                <p>
                  {area
                    ? `Showing ${areaName(area)}`
                    : 'Choose your local area'}
                </p>
                <AreaSelector
                  open={areaOpen}
                  onOpenChange={setAreaOpen}
                  trigger={(props) => (
                    <Button
                      {...props}
                      className="resident-menu-area-button"
                      size="touch"
                      variant="outline"
                    >
                      <MapPinIcon aria-hidden="true" />
                      Change area
                    </Button>
                  )}
                />
              </div>
            </div>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function MobileMenuIcon() {
  return (
    <svg className="resident-hamburger" viewBox="0 0 24 24" aria-hidden="true">
      <path className="resident-hamburger-line" d="M4 8h16" />
      <path className="resident-hamburger-line" d="M4 16h16" />
    </svg>
  )
}

function ResidentNavigationLink({
  item,
  pathname,
}: {
  item: NavigationItem
  pathname: string
}) {
  const isActive =
    pathname === item.href || pathname.startsWith(`${item.href}/`)
  const Icon = item.icon

  return (
    <Link
      aria-current={isActive ? 'page' : undefined}
      className="resident-nav-link"
      data-active={isActive ? '' : undefined}
      to={item.href}
      onClick={(event) => {
        if (!isActive) return
        event.preventDefault()
        const reduced = window.matchMedia(
          '(prefers-reduced-motion: reduce)',
        ).matches
        window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' })
      }}
    >
      <Icon aria-hidden="true" />
      <span>{item.label}</span>
    </Link>
  )
}

export function ResidentStandalone({ children }: { children: ReactNode }) {
  return (
    <div className="resident-blueprint resident-blueprint-standalone">
      <a className="resident-skip-link" href="#resident-main">
        Skip to content
      </a>
      <header className="resident-standalone-header">
        <Link aria-label="Public Parish home" className="resident-brand" to="/">
          <img src="/brand-mark.svg" alt="" width="32" height="32" />
          <span>Public Parish</span>
        </Link>
      </header>
      <ResidentLoadingContent>{children}</ResidentLoadingContent>
    </div>
  )
}
