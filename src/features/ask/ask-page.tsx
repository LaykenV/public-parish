import { Link } from '@tanstack/react-router'
import { useConvex } from 'convex/react'
import { ArrowLeftIcon } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'

import { PageLoading } from '../resident-blueprint/resident-loading'
import { resolveCitationId } from '../evidence/contracts'
import type { CitationMap } from '../evidence/contracts'
import { EvidenceProvider } from '../evidence/evidence-surface'
import { useVisualViewport, useOnline, useMediaQuery } from '../discovery/hooks'
import {
  AskRequestError,
  askScopeIdentity,
  countAnswerSources,
  MAX_ASK_LENGTH,
  shouldConfirmAskScopeChange,
} from './contracts'
import type {
  AskAdapter,
  AskAvailability,
  AskConversationView,
  AskRecentConversation,
  AskScope,
  AskTurnState,
} from './contracts'
import { setAskDraftHandoff, takeAskDraftHandoff } from './draft-handoff'
import { AskComposer } from './ask-composer'
import { createLiveAskAdapter } from './live-adapter'
import { AskThread } from './ask-thread'
import {
  AskCaptchaNotice,
  AskCooldownNotice,
  AskExpiredNotice,
  AskOfflineNotice,
  AskRecent,
  AskScopeConfirm,
  AskStatusRegion,
  AskUnavailable,
} from './ask-states'
import type { AskRouteData } from '../../routes/ask.data'

import './ask.css'

/*
  Ask Public Parish. Composition owns the availability gate, the state model,
  and the draft; it does not own provider calls. The live adapter owns private
  session and provider work. Explicit development scenarios still load through
  a dev-only dynamic import and never ship.
*/

const ASK_EXAMPLES = [
  'What decisions changed this week?',
  'What was approved about drainage?',
]

const EXPIRY_SWEEP_MS = 30_000

