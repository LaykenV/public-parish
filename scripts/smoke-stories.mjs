const EXPECTED_STORIES = ['meta-richland', 'spacex-pecan-island', 'applied-digital-boyce']

function escapeHtml(value) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}

function httpsUrl(value) {
  try { return new URL(value).protocol === 'https:' } catch { return false }
}

// Read-only release checks. Paid Ask and provider mail require separate proof.
export async function smokeStories({ query, request, origins, canonicalOrigin }) {
  const stories = await query('stories/resident:featured', {})
  if (JSON.stringify(stories.map(story => story.slug)) !== JSON.stringify(EXPECTED_STORIES)) {
    throw new Error('The three launch stories are not published in the approved order')
  }
  for (const story of stories) {
    const result = await query('stories/resident:get', { slug: story.slug })
    if (result.state !== 'active' || result.story?.revision !== story.revision) {
      throw new Error(`Story ${story.slug} is unavailable or changed during smoke; inspect and retry`)
    }
    if (!['full', 'limited'].includes(story.mode) || !story.evidence.length ||
      story.evidence.some(span => !span.excerpt.trim() || !httpsUrl(span.officialUrl) || !httpsUrl(span.snapshotUrl))) {
      throw new Error(`Story ${story.slug} has no usable published evidence`)
    }
    if (!story.media || !httpsUrl(story.media.url)) throw new Error(`Story ${story.slug} has no accepted image`)
    const image = await request(story.media.url)
    if (!image.ok || !image.headers.get('content-type')?.startsWith('image/') || !(await image.arrayBuffer()).byteLength) {
      throw new Error(`Story ${story.slug} image is unavailable`)
    }
    const path = `/stories/${story.slug}`
    const canonical = `${canonicalOrigin}${path}`
    for (const origin of origins) {
      const response = await request(`${origin}${path}`)
      const html = await response.text()
      const expected = [
        `<meta property="og:title" content="${escapeHtml(story.payload.title.text)}">`,
        `<meta property="og:description" content="${escapeHtml(story.payload.summary.text)}">`,
        `<meta property="og:image" content="${escapeHtml(story.media.url)}">`,
        `<link rel="canonical" href="${canonical}">`,
      ]
      if (!response.ok || !response.headers.get('etag') || !/\/assets\/[^"\s]+\.js/.test(html) || expected.some(tag => !html.includes(tag))) {
        throw new Error(`${origin}${path} did not serve the interactive app with accepted story metadata`)
      }
      const legacy = await request(`${origin}/share${path}`, { redirect: 'manual' })
      if (legacy.status !== 302 || legacy.headers.get('location') !== canonical || !legacy.headers.get('cache-control')?.includes('no-store')) {
        throw new Error(`${origin}/share${path} did not redirect to the current story`)
      }
    }
  }
  for (const origin of origins) {
    for (const prefix of ['/stories/', '/share/stories/']) {
      const missing = await request(`${origin}${prefix}smoke-nonexistent-story`)
      if (missing.status !== 404 || !missing.headers.get('cache-control')?.includes('no-store')) {
        throw new Error('Missing story route did not fail closed')
      }
    }
  }
}
