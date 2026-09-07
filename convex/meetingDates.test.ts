/// <reference types="vite/client" />
import { convexTest } from 'convex-test'
import { afterEach, expect, test, vi } from 'vitest'
import { api } from './_generated/api'
import schema from './schema'
import { youngsvilleHeaderDate, youngsvilleMeetingId } from './monitoring/meetingDates'
import { eligibleMonitoringDocuments } from './monitoring/documents'
import { sha256HexOfText } from './sources/hashing'

const modules = import.meta.glob('./**/*.ts')
const meetingId = 'ddeda4d873ed48fda1f3167cfa8748c4'
const agendaUrl = `https://meetings.municode.com/adaHtmlDocument/index?cc=YOUNGSVILA&me=${meetingId}&ip=false`
const packetUrl = `https://meetings.municode.com/d/f?u=${encodeURIComponent(`https://mccmeetings.blob.core.usgovcloudapi.net/youngsvila-pubu/MEET-Packet-${meetingId}.pdf`)}&n=wrong-date.pdf`
const text = '# City Council Regular Meeting02/12/2026 06:00 PM\n\nAgenda items'
afterEach(() => vi.unstubAllEnvs())

async function fixture() {
  const t = convexTest(schema, modules)
  const ids = await t.run(async ctx => {
    const userId = await ctx.db.insert('users', { email: 'owner@example.test', googleAccountId: 'owner', emailVerified: true, createdAt: 1, updatedAt: 1, lastSignedInAt: 1 })
    const jurisdictionId = await ctx.db.insert('jurisdictions', { name: 'Lafayette Parish', slug: 'lafayette-parish', state: 'LA', type: 'parish', publicStatus: 'degraded' })
    const bodyId = await ctx.db.insert('governmentBodies', { jurisdictionId, name: 'Youngsville City Council', slug: 'youngsville-city-council', bodyType: 'city_council', publicStatus: 'degraded' })
    const registryId = await ctx.db.insert('sourceRegistries', { governmentBodyId: bodyId, officialDomains: ['meetings.municode.com'], seedUrls: [agendaUrl], sourceKinds: ['agenda'], expectedCadence: { kind: 'monthly' }, discoveryMode: 'adapter', status: 'degraded' })
    const runId = await ctx.db.insert('coverageCompilerRuns', { bodyKey: 'youngsville-city-council', jurisdictionSlug: 'lafayette-parish', rootManifestVersion: 'v1', compilerVersion: 'test', idempotencyKey: 'date-test', attempt: 1, state: 'succeeded', requestedByUserId: userId, startedAt: 1 })
    const proposalId = await ctx.db.insert('coverageRegistryProposals', { runId, governmentBodyId: bodyId, registryId, bodyKey: 'youngsville-city-council', proposalVersion: 1, status: 'promoted', rootManifestVersion: 'v1', goldSetVersion: 'test', evaluatorVersion: 'test', proposedDomains: ['meetings.municode.com'], proposedSeedUrls: [agendaUrl], proposedSourceKinds: ['agenda'], diffHash: 'test', diffSummary: [], createdAt: 1 })
    const policyId = await ctx.db.insert('sourceMonitoringPolicies', { registryId, proposalId, enabled: false, generation: 1, intervalHours: 24, documentsPerRun: 1, targetsPerRun: 1, dailyCallLimit: 10, startsAt: Date.parse('2026-08-07'), activatedAt: 1, baselineComplete: false, nextCheckAt: 0, failures: 0, createdAt: 1, updatedAt: 1 })
    const storageId = await ctx.storage.store(new Blob([text]))
    const snapshotId = await ctx.db.insert('sourceSnapshots', { registryId, canonicalUrl: agendaUrl, retrievedUrl: agendaUrl, contentHash: 'raw-hash', contentHashBasis: 'raw_artifact_v2', normalizedContentHash: await sha256HexOfText(text), contentType: 'text/html', retrievalTime: 1, version: 1, normalizedStorageId: storageId, normalizedContentType: 'text/plain', normalizedByteLength: new TextEncoder().encode(text).byteLength, rawStorageId: storageId, rawContentType: 'text/html', rawByteLength: text.length, truncation: { truncated: false }, firecrawlMetadata: {} })
    const documentId = await ctx.db.insert('monitoredDocuments', { policyId, registryId, canonicalUrl: packetUrl, nextCheckAt: 0, firstSeenAt: 1, notificationEligible: false, inventoryComplete: false, errorClass: 'source_check_incomplete' })
    const evidenceDocumentId = await ctx.db.insert('monitoredDocuments', { policyId, registryId, canonicalUrl: agendaUrl, snapshotId, nextCheckAt: 0, firstSeenAt: 1, notificationEligible: false, inventoryComplete: true })
    return { userId, registryId, policyId, snapshotId, documentId, evidenceDocumentId }
  })
  vi.stubEnv('ADMIN_EMAIL', 'owner@example.test')
  return { t, ...ids, owner: t.withIdentity({ subject: ids.userId }) }
}

