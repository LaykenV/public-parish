/// <reference types="vite/client" />
import rateLimiterTest from '@convex-dev/rate-limiter/test'
import workflowTest from '@convex-dev/workflow/test'
import { DAY, RateLimiter, calculateRateLimit } from '@convex-dev/rate-limiter'
import { creditDevelopmentAdmissions } from './operations/developmentProof'
import { configurePolicy } from './monitoring/ledger'
import { convexTest } from 'convex-test'
import { afterEach, expect, test, vi } from 'vitest'
import { api, components, internal } from './_generated/api'
import { isBeforeSourceWindow, isDocumentUrl, officialMeetingDate } from './monitoring/discovery'
import { inventoryContract, inventoryIdentity, inventorySourceSection, isBeforeMeetingWindow } from './monitoring/contracts'
import type { InventoryResult } from './monitoring/contracts'
import schema from './schema'
import { extractionRunKey } from './pipeline/keys'
import { EXTRACTION_PROCESSOR_VERSION, EXTRACTION_PROMPT_VERSION, EXTRACTION_SCHEMA_VERSION } from './pipeline/state'
import { extractionWorkflowManager } from './pipeline/workflowManager'

const modules = import.meta.glob('./**/*.ts')
afterEach(() => { vi.unstubAllEnvs(); vi.useRealTimers() })
const inventory: InventoryResult = { complete: true, bodyName: 'Test Council', sourceKind: 'agenda', meetingDate: '2026-09-04', dateExcerpt: 'September 4, 2026', targets: [{ printedId: '2026-14', title: 'Road repairs', excerpt: '2026-14 Road repairs' }] }
const text = 'Test Council. September 4, 2026. 2026-14 Road repairs'

test('a midday policy includes same-day meetings and excludes the previous day', () => {
  const startsAt = Date.parse('2026-09-05T18:30:00Z')
  expect(isBeforeMeetingWindow('2026-09-05', startsAt)).toBe(false)
  expect(isBeforeMeetingWindow('2026-09-04', startsAt)).toBe(true)
  expect(isBeforeMeetingWindow('2026-09-06', startsAt)).toBe(false)
})

test('inventory refuses fabricated locators, ambiguous items and invalid dates', () => {
  expect(inventoryContract(inventory, text, 'Test Council')).toBeNull()
  expect(inventoryContract({ ...inventory, targets: [{ ...inventory.targets[0], excerpt: 'Not in the source' }] }, text, 'Test Council')).toMatch(/citation/)
  expect(inventoryContract({ ...inventory, targets: [...inventory.targets, ...inventory.targets] }, text, 'Test Council')).toMatch(/duplicate/)
  expect(inventoryContract({ ...inventory, meetingDate: '2026-02-30' }, text, 'Test Council')).toMatch(/date/)
  expect(inventoryContract({ ...inventory, targets: [{ ...inventory.targets[0], excerpt: 'x'.repeat(241) }] }, `${text} ${'x'.repeat(241)}`, 'Test Council')).toMatch(/240 characters/)
  expect(inventoryContract({ ...inventory, complete: false }, text, 'Test Council')).toMatch(/incomplete/)
  expect(inventoryContract({ ...inventory, targets: [{ ...inventory.targets[0], printedId: '2026-14\n', excerpt: '2026-14\n Road repairs' }] }, text, 'Test Council')).toMatch(/identifier/)
  expect(inventoryContract(inventory, text, 'Another Council')).toMatch(/body/)
})

test('monitoring controls and ledgers require the owner', async () => {
  const t = convexTest(schema, modules)
  await expect(t.query(api.monitoring.ledger.policies, { paginationOpts: { numItems: 10, cursor: null } })).rejects.toThrow()
  const userId = await t.run(ctx => ctx.db.insert('users', { email: 'resident@example.test', googleAccountId: 'monitoring-test', emailVerified: true, createdAt: 1, updatedAt: 1, lastSignedInAt: 1 }))
  await expect(t.withIdentity({ subject: userId }).query(api.monitoring.ledger.policies, { paginationOpts: { numItems: 10, cursor: null } })).rejects.toThrow()
})

test('deployment switch keeps scheduled monitoring dormant', async () => {
  vi.stubEnv('SOURCE_MONITORING_ENABLED', 'false')
  const t = convexTest(schema, modules)
  await t.mutation(internal.monitoring.ledger.tick, {})
  expect(await t.run(ctx => ctx.db.query('sourceMonitoringRuns').collect())).toEqual([])
})

async function monitoringFixture() {
  const t = convexTest(schema, modules)
  vi.stubEnv('SOURCE_MONITORING_ENABLED', 'true')
  vi.stubEnv('AI_SPENDING_GUARD_ENABLED', 'true')
  const ids = await t.run(async ctx => {
    await ctx.db.insert('aiSpendingAllowances', { scope: 'sources', enabled: true, allowanceMicros: 1_000_000, chargedMicros: 0, expiresAt: Date.now() + DAY, updatedAt: Date.now() })
    const jurisdictionId = await ctx.db.insert('jurisdictions', { name: 'Lafayette Parish', slug: 'lafayette-parish', state: 'LA', type: 'parish', publicStatus: 'supported' })
    const bodyId = await ctx.db.insert('governmentBodies', { jurisdictionId, name: 'Lafayette City Council', slug: 'lafayette-city-council', bodyType: 'city_council', publicStatus: 'supported' })
    const registryId = await ctx.db.insert('sourceRegistries', { governmentBodyId: bodyId, officialDomains: ['www.lafayettela.gov'], seedUrls: ['https://www.lafayettela.gov/agenda.pdf'], sourceKinds: ['agenda'], expectedCadence: { kind: 'monthly' }, discoveryMode: 'dynamic', status: 'supported', statusGeneration: 1 })
    const userId = await ctx.db.insert('users', { email: 'owner@example.test', googleAccountId: 'owner', emailVerified: true, createdAt: 1, updatedAt: 1, lastSignedInAt: 1 })
    const compilerRunId = await ctx.db.insert('coverageCompilerRuns', { bodyKey: 'lafayette-city-council', jurisdictionSlug: 'lafayette-parish', rootManifestVersion: 'v1', compilerVersion: 'test', idempotencyKey: 'monitor-test', attempt: 1, state: 'succeeded', requestedByUserId: userId, startedAt: 1 })
    const proposalId = await ctx.db.insert('coverageRegistryProposals', { runId: compilerRunId, governmentBodyId: bodyId, registryId, bodyKey: 'lafayette-city-council', proposalVersion: 1, status: 'promoted', rootManifestVersion: 'v1', goldSetVersion: 'test', evaluatorVersion: 'test', proposedDomains: ['www.lafayettela.gov'], proposedSeedUrls: ['https://www.lafayettela.gov/agenda.pdf'], proposedSourceKinds: ['agenda'], diffHash: 'test', diffSummary: [], createdAt: 1 })
    const policyId = await ctx.db.insert('sourceMonitoringPolicies', { registryId, proposalId, enabled: true, generation: 1, intervalHours: 24, documentsPerRun: 1, targetsPerRun: 1, dailyCallLimit: 10, startsAt: Date.now() - 86_400_000, activatedAt: Date.now(), baselineComplete: false, nextCheckAt: 0, failures: 0, createdAt: 1, updatedAt: 1 })
    const runId = await ctx.db.insert('sourceMonitoringRuns', { policyId, registryId, generation: 1, registryGeneration: 1, state: 'running', baseline: true, documentsChecked: 0, targetsStarted: 0, startedAt: Date.now() })
    await ctx.db.patch(policyId, { activeRunId: runId })
    return { registryId, policyId, runId, bodyId, proposalId, userId }
  })
  return { t, ...ids }
}

