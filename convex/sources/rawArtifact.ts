import { canonicalizeUrl, isAllowedOfficialHost } from './domains'

const MAX_RAW_ARTIFACT_BYTES = 25 * 1024 * 1024
const TRANSIENT_STATUSES = new Set([408, 425, 429, 500, 502, 503, 504])
export const DOCX_CONTENT_TYPE = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
export type BinaryDocumentKind = 'pdf' | 'docx'

export function binaryDocumentKind(contentType: string): BinaryDocumentKind | null {
  const mime = contentType.split(';')[0].trim().toLowerCase()
  return mime === 'application/pdf' ? 'pdf' : mime === DOCX_CONTENT_TYPE ? 'docx' : null
}

const PDF_SIGNATURE = new TextEncoder().encode('%PDF-')

export type RawArtifactDownload =
  | {
      ok: true
      bytes: Uint8Array<ArrayBuffer>
      contentType: string
      finalUrl: string
    }
  | {
      ok: false
      errorClass: string
      errorDetail: string
      retryable: boolean
    }

export async function downloadOfficialPdf(url: string, officialDomains: string[]): Promise<RawArtifactDownload> {
  return downloadOfficialDocument(url, officialDomains, 'pdf')
}

export async function downloadOfficialDocument(
  url: string,
  officialDomains: string[],
  kind: BinaryDocumentKind,
): Promise<RawArtifactDownload> {
  const label = kind === 'pdf' ? 'PDF' : 'DOCX'
  let response: Response
  try {
    response = await fetch(url, {
      redirect: 'follow',
      signal: AbortSignal.timeout(60_000),
    })
  } catch (error) {
    return {
      ok: false,
      errorClass: 'raw_artifact_request_failed',
      errorDetail: error instanceof Error ? error.message : String(error),
      retryable: true,
    }
  }

  const finalUrl = canonicalizeUrl(response.url)
  if (!finalUrl || !isAllowedOfficialHost(finalUrl, officialDomains)) {
    return {
      ok: false,
      errorClass: 'raw_artifact_redirect_domain_not_allowed',
      errorDetail: `Raw artifact URL is outside the registered official domains: ${response.url}`,
      retryable: false,
    }
  }
  if (!response.ok) {
    return {
      ok: false,
      errorClass: 'raw_artifact_http_status',
      errorDetail: `Official raw artifact returned HTTP ${response.status}: ${finalUrl}`,
      retryable: TRANSIENT_STATUSES.has(response.status),
    }
  }

  const contentType = response.headers.get('content-type') ?? ''
  if (
    (contentType === '' && kind === 'docx') ||
    (contentType !== '' && binaryDocumentKind(contentType) !== kind)
  ) {
    return {
      ok: false,
      errorClass: 'raw_artifact_content_type',
      errorDetail: `Expected an official ${label} but received ${contentType || 'no content type'}: ${finalUrl}`,
      retryable: false,
    }
  }

  const declaredLength = Number(response.headers.get('content-length'))
  if (
    Number.isFinite(declaredLength) &&
    declaredLength > MAX_RAW_ARTIFACT_BYTES
  ) {
    return {
      ok: false,
      errorClass: 'raw_artifact_too_large',
      errorDetail: `Official ${label} exceeds the ${MAX_RAW_ARTIFACT_BYTES} byte limit: ${finalUrl}`,
      retryable: false,
    }
  }

  if (!response.body) {
    return {
      ok: false,
      errorClass: 'empty_raw_artifact',
      errorDetail: `Official ${label} had no response body: ${finalUrl}`,
      retryable: true,
    }
  }

  const reader = response.body.getReader()
  const chunks: Uint8Array[] = []
  let byteLength = 0
  try {
    let readResult = await reader.read()
    while (!readResult.done) {
      byteLength += readResult.value.byteLength
      if (byteLength > MAX_RAW_ARTIFACT_BYTES) {
        try {
          await reader.cancel()
        } catch {
          // The size classification still applies if cancellation races an error.
        }
        return {
          ok: false,
          errorClass: 'raw_artifact_too_large',
          errorDetail: `Official ${label} exceeds the ${MAX_RAW_ARTIFACT_BYTES} byte limit: ${finalUrl}`,
          retryable: false,
        }
      }
      chunks.push(readResult.value)
      readResult = await reader.read()
    }
  } catch (error) {
    try {
      await reader.cancel()
    } catch {
      // The stream may already be errored or aborted.
    }
    return {
      ok: false,
      errorClass: 'raw_artifact_request_failed',
      errorDetail: error instanceof Error ? error.message : String(error),
      retryable: true,
    }
  }

  const bytes = new Uint8Array(byteLength)
  let offset = 0
  for (const chunk of chunks) {
    bytes.set(chunk, offset)
    offset += chunk.byteLength
  }
  if (bytes.byteLength === 0) {
    return {
      ok: false,
      errorClass: 'empty_raw_artifact',
      errorDetail: `Official ${label} was empty: ${finalUrl}`,
      retryable: true,
    }
  }
  if (!(kind === 'pdf' ? hasPdfSignature(bytes) : hasDocxSignature(bytes))) {
    return {
      ok: false,
      errorClass: 'raw_artifact_signature',
      errorDetail: `Official response did not contain a ${label} signature: ${finalUrl}`,
      retryable: false,
    }
  }
  return {
    ok: true,
    bytes,
    contentType: contentType || (kind === 'pdf' ? 'application/pdf' : DOCX_CONTENT_TYPE),
    finalUrl,
  }
}

