import { setupCore } from '@convex-dev/auth/core/setup'
import { normalizeGoogleProfile } from '@convex-dev/auth/providers/oauth/google'
import type { GoogleProfile } from '@convex-dev/auth/providers/oauth/google'
import { setupOauth } from '@convex-dev/auth/providers/oauth/setup'
import type { RegisteredMutation } from 'convex/server'
import { v } from 'convex/values'

import { components, internal } from './_generated/api'
import { env, query } from './_generated/server'
import { currentUserOrNull, isOwner } from './auth/authorization'

const core = setupCore({ component: components.auth })

export const { signOut, refreshSession, isAuthenticated } = core

const allowedRedirectOrigins = redirectOriginsFor(env.CONVEX_SITE_URL)

// Use the pinned provider's Google profile validation and OAuth flow, with an
// explicit account chooser so a shared browser does not silently pick an account.
const google: ReturnType<typeof setupOauth<'google', GoogleProfile, 'users'>> =
  setupOauth<'google', GoogleProfile, 'users'>(
    core,
    'google',
    {
      authorizationEndpoint:
        'https://accounts.google.com/o/oauth2/v2/auth?prompt=select_account',
      tokenEndpoint: 'https://oauth2.googleapis.com/token',
      issuer: ['https://accounts.google.com', 'accounts.google.com'],
      scopes: ['openid', 'email', 'profile'],
      pkce: true,
      profile: normalizeGoogleProfile,
    },
    {
      createUser: internal.auth.users.createUserGoogle,
      onSignIn: internal.auth.users.onSignInGoogle,
    },
    {
      component: components.oauthGoogle,
      allowedRedirectOrigins,
    },
  )

export const startSignInGoogle: RegisteredMutation<
  'public',
  { redirectTo: string },
  Promise<{ redirect: string; state: string }>
> = google.startSignIn
export const completeSignInGoogle: typeof google.completeSignIn =
  google.completeSignIn

export const currentUser = query({
  args: {},
  returns: v.union(
    v.object({
      name: v.optional(v.string()),
      email: v.string(),
      picture: v.optional(v.string()),
      isOwner: v.boolean(),
    }),
    v.null(),
  ),
  handler: async (ctx) => {
    const user = await currentUserOrNull(ctx)
    if (user === null) return null
    return {
      email: user.email,
      ...(user.name === undefined ? {} : { name: user.name }),
      ...(user.picture === undefined ? {} : { picture: user.picture }),
      isOwner: isOwner(user),
    }
  },
})

function redirectOriginsFor(siteUrl: string | undefined): string[] {
  if (!siteUrl) return []
  const siteOrigin = new URL(siteUrl).origin
  const origins = [siteOrigin, 'https://www.publicparish.com']
  if (siteOrigin === 'https://woozy-wren-227.convex.site') {
    origins.push('http://localhost:3000')
  }
  return [...new Set(origins)]
}