test('a verified old meeting leaves the current window without losing future inventory eligibility', async () => {
  const f = await monitoringFixture()
  const target = await queuedTarget(f, 'old-meeting', false)
  await f.t.run(async ctx => {
    await ctx.db.patch(f.policyId, { startsAt: Date.parse('2026-09-05') })
    await ctx.db.patch(target.documentId, { completedChunks: 0 })
  })
  await f.t.mutation(internal.monitoring.ledger.saveInventory, { runId: f.runId, documentId: target.documentId, chunk: 0, chunks: 1, inventory: { ...inventory, targets: [] } })
  expect(await f.t.run(ctx => ctx.db.get(target.documentId))).toMatchObject({ sourceMeetingDate: '2026-09-04', completedChunks: 0, inventoryComplete: false })
  expect(await f.t.query(internal.monitoring.ledger.dueDocuments, { runId: f.runId })).toEqual([])
  vi.stubEnv('ADMIN_EMAIL', 'owner@example.test')
  expect(await f.t.withIdentity({ subject: f.userId }).mutation(api.monitoring.ledger.classifyOfficialMeetingDates, { policyId: f.policyId, paginationOpts: { numItems: 50, cursor: null } })).toMatchObject({ classified: 0 })
  expect((await f.t.run(ctx => ctx.db.get(target.documentId)))?.sourceMeetingDate).toBe('2026-09-04')
  expect(await f.t.run(ctx => ctx.db.get(target.targetId))).not.toBeNull()
  await f.t.run(ctx => ctx.db.patch(f.policyId, { startsAt: Date.parse('2026-09-01') }))
  expect((await f.t.query(internal.monitoring.ledger.dueDocuments, { runId: f.runId })).map(d => d._id)).toEqual([target.documentId])
  expect(inventoryContract({ ...inventory, meetingDate: '2026-02-30', targets: [] }, text, 'Test Council')).toMatch(/real source-backed meeting date/)
  expect(officialMeetingDate('https://www.brla.gov/AgendaCenter/ViewFile/ArchivedMinutes/_04302026-3326')).toBe('2026-04-30')
})

test('old-meeting exclusion requires a matching printed date in the header', () => {
  const old = { ...inventory, targets: [] }
  const startsAt = Date.parse('2026-09-05')
  expect(inventoryContract(old, text, 'Test Council', [], ['agenda'], startsAt)).toBeNull()
  expect(inventoryContract({ ...old, meetingDate: '2026-08-04' }, text, 'Test Council', [], ['agenda'], startsAt)).toMatch(/printed date matching/)
  expect(inventoryContract(old, 'Current meeting header. '.repeat(100) + text, 'Test Council', [], ['agenda'], startsAt)).toMatch(/first 2000/)
  for (const dateExcerpt of ['2026-09-04', '09/04/2026', 'September 4, 2026']) expect(inventoryContract({ ...old, dateExcerpt }, `Test Council. ${dateExcerpt}`, 'Test Council', [], ['agenda'], startsAt)).toBeNull()
})

test('a failed document backs off so the next approved document can run', async () => {
  const { t, runId } = await monitoringFixture()
  await t.mutation(internal.monitoring.ledger.addDocuments, { runId, urls: ['https://www.lafayettela.gov/dead-agenda.pdf', 'https://www.lafayettela.gov/good-agenda.pdf', 'https://unapproved.example/agenda.pdf'] })
  const first = await t.query(internal.monitoring.ledger.dueDocuments, { runId })
  expect(first).toHaveLength(1)
  await t.mutation(internal.monitoring.ledger.deferDocument, { runId, documentId: first[0]._id })
  const next = await t.query(internal.monitoring.ledger.dueDocuments, { runId })
  expect(next).toHaveLength(1)
  expect(next[0]._id).not.toBe(first[0]._id)
  expect(await t.run(ctx => ctx.db.query('monitoredDocuments').collect())).toHaveLength(2)
})

test('pause invalidates in-flight monitoring and publication authority', async () => {
  const { t, runId, policyId, registryId } = await monitoringFixture()
  const pipelineId = await t.run(async ctx => {
    const id = await ctx.db.insert('pipelineRuns', { registryId, trigger: 'manual_extraction', state: 'running', processorVersion: 'test', startedAt: Date.now(), monitorPolicyId: policyId, monitorGeneration: 1, monitorRegistryGeneration: 1 })
    await ctx.db.patch(policyId, { enabled: false, generation: 2 })
    return id
  })
  await expect(t.query(internal.monitoring.ledger.context, { runId })).rejects.toThrow('monitoring_stopped')
  await expect(t.query(internal.monitoring.ledger.pipelineGuard, { runId: pipelineId })).rejects.toThrow('monitoring_stopped')
})

test('source window skips dated old archives and keeps opaque document links', () => {
  const start = Date.parse('2026-01-01')
  expect(isBeforeSourceWindow('https://rppj.com/2020-police-jury-meetings', start)).toBe(true)
  expect(isBeforeSourceWindow('https://rppj.com/wp-content/uploads/2026/08/agenda.pdf', start)).toBe(false)
  expect(isBeforeSourceWindow('https://rppj.com/agenda/2392', start)).toBe(false)
  expect(isDocumentUrl('https://www.brla.gov/AgendaCenter/ViewFile/Agenda/_08122026-2419')).toBe(true)
  expect(isDocumentUrl('https://rppj.com/2026-police-jury-meetings')).toBe(false)
})

test('changing a daily limit preserves admissions already used in the window', async () => {
  const { t, runId, policyId, proposalId } = await monitoringFixture()
  rateLimiterTest.register(t)
  expect(await t.mutation(internal.monitoring.ledger.reserve, { runId, units: 6 })).toBe(true)
  const rate = new RateLimiter(components.rateLimiter, {})
  const original = await t.run(ctx => ctx.db.get(policyId))
  for (const dailyCallLimit of [1_000, 5_000, 15_000, 50_000, 10]) {
    await t.run(ctx => configurePolicy(ctx, { proposalId, enabled: true, intervalHours: 24, documentsPerRun: 1, targetsPerRun: 1, dailyCallLimit, startsAt: original!.startsAt }))
    expect(await t.run(ctx => ctx.db.get(policyId))).toMatchObject({ generation: original!.generation, activeRunId: runId })
    const remaining = await t.run(async ctx => {
      const value = await rate.getValue(ctx, 'calls', { key: policyId, config: { kind: 'fixed window', rate: dailyCallLimit, period: DAY } })
      return calculateRateLimit(value, value.config).value
    })
    expect(remaining).toBe(dailyCallLimit - 6)
  }
  await expect(t.run(ctx => configurePolicy(ctx, { proposalId, enabled: true, intervalHours: 24, documentsPerRun: 1, targetsPerRun: 1, dailyCallLimit: 50_001, startsAt: original!.startsAt }))).rejects.toThrow('outside the allowed bounds')
})


