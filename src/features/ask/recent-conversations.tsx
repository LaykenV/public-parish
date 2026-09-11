import { useConvex } from 'convex/react'
import { useNavigate } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'

import { AskRecent } from './ask-states'
import type { AskAdapter, AskRecentConversation } from './contracts'
import { createLiveAskAdapter } from './live-adapter'
import { setRecentAskHandoff } from './recent-handoff'
import './ask.css'

export function RecentConversations({ fixture = false }: { fixture?: boolean }) {
  const convex = useConvex()
  const navigate = useNavigate()
  const [adapter, setAdapter] = useState<AskAdapter | null>(null)
  const [recent, setRecent] = useState<AskRecentConversation[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const request = useRef(0)

  useEffect(() => {
    if (!import.meta.env.DEV || !fixture) {
      setAdapter(createLiveAskAdapter(convex, window.localStorage))
      return
    }
    let cancelled = false
    void import('./fixtures').then(({ getAskFixtureAdapter }) => {
      if (!cancelled) setAdapter(getAskFixtureAdapter('empty-corpus'))
    })
    return () => { cancelled = true }
  }, [convex, fixture])

  useEffect(() => {
    if (!adapter) return
    let cancelled = false
    const refresh = () => {
      const current = ++request.current
      void adapter.listRecent().then((handles) => {
        if (!cancelled && current === request.current) { setRecent(handles); setError(''); setLoading(false) }
      }).catch(() => {
        if (!cancelled && current === request.current) { setError('Recent conversations could not load. Refresh to try again.'); setLoading(false) }
      })
    }
    refresh()
    const timer = window.setInterval(refresh, 30_000)
    window.addEventListener('storage', refresh)
    window.addEventListener('focus', refresh)
    return () => {
      cancelled = true
      window.clearInterval(timer)
      window.removeEventListener('storage', refresh)
      window.removeEventListener('focus', refresh)
    }
  }, [adapter])

  const open = async (handle: AskRecentConversation) => {
    setRecentAskHandoff(handle)
    try {
      await navigate({ to: '/ask', search: import.meta.env.DEV && fixture ? { fixture: 'empty-corpus' } : {} })
    } catch {
      setRecentAskHandoff(null)
      setError('This conversation could not open. Try again.')
    }
  }

  return (
    <section aria-label="Conversations on this device" className="following-page account-conversations">
      <h2>Conversations</h2>
      <p className="account-conversations-note">Available on this device for 24 hours. No sign-in needed.</p>
      {error ? <p role="status">{error}</p> : null}
      <AskRecent
        recent={recent}
        onOpen={(handle) => void open(handle)}
        onClear={() => {
          request.current += 1
          void adapter?.clearRecent().then(() => { setRecent([]); setLoading(false) }).catch(() => setError('Conversations could not be cleared. Try again.'))
        }}
      />
      {loading && !error ? <p role="status">Loading recent conversations...</p> : null}
      {!loading && recent.length === 0 && !error ? <p>No recent conversations on this device.</p> : null}
    </section>
  )
}
