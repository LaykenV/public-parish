import { api, components } from '../_generated/api'
import type { Id } from '../_generated/dataModel'
import { env, httpAction } from '../_generated/server'
import { escapeHtml } from './html'
import { matchesIssueEtag } from './issues'

export function storyShareHtml(input: { title: string, summary: string, canonicalUrl: string, shareUrl: string, imageUrl: string | null, imageAlt: string, reviewedThrough: string, limited: boolean }) {
  const escape = escapeHtml
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(input.title)} | Public Parish</title><meta name="description" content="${escape(input.summary)}"><link rel="canonical" href="${escape(input.canonicalUrl)}"><meta property="og:type" content="article"><meta property="og:title" content="${escape(input.title)}"><meta property="og:description" content="${escape(input.summary)}"><meta property="og:url" content="${escape(input.shareUrl)}"><meta name="twitter:card" content="${input.imageUrl ? 'summary_large_image' : 'summary'}">${input.imageUrl ? `<meta property="og:image" content="${escape(input.imageUrl)}"><meta property="og:image:alt" content="${escape(input.imageAlt)}">` : ''}</head><body><main><a href="/">Public Parish</a><h1>${escape(input.title)}</h1><p>${escape(input.summary)}</p><p>Reviewed through ${escape(input.reviewedThrough)}.${input.limited ? ' Some questions remain unanswered.' : ''}</p><a href="${escape(input.canonicalUrl)}">Read the story and official evidence</a></main></body></html>`
}

// Serve the same interactive application to residents and social crawlers.
// Metadata is assembled from the current accepted story before JavaScript runs.
export function storyAppHtml(shell: string, metadata: string) {
  const head = metadata.match(/<head>([\s\S]*?)<\/head>/i)?.[1]
  if (!head || !/<head[\s>]/i.test(shell) || !/<\/head>/i.test(shell)) throw new Error('Application shell is missing its head')
  return shell.replace(/<head([^>]*)>([\s\S]*?)<\/head>/i, (_match, attrs: string, contents: string) => {
    const cleaned = contents.replace(/<title\b[^>]*>[\s\S]*?<\/title>/gi, '')
      .replace(/<meta\b[^>]*>/gi, tag => /(?:name|property)\s*=\s*["'](?:description|og:[^"']+|twitter:[^"']+)["']/i.test(tag) ? '' : tag)
      .replace(/<link\b[^>]*>/gi, tag => /rel\s*=\s*["']canonical["']/i.test(tag) ? '' : tag)
    return `<head${attrs}>${cleaned}${head}</head>`
  })
}

export const shareStory = httpAction(async (ctx, request) => {
  const path = new URL(request.url).pathname
  const legacy = path.startsWith('/share/stories/')
  let slug: string
  try { slug = decodeURIComponent(path.slice((legacy ? '/share/stories/' : '/stories/').length)) } catch { return unavailable(404) }
  if (!/^[a-z0-9][a-z0-9-]{0,119}$/.test(slug)) return unavailable(404)
  const result = await ctx.runQuery(api.stories.resident.get, { slug })
  if (!result.story) return unavailable(result.state === 'withdrawn' ? 410 : result.state === 'needs_review' ? 503 : 404)
  const base = env.CONVEX_SITE_URL.replace(/\/$/, '')
  const canonicalUrl = `${base}/stories/${slug}`
  if (legacy) return new Response(null, { status: 302, headers: { Location: canonicalUrl, 'Cache-Control': 'no-store' } })
  const story = result.story
  const asset = await ctx.runQuery(components.staticHosting.lib.resolveAssetForHttp, { path: '/index.html', spaFallback: false })
  if (!asset) return unavailable(503)
  // Both storage forms are supported by the installed static-hosting component.
  let shell: string
  if (asset.appStorageId) {
    const blob = await ctx.storage.get(asset.appStorageId as Id<'_storage'>)
    if (!blob) return unavailable(503)
    shell = await blob.text()
  } else if (asset.storageUrl) {
    const response = await fetch(asset.storageUrl)
    if (!response.ok) return unavailable(503)
    shell = await response.text()
  } else return unavailable(503)
  const revision = `${story.revision}:${asset.etag ?? await shellHash(shell)}`
  const headers = { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=0, must-revalidate', ETag: `"${revision}"`,
    'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin' }
  if (matchesIssueEtag(request.headers.get('If-None-Match'), revision)) return new Response(null, { status: 304, headers })
  const metadata = storyShareHtml({ title: story.payload.title.text, summary: story.payload.summary.text, canonicalUrl, shareUrl: canonicalUrl,
    imageUrl: story.media?.url ?? null, imageAlt: story.media?.alt ?? '', reviewedThrough: story.reviewedThrough, limited: story.mode === 'limited' })
  return new Response(storyAppHtml(shell, metadata), { headers })
})

async function shellHash(shell: string) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(shell))
  return Array.from(new Uint8Array(bytes), byte => byte.toString(16).padStart(2, '0')).join('')
}

function unavailable(status: number) {
  return new Response('<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>Story unavailable | Public Parish</title></head><body><main><h1>This story is unavailable</h1><p>No current reviewed story can be shown.</p><a href="/">Return to Public Parish</a></main></body></html>', { status, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } })
}