test('a daily limit cannot erase admissions by dropping below usage', async () => {
  const { t, runId, policyId, proposalId } = await monitoringFixture()
  rateLimiterTest.register(t)
  await t.run(ctx => ctx.db.patch(policyId, { dailyCallLimit: 20 }))
  expect(await t.mutation(internal.monitoring.ledger.reserve, { runId, units: 8 })).toBe(true)
  expect(await t.mutation(internal.monitoring.ledger.reserve, { runId, units: 8 })).toBe(true)
  await expect(t.run(ctx => configurePolicy(ctx, { proposalId, enabled: true, intervalHours: 24, documentsPerRun: 1, targetsPerRun: 1, dailyCallLimit: 10, startsAt: Date.now() - DAY }))).rejects.toThrow('below calls already used')
  expect(await t.mutation(internal.monitoring.ledger.reserve, { runId, units: 5 })).toBe(false)
})

test('daily admission exhaustion preserves source health and resumable work', async () => {
  const { t, runId, policyId, registryId } = await monitoringFixture()
  rateLimiterTest.register(t)
  const rate = new RateLimiter(components.rateLimiter, {})
  await t.run(ctx => rate.limit(ctx, 'calls', { key: policyId, count: 10, config: { kind: 'fixed window', rate: 10, period: DAY, start: Date.now() }, throws: true }))
  await t.mutation(internal.monitoring.ledger.finish, { runId, state: 'incomplete', documentsChecked: 0, targetsStarted: 0, errorClass: 'monitoring_daily_limit' })
  const result = await t.run(async ctx => ({ policy: await ctx.db.get(policyId), registry: await ctx.db.get(registryId), incidents: await ctx.db.query('coverageIncidents').collect() }))
  expect(result.policy?.failures).toBe(0)
  expect(result.policy?.baselineComplete).toBe(false)
  expect(result.policy?.activeRunId).toBeUndefined()
  expect(result.policy!.nextCheckAt).toBeGreaterThan(Date.now() + 23 * 3_600_000)
  expect(result.registry?.status).toBe('supported')
  expect(result.incidents).toEqual([])
})

test('formatting can normalize but local agenda numbering cannot merge different decisions', () => {
  expect(inventoryContract(inventory, '**Test Council**. September 4, 2026. **2026-14 Road repairs**', 'Test Council')).toBeNull()
  const a = { printedId: '2', title: 'Road repairs', excerpt: '2. Repair Oak Street' }
  const b = { printedId: '2', title: 'Road repairs', excerpt: '2. Repair Pine Street' }
  expect(inventoryIdentity('2026-09-04', a).key).not.toBe(inventoryIdentity('2026-09-04', b).key)
  expect(inventoryIdentity('2026-09-04', inventory.targets[0]).key).toBe(inventoryIdentity('2026-10-04', { ...inventory.targets[0], excerpt: '2026-14 Road repairs approved' }).key)
})

test('literal inventory citations can cross a bold boundary without accepting changed text', () => {
  const source = 'Test Council. September 4, 2026. **2026-14 Road repairs** on Oak Street.'
  const target = { printedId: null, title: 'Road repairs', excerpt: 'Road repairs** on Oak Street.' }
  expect(inventoryContract({ ...inventory, targets: [target] }, source, 'Test Council')).toBeNull()
  expect(inventoryContract({ ...inventory, targets: [{ ...target, excerpt: 'Road repairs** on Pine Street.' }] }, source, 'Test Council')).toMatch(/citation/)
  expect(inventoryContract({ ...inventory, targets: [{ ...target, excerpt: '' }] }, source, 'Test Council')).toMatch(/citation/)
  const oversized = 'Road repairs** ' + 'x'.repeat(241)
  expect(inventoryContract({ ...inventory, targets: [{ ...target, excerpt: oversized }] }, source + oversized, 'Test Council')).toMatch(/240 characters/)
})

test('a bounded listing pass preserves its next page and does not finish the baseline', async () => {
  const { t, runId, policyId } = await monitoringFixture()
  await t.mutation(internal.monitoring.ledger.saveDiscoveryProgress, { runId, pending: ['https://www.lafayettela.gov/2026-meetings/page-2'], visited: ['https://www.lafayettela.gov/2026-meetings'] })
  await t.mutation(internal.monitoring.ledger.finish, { runId, state: 'completed', documentsChecked: 0, targetsStarted: 0 })
  const policy = await t.run(ctx => ctx.db.get(policyId))
  expect(policy?.discoveryPendingUrls).toEqual(['https://www.lafayettela.gov/2026-meetings/page-2'])
  expect(policy?.baselineComplete).toBe(false)
  expect(policy?.failures).toBe(0)
})

test('later inventory sections keep a complete motion separate from date-only header context', () => {
  const header = 'Council. September 4, 2026. Unrelated property hearing.'
  const motion = 'On motion to approve drainage repairs ' + 'with official terms '.repeat(40)
  const source = header + '\n\n' + 'x'.repeat(42700) + '\n\n' + motion + '\n\nNext item'
  const section = inventorySourceSection(source, 1)
  expect(section.source.trimStart().startsWith('On motion')).toBe(true)
  expect(section.source).toContain(motion)
  expect(section.source).not.toContain('Unrelated property hearing')
  expect(section.dateAndBodyContext).toContain('September 4, 2026')
})

test('completed discovery waits for its cadence while backlog processing continues', async () => {
  const { t, runId, policyId } = await monitoringFixture()
  await t.mutation(internal.monitoring.ledger.saveDiscoveryProgress, { runId, pending: [], visited: ['https://www.lafayettela.gov/2026-meetings'] })
  const policy = await t.run(ctx => ctx.db.get(policyId))
  expect(policy?.nextDiscoveryAt).toBeGreaterThan(Date.now())
  // No provider component is installed in this fixture. A scrape would fail.
  expect(await t.action(internal.monitoring.actions.discover, { runId })).toBe(true)
  expect(await t.run(ctx => ctx.db.query('monitoringProviderCalls').take(10))).toHaveLength(0)
})


test('continuation rejects different locator fragments of an already inventoried decision', () => {
  const prior = '2026-14 Road repairs include culvert work'
  const source = `Test Council. September 4, 2026. ${prior}. 2026-15 Library repairs`
  expect(inventoryContract(inventory, source, 'Test Council', [prior])).toMatch(/already accepted target/)
  expect(inventoryContract({ ...inventory, targets: [{ ...inventory.targets[0], excerpt: prior }] }, source, 'Test Council', ['2026-14 Road repairs'])).toMatch(/already accepted target/)
  expect(inventoryContract({ ...inventory, targets: [{ printedId: '2026-15', title: 'Library repairs', excerpt: '2026-15 Library repairs' }] }, source, 'Test Council', [prior])).toBeNull()
})

test.each([false, true])('cadence incidents require a completed initial inventory: %s', async baselineComplete => {
  const { t, runId, policyId, registryId, proposalId } = await monitoringFixture()
  await t.run(async ctx => {
    await ctx.db.patch(policyId, { baselineComplete })
    await ctx.db.insert('sourceExpectations', { registryId, proposalId, sourceKind: 'agenda', cadence: 'monthly', basis: 'inferred', expectedFrom: 1, expectedBy: 2, createdAt: 1 })
  })
  await t.mutation(internal.monitoring.ledger.finish, { runId, state: 'completed', documentsChecked: 1, targetsStarted: 0 })
  await t.run(async ctx => {
    const policy = await ctx.db.get(policyId)
    const incidents = await ctx.db.query('coverageIncidents').collect()
    expect(policy?.baselineComplete).toBe(true)
    expect(policy?.failures).toBe(baselineComplete ? 1 : 0)
    expect(incidents.map(incident => incident.code)).toEqual(baselineComplete ? ['expected_artifact_missing'] : [])
  })
})

