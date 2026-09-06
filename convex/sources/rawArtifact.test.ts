import { afterEach, expect, test, vi } from 'vitest'

import { DOCX_CONTENT_TYPE, downloadOfficialDocument, downloadOfficialPdf } from './rawArtifact'

import { testDocxBytes } from '../testFixtures/docx'

const PDF_URL = 'https://apps.lafayettela.gov/obcouncil/api/Document/2553291/'

afterEach(() => {
  vi.unstubAllGlobals()
})

test('classifies a PDF body stream failure as retryable', async () => {
  let pullCount = 0
  const body = new ReadableStream<Uint8Array>({
    pull(controller) {
      if (pullCount === 0) {
        pullCount += 1
        controller.enqueue(new TextEncoder().encode('%PDF-1.7'))
        return
      }
      controller.error(new DOMException('stream timed out', 'AbortError'))
    },
  })
  const response = new Response(body, {
    status: 200,
    headers: { 'content-type': 'application/pdf' },
  })
  Object.defineProperty(response, 'url', { value: PDF_URL })
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => response),
  )

  const result = await downloadOfficialPdf(PDF_URL, ['apps.lafayettela.gov'])

  expect(result).toEqual({
    ok: false,
    errorClass: 'raw_artifact_request_failed',
    errorDetail: 'stream timed out',
    retryable: true,
  })
})

test('rejects a non-PDF response even when the server labels it as PDF', async () => {
  const response = new Response('<html>not a PDF</html>', {
    status: 200,
    headers: { 'content-type': 'application/pdf' },
  })
  Object.defineProperty(response, 'url', { value: PDF_URL })
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => response),
  )

  const result = await downloadOfficialPdf(PDF_URL, ['apps.lafayettela.gov'])

  expect(result).toEqual({
    ok: false,
    errorClass: 'raw_artifact_signature',
    errorDetail: `Official response did not contain a PDF signature: ${PDF_URL}`,
    retryable: false,
  })
})


test.each(['valid', 'wrong_mime', 'other_zip', 'broken_directory', 'too_large'] as const)('DOCX artifact checks reject disguised or malformed originals: %s', async variant => {
  const bytes = testDocxBytes()
  if (variant === 'other_zip') {
    const name = new TextEncoder().encode('word/document.xml')
    for (let offset = 0; offset <= bytes.length - name.length; offset++) {
      if (name.every((value, index) => bytes[offset + index] === value)) bytes.set(new TextEncoder().encode('junk/document.xml'), offset)
    }
  }
  if (variant === 'broken_directory') new DataView(bytes.buffer).setUint32(bytes.length - 6, 0xffffffff, true)
  const response = new Response(bytes, { headers: { 'content-type': variant === 'wrong_mime' ? 'application/zip' : DOCX_CONTENT_TYPE, ...(variant === 'too_large' ? { 'content-length': String(26 * 1024 * 1024) } : {}) } })
  Object.defineProperty(response, 'url', { value: PDF_URL })
  vi.stubGlobal('fetch', vi.fn(async () => response))
  const result = await downloadOfficialDocument(PDF_URL, ['apps.lafayettela.gov'], 'docx')
  if (variant === 'valid') expect(result).toMatchObject({ ok: true, bytes, contentType: DOCX_CONTENT_TYPE })
  else expect(result).toMatchObject({ ok: false, retryable: false })
})