function hasPdfSignature(bytes: Uint8Array): boolean {
  const searchLimit = Math.min(bytes.byteLength, 1024)
  for (
    let offset = 0;
    offset <= searchLimit - PDF_SIGNATURE.byteLength;
    offset += 1
  ) {
    if (
      PDF_SIGNATURE.every((value, index) => bytes[offset + index] === value)
    ) {
      return true
    }
  }
  return false
}


// Inspect bounded ZIP directory metadata only. Firecrawl parses the document;
// this check never decompresses archive entries or executes Office content.
function hasDocxSignature(bytes: Uint8Array): boolean {
  if (bytes.length < 22) return false
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  if (view.getUint32(0, true) !== 0x04034b50) return false
  for (let end = bytes.length - 22; end >= Math.max(0, bytes.length - 65_557); end--) {
    if (view.getUint32(end, true) !== 0x06054b50 || end + 22 + view.getUint16(end + 20, true) !== bytes.length) continue
    const entries = view.getUint16(end + 10, true)
    const directorySize = view.getUint32(end + 12, true)
    const directoryStart = view.getUint32(end + 16, true)
    if (view.getUint16(end + 4, true) !== 0 || view.getUint16(end + 6, true) !== 0 || view.getUint16(end + 8, true) !== entries || entries < 2 || entries > 2_048 || directoryStart + directorySize !== end) return false
    const required = new Set<string>()
    let offset = directoryStart
    for (let entry = 0; entry < entries; entry++) {
      if (offset + 46 > end || view.getUint32(offset, true) !== 0x02014b50 || (view.getUint16(offset + 8, true) & 1) !== 0) return false
      const nameLength = view.getUint16(offset + 28, true)
      const next = offset + 46 + nameLength + view.getUint16(offset + 30, true) + view.getUint16(offset + 32, true)
      const localOffset = view.getUint32(offset + 42, true)
      if (next > end || localOffset + 30 > directoryStart || view.getUint32(localOffset, true) !== 0x04034b50) return false
      const name = new TextDecoder().decode(bytes.subarray(offset + 46, offset + 46 + nameLength))
      if (name === '[Content_Types].xml' || name === 'word/document.xml') required.add(name)
      offset = next
    }
    return offset === end && required.size === 2
  }
  return false
}
