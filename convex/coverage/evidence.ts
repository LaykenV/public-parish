import type { Doc, Id } from '../_generated/dataModel'
import type { MutationCtx } from '../_generated/server'

const MAX_RECENT_EVIDENCE = 200
const MAX_REPRESENTATIVE_SAMPLES = 20

export async function loadCoverageEvidence(
  ctx: Pick<MutationCtx, 'db'>,
  registryId: Id<'sourceRegistries'>,
  samples: Array<Doc<'coverageRepresentativeSamples'>>,
) {
  const [recentRecords, recentRuns] = await Promise.all([
    ctx.db.query('decisionRecords').withIndex('by_registry_and_updated_at', q => q.eq('registryId', registryId)).order('desc').take(MAX_RECENT_EVIDENCE),
    ctx.db.query('pipelineRuns').withIndex('by_registry_and_started_time', q => q.eq('registryId', registryId)).order('desc').take(MAX_RECENT_EVIDENCE),
  ])
  const records = new Map(recentRecords.map(record => [record._id, record]))
  const runs = new Map(recentRuns.map(run => [run._id, run]))
  // Sample receipts must not disappear when routine processing fills the recent window.
  // Their original completion times remain subject to the evaluator's freshness limit.
  for (const sample of samples.slice(0, MAX_REPRESENTATIVE_SAMPLES)) {
    if (sample.state !== 'retrieved' || !sample.pipelineRunId || !sample.snapshotId) continue
    const run = await ctx.db.get(sample.pipelineRunId)
    if (!run || run.registryId !== registryId || run.snapshotId !== sample.snapshotId || run.sourceKind !== sample.sourceKind) continue
    const snapshot = await ctx.db.get(sample.snapshotId)
    if (!snapshot || snapshot.registryId !== registryId || snapshot.truncation.truncated) continue
    runs.set(run._id, run)
    if (!run.targetRecordId) continue
    const matches = await ctx.db.query('decisionRecords').withIndex('by_registry_and_source_record', q => q.eq('registryId', registryId).eq('sourceRecordId', run.targetRecordId!)).take(2)
    if (matches.length === 1) records.set(matches[0]._id, matches[0])
  }
  return { records: [...records.values()], pipelineRuns: [...runs.values()] }
}
