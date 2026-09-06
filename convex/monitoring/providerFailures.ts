import { GatewayUnavailableError } from '../ai/types'

// Classify the typed provider error before workflow serialization removes its type.
export function rethrowMonitoringProviderError(error: unknown): never {
  if (error instanceof GatewayUnavailableError) throw new Error('monitoring_ai_gateway_unavailable')
  throw error
}
