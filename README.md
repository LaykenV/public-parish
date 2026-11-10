# Public Parish

Public Parish is a free, open-source, nonpartisan Louisiana civic application.
Residents can inspect official evidence, ask grounded questions, follow issues
and receive sourced updates.

Three reviewed Louisiana stories are live: Meta as the lead, with SpaceX in
Vermilion Parish and the Boyce data center secondary. All three retain explicit
LIMITED evidence status. Louisiana-first Home, statewide LPSC coverage and ten
November 3 amendment explanations are deployed. Public Parish launched on
September 18, 2026 and is now in maintenance mode. See
[current work](docs/work.md) for what that means and what is still open.

- [Public app](https://www.publicparish.com)
- [Hackathon host](https://befitting-flamingo-587.convex.site)
- [Demo video, 2:48](https://www.youtube.com/watch?v=zuOhc5rGgsQ)
- [Build history](hackathon.md)

## Maintainer

Public Parish is a [Varholdt Labs](https://www.varholdt.com) project.
Varholdt Labs (Varholdt AI LLC) builds, maintains and pays for it. Layken
Varholdt runs it from Lafayette, Louisiana. The app is free and the code is
open source under the MIT license. It is not affiliated with any government
body, candidate or campaign.

## Documentation

| Read this | For this question |
| --- | --- |
| [Business and product plan](PLAN.md) | Who is this for, what are we building, and why? |
| [Current work](docs/work.md) | What does maintenance cover and what is still open? |
| [Launch upgrade](docs/launch-upgrade.md) | What scope shipped and which evidence contracts remain in force? |
| [Architecture](docs/architecture.md) | How do the evidence pipeline and stories work? |
| [Design](docs/design.md) | How should Home and each resident journey work? |
| [Sources](docs/sources.md) | What can we publish and which bodies do we cover? |
| [Operations](docs/operations.md) | How do we spend, process, recover and release safely? |
| [Marketing](docs/marketing.md) | How do we follow up, distribute and measure usefulness? |
| [Submission](docs/submission.md) | History: what the hackathon entry and demo had to prove |
| [Build log](hackathon.md) | History: what happened during the build |
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

The shared [development host](https://woozy-wren-227.convex.site) is separate
from the public production app linked above.

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

The application code is MIT licensed. See [LICENSE](LICENSE). The third-party
story renderings retain their individual provenance and rights disclosures;
the code license does not grant reuse rights to them.

This is a fresh application created for the
[Convex All Gas Hackathon](https://www.convex.dev/hackathons/all-gas). Earlier
civic work contributed evidence principles, not a reused submission codebase.
