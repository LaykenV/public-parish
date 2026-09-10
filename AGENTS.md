# Public Parish Agent Instructions

Read `PLAN.md`, `docs/work.md`, `docs/architecture.md`, `docs/sources.md`,
`docs/design.md`, and `docs/operations.md` before changing product behavior or
scope. Read `docs/marketing.md` for distribution and `docs/submission.md` for
hackathon artifacts. `docs/work.md` is the only active status and pending-work
queue. `docs/archive/` preserves history, not current instructions.

## Product Contract

- Public Parish is a free, open-source, nonpartisan Louisiana civic application.
- It helps residents discover consequential local-government decisions, inspect
  the official evidence, ask source-grounded questions, follow an issue, and
  learn what happened.
- The launch coverage is Lafayette Parish, Rapides Parish, and East Baton Rouge
  Parish as defined in `docs/sources.md`. Do not label a place supported until it
  passes the same publication and coverage gates.
- Preserve atomic government decisions and source snapshots. Issue timelines are
  a view over those records, not a replacement for them.
- Every published factual claim must resolve to an immutable source snapshot and
  a precise citation. Missing evidence produces a limited card or no publication,
  never a guess.
- The product does not take sides on a decision. Explain consequence, process,
  evidence, deadlines, and public actions without advocacy framing.

## Implementation Contract

- Finish the three-story functionality and evidence gate in `docs/work.md` before
  the global design and full founder QA pass. Launch and outreach follow QA.
- Preserve the shared evidence pipeline when adding owner-curated stories. Story
  publication must not promote an unsupported body or parish.
- Use TanStack Start in SPA/static-prerender mode, Convex for the backend and
  realtime state, and Convex static hosting at `convex.site`.
- Keep route files thin, put route-level data contracts in `.data.ts` modules,
  and organize Convex functions by domain.
- Put external side effects in Convex actions. Keep HTTP routing small and
  explicit.
- Firecrawl performs discovery, retrieval, rendering, PDF/OCR extraction, and
  change detection. Add a source-specific adapter only after a repeated,
  documented failure.
- OpenAI calls run from Convex actions through Convex AI Gateway. Refer to
  models by role and keep the only role-to-model table in
  `docs/architecture.md`. `MODEL_STRONG` runs record extraction, consequence
  factors, issue linking, and planned story drafting. `MODEL_FAST` runs discovery
  classification, independent review, and chat. Code computes importance scores.
  The reviewer never runs on the extraction model. Send strict JSON Schema through the Chat Completions `response_format` field.
  Deterministic validation runs after extraction and review.
- Keep direct OpenAI access behind the same provider interface as a documented
  fallback if AI Gateway is unavailable. The submitted app should use AI
  Gateway when the paid Convex team supports it.
- Chat can only answer from published, validated Public Parish evidence.
- Use the pinned Convex Auth v2 alpha for Google account sign-in. Do not add
  Convex Auth v1 or custom email authentication.
- Accounts are optional for reading and chat. Google sign-in exists for saved
  areas and managed follows. AgentMail can verify a
  separate email-only alert subscription without creating an account.
- Never expose secrets, private messages, user records, exact home addresses, or
  raw application data in public docs or logs.

## Scope Control

The approved launch adds three homepage stories: Meta in Richland Parish as the
lead, SpaceX in Vermilion Parish and the Boyce data center as secondary stories.
All three and story-scoped Ask, follows, updates, replies, sharing, source review
and images must pass before the full design and QA campaign. Use the restored hero and stories before issues until an area is selected.
After selection, remove the hero and begin with local issues before stories. Do not add a fourth story or
replace this set without an owner decision.

The owner permits additional targeted hackathon spending under
`docs/operations.md`. The old catch-up maximum is not the remaining project
budget. Retain finite task limits and stop rules; do not restart broad backfill
or change production settings from a documentation instruction.

Do not add maps, public discussion, testimony generation, public-records request
automation, a procurement product, video transcription, or a government staff
portal before the core resident loop is complete, reliable, and used.

The hackathon build also excludes FAQ aggregation, a dedicated public
corrections workflow, public-triggered coverage compilation, live public
compiler progress, and cross-device chat history. Keep a simple source-problem
reporting path, a public coverage-request form that records demand, and an
owner-triggered internal coverage compiler. Weekly roundup emails and per-issue
share HTML remain in scope after the core resident loop works.

Protect the founder's weekday 90-minute Varholdt sales block. Hackathon work does
not replace the first-dollar plan.

## Hackathon Discipline

- Keep the root `hackathon.md` evidence-based and current. Invoke the local
  `convex-hackathon-skill` after meaningful work sessions.
- Do not claim a component, model, feature, deployment, or user result until
  repository or runtime evidence proves it.
- Keep the public app usable without an invitation.
- Test the direct public URL, source links, live updates, email path, and
  under-three-minute demo before submission.
- Never commit, push, deploy, publish, or submit unless the user asks for that
  action.

## Local validation

- Run tests, typechecks, builds, and linters locally as needed. Use
  `npm run verify` for the full validation suite. GitHub Actions repeats these
  checks on the pull request.
- Review code and diffs as well. Report which checks ran and any failures or
  checks left pending.
- After an authorized production merge, `npm run smoke:production` remains
  required. It checks the live deployment and does not run the local test suite.

## Pull requests

- One concern per PR. If the description needs "also", split it into another PR.
- Real PRs, never drafts.
- Titles: conventional prefix plus the user-facing why, never an inventory of
  files touched. Bodies: problem first, then the fix. No file changelog.
- Keep changes simple and concise. Ship the smallest change that makes the
  behavior obvious.
- Review feedback never grows a PR past its original goal. Verify every bot
  finding against source before changing code; dismiss false positives with a
  written reason and resolve the thread.
- PR-Agent runs `/describe` and `/review` on PR open, and `/review` on push
  (see `pr-agent.md`). The `file-pr` and `babysit-pr` skills carry the full
  procedure; these rules apply even when the skills do not fire.
- Merging to `main` deploys the production backend and frontend. The merge
  question must say that plainly. After an authorized merge, babysit the exact
  production workflow run and execute `npm run smoke:production` before calling
  the release ready.

<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read
`convex/_generated/ai/guidelines.md` first** for important guidelines on
how to correctly use Convex APIs and patterns. The file contains rules that
override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running
`npx convex ai-files install`.

<!-- convex-ai-end -->