test('the approved development credit is once only and expires without changing the daily rate', async () => {
  const { t, policyId } = await monitoringFixture()
  rateLimiterTest.register(t)
  const windowStart = Date.now()
  const rate = new RateLimiter(components.rateLimiter, {})
  const config = { kind: 'fixed window' as const, rate: 500, period: DAY, start: windowStart }
  await t.run(async ctx => {
    await ctx.db.patch(policyId, { dailyCallLimit: 500 })
    await rate.limit(ctx, 'calls', { key: policyId, count: 500, config, throws: true })
  })
  vi.stubEnv('CONVEX_SITE_URL', 'https://befitting-flamingo-587.convex.site')
  await expect(t.run(ctx => creditDevelopmentAdmissions(ctx, policyId, windowStart))).rejects.toThrow('unavailable')
  vi.stubEnv('CONVEX_SITE_URL', 'https://woozy-wren-227.convex.site')
  expect(await t.run(ctx => creditDevelopmentAdmissions(ctx, policyId, windowStart))).toMatchObject({ granted: true, remaining: 100 })
  expect(await t.run(ctx => creditDevelopmentAdmissions(ctx, policyId, windowStart))).toMatchObject({ granted: false, remaining: 100 })
  await t.run(async ctx => {
    expect((await rate.limit(ctx, 'calls', { key: policyId, count: 100, config })).ok).toBe(true)
    expect((await rate.limit(ctx, 'calls', { key: policyId, count: 1, config })).ok).toBe(false)
    const value = await rate.getValue(ctx, 'calls', { key: policyId, config })
    expect(calculateRateLimit(value, value.config, windowStart + DAY + 1).value).toBe(500)
    const policy = await ctx.db.get(policyId)
    expect(policy?.dailyCallLimit).toBe(500)
    expect(policy?.developmentAdmissionGrant).toMatchObject({ admissions: 100, consumedBefore: 500, windowStart })
  })
  await expect(t.run(ctx => creditDevelopmentAdmissions(ctx, policyId, windowStart - DAY))).rejects.toThrow('expired')
})

async function queuedTarget(fixture: Awaited<ReturnType<typeof monitoringFixture>>, key: string, complete = true) {
  const { t, registryId, policyId } = fixture
  return t.run(async ctx => {
    const storageId = await ctx.storage.store(new Blob([text]))
    const url = `https://www.lafayettela.gov/${key}-agenda.pdf`
    const snapshotId = await ctx.db.insert('sourceSnapshots', { registryId, canonicalUrl: url, retrievedUrl: url, contentHash: key, contentType: 'application/pdf', retrievalTime: 1, version: 1, normalizedStorageId: storageId, normalizedContentType: 'text/plain', normalizedByteLength: text.length, rawStorageId: storageId, rawContentType: 'application/pdf', rawByteLength: text.length, truncation: { truncated: false }, firecrawlMetadata: {} })
    const documentId = await ctx.db.insert('monitoredDocuments', { registryId, policyId, canonicalUrl: url, snapshotId, nextCheckAt: 0, firstSeenAt: 1, notificationEligible: false, inventoryComplete: complete, completedChunks: 1, chunkCount: complete ? 1 : 2 })
    const targetRecordId = `AUTO-${key}`
    const idempotencyKey = await extractionRunKey({ registryId, snapshotId, sourceKind: 'agenda', targetRecordId, sourceRecordIdProvenance: 'operator_assigned', promptVersion: EXTRACTION_PROMPT_VERSION, schemaVersion: EXTRACTION_SCHEMA_VERSION, processorVersion: EXTRACTION_PROCESSOR_VERSION })
    // An existing queued extraction proves dispatch can reuse work without
    // starting provider calls in these scheduler regressions.
    const pipelineRunId = await ctx.db.insert('pipelineRuns', { registryId, snapshotId, targetRecordId, sourceKind: 'agenda', sourceRecordIdProvenance: 'operator_assigned', trigger: 'manual_extraction', state: 'queued', processorVersion: EXTRACTION_PROCESSOR_VERSION, idempotencyKey, startedAt: 1, monitorPolicyId: policyId, monitorGeneration: 1, monitorRegistryGeneration: 1 })
    for (const stage of ['extract', 'validate'] as const) await ctx.db.insert('pipelineStages', { runId: pipelineRunId, stage, idempotencyKey: `${idempotencyKey}:${stage}`, state: 'queued', attempt: 0 })
    const targetId = await ctx.db.insert('documentInventoryTargets', { documentId, snapshotId, policyId, registryId, targetKey: key, targetRecordId, locator: '2026-14 Road repairs', sourceRecordIdProvenance: 'operator_assigned', sourceKind: 'agenda', meetingDate: '2026-09-04', state: 'pending', notificationEligible: false, createdAt: 1, updatedAt: 1 })
    return { targetId, documentId, pipelineRunId }
  })
}

test('Pineville listing reclassification preserves history and excludes wrappers from evidence work', async () => {
  const f = await monitoringFixture()
  vi.stubEnv('ADMIN_EMAIL', 'owner@example.test')
  const ids = await f.t.run(async ctx => {
    await ctx.db.patch(f.proposalId, { bodyKey: 'pineville-city-council' })
    await ctx.db.patch(f.policyId, { enabled: false })
    const fields = { policyId: f.policyId, registryId: f.registryId, nextCheckAt: 0, firstSeenAt: 1, notificationEligible: false, inventoryComplete: false }
    const listingId = await ctx.db.insert('monitoredDocuments', { ...fields, canonicalUrl: 'https://www.pineville.net/egov/apps/document/center.egov?id=2309&view=item', errorClass: 'redirect_domain_not_allowed' })
    const pdfId = await ctx.db.insert('monitoredDocuments', { ...fields, canonicalUrl: 'https://mcclibraryfunctions.azurewebsites.us/api/munidocDownload/31105/9734ade6364fa/pdf' })
    return { listingId, pdfId }
  })
  const args = { policyId: f.policyId, paginationOpts: { numItems: 50, cursor: null } }
  await expect(f.t.mutation(api.monitoring.ledger.reclassifyPinevilleListings, args)).rejects.toThrow()
  const result = await f.t.withIdentity({ subject: f.userId }).mutation(api.monitoring.ledger.reclassifyPinevilleListings, args)
  expect(result).toMatchObject({ classified: 1, isDone: true })
  expect(await f.t.run(ctx => ctx.db.get(ids.listingId))).toMatchObject({ discoveryOnly: true, inventoryComplete: false, errorClass: 'redirect_domain_not_allowed' })
  await f.t.run(ctx => ctx.db.patch(f.policyId, { enabled: true }))
  expect((await f.t.query(internal.monitoring.ledger.dueDocuments, { runId: f.runId })).map(d => d._id)).toEqual([ids.pdfId])
  await expect(f.t.withIdentity({ subject: f.userId }).mutation(api.monitoring.ledger.reclassifyPinevilleListings, args)).rejects.toThrow('Pause the Pineville policy')
})

test('a wrapper with existing decision targets cannot be reclassified automatically', async () => {
  const f = await monitoringFixture()
  vi.stubEnv('ADMIN_EMAIL', 'owner@example.test')
  const target = await queuedTarget(f, 'protected')
  await f.t.run(async ctx => {
    await ctx.db.patch(f.proposalId, { bodyKey: 'pineville-city-council' })
    await ctx.db.patch(f.policyId, { enabled: false })
    await ctx.db.patch(target.documentId, { canonicalUrl: 'https://www.pineville.net/egov/apps/document/center.egov?id=2309&view=item' })
  })
  await expect(f.t.withIdentity({ subject: f.userId }).mutation(api.monitoring.ledger.reclassifyPinevilleListings, { policyId: f.policyId, paginationOpts: { numItems: 50, cursor: null } })).rejects.toThrow('requires individual review')
  expect((await f.t.run(ctx => ctx.db.get(target.documentId)))?.discoveryOnly).toBeUndefined()
  expect(await f.t.run(ctx => ctx.db.get(target.targetId))).not.toBeNull()
})

