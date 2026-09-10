# PR-Agent setup

Public Parish runs two independent PR-Agent reviews through OpenRouter:
GLM 5.3 Flash and DeepSeek V4.1 Flash. Each model owns one summary comment.
GLM alone writes PR descriptions and answers `/ask` questions.

The workflow uses `the-pr-agent/pr-agent@v0.43.0`. The upstream action's Dockerfile
pulls `pragent/pr-agent:github_action`, a mutable image tag. The action release
reference therefore does not pin the container contents. Recheck output and
configuration compatibility when the upstream image changes.

PR diffs go through OpenRouter to the selected model provider. This is a
self-hosted GitHub Action, with no Qodo account or hosted review app.

## Configuration

[.github/workflows/pr-agent.yml](.github/workflows/pr-agent.yml) defines the two
review jobs as a matrix with `fail-fast: false`. A failure in one model does not
cancel the other. Each job has a 20-minute timeout and a 32,768-token completion
cap, including reasoning tokens. Both use the existing `OPENROUTER_API_KEY`
Actions secret, passed as `OPENROUTER__KEY`. GitHub supplies `GITHUB_TOKEN`.

The workflow explicitly selects each model and repeats that same model in its
fallback list. A failed DeepSeek call cannot turn into a second GLM review.
OpenRouter can still route between providers serving the selected model.
DeepSeek prefers its own provider through OpenRouter. The first live attempt
hit shared-pool rate limits at Novita, Venice, and DeepInfra, so that route
preference avoids starting with those pools. Provider fallback remains enabled.
Fallback providers can charge more than the direct-provider rates below.
DeepSeek uses low reasoning effort. Its first successful inference exhausted
the 32,768-token completion cap on reasoning without returning review text.
The publisher rejected that empty result; the total output cap remains in place.

[.pr_agent.toml](.pr_agent.toml) holds shared review settings and the GLM default
for commands. Workflow environment overrides take precedence over that file.
Both reviewers use a 900,000-token input ceiling and a 1,000,000-token custom
model limit. This leaves response room within DeepSeek's 1,048,576-token context.
PR-Agent can still prune a diff larger than the configured ceiling.

## Events and commands

| Event                                             | Behavior                                                             |
| ------------------------------------------------- | -------------------------------------------------------------------- |
| PR opened, reopened, or marked ready              | Both models review. GLM generates the description in a separate job. |
| Push to an open PR                                | Both models review. No description rewrite.                          |
| Exact comment `/review`                           | Both models review the current head.                                 |
| Exact comment `/describe`                         | GLM updates the description.                                         |
| Comment starting with `/ask `                     | GLM answers the question.                                            |
| Ordinary discussion, bot comments, other commands | No model call.                                                       |

The workflow accepts only the commands listed above. `/review` arguments and
`/review -i` are unsupported. Full reviews keep both models on the same PR head.
New pushes or `/review` requests cancel stale review runs. Ordinary discussion
has a separate concurrency key so it cannot cancel an active review. Description
and question commands do not cancel reviews.

## Separate review comments

PR-Agent's native persistent review lookup matches a shared heading. Two models
using that lookup could overwrite one another. The review jobs therefore set
`config.publish_output = false` and request the action's structured `review`
output. A GitHub Script step publishes each model's result with its own marker:

- `<!-- public-parish-review:glm -->`
- `<!-- public-parish-review:deepseek -->`

The publisher updates only the matching `github-actions[bot]` comment. It
includes the model name, reviewed commit, findings with commit-specific source
links, and the full structured result in a collapsible section. Findings remain
in these summaries. The dual review jobs do not create inline threads or labels.
The old single-review comment, if present, stays as historical output.

Missing output, malformed findings, and oversized comments fail the job. A PR
that closes or changes head during review also fails publication, so old output
cannot be presented as a review of the new commit. An earlier successful summary
keeps its original commit link if a later run fails. Read both check results and
commit links before treating the latest head as reviewed.

The script lives inside the workflow. The publication job does not check out or
execute code from the PR. PR-Agent still loads repository instructions and diffs
through GitHub's API.

## Price reference, September 10, 2026

OpenRouter's live model catalog listed the following dollars per million tokens.
Rates can change, and actual charges depend on routing, cache hits, and reasoning.
GLM's old $0.075 input and $0.25 output launch discount has ended.

| Model                         | Uncached input | Output | Cached input |
| ----------------------------- | -------------: | -----: | -----------: |
| GLM 5.3 Flash                 |          $0.15 |  $0.50 |        $0.03 |
| DeepSeek V4.1 Flash, off-peak |          $0.15 |  $0.60 |       $0.003 |
| DeepSeek V4.1 Flash, peak     |          $0.30 |  $1.20 |       $0.006 |

DeepSeek peak hours are weekdays 01:00 to 04:00 and 06:00 to 10:00 UTC.
At 50,000 uncached input tokens and 5,000 billed output tokens per model, the
pair costs $0.0205 off-peak or $0.031 at peak. Description generation, retries,
and GitHub runner costs are separate.

Sources: [OpenRouter live model catalog](https://openrouter.ai/api/v1/models)
and [DeepSeek pricing](https://api-docs.deepseek.com/quick_start/pricing/).

## Validation and rollout

`scripts/pr-agent.test.mjs` executes the publisher embedded in the workflow with
mock GitHub responses. It covers separate model comments, updates, copied user
markers, stale commits, closed PRs, malformed output, empty reviews, source links,
and comment size limits. Run it with `npx vitest run scripts/pr-agent.test.mjs`.
These checks do not call a model or publish GitHub comments.

The workflow must reach the default branch before the setup is fully active,
including manual comment triggers. After release, verify both model names in the
Action logs, two separate summaries on one head, and in-place updates after a
push. Confirm `/describe` still runs once and `/review` reruns both models.
Local tests do not prove model availability or live billing.

During the first 10 to 20 PRs, compare confirmed bugs unique to each model, false
positives, review time, and actual costs. Verify each finding against source.
The review score is a model opinion, not a merge gate.
