import { expect, test } from 'vitest'
import { GatewayUnavailableError, PermanentModelError } from '../ai/types'
import { rethrowMonitoringProviderError } from './providerFailures'

test('only a typed gateway outage becomes a resumable monitoring pause', () => {
  expect(() => rethrowMonitoringProviderError(new GatewayUnavailableError('ai_gateway_unavailable', 'Provider unavailable', 503, null))).toThrow('monitoring_ai_gateway_unavailable')
  for (const error of [new Error('Government source says ai_gateway_unavailable'), new PermanentModelError('invalid_request', 'Invalid schema', 400), new Error('monitoring_inventory_rejected')]) {
    expect(() => rethrowMonitoringProviderError(error)).toThrow(error)
  }
})