test('an incomplete first document cannot block a ready decision behind it', async () => {
  const f = await monitoringFixture()
  rateLimiterTest.register(f.t)
  const blocked = await queuedTarget(f, 'blocked', false)
  const ready = await queuedTarget(f, 'ready')
  expect(await f.t.mutation(internal.monitoring.ledger.dispatchTargets, { runId: f.runId })).toEqual({ started: 1, processing: true })
  await f.t.run(async ctx => {
    expect(await ctx.db.get(blocked.targetId)).toMatchObject({ state: 'pending' })
    expect(await ctx.db.get(ready.targetId)).toMatchObject({ state: 'running', attempts: 1 })
  })
  // A subsequent run cannot start another batch over the in-flight decision.
  await queuedTarget(f, 'later')
  expect(await f.t.mutation(internal.monitoring.ledger.dispatchTargets, { runId: f.runId })).toEqual({ started: 0, processing: true })
})

test('an exhausted budget leaves an eligible target unattempted until reset', async () => {
  const f = await monitoringFixture()
  rateLimiterTest.register(f.t)
  const ready = await queuedTarget(f, 'ready')
  expect(await f.t.mutation(internal.monitoring.ledger.reserve, { runId: f.runId, units: 8 })).toBe(true)
  await expect(f.t.mutation(internal.monitoring.ledger.dispatchTargets, { runId: f.runId })).rejects.toThrow('monitoring_daily_limit')
  const target = await f.t.run(ctx => ctx.db.get(ready.targetId))
  expect(target?.state).toBe('pending')
  expect(target?.attempts).toBeUndefined()
})

test.each(['pending', 'running'] as const)('queued work gets provider priority over discovery: %s', async state => {
  vi.useFakeTimers()
  const f = await monitoringFixture()
  rateLimiterTest.register(f.t)
  workflowTest.register(f.t)
  const target = await queuedTarget(f, 'priority')
  if (state === 'running') await f.t.run(ctx => ctx.db.patch(target.targetId, { state, pipelineRunId: target.pipelineRunId, attempts: 1 }))
  await f.t.run(ctx => extractionWorkflowManager.start(ctx, internal.monitoring.workflow.checkSources, { runId: f.runId }))
  await f.t.finishAllScheduledFunctions(vi.runAllTimers)
  const run = await f.t.run(ctx => ctx.db.get(f.runId))
  // Firecrawl is deliberately absent. Calling discovery would fail this run.
  expect(run).toMatchObject({ state: 'completed', documentsChecked: 0, targetsStarted: state === 'pending' ? 1 : 0 })
  expect(await f.t.run(ctx => ctx.db.query('monitoringProviderCalls').take(10))).toHaveLength(0)
})

test('a document with waiting items resumes before untouched archive documents', async () => {
  const f = await monitoringFixture()
  await f.t.mutation(internal.monitoring.ledger.addDocuments, { runId: f.runId, urls: ['https://www.lafayettela.gov/old-agenda.pdf'] })
  const partial = await queuedTarget(f, 'partial', false)
  expect((await f.t.query(internal.monitoring.ledger.dueDocuments, { runId: f.runId })).map(document => document._id)).toEqual([partial.documentId])
})

test.each([true, false])('budget exhaustion does not consume a terminal retry: %s', async budgetPaused => {
  const f = await monitoringFixture()
  rateLimiterTest.register(f.t)
  const target = await queuedTarget(f, 'retry')
  await f.t.run(async ctx => {
    await ctx.db.patch(target.targetId, { state: 'running', pipelineRunId: target.pipelineRunId, attempts: 3 })
    await ctx.db.patch(target.pipelineRunId, { state: 'failed_retryable' })
    const stage = await ctx.db.query('pipelineStages').withIndex('by_run_and_stage', q => q.eq('runId', target.pipelineRunId).eq('stage', 'extract')).unique()
    await ctx.db.patch(stage!._id, { state: 'failed_retryable', errorClass: 'extraction_step_failed', errorDetail: budgetPaused ? 'Error: monitoring_daily_limit' : 'source_hash_mismatch' })
  })
  await f.t.mutation(internal.monitoring.ledger.reconcileTargets, { policyId: f.policyId })
  expect(await f.t.run(ctx => ctx.db.get(target.targetId))).toMatchObject({ state: budgetPaused ? 'pending' : 'failed', attempts: budgetPaused ? 2 : 3 })
})

test('only the owner can change shared capacity and usage survives increases and reductions', async () => {
  const { t, runId, policyId, userId } = await monitoringFixture()
  rateLimiterTest.register(t)
  await expect(t.mutation(api.monitoring.ledger.configureGlobalBudget, { dailyCallLimit: 2_000 })).rejects.toThrow()
  vi.stubEnv('ADMIN_EMAIL', 'owner@example.test')
  const owner = t.withIdentity({ subject: userId })
  await t.run(ctx => ctx.db.patch(policyId, { dailyCallLimit: 5_000 }))
  expect(await t.mutation(internal.monitoring.ledger.reserve, { runId, units: 8 })).toBe(true)
  const raised = await owner.mutation(api.monitoring.ledger.configureGlobalBudget, { dailyCallLimit: 2_000 })
  expect(raised.used).toBe(8)
  const lowered = await owner.mutation(api.monitoring.ledger.configureGlobalBudget, { dailyCallLimit: 10 })
  expect(lowered).toMatchObject({ used: 8, windowStart: raised.windowStart })
  expect(await t.mutation(internal.monitoring.ledger.reserve, { runId, units: 2 })).toBe(true)
  expect(await t.mutation(internal.monitoring.ledger.reserve, { runId, units: 1 })).toBe(false)
  expect(await owner.mutation(api.monitoring.ledger.configureGlobalBudget, { dailyCallLimit: 2_000 })).toMatchObject({ used: 10, windowStart: raised.windowStart })
  expect(await t.mutation(internal.monitoring.ledger.reserve, { runId, units: 2 })).toBe(true)
  await expect(owner.mutation(api.monitoring.ledger.configureGlobalBudget, { dailyCallLimit: 10 })).rejects.toThrow('below calls already used')
  await expect(owner.mutation(api.monitoring.ledger.configureGlobalBudget, { dailyCallLimit: 50_001 })).rejects.toThrow('outside the allowed bounds')
})

