# Bounded story artifact transfer

This path moves official source artifacts for the three launch stories. It does
not publish a story, copy residents, replace a target snapshot, certify coverage,
or enable monitoring. Production use still requires the owner's release approval.

An owner calls `stories/transfer:exportSource` for a current accepted story and
source key, naming the exact target Convex site. Export verifies retained raw and
normalized bytes against their hashes and rechecks current evidence before signing
a seven-day receipt. The receipt includes stable body/source keys, original
retrieval provenance and time, exact hashes, byte lengths and any existing page map.
It excludes development database IDs. Download the two returned artifact URLs and
retain their exact bytes with the signed receipt.

`STORY_ARTIFACT_TRANSFER_KEY` is a dedicated 32-byte secret encoded as 64 lowercase
hex characters. The authorized operator installs the same secret in the sending
and receiving deployments through private environment settings. Never place it
in a bundle, frontend, PR, log or public report. The owner must approve its
production installation separately. Rotating it invalidates unused receipts.

In the receiving deployment, stage the frozen manifest predecessor chain and use
the existing reviewed-publisher registration operation. Upload only missing raw
and normalized artifacts through the owner upload URL. Call
`stories/transfer:importSource` with the target import ID, exact bundle hash,
signed packet and the two new storage IDs. It verifies the target, signature,
artifact bytes and staged source identity. An identical latest snapshot is reused.
A different existing source is a conflict requiring review, never an overwrite.
The importer retains original retrieval time and records transfer provenance in
`storyArtifactTransfers`; it does not pretend a transfer is another Firecrawl call.

The normal story builder still checks exact spans and current evidence. Research
claims never inherit publication approval from an artifact receipt. Draft and
review reuse is a separate gate. Until a portable accepted-draft path exists,
do not claim that this artifact-only operation avoids every model call. No
production model spending or data import is authorized by this document.

Rehearse with development receipts and target IDs before promotion. Verify owner
refusals, signature and byte tampering, target conflicts, replay, original retrieval
time and zero new publications or mail. Automated cases run in PR CI. Live
development transfer proof is pending.
