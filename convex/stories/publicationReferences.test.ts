import { expect, test, vi } from 'vitest'
import type { Doc } from '../_generated/dataModel'
import type { QueryCtx } from '../_generated/server'
import type { StoryManifest } from './manifestTypes'
import { canonicalPublicationMappings, resolvePublicationReferences } from './publicationReferences'

// Synthetic resolver fixtures. These are not publication or provider evidence.
function fixture() {
  const snapshot = { _id: 'target-snapshot', registryId: 'target-registry' } as Doc<'sourceSnapshots'>
  const record = { _id: 'target-record', registryId: snapshot.registryId, currentPublishedVersionId: 'target-publication' } as Doc<'decisionRecords'>
  const publication = { _id: 'target-publication', recordId: record._id, snapshotId: snapshot._id, payloadHash: 'target-hash', payload: { title: 'Accepted target record' }, mode: 'limited' } as Doc<'publicationVersions'>
  const source = { sourceKey: 'official-source', existingPublicationReferences: [{ kind: 'decision', stableKey: 'origin-key', versionHash: 'origin-hash' }] } as StoryManifest['sources'][number]
  const mapping = { sourceKey: source.sourceKey, originRecordKey: 'origin-key', targetRecordKey: 'target-key', targetPayloadHash: 'target-hash' }
  let selectedKey: string
  const range = { eq: (_field: string, key: string) => { selectedKey = key; return range } }
  const unique = vi.fn(async () => selectedKey === 'target-key' ? record : null)
  const ctx = { db: { query: () => ({ withIndex: (_index: string, select: (range: unknown) => void) => { select(range); return { unique } } }), get: async () => publication } } as unknown as Pick<QueryCtx, 'db'>
  return { ctx, source, snapshot, record, publication, mapping, sources: [{ source, snapshot }] }
}

test('target mapping resolves different deployment keys without accepting the origin payload hash', async () => {
  const f = fixture()
  await expect(resolvePublicationReferences(f.ctx, f.sources, [])).rejects.toThrow('does not resolve')
  expect(await resolvePublicationReferences(f.ctx, f.sources, [f.mapping])).toEqual([{ recordId: f.record._id, publicationVersionId: f.publication._id, payloadHash: 'target-hash' }])
  await expect(resolvePublicationReferences(f.ctx, f.sources, [{ ...f.mapping, targetPayloadHash: 'origin-hash' }])).rejects.toThrow('does not resolve')
  f.publication.payloadHash = 'changed-after-preview'
  await expect(resolvePublicationReferences(f.ctx, f.sources, [f.mapping])).rejects.toThrow('does not resolve')
})

test('mapping refuses another source, withdrawn publication, duplicate and unrequested hints', async () => {
  for (const change of ['snapshot', 'registry', 'withdrawn', 'record'] as const) {
    const f = fixture()
    if (change === 'snapshot') f.publication.snapshotId = 'other' as typeof f.snapshot._id
    if (change === 'registry') f.record.registryId = 'other' as typeof f.snapshot.registryId
    if (change === 'withdrawn') f.publication.mode = 'withheld'
    if (change === 'record') f.publication.recordId = 'other' as typeof f.record._id
    await expect(resolvePublicationReferences(f.ctx, f.sources, [f.mapping])).rejects.toThrow('does not resolve')
  }
  const f = fixture()
  await expect(resolvePublicationReferences(f.ctx, f.sources, [f.mapping, f.mapping])).rejects.toThrow('Duplicate')
  await expect(resolvePublicationReferences(f.ctx, f.sources, [f.mapping, { ...f.mapping, originRecordKey: 'unrequested' }])).rejects.toThrow('outside')
})


test('mapping identity ignores redundant origin hints but preserves changed target hashes', () => {
  const f = fixture()
  const original = { ...f.mapping, targetRecordKey: 'origin-key', targetPayloadHash: 'origin-hash' }
  expect(canonicalPublicationMappings([f.source], [original])).toEqual([])
  expect(canonicalPublicationMappings([f.source], [f.mapping])).toEqual([f.mapping])
  expect(canonicalPublicationMappings([f.source], [{ ...original, targetPayloadHash: 'changed' }])).toHaveLength(1)
  expect(() => canonicalPublicationMappings([f.source], [original, original])).toThrow('Duplicate')
})