test('proposal recovery waits for the shared budget without consuming calls', async () => {
  const { t, policyId, registryId, runId, userId } = await monitoringFixture()
  rateLimiterTest.register(t)
  vi.stubEnv('ADMIN_EMAIL', 'owner@example.test')
  const owner = t.withIdentity({ subject: userId })
  const pipelineRunId = await t.run(ctx => ctx.db.insert('pipelineRuns', { registryId, trigger: 'decision_published', state: 'succeeded', processorVersion: 'test', monitorPolicyId: policyId, monitorGeneration: 1, monitorRegistryGeneration: 1, startedAt: 1 }))
  await owner.mutation(api.monitoring.ledger.configureGlobalBudget, { dailyCallLimit: 10 })
  expect(await t.mutation(internal.monitoring.ledger.reserve, { runId, units: 10 })).toBe(true)
  const paused = await t.mutation(internal.monitoring.ledger.pipelineBudget, { runId: pipelineRunId })
  expect(paused.ok).toBe(false)
  expect(paused.retryAt).toBeGreaterThan(Date.now())
  await owner.mutation(api.monitoring.ledger.configureGlobalBudget, { dailyCallLimit: 100 })
  await t.run(async ctx => { const policy = (await ctx.db.get(policyId))!; await configurePolicy(ctx, { proposalId: policy.proposalId, enabled: true, intervalHours: policy.intervalHours, documentsPerRun: policy.documentsPerRun, targetsPerRun: policy.targetsPerRun, dailyCallLimit: 100, startsAt: policy.startsAt }) })
  expect((await t.mutation(internal.monitoring.ledger.pipelineBudget, { runId: pipelineRunId })).ok).toBe(true)
  await t.run(ctx => ctx.db.patch(policyId, { enabled: false }))
  await expect(t.mutation(internal.monitoring.ledger.pipelineBudget, { runId: pipelineRunId })).rejects.toThrow('monitoring_stopped')
})

test('owner document retry preserves accepted inventory progress', async () => {
  const f = await monitoringFixture()
  const target = await queuedTarget(f, 'retry-inventory', false)
  await f.t.run(ctx => ctx.db.patch(target.documentId, { completedChunks: 1, chunkCount: 2, nextCheckAt: Date.now() + DAY, errorClass: 'source_check_incomplete' }))
  await expect(f.t.mutation(api.monitoring.ledger.retryDocument, { documentId: target.documentId })).rejects.toThrow()
  vi.stubEnv('ADMIN_EMAIL', 'owner@example.test')
  await f.t.withIdentity({ subject: f.userId }).mutation(api.monitoring.ledger.retryDocument, { documentId: target.documentId })
  const document = await f.t.run(ctx => ctx.db.get(target.documentId))
  expect(document).toMatchObject({ completedChunks: 1, chunkCount: 2, inventoryComplete: false, errorClass: 'source_check_incomplete' })
  expect(document!.nextCheckAt).toBeLessThanOrEqual(Date.now())
  expect((await f.t.run(ctx => ctx.db.get(target.targetId)))?.state).toBe('pending')
  await f.t.mutation(internal.monitoring.ledger.saveInventory, { runId: f.runId, documentId: target.documentId, chunk: 1, chunks: 2, inventory: { ...inventory, targets: [] } })
  expect((await f.t.run(ctx => ctx.db.get(target.documentId)))?.errorClass).toBeUndefined()
  await f.t.run(ctx => ctx.db.patch(f.policyId, { enabled: false }))
  await expect(f.t.withIdentity({ subject: f.userId }).mutation(api.monitoring.ledger.retryDocument, { documentId: target.documentId })).rejects.toThrow('monitoring_stopped')
})

test('PDF parser repair requires the owner and idle work while preserving the old snapshot', async () => {
  const f = await monitoringFixture()
  workflowTest.register(f.t)
  const target = await queuedTarget(f, 'parser-repair', false)
  const args = { documentId: target.documentId, pdfParserMode: 'fast' as const }
  await expect(f.t.mutation(api.monitoring.ledger.retryDocument, args)).rejects.toThrow()
  vi.stubEnv('ADMIN_EMAIL', 'owner@example.test')
  const owner = f.t.withIdentity({ subject: f.userId })
  await expect(owner.mutation(api.monitoring.ledger.retryDocument, args)).rejects.toThrow('current source check')
  await f.t.run(ctx => ctx.db.patch(f.runId, { state: 'completed' }))
  await f.t.run(ctx => ctx.db.patch(target.targetId, { state: 'running' }))
  await expect(owner.mutation(api.monitoring.ledger.retryDocument, args)).rejects.toThrow('document decisions')
  await f.t.run(ctx => ctx.db.patch(target.targetId, { state: 'pending' }))
  const before = await f.t.run(ctx => ctx.db.get(target.documentId))
  await owner.mutation(api.monitoring.ledger.retryDocument, args)
  const after = await f.t.run(ctx => ctx.db.get(target.documentId))
  expect(after).toMatchObject({ snapshotId: before!.snapshotId, completedChunks: 1, inventoryComplete: false, pdfParserMode: 'fast', refreshSnapshot: true })
  expect(await f.t.run(ctx => ctx.db.get(target.targetId))).toMatchObject({ state: 'pending', snapshotId: before!.snapshotId })
})

test('source requests reserve bounded paced slots without spending daily admissions', async () => {
  const { t, runId, policyId } = await monitoringFixture()
  rateLimiterTest.register(t)
  vi.useFakeTimers()
  expect(await t.mutation(internal.monitoring.ledger.reserveRetrievalSlot, { runId })).toBe(0)
  expect(await t.mutation(internal.monitoring.ledger.reserveRetrievalSlot, { runId })).toBe(15_000)
  expect(await t.mutation(internal.monitoring.ledger.reserveRetrievalSlot, { runId })).toBe(30_000)
  expect(await t.mutation(internal.monitoring.ledger.reserveRetrievalSlot, { runId })).toBe(45_000)
  await expect(t.mutation(internal.monitoring.ledger.reserveRetrievalSlot, { runId })).rejects.toThrow('monitoring_provider_rate_limit')
  expect(await t.mutation(internal.monitoring.ledger.reserve, { runId, units: 10 })).toBe(true)
  await t.run(ctx => ctx.db.patch(policyId, { enabled: false }))
  await expect(t.mutation(internal.monitoring.ledger.reserveRetrievalSlot, { runId })).rejects.toThrow('monitoring_stopped')
})

test.each([['monitoring_provider_rate_limit', 60_000], ['monitoring_ai_gateway_unavailable', 900_000]] as const)('%s schedules a bounded continuation without degrading the source', async (errorClass, delay) => {
  const { t, runId, policyId, registryId } = await monitoringFixture()
  await t.mutation(internal.monitoring.ledger.finish, { runId, state: 'incomplete', documentsChecked: 0, targetsStarted: 0, errorClass })
  const policy = await t.run(ctx => ctx.db.get(policyId))
  expect(policy?.failures).toBe(0)
  expect(policy!.nextCheckAt - Date.now()).toBeGreaterThan(delay - 1_000)
  expect(policy!.nextCheckAt - Date.now()).toBeLessThanOrEqual(delay)
  expect((await t.run(ctx => ctx.db.get(registryId)))?.status).toBe('supported')
  expect(await t.run(ctx => ctx.db.query('coverageIncidents').collect())).toEqual([])
  await t.run(ctx => ctx.db.patch(policyId, { enabled: false, generation: 2 }))
  await t.mutation(internal.monitoring.ledger.wake, { policyId, generation: 1 })
  expect(await t.run(ctx => ctx.db.query('sourceMonitoringRuns').collect())).toHaveLength(1)
})


