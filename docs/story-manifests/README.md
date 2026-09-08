# Story research contract 1.0.0

The JSON schema defines the frozen research exchange with Agent 2. The example
and its artifact are fictional, complete formatting examples. They cannot be
published. Do not copy example claims into a launch bundle.

`stories/imports:stage` requires the configured owner and the SHA-256 of the exact
UTF-8 manifest bytes. It validates the bounded contract, stores those bytes, and
returns a stable import receipt. Replay returns the same receipt without model
work or notifications. `preview` and paginated `list` require owner access.
Staging does not establish official provenance or accept a claim.

Hash raw bytes and normalized UTF-8 text separately. Citation offsets are
JavaScript UTF-16 positions, start inclusive and end exclusive, in that exact
normalized file. Page numbers need a supporting page map. Actual artifact bytes
must pass a later server verification step before drafting or publication.

Artifact URIs are resolver references, never fetch permission. Keep large files
outside Git. Preserve actual retrieval method and repeated failure documentation
for manual file intake. Never invent Firecrawl metadata. Existing publication
references are hints to resolve and verify against the server, never approval.

Keep source and story keys stable. Freeze the exact bundle bytes and record their
hash outside the file. Changed bytes require a higher bundleVersion and the prior
bundle hash. Keep bundleKey stable across revisions. Unknown fields and versions
are rejected. Contract changes require a separately versioned schema, migration
instructions, and a handoff acknowledgement before bundle formatting changes.

The next packet must verify official identity and artifact bytes, resolve shared
accepted evidence, draft and independently review claims, bind owner approval to
exact evidence and draft hashes, and publish immutable full or limited versions.
There is no story publication endpoint in this first packet.

## Reviewed publication packet, in development

The dependent publication branch adds a durable draft and independent review
workflow over verified `sourceSnapshots`. Owner staging still cannot publish.
`stories/build:start` checks saved raw and normalized bytes and exact excerpts,
then freezes the input. The draft and independent review use the existing model
provider and spending ledger. No automatic retry spends after a failed step.

The owner preview includes the previous accepted version for comparison.
`stories/operations:approve` requires the exact input, draft and review hashes
and the expected story generation. It rechecks current sources and storage,
then atomically stores an immutable version and updates the accepted pointer.
Withheld candidates preserve the prior pointer. Withdrawal advances the generation
and preserves private historical inspection. No broad monitoring or coverage
promotion runs from these operations.

Official announcements and records that do not describe an atomic decision can
support explicit reviewed statements in a story version. Each statement pins
exact spans in shared immutable snapshots and receives its own independent
review check. These statements do not create fictional decision records or alter
single-body issue membership. Generated story prose remains a projection of this
evidence, never an independent source for Ask.

Resident routes, story search, Ask and typed notification events follow in their
own packets. This branch does not yet certify a complete resident story loop.
