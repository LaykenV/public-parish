# Public Parish

Public Parish is a free, open-source, nonpartisan Louisiana civic application.
Residents can inspect official evidence, ask grounded questions, follow issues
and receive sourced updates.

Three reviewed Louisiana stories are live: Meta as the lead, with SpaceX in
Vermilion Parish and the Boyce data center secondary. All three retain explicit
LIMITED evidence status. Story functionality and targeted source work have passed
the gate for the global design and founder QA pass. Public launch follows QA.
See [current status and pending work](docs/work.md) for verified coverage,
operating limits and the remaining launch gates.

- [Public app](https://www.publicparish.com)
- [Qualifying hackathon host](https://befitting-flamingo-587.convex.site)
- [Development host](https://woozy-wren-227.convex.site)

## Documentation

| Read this | For this question |
| --- | --- |
| [Business and product plan](PLAN.md) | Who is this for, what are we building, and why? |
| [Current work](docs/work.md) | What is done, what is next, and what blocks launch? |
| [Architecture](docs/architecture.md) | How do the evidence pipeline and stories work? |
| [Design](docs/design.md) | How should Home and each resident journey work? |
| [Sources](docs/sources.md) | What can we publish and which bodies do we cover? |
| [Operations](docs/operations.md) | How do we spend, process, recover and release safely? |
| [Marketing](docs/marketing.md) | How will we launch, distribute and measure usefulness? |
| [Submission](docs/submission.md) | What must the hackathon entry and demo prove? |
| [Build log](hackathon.md) | What actually happened during the build? |
| [Archive](docs/archive/README.md) | Where are the completed plans and dated release receipts? |

Each active document owns its subject. Keep task status in the work plan rather
than copying it into every guide. Archived plans are history, not new work orders.

The [design-system reference](docs/design-system.html), gold sets, coverage
manifests, production-batch evidence, source investigations and scripts retain
their existing paths. [Sources](docs/sources.md#evidence-assets-to-preserve) indexes
the evidence assets. [Grok Bot](grok-bot.md) and [PR-Agent](pr-agent.md) remain
short entry points for their respective operating instructions.

## Local setup

Use Node.js 22 and npm 11. Install dependencies with `npm ci`. A fresh Convex
setup uses `npx convex ai-files install` and `npx convex dev --once` to initialize
the personal development environment. Never commit its generated credentials.

`npm run dev` serves Vite at `http://localhost:3000` and syncs the backend to the
shared personal Convex development deployment. The backend is remote, not local.
Switching a worktree does not create a separate backend or database. Coordinate
syncs before using another branch. `npm run dev:web` and `npm run dev:convex`
start those processes individually when needed.

Agents follow [AGENTS.md](AGENTS.md). Run automated validation locally with
`npm run verify`, which combines the project's typecheck, tests, build and lint.
PR CI repeats these checks. Setup examples do not authorize deployment syncs.

Every push to `main` deploys production, including docs-only pushes. Follow the
[release procedure](docs/operations.md#releases-and-validation), watch the exact
workflow and run independent production smoke after an authorized release.

## License

MIT. See [LICENSE](LICENSE). This is a fresh application created for the
[Convex All Gas Hackathon](https://www.convex.dev/hackathons/all-gas). Earlier
civic work contributed evidence principles, not a reused submission codebase.
