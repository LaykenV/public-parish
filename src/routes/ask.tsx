import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

import {
  askScopeIdentity,
  getActiveAskFixture,
  askScopeKey,
  parseAskSearch,
  routeSearchFromScopeKey,
} from '../features/ask/contracts'
import type { AskScope } from '../features/ask/contracts'
import { AskPage } from '../features/ask/ask-page'
import { MOBILE_CHAT_QUERY, MobileChatScreen } from '../features/ask/mobile-ask'
import { useMediaQuery, useOverlay } from '../features/discovery/hooks'
import { ResidentShell } from '../features/resident-blueprint/resident-shell'
import { loadAskPageData } from './ask.data'

export const Route = createFileRoute('/ask')({
  component: ResidentAsk,
  loaderDeps: ({ search }) => ({
    fixture: getActiveAskFixture(search.fixture),
    returnTo: search.returnTo,
    scopeKey: askScopeKey(search),
  }),
  loader: ({ deps }) =>
    loadAskPageData(deps.fixture, deps.scopeKey, deps.returnTo),
  validateSearch: parseAskSearch,
})

function askExitPath(scope: AskScope): string {
  return scope.kind === 'corpus' ? '/' : scope.returnTo
}

function ResidentAsk() {
  const data = Route.useLoaderData()
  const { source } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const mobile = useMediaQuery(MOBILE_CHAT_QUERY)
  const [leaving, setLeaving] = useState(false)
  useOverlay(mobile)

  const onRestoreScope = (scope: AskScope) =>
    navigate({
      replace: true,
      resetScroll: false,
      search: (prev) => ({
        ...routeSearchFromScopeKey(askScopeIdentity(scope)),
        fixture: prev.fixture,
        returnTo:
          askScopeIdentity(scope) === askScopeKey(prev)
            ? prev.returnTo
            : undefined,
        source: prev.source,
      }),
    })
  const onSelectSource = (selected: string | null) =>
    navigate({
      replace: true,
      resetScroll: false,
      search: (prev) => ({ ...prev, source: selected ?? undefined }),
    })

  if (mobile) {
    // The phone screen leaves the way it arrived: it plays its exit motion
    // and only then hands the display back to the page it came from.
    const leave = () => setLeaving(true)
    return (
      <ResidentShell>
        <main className="ask-screen-anchor" id="resident-main" />
        <MobileChatScreen
          open={!leaving}
          onOpenChange={(next) => {
            if (!next) leave()
          }}
          onOpenChangeComplete={(open) => {
            if (!open) void navigate({ to: askExitPath(data.scope) })
          }}
          data={data}
          source={source}
          onBack={leave}
          onRestoreScope={onRestoreScope}
          onSelectSource={onSelectSource}
        />
      </ResidentShell>
    )
  }

  return (
    <ResidentShell>
      <AskPage
        data={data}
        onRestoreScope={onRestoreScope}
        onSelectSource={onSelectSource}
        source={source}
      />
    </ResidentShell>
  )
}
