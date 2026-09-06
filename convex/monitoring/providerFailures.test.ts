import { expect, test } from 'vitest'
import { GatewayUnavailableError, PermanentModelError } from '../ai/types'
import { isGatewayOnlyFailure, rethrowMonitoringProviderError } from './providerFailures'

test('only a typed gateway outage becomes a resumable monitoring pause', () => {
  expect(() => rethrowMonitoringProviderError(new GatewayUnavailableError('ai_gateway_unavailable', 'Provider unavailable', 503, null))).toThrow('monitoring_ai_gateway_unavailable')
  for (const error of [new GatewayUnavailableError('ai_gateway_auth', 'Unauthorized', 401, null), new GatewayUnavailableError('ai_gateway_disabled', 'Disabled', 403, null), new Error('Government source says ai_gateway_unavailable'), new PermanentModelError('invalid_request', 'Invalid schema', 400), new Error('monitoring_inventory_rejected')]) {
    expect(() => rethrowMonitoringProviderError(error)).toThrow(error)
  }
})


test('a provider pause cannot hide a citation failure or a message quoted from a source', () => {
  const gateway = { errorClass: 'extraction_step_failed', errorDetail: 'Uncaught Error: model_transient:ai_gateway_unavailable:The model provider is temporarily unavailable' }
  expect(isGatewayOnlyFailure([gateway, gateway])).toBe(true)
  expect(isGatewayOnlyFailure([gateway, { errorClass: 'validation_failed', errorDetail: 'citation_not_found' }])).toBe(false)
  expect(isGatewayOnlyFailure([{ errorDetail: 'Source text: model_transient:ai_gateway_unavailable:example' }])).toBe(false)
  expect(isGatewayOnlyFailure([{ errorDetail: 'model_transient:ai_gateway_auth:Unauthorized' }])).toBe(false)
  expect(isGatewayOnlyFailure([])).toBe(false)
})
