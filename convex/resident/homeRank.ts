// Use the same ordering as the consequence indexes before and after hydration.
// Dates never add points to the accepted consequence score.
export type HomeIssueOrder = {
  slug: string
  importanceScore: number
  acceptedAt: number
}

export type HomeIssueSignals = HomeIssueOrder & {
  nextAt: string | null
  hasSupportedFactor: boolean
}

export function homeEligible(signals: HomeIssueSignals): boolean {
  return signals.hasSupportedFactor || signals.nextAt !== null
}

export function compareHomeIssues(left: HomeIssueOrder, right: HomeIssueOrder): number {
  return right.importanceScore - left.importanceScore ||
    right.acceptedAt - left.acceptedAt ||
    // The descending index uses the same code-point order for unique slugs.
    (left.slug === right.slug ? 0 : left.slug < right.slug ? 1 : -1)
}

export function rankHomeIssues<T extends HomeIssueSignals>(issues: T[]): T[] {
  return issues.filter(homeEligible).sort(compareHomeIssues)
}
