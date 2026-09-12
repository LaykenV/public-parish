export type Allowance = {
  scope: 'sources' | 'ask'
  allowanceUsd: number
  chargedUsd: number
  enabled: boolean
  expiresAt: number
}

export function allowanceStatus(
  allowance: Allowance | undefined,
  guardEnabled: boolean,
  now: number,
): string {
  if (!guardEnabled) return 'Blocked. Spending guard is disabled.'
  if (!allowance) return 'Blocked. No allowance configured.'
  if (!allowance.enabled) return 'Blocked. Allowance is disabled.'
  if (allowance.expiresAt <= now) return 'Blocked. Allowance has expired.'
  if (allowance.chargedUsd >= allowance.allowanceUsd)
    return 'Blocked. Allowance is exhausted.'
  return 'Funded. Each request still needs enough remaining allowance.'
}