export function AskPage({
  data,
  embedded = false,
  onBack,
  onRestoreScope,
  onSelectSource,
  source,
}: {
  data: AskRouteData
  embedded?: boolean
  onBack?: () => void
  onRestoreScope: (scope: AskScope) => Promise<void>
  onSelectSource: (id: string | null) => void
  source?: string
}) {
  const viewport = useVisualViewport()
  const mobile = useMediaQuery('(max-width: 48rem)')
  const convex = useConvex()
  const online = useOnline()

  const [adapter, setAdapter] = useState<AskAdapter | null>(null)
  const [availability, setAvailability] = useState<AskAvailability>(
    data.availability,
  )
  const [conversation, setConversation] = useState<AskConversationView | null>(
    null,
  )
  const [recent, setRecent] = useState<AskRecentConversation[]>([])
  const [viewScope, setViewScope] = useState<AskScope>(data.scope)
  const [draft, setDraft] = useState('')
  const [dismissed, setDismissed] = useState<ReadonlySet<string>>(
    () => new Set(),
  )
  const [expired, setExpired] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState('')
  const [pendingScope, setPendingScope] = useState<{
    draft: string | null
    scope: AskScope
  } | null>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const threadRef = useRef<HTMLElement>(null)
  const previousConversation = useRef<AskConversationView | null>(null)
  const submitLock = useRef(false)

  // Consume the in-memory draft handoff, and when the public scope changes by
  // navigation, drop the previous conversation instead of showing it under a
  // new scope. Opening a recent handle goes through openHandle instead and
  // keeps its own scope.
  const consumedScope = useRef<string | null>(null)
  useEffect(() => {
    const identity = askScopeIdentity(data.scope)
    const changed = consumedScope.current !== identity
    consumedScope.current = identity
    if (!changed) return
    const handed = takeAskDraftHandoff(identity)
    const activeConversation = previousConversation.current
    if (shouldConfirmAskScopeChange(activeConversation, data.scope)) {
      setPendingScope({ draft: handed, scope: data.scope })
      return
    }
    setPendingScope(null)
    setViewScope(data.scope)
    setExpired(false)
    setDismissed(new Set())
    if (handed) {
      previousConversation.current = null
      setConversation(null)
      setDraft(handed)
      return
    }
    setConversation((current) => {
      if (!current || askScopeIdentity(current.scope) === identity) {
        return current
      }
      previousConversation.current = null
      return null
    })
  }, [data.scope])

  useEffect(() => {
    if (!import.meta.env.DEV || !data.scenario) {
      setAdapter(createLiveAskAdapter(convex, window.localStorage))
      return
    }
    let cancelled = false
    import('./fixtures').then(({ getAskFixtureAdapter }) => {
      if (!cancelled) setAdapter(getAskFixtureAdapter(data.scenario!))
    })
    return () => {
      cancelled = true
    }
  }, [convex, data.scenario])

  useEffect(() => {
    if (!adapter) return
    let cancelled = false
    void adapter
      .resolveScope(data.routeSearch)
      .then((resolved) => {
        if (cancelled) return
        const activeConversation = previousConversation.current
        if (shouldConfirmAskScopeChange(activeConversation, resolved)) {
          setPendingScope((current) =>
            current ? { ...current, scope: resolved } : current,
          )
          return
        }
        setViewScope(resolved)
      })
      .catch(() => {
        if (!cancelled) setAvailability({ kind: 'offline' })
      })
    return () => {
      cancelled = true
    }
  }, [adapter, data.routeSearch])

  const handleAvailability = useCallback((next: AskAvailability) => {
    setAvailability(next)
    if (next.kind === 'cooldown') {
      setStatus('Ask is paused until capacity resets')
    }
    if (next.kind === 'captcha') {
      setStatus('Please complete this quick check')
    }
  }, [])

  const handleConversation = useCallback((next: AskConversationView | null) => {
    setConversation(next)
    // A conversation on the page is not an expired one. Without this the
    // notice outlives the thread that replaced it, and its restart action
    // would then clear the conversation the resident just started.
    if (next) setExpired(false)
    const previous = previousConversation.current
    previousConversation.current = next
    if (!next || !previous || previous.id !== next.id) return

    const added = next.turns[next.turns.length - 1]
    if (next.turns.length > previous.turns.length) {
      if (added.state === 'checking') {
        setStatus('Checking the official record')
      }
    }
    for (const turn of next.turns) {
      const before = previous.turns.find((item) => item.id === turn.id)
      if (before?.state === 'checking' && turn.state === 'allowance_paused') {
        setStatus(
          'Ask is paused because its paid allowance is unavailable. No restart time is available yet.',
        )
      }
      if (
        before?.state === 'checking' &&
        turn.state === 'complete' &&
        turn.answer
      ) {
        setStatus(
          turn.answer.kind === 'supported'
            ? `Answer ready with ${countAnswerSources(turn.answer)} sources`
            : 'The published evidence did not answer the question',
        )
      }
    }
  }, [])

  useEffect(() => {
    if (!adapter) return
    return adapter.subscribe((update) => {
      if (update.kind === 'conversation')
        handleConversation(update.conversation)
      else if (update.kind === 'availability')
        handleAvailability(update.availability)
      else if (update.kind === 'recent') setRecent(update.recent)
      else {
        previousConversation.current = null
        setConversation(null)
        setExpired(true)
        setDraft('')
      }
    })
  }, [adapter, handleConversation, handleAvailability])

  const turns = conversation?.turns ?? []
  const lastTurn = turns.length > 0 ? turns[turns.length - 1] : null
  const checking = turns.some((turn) => turn.state === 'checking')
  const blockingRetry =
    lastTurn?.state === 'retryable_failure' && !dismissed.has(lastTurn.id)
  const cooldown = availability.kind === 'cooldown'
  const captcha = availability.kind === 'captcha'
  const offline = !online || availability.kind === 'offline'
  const composerDisabled =
    submitting || checking || blockingRetry || cooldown || captcha || offline
  const canSubmit =
    !composerDisabled &&
    draft.trim().length > 0 &&
    draft.length <= MAX_ASK_LENGTH

  // Focus the frozen question after submission, and a retryable notice that
  // requires action. No focus move when the answer itself arrives.
  const lastTurnId = lastTurn?.id ?? null
  const lastTurnState: AskTurnState | null = lastTurn?.state ?? null
  useEffect(() => {
    if (lastTurnId && lastTurnState === 'checking') {
      const question = document.getElementById(`ask-turn-${lastTurnId}`)
      const region = question?.closest('.ask-thread-region')
      if (region && question) {
        region.scrollTop +=
          question.getBoundingClientRect().top -
          region.getBoundingClientRect().top
      }
    }
    if (
      lastTurnId &&
      lastTurnState === 'retryable_failure' &&
      !dismissed.has(lastTurnId)
    ) {
      document.getElementById(`ask-failure-${lastTurnId}`)?.focus()
    }
  }, [dismissed, lastTurnId, lastTurnState])

  // A reopened conversation starts at its latest exchange.
  const conversationId = conversation?.id ?? null
  useEffect(() => {
    const region = threadRef.current
    if (!region || !conversationId) return
    region.scrollTop = region.scrollHeight
  }, [conversationId])

  // A keyboard shrinks the conversation from below. A reader who was at the
  // latest answer stays there instead of losing it behind the keyboard.
  useEffect(() => {
    const region = threadRef.current
    if (!region || typeof ResizeObserver === 'undefined') return
    let nearBottom =
      region.scrollHeight - region.scrollTop - region.clientHeight < 48
    const track = () => {
      nearBottom =
        region.scrollHeight - region.scrollTop - region.clientHeight < 48
    }
    const observer = new ResizeObserver(() => {
      if (nearBottom) region.scrollTop = region.scrollHeight
    })
    region.addEventListener('scroll', track, { passive: true })
    observer.observe(region)
    return () => {
      region.removeEventListener('scroll', track)
      observer.disconnect()
    }
  }, [adapter])

  // A paused device returns to Ask once its own retry time has passed.
  useEffect(() => {
    if (availability.kind !== 'cooldown') return
    const wait =
      Math.max(0, Date.parse(availability.retryAt) - Date.now()) + 1000
    const timer = window.setTimeout(
      () => setAvailability({ kind: 'available' }),
      wait,
    )
    return () => window.clearTimeout(timer)
  }, [availability])

  useEffect(() => {
    if (online && availability.kind === 'offline') {
      setAvailability({ kind: 'available' })
    }
  }, [availability.kind, online])

  // Expiry removes private content from the page and the recent handles.
  useEffect(() => {
    if (!conversation || !adapter) return
    const sweep = () => {
      if (Date.parse(conversation.expiresAt) >= Date.now()) return
      previousConversation.current = null
      setConversation(null)
      setExpired(true)
      setDismissed(new Set())
      setDraft('')
      void adapter.listRecent().then(setRecent)
    }
    const timer = window.setInterval(sweep, EXPIRY_SWEEP_MS)
    return () => window.clearInterval(timer)
  }, [adapter, conversation])

  const openHandle = useCallback(
    async (handle: AskRecentConversation) => {
      if (!adapter) return
      const view = await adapter.open(handle.localHandle)
      if (!view) {
        setRecent((current) =>
          current.filter((item) => item.localHandle !== handle.localHandle),
        )
        setExpired(true)
        previousConversation.current = null
        setConversation(null)
        return
      }
      setExpired(false)
      setDismissed(new Set())
      setViewScope(view.scope)
      // Install the conversation first so the route-sync effect recognizes
      // the same scope and does not ask to clear the thread just opened.
      handleConversation(view)
      await onRestoreScope(view.scope)
    },
    [adapter, handleConversation, onRestoreScope],
  )

  const handleOpenRecent = useCallback(
    (handle: AskRecentConversation) => {
      void openHandle(handle)
    },
    [openHandle],
  )

  const confirmScopeChange = useCallback(() => {
    const pending = pendingScope
    if (!pending) return
    setPendingScope(null)
    previousConversation.current = null
    setConversation(null)
    setViewScope(pending.scope)
    setExpired(false)
    setDismissed(new Set())
    setDraft(pending.draft ?? '')
    void adapter?.startNew(pending.scope)
  }, [adapter, pendingScope])

  const cancelScopeChange = useCallback(() => {
    const pending = pendingScope
    setPendingScope(null)
    if (pending?.draft) {
      setAskDraftHandoff(askScopeIdentity(pending.scope), pending.draft)
      setStatus(
        'That draft is still available if you return to the new evidence scope',
      )
    }
    void onRestoreScope(viewScope)
  }, [onRestoreScope, pendingScope, viewScope])

  const handleClearRecent = useCallback(async () => {
    if (!adapter) return
    await adapter.clearRecent()
    setRecent([])
  }, [adapter])

  const expandComposer = useCallback(() => {
    window.requestAnimationFrame(() =>
      inputRef.current?.focus({ preventScroll: true }),
    )
  }, [])

  const handleSuggestion = useCallback(
    (suggestion: string) => {
      setDraft(suggestion)
      expandComposer()
    },
    [expandComposer],
  )

  const handleSubmit = useCallback(async () => {
    if (!adapter || !canSubmit || submitLock.current) return
    submitLock.current = true
    setSubmitting(true)
    setStatus('Checking the official record')
    const question = draft.trim()
    try {
      await adapter.submit({
        conversationId: conversation?.id,
        scope: viewScope,
        question,
        idempotencyKey: crypto.randomUUID(),
      })
    } catch (error) {
      if (!(error instanceof AskRequestError)) throw error
      // A refusal carries the state that caused it. Apply it here instead of
      // waiting for the adapter to push, so the page can never leave an
      // enabled composer whose Send silently does nothing. Keep the draft.
      if (error.failure.kind === 'not_sent') {
        setStatus('Question was not sent. Try again.')
        return
      }
      handleAvailability(error.failure)
      return
    } finally {
      submitLock.current = false
      setSubmitting(false)
    }
    // Clear the draft only after the submission is accepted.
    setDraft('')
    setExpired(false)
  }, [
    adapter,
    canSubmit,
    conversation?.id,
    draft,
    handleAvailability,
    viewScope,
  ])

  const handleRetry = useCallback(
    async (turnId: string) => {
      if (!adapter || !conversation) return
      setStatus('Checking the official record')
      try {
        await adapter.retry({ conversationId: conversation.id, turnId })
      } catch (error) {
        if (!(error instanceof AskRequestError)) throw error
        if (error.failure.kind === 'not_sent') {
          setStatus('Question was not sent. Try again.')
          return
        }
        handleAvailability(error.failure)
        return
      }
    },
    [adapter, conversation, handleAvailability],
  )

  const handleDismiss = useCallback((turnId: string) => {
    setDismissed((current) => new Set(current).add(turnId))
  }, [])

  const handleResolveChallenge = useCallback(async () => {
    if (!adapter || availability.kind !== 'captcha') return
    await adapter.resolveChallenge(availability.challengeId)
  }, [adapter, availability])

  const citations: CitationMap = useMemo(() => {
    const merged: CitationMap = {}
    for (const turn of turns) {
      if (!turn.answer) continue
      Object.assign(merged, turn.answer.citations)
    }
    return merged
  }, [conversation])

  const selected = resolveCitationId(citations, source)
  const sticky = turns.length > 0
  const empty = turns.length === 0 && !expired
  const kbStyle = { '--ask-viewport-height': viewport.height === undefined ? '100dvh' : `${viewport.height}px`, '--ask-viewport-top': `${viewport.top}px` } as CSSProperties

  const Container = embedded ? 'div' : 'main'
  return (
    <Container
      className={embedded ? 'ask-page ask-page-embedded' : 'ask-page'}
      id={embedded ? undefined : 'resident-main'}
      data-empty={empty || undefined}
      data-keyboard-open={viewport.keyboardOpen || undefined}
      style={kbStyle}
    >
      <AskStatusRegion message={status} />
      {mobile ? (
        <header className="ask-screen-header">
          {onBack ? (
            <button
              aria-label="Back to reading"
              className="ask-screen-back"
              onClick={onBack}
              type="button"
            >
              <ArrowLeftIcon aria-hidden="true" />
            </button>
          ) : (
            <Link
              aria-label={
                viewScope.kind === 'corpus' ? 'Back to Home' : 'Back to reading'
              }
              className="ask-screen-back"
              to={viewScope.kind === 'corpus' ? '/' : viewScope.returnTo}
              resetScroll={false}
            >
              <ArrowLeftIcon aria-hidden="true" />
            </Link>
          )}
          <div className="ask-screen-heading">
            <h1 className="ask-screen-name">
              {viewScope.kind === 'corpus'
                ? 'Ask Public Parish'
                : viewScope.recordTitle}
            </h1>
            <p className="ask-screen-context">
              {viewScope.kind === 'corpus' ? viewScope.label : 'Ask Public Parish'}
            </p>
          </div>
        </header>
      ) : null}

      {!mobile ? <header className="ask-head">
        <h1 className="ask-title">Ask Public Parish</h1>
        <p className="ask-lede">
          Answers come only from published, validated official evidence.
        </p>
      </header> : null}

      {data.availability.kind === 'unavailable' && !data.scenario ? (
        <AskUnavailable />
      ) : !adapter ? (
        <PageLoading />
      ) : (
        <EvidenceProvider
          citations={citations}
          onSelect={onSelectSource}
          selected={selected}
        >
          <AskScopeBar scope={viewScope} />

          <div className="ask-layout">
            <div className="ask-reading">
              {mobile && empty ? (
                <div className="ask-intro">
                  <p className="ask-intro-title">
                    {viewScope.kind === 'corpus'
                      ? 'What do you want to understand?'
                      : `What do you want to understand about this ${viewScope.kind}?`}
                  </p>
                  <p className="ask-intro-text">
                    Answers come only from published, validated official
                    evidence.
                  </p>
                </div>
              ) : null}
              <section
                aria-label="Conversation"
                className="ask-thread-region"
                ref={threadRef}
              >
                {expired ? (
                  <AskExpiredNotice
                    onRestart={() => {
                      setExpired(false)
                      void adapter.startNew(viewScope)
                    }}
                  />
                ) : null}
                {turns.length > 0 ? (
                  <AskThread
                    dismissedTurnIds={dismissed}
                    onDismiss={handleDismiss}
                    onRetry={handleRetry}
                    onSuggestion={handleSuggestion}
                    turns={turns}
                  />
                ) : null}
                {!expired && availability.kind === 'cooldown' ? (
                  <AskCooldownNotice retryAt={availability.retryAt} />
                ) : null}
                {!expired && availability.kind === 'captcha' ? (
                  <AskCaptchaNotice
                    onResolve={() => void handleResolveChallenge()}
                  />
                ) : null}
                {offline ? <AskOfflineNotice /> : null}
              </section>

              {empty ? (
                <div className="ask-examples">
                  <h2 className="ask-examples-head">Try asking</h2>
                  <ul className="ask-suggestions-list">
                    {(viewScope.kind === 'corpus'
                      ? ASK_EXAMPLES
                      : ['What has been decided so far?', 'What happens next?']
                    ).map((example) => (
                      <li key={example}>
                        <button
                          className="ask-suggestion"
                          onClick={() => handleSuggestion(example)}
                          type="button"
                        >
                          {example}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {empty ? (
                <AskRecent
                  onClear={() => void handleClearRecent()}
                  onOpen={handleOpenRecent}
                  recent={recent}
                />
              ) : null}

              {!expired ? (
                <div className="ask-dock" data-sticky={sticky || undefined}>
                  {pendingScope ? (
                    <AskScopeConfirm
                      onCancel={cancelScopeChange}
                      onConfirm={confirmScopeChange}
                    />
                  ) : (
                    <AskComposer
                      canSubmit={canSubmit}
                      draft={draft}
                      inputRef={inputRef}
                      label={
                        sticky
                          ? 'Ask another question'
                          : 'What do you want to understand?'
                      }
                      onDraftChange={setDraft}
                      onSubmit={() => void handleSubmit()}
                      pending={checking || submitting}
                      privacyNote={turns.length === 0}
                      sendLabel={sticky ? 'Send' : 'Send question'}
                    />
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </EvidenceProvider>
      )}
    </Container>
  )
}

function AskScopeBar({ scope }: { scope: AskScope }) {
  if (scope.kind === 'corpus') {
    return <p className="ask-scope-line">{scope.label}</p>
  }

  return (
    <div className="ask-scope">
      <p className="ask-scope-label">{scope.label}</p>
      <div className="ask-scope-row">
        <p className="ask-scope-title">{scope.recordTitle}</p>
        <Link className="ask-scope-back" to={scope.returnTo}>
          <ArrowLeftIcon aria-hidden="true" />
          {scope.kind === 'story'
            ? 'Back to story'
            : scope.kind === 'issue'
              ? 'Back to issue'
              : 'Back to meeting'}
        </Link>
      </div>
    </div>
  )
}
