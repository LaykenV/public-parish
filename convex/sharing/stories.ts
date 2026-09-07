import { api } from '../_generated/api'
import { env, httpAction } from '../_generated/server'
import { escapeHtml } from './html'
import { matchesIssueEtag } from './issues'

export function storyShareHtml(input: { title: string, summary: string, canonicalUrl: string, shareUrl: string, imageUrl: string | null, imageAlt: string, reviewedThrough: string, limited: boolean }) {
  const escape = escapeHtml
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(input.title)} | Public Parish</title><meta name="description" content="${escape(input.summary)}"><link rel="canonical" href="${escape(input.canonicalUrl)}"><meta property="og:type" content="article"><meta property="og:title" content="${escape(input.title)}"><meta property="og:description" content="${escape(input.summary)}"><meta property="og:url" content="${escape(input.shareUrl)}"><meta name="twitter:card" content="${input.imageUrl ? 'summary_large_image' : 'summary'}">${input.imageUrl ? `<meta property="og:image" content="${escape(input.imageUrl)}"><meta property="og:image:alt" content="${escape(input.imageAlt)}">` : ''}</head><body><main><a href="/">Public Parish</a><h1>${escape(input.title)}</h1><p>${escape(input.summary)}</p><p>Reviewed through ${escape(input.reviewedThrough)}.${input.limited ? ' Some questions remain unanswered.' : ''}</p><a href="${escape(input.canonicalUrl)}">Read the story and official evidence</a></main></body></html>`
}

export const shareStory = httpAction(async (ctx, request) => {
  let slug: string
  try { slug = decodeURIComponent(new URL(request.url).pathname.slice('/share/stories/'.length)) } catch { return unavailable(404) }
  if (!/^[a-z0-9][a-z0-9-]{0,119}$/.test(slug)) return unavailable(404)
  const result = await ctx.runQuery(api.stories.resident.get, { slug })
  if (!result.story) return unavailable(result.state === 'withdrawn' ? 410 : result.state === 'needs_review' ? 503 : 404)
  const story = result.story
  const headers = { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=0, must-revalidate', ETag: `"${story.revision}"`,
    'X-Content-Type-Options': 'nosniff', 'Content-Security-Policy': "default-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'", 'Referrer-Policy': 'strict-origin-when-cross-origin' }
  if (matchesIssueEtag(request.headers.get('If-None-Match'), story.revision)) return new Response(null, { status: 304, headers })
  const base = env.CONVEX_SITE_URL.replace(/\/$/, '')
  return new Response(storyShareHtml({ title: story.payload.title.text, summary: story.payload.summary.text, canonicalUrl: `${base}/stories/${slug}`, shareUrl: `${base}/share/stories/${slug}`,
    imageUrl: story.media?.url ?? null, imageAlt: story.media?.alt ?? '', reviewedThrough: story.reviewedThrough, limited: story.mode === 'limited' }), { headers })
})

function unavailable(status: number) {
  return new Response('<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>Story unavailable | Public Parish</title></head><body><main><h1>This story is unavailable</h1><p>No current reviewed story can be shown.</p><a href="/">Return to Public Parish</a></main></body></html>', { status, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } })
}
