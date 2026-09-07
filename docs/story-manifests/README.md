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