test('stored matching evidence excludes the old packet without claiming completion or recovery', async () => {
  const f = await fixture()
  const args = { documentId: f.documentId, evidenceDocumentId: f.evidenceDocumentId }
  await expect(f.t.action(api.monitoring.meetingDates.classifyStoredMeeting, args)).rejects.toThrow()
  expect(await f.owner.action(api.monitoring.meetingDates.classifyStoredMeeting, args)).toEqual({ date: '2026-02-12' })
  expect(await f.t.run(ctx => ctx.db.get(f.documentId))).toMatchObject({ sourceMeetingDate: '2026-02-12', meetingDateEvidenceSnapshotId: f.snapshotId, inventoryComplete: false, errorClass: 'source_check_incomplete' })
  expect(await f.t.run(ctx => ctx.db.get(f.registryId))).toMatchObject({ status: 'degraded' })
  const eligible = await f.t.run(async ctx => eligibleMonitoringDocuments(ctx, (await ctx.db.get(f.policyId))!, { limit: 10, incompleteOnly: true }))
  expect(eligible.map(d => d._id)).not.toContain(f.documentId)
  await f.t.run(ctx => ctx.db.patch(f.policyId, { startsAt: Date.parse('2026-01-01') }))
  const widened = await f.t.run(async ctx => eligibleMonitoringDocuments(ctx, (await ctx.db.get(f.policyId))!, { limit: 10, incompleteOnly: true }))
  expect(widened.map(d => d._id)).toContain(f.documentId)
})

test('a changed source hash refuses to classify the packet', async () => {
  const f = await fixture()
  await f.t.run(ctx => ctx.db.patch(f.snapshotId, { normalizedContentHash: 'wrong' }))
  await expect(f.owner.action(api.monitoring.meetingDates.classifyStoredMeeting, { documentId: f.documentId, evidenceDocumentId: f.evidenceDocumentId })).rejects.toThrow('integrity')
  expect((await f.t.run(ctx => ctx.db.get(f.documentId)))?.sourceMeetingDate).toBeUndefined()
})

test('only the official Youngsville meeting identity and header date are accepted', () => {
  expect(youngsvilleMeetingId(packetUrl)).toBe(meetingId)
  expect(youngsvilleMeetingId(agendaUrl)).toBe(meetingId)
  expect(youngsvilleMeetingId(agendaUrl.replace('YOUNGSVILA', 'OTHER'))).toBeNull()
  expect(youngsvilleMeetingId(packetUrl.replace('youngsvila-pubu', 'other-pubu'))).toBeNull()
  expect(youngsvilleMeetingId(agendaUrl.replace('https:', 'http:'))).toBeNull()
  expect(youngsvilleHeaderDate(text)).toBe('2026-02-12')
  expect(youngsvilleHeaderDate(text.replace('02/12', '02/30'))).toBeNull()
  expect(youngsvilleHeaderDate('Prior business dated 02/12/2026')).toBeNull()
})
