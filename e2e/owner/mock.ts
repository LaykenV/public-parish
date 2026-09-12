import { getFunctionName } from 'convex/server'
import type { FunctionReference } from 'convex/server'
import manifest from '../../docs/story-manifests/import-contract-v1.example.json'

const hash = 'a'.repeat(64)
const imported = {
  _id: 'import-one',
  storyKey: manifest.story.storyKey,
  bundleVersion: 1,
  bundleHash: hash,
  manifestJson: JSON.stringify(manifest),
}
const draft = {
  title: {
    text: 'Illustrative project, never publish',
    evidenceKeys: ['example'],
  },
  summary: {
    text: 'Synthetic evidence for owner screen testing.',
    evidenceKeys: ['example'],
  },
  sections: [],
  timeline: [],
  limitations: ['No actual government decision.'],
  nextAction: null,
}
const build = {
  _id: 'build-one',
  storyId: 'story-one',
  state: 'reviewed',
  inputHash: hash,
  draftHash: hash,
  reviewHash: hash,
  draft,
  spans: [
    {
      key: 'example',
      excerpt: 'Synthetic evidence for layout testing.',
      officialUrl: 'https://example.invalid/source',
      rawHash: hash,
      normalizedHash: hash,
    },
  ],
  review: { verdict: 'pass' },
  expectedGeneration: 1,
  notificationIntent: 'baseline',
}
const run = {
  runId: 'run-one',
  bodyKey: 'example',
  state: 'failed_retryable',
  attempt: 1,
  startedAt: 1_789_200_000_000,
  currentStage: 'verify_root',
}
const empty = () => new URLSearchParams(location.search).has('empty')
export function useGoogleAuth() {
  const state = new URLSearchParams(location.search).get('auth')
  return {
    isAuthenticated: state !== 'signed-out',
    isLoading: false,
    isSigningIn: false,
    error: null,
    signInGoogle: async () => {},
    signOut: async () => {},
  }
}
export function useQuery(ref: FunctionReference<'query'>, args: unknown) {
  if (args === 'skip') return undefined
  const name = getFunctionName(ref)
  if (name === 'ai/spendingLedger:overview')
    return {
      guardEnabled: true,
      allowances: [
        {
          scope: 'sources',
          allowanceUsd: 4,
          chargedUsd: 4.4,
          enabled: true,
          expiresAt: Date.now() + 86_400_000,
        },
        {
          scope: 'ask',
          allowanceUsd: 5,
          chargedUsd: 0.25,
          enabled: true,
          expiresAt: Date.now() + 86_400_000,
        },
      ],
    }
  if (name === 'auth:currentUser')
    return {
      isOwner: new URLSearchParams(location.search).get('auth') !== 'non-owner',
    }
  if (name === 'operations/dashboard:monitoring')
    return {
      enabled: false,
      sources: empty()
        ? []
        : [
            {
              proposalId: 'proposal-one',
              bodyName: 'Example parish council, synthetic source',
              policy: { _id: 'policy-one', enabled: true },
              failedTargetId: 'target-one',
            },
            {
              proposalId: 'proposal-two',
              bodyName: 'Example planning commission, synthetic source',
              policy: null,
            },
          ],
      counters: [
        {
          _id: 'counter-one',
          environment: 'development',
          kind: 'evidence_open',
          count: 12,
        },
      ],
    }
  if (name === 'coverage/operations:availableRoots')
    return [
      {
        bodyKey: 'example',
        bodyName: 'Example parish council',
        jurisdictionName: 'Synthetic parish',
        approvedRootUrl: 'https://example.invalid',
        version: '1',
      },
    ]
  if (name === 'coverage/operations:recentRuns') return empty() ? [] : [run]
  if (name === 'coverage/operations:run')
    return {
      run,
      stages: [
        {
          stageId: 'stage-one',
          stage: 'verify_root',
          attempt: 1,
          gateVersion: '1',
          state: 'failed_retryable',
          resolvedRootUrl:
            'https://example.invalid/very-long-official-source-path-for-overflow-testing',
          errorDetail: 'Synthetic source could not be checked.',
          redirectChain: [],
        },
      ],
      providerCalls: [],
      candidates: [],
      proposals: [],
      findings: [
        {
          findingId: 'finding-one',
          code: 'source_unavailable',
          summary: 'Synthetic finding. Inspect the source before retrying.',
        },
      ],
    }
  if (name === 'stories/imports:preview') return imported
  if (name === 'stories/intake:sources')
    return [
      {
        sourceKey: 'example-announcement',
        bodyName: 'Example agency, fictional fixture',
        url: 'https://example.invalid/source',
        status: 'ready',
        snapshotId: 'snapshot-one',
        rawHash: hash,
        normalizedHash: hash,
      },
    ]
  if (name === 'stories/intake:builds')
    return [
      { id: 'build-one', state: 'reviewed', createdAt: 1_789_200_000_000 },
    ]
  if (name === 'stories/operations:preview')
    return {
      build,
      previous: { payload: { ...draft, limitations: [] } },
      imageUrl: null,
    }
  if (name === 'stories/intake:identity')
    return { state: 'active', generation: 1 }
  return null
}
export function usePaginatedQuery(ref: FunctionReference<'query'>) {
  const name = getFunctionName(ref)
  const rows: Record<string, unknown[]> = {
    'stories/imports:list': [imported],
    'operations/dashboard:providerUsage': [
      {
        id: 'usage-one',
        at: 1_789_200_000_000,
        operation: 'synthetic-provider-operation-with-a-long-name',
        provider: 'Fixture',
        model: 'example-model',
        status: 'succeeded',
        tokens: 200,
        estimatedCostUsd: 0.001,
      },
    ],
    'operations/usage:daily': [
      {
        _id: 'daily-one',
        day: '2026-09-11',
        kind: 'monitoring',
        provider: 'Fixture',
        calls: 1,
        failures: 0,
        reportedTokens: 200,
        estimatedCostUsd: 0.001,
        reportedCredits: 0,
        unknownCostCalls: 0,
        unknownTokenCalls: 0,
        unknownCreditCalls: 1,
        totalLatencyMs: 1000,
      },
    ],
  }
  return {
    results: empty() ? [] : (rows[name] ?? []),
    status: 'Exhausted',
    loadMore: () => {},
  }
}
export function useMutation() {
  return async () => {
    await new Promise((resolve) => setTimeout(resolve, 250))
    throw new Error('Synthetic operation refused. No backend request was sent.')
  }
}
export const useAction = useMutation
