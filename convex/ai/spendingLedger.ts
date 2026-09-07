import { v } from 'convex/values'
import { internalMutation, mutation, query } from '../_generated/server'
import { requireOwner } from '../auth/authorization'
import { spendingScope } from './spending'

const MICROS_PER_DOLLAR = 1_000_000

// This is a prepaid estimated-cost ledger, not the provider's invoice. Missing
// usage keeps the whole reservation charged. Allowances never renew themselves.
export const configure = mutation({
  args: { scope: spendingScope, allowanceUsd: v.number(), expiresAt: v.number(), enabled: v.boolean() },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireOwner(ctx)
    if (!Number.isFinite(args.allowanceUsd) || args.allowanceUsd < 0 || args.allowanceUsd > 100 ||
        !Number.isFinite(args.expiresAt) || args.expiresAt <= Date.now() || args.expiresAt > Date.now() + 31 * 86_400_000) throw new Error('Choose an allowance up to $100 expiring within 31 days.')
    const existing = await ctx.db.query('aiSpendingAllowances').withIndex('by_scope', q => q.eq('scope', args.scope)).unique()
    const fields = { scope: args.scope, allowanceMicros: Math.floor(args.allowanceUsd * MICROS_PER_DOLLAR), expiresAt: args.expiresAt, enabled: args.enabled, updatedAt: Date.now() }
    // Reconfiguration changes the total ceiling. It never erases prior charges.
    if (existing) await ctx.db.patch(existing._id, fields)
    else await ctx.db.insert('aiSpendingAllowances', { ...fields, chargedMicros: 0 })
    return null
  },
})

export const status = query({
  args: {},
  returns: v.array(v.object({ scope: spendingScope, allowanceUsd: v.number(), chargedUsd: v.number(), enabled: v.boolean(), expiresAt: v.number() })),
  handler: async ctx => {
    await requireOwner(ctx)
    const rows = await ctx.db.query('aiSpendingAllowances').take(2)
    return rows.map(row => ({ scope: row.scope, allowanceUsd: row.allowanceMicros / MICROS_PER_DOLLAR, chargedUsd: row.chargedMicros / MICROS_PER_DOLLAR, enabled: row.enabled, expiresAt: row.expiresAt }))
  },
})

export const reserve = internalMutation({
  args: { scope: spendingScope, micros: v.number() },
  returns: v.union(v.id('aiSpendingReservations'), v.null()),
  handler: async (ctx, args) => {
    if (!Number.isSafeInteger(args.micros) || args.micros <= 0) throw new Error('Invalid estimated-cost reservation.')
    const budget = await ctx.db.query('aiSpendingAllowances').withIndex('by_scope', q => q.eq('scope', args.scope)).unique()
    if (!budget?.enabled || budget.expiresAt <= Date.now() || budget.chargedMicros + args.micros > budget.allowanceMicros) return null
    await ctx.db.patch(budget._id, { chargedMicros: budget.chargedMicros + args.micros, updatedAt: Date.now() })
    return await ctx.db.insert('aiSpendingReservations', { allowanceId: budget._id, reservedMicros: args.micros, createdAt: Date.now() })
  },
})

export const settle = internalMutation({
  args: { reservationId: v.id('aiSpendingReservations'), actualMicros: v.union(v.number(), v.null()) },
  returns: v.null(),
  handler: async (ctx, args) => {
    const reservation = await ctx.db.get(args.reservationId)
    if (!reservation || reservation.settledAt !== undefined) return null
    if (args.actualMicros !== null && (!Number.isSafeInteger(args.actualMicros) || args.actualMicros < 0)) throw new Error('Invalid estimated cost.')
    const chargedMicros = args.actualMicros ?? reservation.reservedMicros
    const budget = await ctx.db.get(reservation.allowanceId)
    if (!budget) throw new Error('Spending allowance is missing.')
    await ctx.db.patch(budget._id, { chargedMicros: budget.chargedMicros + chargedMicros - reservation.reservedMicros, updatedAt: Date.now() })
    await ctx.db.patch(reservation._id, { chargedMicros, settledAt: Date.now() })
    return null
  },
})

