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
claims never inherit publication approval from an artifact receipt.

An owner can export the current accepted writing with
`stories/retainedDraft:exportDraft`, naming the target site. Its signed seven-day
receipt binds the exact draft, original draft model, story key and frozen bundle
hash. Pass it as `retainedDraft` to `stories/build:start` in the target. The builder
checks the actual retained artifacts and every exact span before adopting the
writing. It records the receipt and runs a fresh MODEL_FAST independent review.
It never copies a review or approval. The target owner must approve the exact
new candidate and target evidence hashes. This path avoids another MODEL_STRONG
draft call; budget one independent review per story, with no automatic retries.
No production model spending or data import is authorized by this document.

Existing atomic record keys and payload hashes may differ between deployments.
For each such manifest hint, the owner calls
`stories/buildLedger:previewPublicationMapping` with the import, verified source
bindings, source key, origin record key and proposed target record key. Review
the returned title, source and current target payload hash. Pass each returned
mapping as `publicationMappings` to `stories/build:start`. The builder requires
an accepted current target publication on the exact verified story snapshot and
records the mapping in the candidate's approval inputs. It does not rewrite the
manifest, atomic record or issue membership. Changed hashes and unrelated source
snapshots fail closed. Production artifact conflicts still stop promotion.

Rehearse with development receipts and target IDs before promotion. Verify owner
refusals, signature and byte tampering, target conflicts, replay, original retrieval
time and zero new publications or mail. Automated cases run in PR CI. Eleven live
development artifact pairs passed signed export and identical replay. The three
Boyce owner mapping previews and all three story replays passed on application
decf363 with no additional model calls or update events. Production target
artifact and payload hashes require revalidation after the approved code release.

## September 8 successor publication

The [source continuation](targeted-catchup-2026-09-08.md) transferred only three
missing raw and normalized artifact pairs for Meta and SpaceX. Existing evidence
was reused. Target-side reviews and exact approvals preceded publication.

A retained draft does not by itself retain the current accepted image. Use the
[reviewed image-retention procedure](operations.md#retaining-images-during-evidence-updates)
when the source candidate needs that media. Preserve original retrieval times,
image bytes and rights disclosures. A caption correction starts a fresh review;
it cannot inherit the predecessor's approval.