test('official Baton Rouge meeting dates exclude only meetings before the approved day', () => {
  const startsAt = Date.parse('2026-08-07T18:30:00Z')
  expect(officialMeetingDate('https://www.brla.gov/AgendaCenter/ViewFile/ArchivedAgenda/_01262026-3182')).toBe('2026-01-26')
  expect(isBeforeSourceWindow('https://www.brla.gov/AgendaCenter/ViewFile/Agenda/_08062026-2400', startsAt)).toBe(true)
  expect(isBeforeSourceWindow('https://www.brla.gov/AgendaCenter/ViewFile/Minutes/_08072026-2400', startsAt)).toBe(false)
  expect(isBeforeSourceWindow('https://www.brla.gov/AgendaCenter/ViewFile/ArchivedAgenda/_09092026-3415', startsAt)).toBe(false)
  for (const url of [
    'https://www.brla.gov/AgendaCenter/ViewFile/Agenda/_02302026-2400',
    'https://unapproved.example/AgendaCenter/ViewFile/Agenda/_01262026-2400',
    'https://www.brla.gov/Documents/_01262026-2400',
    'https://www.brla.gov/uploads/2026/01/current-agenda.pdf',
  ]) expect(officialMeetingDate(url)).toBeUndefined()
})

test('classifying existing meeting dates preserves inventory history and follows changed source windows', async () => {
  const f = await monitoringFixture()
  vi.stubEnv('ADMIN_EMAIL', 'owner@example.test')
  const ids = await f.t.run(async ctx => {
    await ctx.db.patch(f.policyId, { startsAt: Date.parse('2026-08-07'), documentsPerRun: 3 })
    const fields = { policyId: f.policyId, registryId: f.registryId, nextCheckAt: 0, firstSeenAt: 1, notificationEligible: false, inventoryComplete: false, errorClass: 'source_check_incomplete' }
    const old = await ctx.db.insert('monitoredDocuments', { ...fields, canonicalUrl: 'https://www.brla.gov/AgendaCenter/ViewFile/Agenda/_01262026-3182', completedChunks: 1, chunkCount: 2 })
    const current = await ctx.db.insert('monitoredDocuments', { ...fields, canonicalUrl: 'https://www.brla.gov/AgendaCenter/ViewFile/Minutes/_08122026-2419' })
    const opaque = await ctx.db.insert('monitoredDocuments', { ...fields, canonicalUrl: 'https://www.lafayettela.gov/current-agenda.pdf' })
    return { old, current, opaque }
  })
  const args = { policyId: f.policyId, paginationOpts: { numItems: 50, cursor: null } }
  await expect(f.t.mutation(api.monitoring.ledger.classifyOfficialMeetingDates, args)).rejects.toThrow()
  expect(await f.t.withIdentity({ subject: f.userId }).mutation(api.monitoring.ledger.classifyOfficialMeetingDates, args)).toMatchObject({ classified: 2, isDone: true })
  expect(await f.t.run(ctx => ctx.db.get(ids.old))).toMatchObject({ sourceMeetingDate: '2026-01-26', inventoryComplete: false, completedChunks: 1, chunkCount: 2, errorClass: 'source_check_incomplete' })
  expect((await f.t.query(internal.monitoring.ledger.dueDocuments, { runId: f.runId })).map(d => d._id)).toEqual([ids.current, ids.opaque])
  await f.t.run(ctx => ctx.db.patch(f.policyId, { startsAt: Date.parse('2026-01-01') }))
  expect((await f.t.query(internal.monitoring.ledger.dueDocuments, { runId: f.runId })).map(d => d._id)).toEqual([ids.old, ids.current, ids.opaque])
})

test.each(['policy', 'registry'] as const)('monitoring dispatch replaces extraction with stale %s authority', async changed => {
  const f = await monitoringFixture()
  workflowTest.register(f.t)
  rateLimiterTest.register(f.t)
  const target = await queuedTarget(f, `stale-${changed}`)
  await f.t.run(async ctx => {
    if (changed === 'policy') {
      await ctx.db.patch(f.policyId, { generation: 2 })
      await ctx.db.patch(f.runId, { generation: 2 })
    } else {
      await ctx.db.patch(f.registryId, { statusGeneration: 2 })
      await ctx.db.patch(f.runId, { registryGeneration: 2 })
    }
  })
  await f.t.mutation(internal.monitoring.ledger.dispatchTargets, { runId: f.runId })
  const updated = await f.t.run(ctx => ctx.db.get(target.targetId))
  expect(updated?.pipelineRunId).not.toBe(target.pipelineRunId)
  const run = await f.t.run(ctx => ctx.db.get(updated!.pipelineRunId!))
  expect(run).toMatchObject({ monitorPolicyId: f.policyId, monitorGeneration: changed === 'policy' ? 2 : 1, monitorRegistryGeneration: changed === 'registry' ? 2 : 1 })
  expect((await f.t.run(ctx => ctx.db.get(target.pipelineRunId)))?.state).toBe('queued')
})

test('owner can expedite a failed attempt without resetting attempts or bypassing evidence gates', async () => {
  const f = await monitoringFixture()
  vi.stubEnv('ADMIN_EMAIL', 'owner@example.test')
  const target = await queuedTarget(f, 'expedite')
  const args = { targetId: target.targetId, expediteFailedAttempt: true }
  await f.t.run(async ctx => {
    await ctx.db.patch(target.targetId, { pipelineRunId: target.pipelineRunId, attempts: 2, retryAt: Date.now() + DAY })
    await ctx.db.patch(target.pipelineRunId, { state: 'failed_terminal' })
  })
  await expect(f.t.mutation(api.monitoring.ledger.retryTarget, args)).rejects.toThrow()
  const owner = f.t.withIdentity({ subject: f.userId })
  expect(await owner.mutation(api.monitoring.ledger.retryTarget, { targetId: target.targetId })).toBe(false)
  expect(await owner.mutation(api.monitoring.ledger.retryTarget, args)).toBe(true)
  const updated = await f.t.run(ctx => ctx.db.get(target.targetId))
  expect(updated).toMatchObject({ state: 'pending', attempts: 2, pipelineRunId: target.pipelineRunId })
  expect(updated?.retryAt).toBeUndefined()
  await f.t.run(ctx => ctx.db.patch(target.pipelineRunId, { state: 'running' }))
  expect(await owner.mutation(api.monitoring.ledger.retryTarget, args)).toBe(false)
  await f.t.run(ctx => ctx.db.patch(target.pipelineRunId, { state: 'failed_terminal' }))
  await f.t.run(ctx => ctx.db.patch(target.documentId, { inventoryComplete: false }))
  expect(await owner.mutation(api.monitoring.ledger.retryTarget, args)).toBe(false)
  await f.t.run(ctx => ctx.db.patch(target.documentId, { inventoryComplete: true }))
  await f.t.run(ctx => ctx.db.patch(f.policyId, { enabled: false }))
  expect(await owner.mutation(api.monitoring.ledger.retryTarget, args)).toBe(false)
})


test('inventory scope rejects background targets without hiding incomplete meeting evidence', () => {
  const allowed = ['agenda', 'minutes']
  expect(inventoryContract({ ...inventory, sourceKind: 'planning_case' }, text, 'Test Council', [], allowed)).toMatch(/outside the approved/)
  expect(inventoryContract({ ...inventory, sourceKind: 'planning_case', targets: [], meetingDate: null, dateExcerpt: null }, text, 'Test Council', [], allowed)).toBeNull()
  expect(inventoryContract({ ...inventory, complete: false, targets: [] }, text, 'Test Council', [], allowed)).toMatch(/incomplete/)
  expect(inventoryContract(inventory, text, 'Test Council', [], allowed)).toBeNull()
})

test('inventory context exposes the current approved source kinds', async () => {
  const f = await monitoringFixture()
  const target = await queuedTarget(f, 'approved-scope')
  const context = await f.t.query(internal.monitoring.ledger.documentContext, { runId: f.runId, documentId: target.documentId })
  expect(context.allowedSourceKinds).toEqual(['agenda'])
})


