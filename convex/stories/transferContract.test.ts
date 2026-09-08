import { expect, test } from 'vitest'
import { checkArtifactPacket, signArtifactPacket, verifyArtifactPacket, transferDeploymentSite } from './transferContract'
import type { ArtifactPacket } from './transferContract'

const packet: ArtifactPacket = { contract: 'story-artifact-transfer-v1', originSite: 'https://woozy-wren-227.convex.site', targetSite: 'https://befitting-flamingo-587.convex.site',
  exportedAt: 1_000_000, retrievalTime: 100, storyKey: 'meta-richland', acceptedDraftHash: 'a'.repeat(64), sourceKey: 'official', bodyKey: 'body', bodyName: 'Body',
  canonicalUrl: 'https://example.invalid/source', retrievedUrl: 'https://example.invalid/source', rawHash: 'b'.repeat(64), normalizedHash: 'c'.repeat(64),
  rawBytes: 10, normalizedBytes: 8, rawContentType: 'application/pdf', normalizedContentType: 'text/plain', provenanceJson: '{}', pageMap: [] }
const key = '1'.repeat(64)

test('transfer signatures bind provenance, exact artifact hashes and target deployment', async () => {
  const signature = await signArtifactPacket(packet, key)
  await expect(verifyArtifactPacket(packet, signature, key)).resolves.toBeUndefined()
  for (const changed of [{ ...packet, rawHash: 'd'.repeat(64) }, { ...packet, bodyKey: 'other' }, { ...packet, targetSite: packet.originSite }, { ...packet, provenanceJson: '{"method":"invented"}' }]) {
    await expect(verifyArtifactPacket(changed, signature, key)).rejects.toThrow('signature mismatch')
  }
  await expect(verifyArtifactPacket(packet, signature, '2'.repeat(64))).rejects.toThrow('signature mismatch')
  await expect(verifyArtifactPacket(packet, signature, undefined)).rejects.toThrow('trust key')
})

test('transfer refuses wrong deployment, stale export and unbounded artifacts', () => {
  expect(() => checkArtifactPacket(packet, packet.targetSite, packet.exportedAt)).not.toThrow()
  expect(() => checkArtifactPacket(packet, packet.originSite, packet.exportedAt)).toThrow('deployment mismatch')
  expect(() => checkArtifactPacket(packet, packet.targetSite, packet.exportedAt + 8 * 86_400_000)).toThrow('expired')
  expect(() => checkArtifactPacket({ ...packet, retrievalTime: packet.exportedAt + 1 }, packet.targetSite, packet.exportedAt)).toThrow('provenance time')
  expect(() => checkArtifactPacket({ ...packet, rawBytes: 20_000_001 }, packet.targetSite, packet.exportedAt)).toThrow('bound')
})


test('transfer identity uses the backend deployment rather than the public custom domain', () => {
  expect(transferDeploymentSite('https://befitting-flamingo-587.convex.cloud')).toBe('https://befitting-flamingo-587.convex.site')
  expect(transferDeploymentSite('https://woozy-wren-227.convex.cloud')).toBe(packet.originSite)
  expect(() => transferDeploymentSite('https://www.publicparish.com')).toThrow('reviewed transfer deployment')
  expect(() => transferDeploymentSite('https://other.convex.cloud')).toThrow('reviewed transfer deployment')
})
