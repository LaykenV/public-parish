import { LogOutIcon } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../../components/ui/button'

export type GoogleAccountProfile = {
  name?: string
  email: string
  picture?: string
}

export function AccountIdentity({
  account,
  onSignOut,
}: {
  account: GoogleAccountProfile
  onSignOut?: () => Promise<void>
}) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  async function signOut() {
    if (!onSignOut || busy) return
    setBusy(true)
    setError(null)
    try {
      await onSignOut()
    } catch {
      setError('Sign-out did not finish. Try again.')
    } finally {
      setBusy(false)
    }
  }
  return (
    <section
      className="account-identity"
      aria-label={`Signed in as ${account.email}`}
    >
      <GoogleAvatar key={account.picture ?? account.email} account={account} />
      <div className="account-identity-details">
        <span className="account-identity-label">Google account</span>
        <strong>{account.name || 'Your account'}</strong>
        <span className="account-identity-email">{account.email}</span>
      </div>
      {onSignOut ? (
        <Button
          className="account-sign-out"
          variant="outline"
          size="touch"
          loading={busy}
          onClick={() => void signOut()}
        >
          {!busy ? <LogOutIcon aria-hidden="true" /> : null}
          {busy ? 'Signing out' : 'Sign out'}
        </Button>
      ) : null}
      {error ? (
        <p className="account-identity-error" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  )
}

function GoogleAvatar({ account }: { account: GoogleAccountProfile }) {
  const [failed, setFailed] = useState(false)
  const initials = (account.name || account.email)
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
  return (
    <span className="account-avatar" aria-hidden="true">
      {account.picture && !failed ? (
        <img
          src={account.picture}
          alt=""
          width={48}
          height={48}
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
        />
      ) : (
        initials
      )}
    </span>
  )
}
