import { execFileSync } from 'node:child_process'

if (!process.env.CONVEX_DEPLOY_KEY) {
  throw new Error('Home ranking repair requires the release deployment key')
}

// The release workflow supplies the same deployment key used for deployment.
// Each transaction handles at most 100 issues; an unexpected corpus size stops
// the release instead of leaving an unbounded repair running in the background.
for (let batch = 0; batch < 100; batch += 1) {
  const result = JSON.parse(execFileSync('npx', [
    'convex', 'run', 'resident/evidence:backfillImportanceScores', '{}',
  ], { encoding: 'utf8', timeout: 120_000 }))
  if (typeof result.updated !== 'number' || typeof result.done !== 'boolean') {
    throw new Error('Unexpected Home ranking repair receipt')
  }
  console.log(`Home ranking batch ${batch + 1}: ${result.updated} scores copied`)
  if (result.done) process.exit(0)
}
throw new Error('Home ranking repair exceeded 100 batches')
