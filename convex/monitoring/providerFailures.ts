import { GatewayUnavailableError } from '../ai/types'

// Classify the typed provider error before workflow serialization removes its type.
export function rethrowMonitoringProviderError(error: unknown): never {
  if (error instanceof GatewayUnavailableError && error.errorClass === 'ai_gateway_unavailable') throw new Error('monitoring_ai_gateway_unavailable')
  throw error
}


export function isGatewayOnlyFailure(stages: Array<{ errorClass?: string; errorDetail?: string }>): boolean {
  const failures = stages.filter(stage => stage.errorClass || stage.errorDetail)
  return failures.length > 0 && failures.every(stage => {
    const detail = stage.errorDetail ?? ''
    return detail.startsWith('model_transient:ai_gateway_unavailable:') || detail.startsWith('Uncaught Error: model_transient:ai_gateway_unavailable:')
  })
}
