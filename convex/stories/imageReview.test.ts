import { expect, test } from 'vitest'
import { imageReviewMessage } from './imageReview'
import { sha256HexOfBytes } from '../sources/hashing'

const bytes = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 0])

test('image review binds inline bytes to the retained hash and never fetches the original URL', async () => {
  const message = await imageReviewMessage(new Blob([bytes]), await sha256HexOfBytes(bytes))
  expect(message.role).toBe('user')
  if (typeof message.content === 'string') throw new Error('Expected image content')
  const part = message.content[1]
  if (part.type !== 'image_url') throw new Error('Expected image part')
  expect(part.image_url.detail).toBe('high')
  expect(part.image_url.url).toBe(`data:image/png;base64,${btoa(String.fromCharCode(...bytes))}`)
  await expect(imageReviewMessage(new Blob([bytes]), '0'.repeat(64))).rejects.toThrow('hash changed')
})

test('missing, oversized and non-image artifacts stop before a review request', async () => {
  await expect(imageReviewMessage(null, '')).rejects.toThrow('retained image')
  await expect(imageReviewMessage(new Blob([new Uint8Array(4_000_001)]), '')).rejects.toThrow('at most 4 MB')
  const html = new TextEncoder().encode('<html>not an image</html>')
  await expect(imageReviewMessage(new Blob([html]), await sha256HexOfBytes(html))).rejects.toThrow('PNG, JPEG or WebP')
})
