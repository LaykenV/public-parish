import { MessageCircleIcon } from 'lucide-react'
import { lazy, Suspense, useEffect, useId, useState } from 'react'

import { Button } from '../../components/ui/button'
import { loadAskPageData } from '../../routes/ask.data'
import type { AskRouteData } from '../../routes/ask.data'
import { useMediaQuery } from '../discovery/hooks'
import { Sheet } from '../discovery/sheet'
import { askScopeIdentity } from './contracts'
import type { AskScenario } from './contracts'
import './mobile-ask.css'

const EmbeddedAskPage = lazy(() => import('./ask-page').then((module) => ({ default: module.AskPage })))

export function MobileAsk({ scopeKey, returnTo, scenario }: {
  scopeKey: string
  returnTo: string
  scenario?: AskScenario
}) {
  const mobile = useMediaQuery('(max-width: 48rem)')
  const [open, setOpen] = useState(false)
  const [data, setData] = useState<AskRouteData | null>(null)
  const [source, setSource] = useState<string>()
  const [failed, setFailed] = useState(false)
  const triggerId = useId()

  useEffect(() => {
    if (!open || data) return
    let cancelled = false
    void loadAskPageData(scenario, scopeKey, returnTo).then((next) => {
      if (!cancelled) setData(next)
    }).catch(() => { if (!cancelled) setFailed(true) })
    return () => { cancelled = true }
  }, [open, data, scopeKey, returnTo, scenario])

  if (!mobile) return null
  return (
    <>
      <Button
        aria-label="Ask Public Parish"
        aria-haspopup="dialog"
        aria-expanded={open}
        className="mobile-ask-trigger"
        id={triggerId}
        onClick={() => { setFailed(false); setOpen(true) }}
        size="icon"
      >
        <MessageCircleIcon aria-hidden="true" />
      </Button>
      <Sheet
        className="mobile-ask-sheet"
        keepMounted={data !== null}
        open={open}
        onOpenChange={(next) => { setOpen(next); if (!next) setSource(undefined) }}
        size="full"
        title="Ask Public Parish"
        triggerId={triggerId}
      >
        {data ? (
          <Suspense fallback={<p role="status">Opening chat…</p>}>
            <EmbeddedAskPage
              data={data}
              embedded
              onRestoreScope={async (scope) => {
                setData(await loadAskPageData(scenario, askScopeIdentity(scope), returnTo))
              }}
              onSelectSource={(id) => setSource(id ?? undefined)}
              source={source}
            />
          </Suspense>
        ) : <p role="status">{failed ? 'Chat could not open. Close this drawer and try again.' : 'Opening chat…'}</p>}
      </Sheet>
    </>
  )
}
