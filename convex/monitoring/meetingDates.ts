import { v } from 'convex/values'
import { internal } from '../_generated/api'
import type { QueryCtx } from '../_generated/server'
import { action, internalMutation, internalQuery } from '../_generated/server'
import { requireOwner } from '../auth/authorization'
import { sha256HexOfText } from '../sources/hashing'
import schema from '../schema'

// Link representations by the official meeting ID, never the editable download
// filename. This adapter covers the repeatedly failing Youngsville PDF wrapper.
export function youngsvilleMeetingId(raw: string): string | null {
  let url: URL
  try { url = new URL(raw) } catch { return null }
  if (url.protocol !== 'https:' || url.port || url.username || url.password) return null
  if (url.hostname === 'meetings.municode.com' && url.pathname === '/adaHtmlDocument/index' && url.searchParams.get('cc')?.toUpperCase() === 'YOUNGSVILA') {
    const id = url.searchParams.get('me') ?? ''
    return /^[a-f0-9]{32}$/i.test(id) ? id.toLowerCase() : null
  }
  if (url.hostname === 'meetings.municode.com' && url.pathname === '/d/f') {
    try { url = new URL(url.searchParams.get('u') ?? '') } catch { return null }
  }
  if (url.protocol !== 'https:' || url.hostname !== 'mccmeetings.blob.core.usgovcloudapi.net' || url.port || url.username || url.password) return null
  return /^\/youngsvila-pubu\/MEET-(?:Agenda|Packet|Minutes)-([a-f0-9]{32})\.pdf$/i.exec(url.pathname)?.[1].toLowerCase() ?? null
}

export function youngsvilleHeaderDate(text: string): string | null {
  const header = /^# City Council (?:Regular|Special) Meeting\s*(\d{2})\/(\d{2})\/(20\d{2})\b/m.exec(text.slice(0, 1000))
  if (!header) return null
  const date = `${header[3]}-${header[1]}-${header[2]}`
  const time = Date.parse(date)
  return Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === date ? date : null
}

const documentPair = { documentId: v.id('monitoredDocuments'), evidenceDocumentId: v.id('monitoredDocuments') }
async function loadPair(ctx: Pick<QueryCtx, 'db'>, args: typeof pairArgs.type) {
  const document = await ctx.db.get(args.documentId)
  const evidence = await ctx.db.get(args.evidenceDocumentId)
  const registry = document ? await ctx.db.get(document.registryId) : null
  const body = registry ? await ctx.db.get(registry.governmentBodyId) : null
  const snapshot = evidence?.snapshotId ? await ctx.db.get(evidence.snapshotId) : null
  const meetingId = document ? youngsvilleMeetingId(document.canonicalUrl) : null
  if (!document || !evidence || !registry || body?.slug !== 'youngsville-city-council' ||
      document.policyId !== evidence.policyId || document.registryId !== evidence.registryId ||
      !meetingId || youngsvilleMeetingId(evidence.canonicalUrl) !== meetingId ||
      !snapshot || snapshot.registryId !== registry._id || snapshot.contentHashBasis !== 'raw_artifact_v2' ||
      snapshot.truncation.truncated || !snapshot.normalizedContentHash ||
      youngsvilleMeetingId(snapshot.canonicalUrl) !== meetingId || youngsvilleMeetingId(snapshot.retrievedUrl) !== meetingId ||
      !snapshot.canonicalUrl.includes('/adaHtmlDocument/index?')) throw new Error('A complete stored accessible agenda for the same Youngsville meeting is required.')
  return { document, snapshot }
}
const pairArgs = v.object(documentPair)
export const context = internalQuery({
  args: pairArgs.fields,
  returns: v.object({ document: schema.doc('monitoredDocuments'), snapshot: schema.doc('sourceSnapshots') }),
  handler: async (ctx, args) => { await requireOwner(ctx); return loadPair(ctx, args) },
})

export const save = internalMutation({
  args: { ...documentPair, snapshotId: v.id('sourceSnapshots'), date: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { document, snapshot } = await loadPair(ctx, args)
    if (snapshot._id !== args.snapshotId || !/^\d{4}-\d{2}-\d{2}$/.test(args.date) ||
        (document.sourceMeetingDate && document.sourceMeetingDate !== args.date)) throw new Error('Meeting date evidence changed.')
    await ctx.db.patch(document._id, { sourceMeetingDate: args.date, meetingDateEvidenceSnapshotId: snapshot._id })
    return null
  },
})

export const classifyStoredMeeting = action({
  args: pairArgs.fields,
  returns: v.object({ date: v.string() }),
  handler: async (ctx, args): Promise<{ date: string }> => {
    const { snapshot } = await ctx.runQuery(internal.monitoring.meetingDates.context, args)
    const blob = await ctx.storage.get(snapshot.normalizedStorageId)
    if (!blob) throw new Error('Stored agenda is missing.')
    const text = await blob.text()
    if (new TextEncoder().encode(text).byteLength !== snapshot.normalizedByteLength || await sha256HexOfText(text) !== snapshot.normalizedContentHash) throw new Error('Stored agenda failed its integrity check.')
    const date = youngsvilleHeaderDate(text)
    if (!date) throw new Error('The stored agenda has no unambiguous meeting header date.')
    await ctx.runMutation(internal.monitoring.meetingDates.save, { ...args, snapshotId: snapshot._id, date })
    return { date }
  },
})
