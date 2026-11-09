import { v } from 'convex/values'

import { env } from '../_generated/server'

export const modelRoles = v.union(
  v.literal('MODEL_STRONG'),
  v.literal('MODEL_FAST'),
)

export type ModelRole = typeof modelRoles.type

export const aiRoutes = v.union(
  v.literal('ai_gateway'),
  v.literal('direct_openai'),
)

export type AiRoute = typeof aiRoutes.type

export type ChatMessage = {
  role: 'system' | 'user'
  content: string | Array<{ type: 'text'; text: string } | { type: 'image_url'; image_url: { url: string; detail: 'high' } }>
}

export type StructuredRequest = {
  role: ModelRole
  messages: ChatMessage[]
  schemaName: string
  jsonSchema: Record<string, unknown>
  reasoningEffort: 'high' | 'low'
  maxCompletionTokens?: number
}

export type ModelUsage = {
  promptTokens: number | null
  completionTokens: number | null
  totalTokens: number | null
  cachedTokens: number | null
  reasoningTokens: number | null
}

export type StructuredSuccess = {
  kind: 'success'
  route: AiRoute
  modelId: string
  requestId: string | null
  finishReason: string | null
  content: string
  parsed: unknown
  usage: ModelUsage
  latencyMs: number
}

export type StructuredFailure = {
  kind:
    | 'refusal'
    | 'response_truncated'
    | 'content_filtered'
    | 'missing_content'
    | 'malformed_json'
    | 'schema_invalid'
  route: AiRoute
  modelId: string | null
  requestId: string | null
  finishReason: string | null
  content: string | null
  detail: string
  usage: ModelUsage | null
  latencyMs: number
}

export type StructuredOutcome =
  | { outcome: 'success'; result: StructuredSuccess; attempts: AttemptRecord[] }
  | { outcome: 'failed'; failure: StructuredFailure; attempts: AttemptRecord[] }

export type AttemptRecord = {
  route: AiRoute
  modelId: string
  status: string
  httpStatus: number | null
  latencyMs: number
  requestId: string | null
  usage: ModelUsage | null
  retryAfterMs: number | null
  errorClass: string | null
  errorDetail: string | null
}

export class TransientModelError extends Error {
  readonly errorClass: string
  readonly httpStatus: number | null
  readonly retryAfterMs: number | null

  constructor(
    errorClass: string,
    message: string,
    httpStatus: number | null,
    retryAfterMs: number | null,
  ) {
    super(message)
    this.name = 'TransientModelError'
    this.errorClass = errorClass
    this.httpStatus = httpStatus
    this.retryAfterMs = retryAfterMs
  }
}

export class PermanentModelError extends Error {
  readonly errorClass: string
  readonly httpStatus: number | null

  constructor(
    errorClass: string,
    message: string,
    httpStatus: number | null = null,
  ) {
    super(message)
    this.name = 'PermanentModelError'
    this.errorClass = errorClass
    this.httpStatus = httpStatus
  }
}

export class GatewayUnavailableError extends Error {
  readonly errorClass: string
  readonly httpStatus: number | null
  readonly retryAfterMs: number | null

  constructor(
    errorClass: string,
    message: string,
    httpStatus: number | null,
    retryAfterMs: number | null,
  ) {
    super(message)
    this.name = 'GatewayUnavailableError'
    this.errorClass = errorClass
    this.httpStatus = httpStatus
    this.retryAfterMs = retryAfterMs
  }
}

export type ModelRates = { input: number; cachedInput: number; output: number }

// OpenAI prices prompts over this many input tokens at the long rates for
// the whole request.
export const LONG_CONTEXT_THRESHOLD_TOKENS = 272_000

// USD per 1M tokens, from OpenAI's developer pricing page on November 9, 2026.
// Keyed by gateway model ID so the ledger charges the model the env names.
export const MODEL_COST_USD_PER_1M_TOKENS: Record<
  string,
  { standard: ModelRates; longContext: ModelRates }
> = {
  'openai/gpt-5.6-terra': {
    standard: { input: 2.0, cachedInput: 0.2, output: 12.0 },
    longContext: { input: 4.0, cachedInput: 0.4, output: 18.0 },
  },
  'openai/gpt-5.6-luna': {
    standard: { input: 0.2, cachedInput: 0.02, output: 1.2 },
    longContext: { input: 0.4, cachedInput: 0.04, output: 1.8 },
  },
  'openai/gpt-6.1-terra': {
    standard: { input: 1.0, cachedInput: 0.05, output: 5.0 },
    longContext: { input: 2.0, cachedInput: 0.1, output: 7.5 },
  },
  'openai/gpt-6-luna': {
    standard: { input: 0.1, cachedInput: 0.01, output: 0.5 },
    longContext: { input: 0.2, cachedInput: 0.02, output: 0.75 },
  },
}

const ALL_KNOWN_RATES = Object.values(MODEL_COST_USD_PER_1M_TOKENS).flatMap(
  model => [model.standard, model.longContext],
)

// An ID missing from the table is charged at the highest known rate for every
// token kind, so a new model never spends past an allowance unnoticed.
export const UNKNOWN_MODEL_RATES: ModelRates = {
  input: Math.max(...ALL_KNOWN_RATES.map(rates => rates.input)),
  cachedInput: Math.max(...ALL_KNOWN_RATES.map(rates => rates.cachedInput)),
  output: Math.max(...ALL_KNOWN_RATES.map(rates => rates.output)),
}

export function modelRates(
  modelId: string | undefined,
  promptTokens: number,
): ModelRates {
  const known =
    modelId === undefined ||
    !Object.prototype.hasOwnProperty.call(MODEL_COST_USD_PER_1M_TOKENS, modelId)
      ? undefined
      : MODEL_COST_USD_PER_1M_TOKENS[modelId]
  if (!known) return UNKNOWN_MODEL_RATES
  return promptTokens > LONG_CONTEXT_THRESHOLD_TOKENS
    ? known.longContext
    : known.standard
}

export function configuredModelId(role: ModelRole): string | undefined {
  return role === 'MODEL_STRONG' ? env.MODEL_STRONG_ID : env.MODEL_FAST_ID
}

// Prices the model the env currently configures for the role. Reservations,
// settlement and run ledgers all go through here.
export function estimateCostUsd(
  role: ModelRole,
  usage: ModelUsage,
): number | null {
  if (usage.promptTokens === null && usage.completionTokens === null) {
    return null
  }
  const prompt = usage.promptTokens ?? 0
  const completion = usage.completionTokens ?? 0
  const cached = Math.min(usage.cachedTokens ?? 0, prompt)
  const fresh = prompt - cached
  const rates = modelRates(configuredModelId(role), prompt)
  const cost =
    (fresh / 1_000_000) * rates.input +
    (cached / 1_000_000) * rates.cachedInput +
    (completion / 1_000_000) * rates.output
  return Math.round(cost * 1_000_000) / 1_000_000
}
