import { Dialog } from '@base-ui/react/dialog'
import { ArrowLeftIcon, MessageCircleIcon } from 'lucide-react'
import { lazy, Suspense, useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'

import { Button } from '../../components/ui/button'
import { loadAskPageData } from '../../routes/ask.data'
import type { AskRouteData } from '../../routes/ask.data'
import {
  useMediaQuery,
  useOverlay,
  useVisualViewport,
} from '../discovery/hooks'
import { askScopeIdentity } from './contracts'
import type { AskScenario, AskScope } from './contracts'
import './ask.css'
import './mobile-ask.css'

const EmbeddedAskPage = lazy(() =>
  import('./ask-page').then((module) => ({ default: module.AskPage })),
)

export const MOBILE_CHAT_QUERY = '(max-width: 48rem)'

/*
  One phone chat screen for every entry point. The standalone Ask route and
  the floating trigger both render this, so the keyboard, the scroll lock, the
  bar and the open and close motion behave the same wherever chat starts.
*/
export function MobileChatScreen({
  open,
  onOpenChange,
  onOpenChangeComplete,
  keepMounted = false,
  data,
  failed = false,
  source,
  onBack,
  onRestoreScope,
  onSelectSource,
  finalFocus,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onOpenChangeComplete?: (open: boolean) => void
  keepMounted?: boolean
  data: AskRouteData | null
  failed?: boolean
  source?: string
  onBack: () => void
  onRestoreScope: (scope: AskScope) => Promise<void>
  onSelectSource: (id: string | null) => void
  finalFocus?: () => false
}) {
  // Safari can pan the document to reveal a focused textarea even while its
  // overflow is hidden. Freeze the reading document until the screen closes.
  // Only own positioning here; Base UI still owns overflow and nested locks.
  useLayoutEffect(() => {
    if (!open) return
    const body = document.body
    const position = { x: window.scrollX, y: window.scrollY }
    const before = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      width: body.style.width,
    }
    Object.assign(body.style, {
      position: 'fixed',
      top: `${-position.y}px`,
      left: `${-position.x}px`,
      width: '100%',
    })
    return () => {
      Object.assign(body.style, before)
      window.scrollTo({ left: position.x, top: position.y, behavior: 'instant' })
    }
  }, [open])

  const viewport = useVisualViewport()
  const popupRef = useRef<HTMLDivElement>(null)
  const loading = (
    <div className="ask-page ask-page-embedded ask-screen-loading">
      <header className="ask-screen-header">
        <button
          aria-label="Back to reading"
          className="ask-screen-back"
          onClick={onBack}
          type="button"
        >
          <ArrowLeftIcon aria-hidden="true" />
        </button>
        <div className="ask-screen-heading">
          <p className="ask-screen-name">Ask Public Parish</p>
        </div>
      </header>
      <p role="status">
        {failed
          ? 'Chat could not open. Go back and try again.'
          : 'Opening chat…'}
      </p>
    </div>
  )
  const screenStyle = {
    '--ask-viewport-top': `${viewport.top}px`,
    '--ask-viewport-height':
      viewport.height === undefined ? '100dvh' : `${viewport.height}px`,
  } as CSSProperties
  return (
    <Dialog.Root
      open={open}
      onOpenChange={onOpenChange}
      onOpenChangeComplete={onOpenChangeComplete}
    >
      <Dialog.Portal keepMounted={keepMounted}>
        <Dialog.Backdrop className="mobile-chat-backdrop" />
        <Dialog.Popup
          className="mobile-chat-screen"
          ref={popupRef}
          aria-hidden={open ? undefined : true}
          inert={open ? undefined : true}
          data-keyboard-open={viewport.keyboardOpen || undefined}
          style={screenStyle}
          initialFocus={() => {
            popupRef.current
              ?.querySelector<HTMLButtonElement>('.ask-screen-back')
              ?.focus({ preventScroll: true })
            return false
          }}
          finalFocus={finalFocus}
        >
          <Dialog.Title className="visually-hidden">
            Ask Public Parish
          </Dialog.Title>
          {data ? (
            <Suspense fallback={loading}>
              <EmbeddedAskPage
                data={data}
                embedded
                onBack={onBack}
                onRestoreScope={onRestoreScope}
                onSelectSource={onSelectSource}
                source={source}
              />
            </Suspense>
          ) : (
            loading
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export function MobileAsk({
  scopeKey,
  returnTo,
  scenario,
}: {
  scopeKey: string
  returnTo: string
  scenario?: AskScenario
}) {
  const mobile = useMediaQuery(MOBILE_CHAT_QUERY)
  const [open, setOpen] = useState(false)
  useOverlay(open && mobile)
  const [data, setData] = useState<AskRouteData | null>(null)
  const [source, setSource] = useState<string>()
  const [failed, setFailed] = useState(false)
  const triggerId = useId()

  useEffect(() => {
    if (!open || data) return
    let cancelled = false
    void loadAskPageData(scenario, scopeKey, returnTo)
      .then((next) => {
        if (!cancelled) setData(next)
      })
      .catch(() => {
        if (!cancelled) setFailed(true)
      })
    return () => {
      cancelled = true
    }
  }, [open, data, scopeKey, returnTo, scenario])

  if (!mobile) return null
  const close = () => {
    setOpen(false)
    setSource(undefined)
  }
  return (
    <>
      <Button
        aria-label="Ask Public Parish"
        aria-haspopup="dialog"
        aria-expanded={open}
        className="mobile-ask-trigger"
        id={triggerId}
        onClick={() => {
          setFailed(false)
          setOpen(true)
        }}
        size="icon"
      >
        <MessageCircleIcon aria-hidden="true" />
      </Button>
      <MobileChatScreen
        open={open}
        onOpenChange={(next) => {
          if (next) setOpen(true)
          else close()
        }}
        keepMounted={data !== null}
        data={data}
        failed={failed}
        source={source}
        onBack={close}
        onRestoreScope={async (scope) => {
          setData(
            await loadAskPageData(
              scenario,
              askScopeIdentity(scope),
              returnTo,
            ),
          )
        }}
        onSelectSource={(id) => setSource(id ?? undefined)}
        finalFocus={() => {
          document.getElementById(triggerId)?.focus({ preventScroll: true })
          return false
        }}
      />
    </>
  )
}
