# Public Parish

A free, open-source, nonpartisan civic app for Louisiana. Residents find
local-government decisions that matter, read the official evidence, ask
questions grounded in it, follow an issue, and see what happened.

It launched September 18, 2026. `docs/work.md` is the only status and work
queue. Read it first. Read `PLAN.md` and the matching doc before changing
product behavior: `architecture.md`, `sources.md`, `design.md`,
`operations.md`, `launch-upgrade.md`, `marketing.md`, or `submission.md` in
`docs/`. `docs/archive/` and dated reports are history, not instructions.

## Evidence and neutrality

- Every published factual claim resolves to an immutable source snapshot and
  a precise citation. Missing evidence means a limited card or nothing, never
  a guess.
- Keep atomic government decisions and source snapshots. Issue timelines are a
  view over them.
- Don't take sides. Explain consequence, process, evidence, deadlines, and
  what residents can do. Ballot measures quote the official wording and the
  Act and never recommend a vote.
- Chat answers only from published, validated evidence.
- Don't claim a feature, model, deployment, or user result until the repo or
  runtime proves it. Don't infer a government outcome from my launch sign-off.
- The public app works without an invitation.
- Never put secrets, private messages, user records, home addresses, or raw
  app data in public docs or logs.

## Coverage

Supported places are defined in `docs/sources.md`. A body or parish is
supported only after it passes the same ten coverage gates. Public labels use
a display field because `governmentBodies.name` is an identity value.
Owner-curated stories go through the same evidence pipeline and never make an
unsupported body or parish look supported.

The homepage has three stories: Meta in Richland Parish as the lead, SpaceX
in Vermilion Parish, and the Boyce data center. Don't add or swap one without
me. Home behavior is specified in `docs/launch-upgrade.md`.

Out of scope until the core resident loop is reliable and used: maps, public
discussion, testimony generation, records-request automation, procurement,
video transcription, a staff portal, candidates, campaign finance, polls,
spending dashboards, FAQ aggregation, a public corrections workflow,
public-triggered or live coverage compiling, and cross-device chat history.
Keep the simple source-problem report, the coverage-request form, and the
owner-run coverage compiler. Weekly roundup emails and per-issue share HTML
are still in scope.

## Stack

- TanStack Start in SPA/static-prerender mode. Convex for backend, realtime,
  and static hosting at `convex.site`.
- Thin route files. Route data contracts go in `.data.ts` modules. Convex
  functions are organized by domain.
- External side effects run in Convex actions. Keep HTTP routing small.
- Firecrawl does discovery, retrieval, rendering, PDF/OCR, and change
  detection. Write a source-specific adapter only after a repeated, documented
  failure.
- OpenAI calls go through Convex AI Gateway from actions, behind the provider
  interface that also allows direct OpenAI as a fallback. Refer to models by
  role. The only role-to-model table is in `docs/architecture.md`. The
  reviewer never runs on the extraction model. Code computes importance
  scores, not a model. Send strict JSON Schema in
  `response_format`, then run deterministic validation.
- Google sign-in uses the pinned Convex Auth v2 alpha. No Auth v1 or custom
  email auth. Accounts are optional for reading and chat. AgentMail verifies
  email-only alert subscriptions without an account.

## Spending and time

Targeted spending is allowed under `docs/operations.md`. Keep task limits and
stop rules. Don't restart broad backfills or change production settings
because a doc says to.

Protect my weekday 90-minute Varholdt sales block. This project doesn't
replace it.

Keep `hackathon.md` current and evidence-based. Run the local
`convex-hackathon-skill` after meaningful sessions. Before submitting, test
the public URL, source links, live updates, the email path, and the demo.
Don't restart finished launch work because a dated report lists it.

## Validation

`npm run verify` runs the full suite locally. CI runs it again on the PR.
Report what ran and what's still pending.

## Pull requests

- Commit, push, deploy, publish, or submit only when I ask.
- One concern per PR. Real PRs, never drafts. Title is a conventional prefix
  plus the user-facing why. Body is the problem, then the fix.
- Two PR-Agent reviewers run on every push through the shared
  `LaykenV/pr-review` workflow. Small PRs take two or three minutes. Large ones
  take six to nine. `/describe` runs only when someone comments it. See
  `pr-agent.md`.
- Review feedback never grows a PR past its goal. Check every bot finding
  against the code. Dismiss false positives with a reason and resolve them.
- Merging to `main` deploys the production backend and frontend. Say so when
  asking to merge. After a merge, watch that exact production workflow run,
  then run `npm run smoke:production`.
- Never deploy production from a dirty tree. Publishing story data still
  needs a reviewed, committed change.

## Review guidelines

Every reviewer reads this section: PR-Agent, Codex, sol-loop, and council.

- Flag any published factual claim that doesn't resolve to a source snapshot
  and a precise citation.
- Flag copy that takes a side on a decision or recommends a vote.
- Flag secrets, private messages, user records, home addresses, or raw app
  data reaching logs, public docs, or the client.
- Flag Convex functions without argument and return validators, external side
  effects outside actions, and unauthenticated mutations that can spend money.
- Flag model calls that skip the provider interface, and a reviewer that runs
  on the extraction model.
- Style, extra tests, rare edge cases, and small perf costs are nits. Don't
  suggest growing the PR past its goal.

<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read
`convex/_generated/ai/guidelines.md` first** for important guidelines on
how to correctly use Convex APIs and patterns. The file contains rules that
override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running
`npx convex ai-files install`.

<!-- convex-ai-end -->
