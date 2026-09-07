import { v } from 'convex/values'
import { canonicalStoryJson } from './hashing'

export const artifactPacket = v.object({
  contract: v.literal('story-artifact-transfer-v1'),
  originSite: v.string(), targetSite: v.string(), exportedAt: v.number(),
  storyKey: v.string(), acceptedDraftHash: v.string(), sourceKey: v.string(),
  bodyKey: v.string(), bodyName: v.string(), canonicalUrl: v.string(), retrievedUrl: v.string(),
  rawHash: v.string(), normalizedHash: v.string(), rawBytes: v.number(), normalizedBytes: v.number(),
  rawContentType: v.string(), normalizedContentType: v.string(), retrievalTime: v.number(),
  provenanceJson: v.string(),
  pageMap: v.array(v.object({ page: v.number(), startOffset: v.number(), endOffset: v.number() })),
})
export type ArtifactPacket = typeof artifactPacket.type
const MAX_TRANSFER_AGE = 7 * 86_400_000

export function checkArtifactPacket(packet: ArtifactPacket, targetSite: string, now: number) {
  if (packet.targetSite !== targetSite || !/^https:\/\/[a-z0-9-]+\.convex\.site$/.test(packet.originSite)) throw new Error('Artifact transfer deployment mismatch')
  if (!Number.isFinite(packet.exportedAt) || packet.exportedAt > now + 60_000 || now - packet.exportedAt > MAX_TRANSFER_AGE || packet.retrievalTime > packet.exportedAt || packet.retrievalTime < 0) throw new Error('Artifact transfer receipt expired or has invalid provenance time')
  if (![packet.rawHash, packet.normalizedHash, packet.acceptedDraftHash].every(hash => /^[a-f0-9]{64}$/.test(hash))) throw new Error('Invalid transfer artifact hash')
  if (![packet.rawBytes, packet.normalizedBytes].every(size => Number.isInteger(size) && size > 0 && size <= 20_000_000) || packet.provenanceJson.length > 50_000 || packet.pageMap.length > 1000) throw new Error('Artifact transfer exceeds its bound')
  if (![packet.canonicalUrl, packet.retrievedUrl].every(url => url.startsWith('https://'))) throw new Error('Artifact transfer requires official HTTPS sources')
}

async function transferKey(secret: string | undefined) {
  if (!secret || !/^[a-f0-9]{64}$/.test(secret)) throw new Error('Configure the dedicated artifact transfer trust key first')
  const bytes = Uint8Array.from(secret.match(/../g)!, pair => Number.parseInt(pair, 16))
  return crypto.subtle.importKey('raw', bytes, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify'])
}
export async function signArtifactPacket(packet: ArtifactPacket, secret: string | undefined) {
  const signature = await crypto.subtle.sign('HMAC', await transferKey(secret), new TextEncoder().encode(canonicalStoryJson(packet)))
  return Array.from(new Uint8Array(signature), byte => byte.toString(16).padStart(2, '0')).join('')
}
export async function verifyArtifactPacket(packet: ArtifactPacket, signature: string, secret: string | undefined) {
  if (!/^[a-f0-9]{64}$/.test(signature)) throw new Error('Invalid artifact transfer signature')
  const bytes = Uint8Array.from(signature.match(/../g)!, pair => Number.parseInt(pair, 16))
  if (!await crypto.subtle.verify('HMAC', await transferKey(secret), bytes, new TextEncoder().encode(canonicalStoryJson(packet)))) throw new Error('Artifact transfer signature mismatch')
}
