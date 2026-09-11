import { Dialog } from '@base-ui/react/dialog'
import { ArrowLeftIcon, MessageCircleIcon } from 'lucide-react'
import { lazy, Suspense, useEffect, useId, useRef, useState } from 'react'
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
import type { AskScenario } from './contracts'
import './ask.css'
import './mobile-ask.css'

const EmbeddedAskPage = lazy(() =>
  import('./ask-page').then((module) => ({ default: module.AskPage })),
)

export function MobileAsk({
  scopeKey,
  returnTo,
  scenario,
}: {
  scopeKey: string
  returnTo: string
  scenario?: AskScenario
}) {
  const mobile = useMediaQuery('(max-width: 48rem)')
  const [open, setOpen] = useState(false)
  const viewport = useVisualViewport()
  const popupRef = useRef<HTMLDivElement>(null)
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
  const loading = (
    <div className="ask-page ask-page-embedded ask-screen-loading">
      <header className="ask-screen-header">
        <button
          aria-label="Back to reading"
          className="ask-screen-back"
          onClick={() => setOpen(false)}
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
      <Dialog.Root
        open={open}
        onOpenChange={(next) => {
          setOpen(next)
          if (!next) setSource(undefined)
        }}
      >
        <Dialog.Portal keepMounted={data !== null}>
          <Dialog.Backdrop className="mobile-chat-backdrop" />
          <Dialog.Popup
            className="mobile-chat-screen"
            ref={popupRef}
            aria-hidden={open ? undefined : true}
            inert={open ? undefined : true}
            style={screenStyle}
            initialFocus={() => {
              popupRef.current
                ?.querySelector<HTMLButtonElement>('.ask-screen-back')
                ?.focus({ preventScroll: true })
              return false
            }}
            finalFocus={() => {
              document.getElementById(triggerId)?.focus({ preventScroll: true })
              return false
            }}
          >
            <Dialog.Title className="visually-hidden">
              Ask Public Parish
            </Dialog.Title>
            {data ? (
              <Suspense fallback={loading}>
                <EmbeddedAskPage
                  data={data}
                  embedded
                  onBack={() => {
                    setOpen(false)
                    setSource(undefined)
                  }}
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
                  source={source}
                />
              </Suspense>
            ) : (
              loading
            )}
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  )
}
