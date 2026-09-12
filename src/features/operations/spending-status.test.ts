import { expect, test } from 'vitest'
import { allowanceStatus } from './spending-status'

const allowance = {
  scope: 'sources' as const,
  allowanceUsd: 4,
  chargedUsd: 1,
  enabled: true,
  expiresAt: 200,
}

test('a funded source becomes blocked when it expires, without another database write', () => {
  expect(allowanceStatus(allowance, true, 199)).toContain('Funded.')
  expect(allowanceStatus(allowance, true, 200)).toContain('expired')
})

test('missing, disabled and overspent allowances never appear funded', () => {
  expect(allowanceStatus(undefined, true, 100)).toContain('No allowance')
  expect(allowanceStatus(allowance, false, 100)).toContain('guard is disabled')
  expect(
    allowanceStatus({ ...allowance, enabled: false }, true, 100),
  ).toContain('Allowance is disabled')
  expect(
    allowanceStatus({ ...allowance, chargedUsd: 4.4 }, true, 100),
  ).toContain('exhausted')
  expect(allowanceStatus({ ...allowance, chargedUsd: 4 }, true, 100)).toContain(
    'exhausted',
  )
})
