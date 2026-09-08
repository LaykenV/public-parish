import { describe, expect, it, vi } from 'vitest'
import { smokeStories } from './smoke-stories.mjs'

const canonicalOrigin = 'https://www.publicparish.com'
const origins = [canonicalOrigin, 'https://befitting-flamingo-587.convex.site']

function fixture() {
  const stories = ['meta-richland', 'spacex-pecan-island', 'applied-digital-boyce'].map(slug => ({
    slug, revision: `${slug}-v1`, mode: 'limited',
    payload: { title: { text: 'Reviewed title' }, summary: { text: 'Reviewed summary' } },
    evidence: [{ excerpt: 'Official excerpt', officialUrl: 'https://agency.example/record', snapshotUrl: 'https://storage.example/snapshot' }],
    media: { url: `https://storage.example/${slug}.png` },
  }))
  const query = vi.fn((name, args) => name.endsWith(':featured') ? stories : { state: 'active', story: stories.find(story => story.slug === args.slug) })
  const request = vi.fn((url) => {
    if (url.includes('smoke-nonexistent-story')) return new Response('Unavailable', { status: 404, headers: { 'cache-control': 'no-store' } })
    if (url.endsWith('.png')) return new Response('image bytes', { headers: { 'content-type': 'image/png' } })
    const slug = url.split('/').pop()
    if (url.includes('/share/')) return new Response(null, { status: 302, headers: { location: `${canonicalOrigin}/stories/${slug}`, 'cache-control': 'no-store' } })
    return new Response(`<html><head><link rel="canonical" href="${canonicalOrigin}/stories/${slug}"><meta property="og:title" content="Reviewed title"><meta property="og:description" content="Reviewed summary"><meta property="og:image" content="https://storage.example/${slug}.png"></head><body><script src="/assets/app.js"></script></body></html>`, { headers: { etag: '"revision"' } })
  })
  return { stories, query, request, origins, canonicalOrigin }
}

describe('production story smoke', () => {
  it('checks both origins and never calls a paid action or sends mail', async () => {
    const input = fixture()
    await smokeStories(input)
    expect(input.query.mock.calls.map(([name]) => name)).toEqual([
      'stories/resident:featured', 'stories/resident:get', 'stories/resident:get', 'stories/resident:get',
    ])
    for (const origin of origins) expect(input.request).toHaveBeenCalledWith(`${origin}/stories/meta-richland`)
  })

  it('rejects a missing launch story even when local issues remain healthy', async () => {
    const input = fixture()
    input.stories.pop()
    await expect(smokeStories(input)).rejects.toThrow('approved order')
  })

  it('rejects a story that becomes unavailable after the featured query', async () => {
    const input = fixture()
    input.query.mockImplementation(name => name.endsWith(':featured') ? input.stories : { state: 'needs_review', story: null })
    await expect(smokeStories(input)).rejects.toThrow('unavailable or changed')
  })

  it('rejects citations without retained snapshot links', async () => {
    const input = fixture()
    input.stories[0].evidence[0].snapshotUrl = ''
    await expect(smokeStories(input)).rejects.toThrow('usable published evidence')
  })

  it('rejects an image URL that returns an HTML error page with status 200', async () => {
    const input = fixture()
    input.request.mockImplementation(() => new Response('<html>Error</html>', { headers: { 'content-type': 'text/html' } }))
    await expect(smokeStories(input)).rejects.toThrow('image is unavailable')
  })

  it('rejects stale social metadata on an otherwise available app', async () => {
    const input = fixture()
    input.stories[0].payload.title.text = 'A revised accepted title'
    await expect(smokeStories(input)).rejects.toThrow('accepted story metadata')
  })

  it('rejects a generic SPA fallback for missing story URLs', async () => {
    const input = fixture()
    const request = input.request.getMockImplementation()
    input.request.mockImplementation(url => url.includes('smoke-nonexistent-story') ? new Response('<html>App</html>') : request(url))
    await expect(smokeStories(input)).rejects.toThrow('Missing story route')
  })
})