test('a gateway pause retains inventory progress and makes the snapshot due at its retry', async () => {
  const f = await monitoringFixture()
  const target = await queuedTarget(f, 'gateway-paused-inventory', false)
  await f.t.run(ctx => ctx.db.patch(target.documentId, { completedChunks: 1, chunkCount: 2, nextCheckAt: Date.now() + DAY }))
  const before = await f.t.run(ctx => ctx.db.get(target.documentId))
  await f.t.mutation(internal.monitoring.ledger.deferDocument, { runId: f.runId, documentId: target.documentId, reason: 'monitoring_ai_gateway_unavailable' })
  const document = await f.t.run(ctx => ctx.db.get(target.documentId))
  expect(document).toMatchObject({ snapshotId: before!.snapshotId, completedChunks: 1, chunkCount: 2, inventoryComplete: false, errorClass: 'monitoring_ai_gateway_unavailable' })
  expect(document!.nextCheckAt - Date.now()).toBeGreaterThan(899_000)
  expect(document!.nextCheckAt - Date.now()).toBeLessThanOrEqual(900_000)
  expect((await f.t.run(ctx => ctx.db.get(target.targetId)))?.state).toBe('pending')
  await f.t.mutation(internal.monitoring.ledger.deferDocument, { runId: f.runId, documentId: target.documentId })
  expect((await f.t.run(ctx => ctx.db.get(target.documentId)))!.nextCheckAt - Date.now()).toBeGreaterThan(DAY - 1_000)
})


test('inventory normalizes a printed date without accepting missing dates or altered evidence', () => {
  expect(inventoryContract(inventory, text, 'Test Council')).toBeNull()
  for (const meetingDate of [null, 'September 4, 2026', '2026-09-04T00:00:00Z', '2026-02-30']) {
    expect(inventoryContract({ ...inventory, meetingDate }, text, 'Test Council')).toMatch(/YYYY-MM-DD/)
  }
  expect(inventoryContract({ ...inventory, dateExcerpt: '2026-09-04' }, text, 'Test Council')).toMatch(/date citation/)
})


test('approved-source discovery recognizes DOCX agendas without broadening to executable or legacy Word files', () => {
  expect(isDocumentUrl('https://www.lafayettela.gov/media/agenda.docx')).toBe(true)
  expect(isDocumentUrl('https://www.lafayettela.gov/media/agenda.docx?download=1')).toBe(true)
  expect(isDocumentUrl('https://www.lafayettela.gov/media/agenda.doc')).toBe(false)
  expect(isDocumentUrl('https://www.lafayettela.gov/media/agenda.docx.exe')).toBe(false)
})

test.each([false, true])('target reconciliation retries a Gateway outage without relaxing evidence failures: mixed=%s', async mixed => {
  const f = await monitoringFixture()
  const target = await queuedTarget(f, 'provider-paused-target')
  await f.t.run(async ctx => {
    await ctx.db.patch(target.targetId, { state: 'running', attempts: 3, pipelineRunId: target.pipelineRunId })
    await ctx.db.patch(target.pipelineRunId, { state: 'failed_terminal' })
    const stages = await ctx.db.query('pipelineStages').withIndex('by_run_and_stage', q => q.eq('runId', target.pipelineRunId)).collect()
    for (const stage of stages) await ctx.db.patch(stage._id, { state: 'failed_terminal', errorClass: mixed && stage.stage === 'validate' ? 'validation_failed' : 'extraction_step_failed', errorDetail: mixed && stage.stage === 'validate' ? 'citation_not_found' : 'Uncaught Error: model_transient:ai_gateway_unavailable:The model provider is temporarily unavailable' })
  })
  await f.t.mutation(internal.monitoring.ledger.reconcileTargets, { policyId: f.policyId })
  const result = await f.t.run(ctx => ctx.db.get(target.targetId))
  expect(result).toMatchObject({ state: mixed ? 'failed' : 'pending', attempts: mixed ? 3 : 2, pipelineRunId: target.pipelineRunId })
  expect(result!.retryAt! - Date.now()).toBeGreaterThan((mixed ? DAY : 900_000) - 1_000)
  expect(result!.retryAt! - Date.now()).toBeLessThanOrEqual(mixed ? DAY : 900_000)
  await f.t.mutation(internal.monitoring.ledger.reconcileTargets, { policyId: f.policyId })
  expect((await f.t.run(ctx => ctx.db.get(target.targetId)))?.attempts).toBe(mixed ? 3 : 2)
})

test('accepts a unique locator without copying an identifier outside that locator', () => {
  const source = 'Test Council. September 4, 2026. Resolution 2026-14. Authorize repairs to the library roof.'
  const target = { printedId: null, title: 'Library roof repairs', excerpt: 'Authorize repairs to the library roof.' }
  const value = { ...inventory, targets: [target] }
  expect(inventoryContract(value, source, 'Test Council')).toBeNull()
  expect(inventoryIdentity('2026-09-04', target).sourcePrinted).toBe(false)
  expect(inventoryContract({ ...value, targets: [{ ...target, printedId: '2026-14' }] }, source, 'Test Council')).toMatch(/complete printed identifier/)
  expect(inventoryContract({ ...value, targets: [target, target] }, source, 'Test Council')).toMatch(/duplicate/)
})

test('an exhausted source allowance blocks retrieval admissions and new monitoring runs', async () => {
  const f = await monitoringFixture()
  rateLimiterTest.register(f.t)
  await f.t.run(async ctx => { const allowance = await ctx.db.query('aiSpendingAllowances').first(); await ctx.db.delete(allowance!._id) })
  vi.stubEnv('ADMIN_EMAIL', 'owner@example.test')
  expect(await f.t.mutation(internal.monitoring.ledger.reserve, { runId: f.runId, units: 1 })).toBe(false)
  const owner = f.t.withIdentity({ subject: f.userId })
  expect(await owner.mutation(api.monitoring.ledger.checkNow, { policyId: f.policyId })).toBeNull()
  await owner.mutation(api.ai.spendingLedger.configure, { scope: 'sources', allowanceUsd: 0.1, expiresAt: Date.now() + DAY, enabled: true })
  expect(await f.t.mutation(internal.monitoring.ledger.reserve, { runId: f.runId, units: 1 })).toBe(true)
  await f.t.mutation(internal.ai.spendingLedger.reserve, { scope: 'sources', micros: 100_000 })
  expect(await f.t.mutation(internal.monitoring.ledger.reserve, { runId: f.runId, units: 1 })).toBe(false)
})

test.each([undefined, 'false'])('a %s spending guard blocks monitoring even with funded allowance', async guard => {
  const f = await monitoringFixture()
  vi.stubEnv('AI_SPENDING_GUARD_ENABLED', guard)
  vi.stubEnv('ADMIN_EMAIL', 'owner@example.test')
  expect(await f.t.mutation(internal.monitoring.ledger.reserve, { runId: f.runId, units: 1 })).toBe(false)
  await expect(f.t.mutation(internal.monitoring.ledger.reserveRetrievalSlot, { runId: f.runId })).rejects.toThrow('monitoring_daily_limit')
  await f.t.run(ctx => ctx.db.patch(f.policyId, { activeRunId: undefined }))
  expect(await f.t.withIdentity({ subject: f.userId }).mutation(api.monitoring.ledger.checkNow, { policyId: f.policyId })).toBeNull()
  expect(await f.t.run(ctx => ctx.db.query('sourceMonitoringRuns').collect())).toHaveLength(1)
})
