# PR review

Reviews run through the shared workflow in
[LaykenV/pr-review](https://github.com/LaykenV/pr-review). This repo's
[caller](.github/workflows/pr-review.yml) runs the default reviewers, currently
DeepSeek V4.1 Flash and GLM 5.3 Flash through OpenRouter. Change models in
pr-review, not here.

Each reviewer posts and updates its own comment on every push. `/review` in a
comment reruns them. `/describe` and `/ask <question>` run only when someone
asks, so nothing rewrites the PR body on its own.

Reviewers get the `## Review guidelines` section of AGENTS.md. Edit the rules
there.

PR diffs go through OpenRouter to the model providers. The workflow needs the
`OPENROUTER_API_KEY` Actions secret. It runs `the-pr-agent/pr-agent@v0.43.0`,
whose container tag is mutable, so recheck output when upstream changes.
