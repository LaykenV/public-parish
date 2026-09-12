import { OperationsHeader, OperationsState } from './operations-header'
import { SpendingPanel } from './spending-panel'
import { PageLoading } from '../resident-blueprint/resident-loading'
import { useRef, useState } from 'react'
import { useAction, useMutation, useQuery } from 'convex/react'
import { Link } from '@tanstack/react-router'
import { api } from '../../../convex/_generated/api'
import type { Doc, Id } from '../../../convex/_generated/dataModel'
import { parseStoryManifest } from '../../../convex/stories/manifest'
import { MAX_STORY_BUILD_RETRIES } from '../../../convex/stories/contracts'
import { sha256HexOfText } from '../../../convex/sources/hashing'
import { Button } from '../../components/ui/button'
import { useGoogleAuth } from '../auth/google-auth'
import {
  changedDraftFields,
  useBuild,
  useImport,
  useImports,
  useSourceIntake,
  useStoryBuilds,
  useStoryHistory,
  useStoryIdentity,
} from './story-operations-page.data'
import './coverage-operations.css'
import './story-operations.css'

export function StoryOperationsPage() {
  const auth = useGoogleAuth('/operations/stories')
  const user = useQuery(
    api.auth.currentUser,
    auth.isAuthenticated ? {} : 'skip',
  )
  if (auth.isLoading || (auth.isAuthenticated && user === undefined))
    return (
      <main className="coverage-ops" id="resident-main">
        <PageLoading />
      </main>
    )
  if (!auth.isAuthenticated)
    return (
      <OperationsState
        title="Owner sign-in required"
        detail="Source intake and publication are private owner operations."
        error={auth.error}
        action={
          <Button
            loading={auth.isSigningIn}
            onClick={() => void auth.signInGoogle()}
          >
            Continue with Google
          </Button>
        }
      />
    )
  if (!user?.isOwner)
    return (
      <OperationsState
        title="This account is not the owner"
        detail="Sign in with the account configured for owner operations."
        action={
          <Button variant="outline" onClick={() => void auth.signOut()}>
            Sign out
          </Button>
        }
      />
    )
  return <OwnerStories />
}

function OwnerStories() {
  const imports = useImports()
  const stage = useMutation(api.stories.imports.stage)
  const [selected, setSelected] = useState<Id<'storyImports'> | null>(null)
  const imported = useImport(selected)
  const [message, setMessage] = useState('')
  const [pending, setPending] = useState(false)
  async function stageFile(file: File) {
    setPending(true)
    setMessage('')
    try {
      if (file.size > 250_000)
        throw new Error('The manifest must fit within 250000 bytes.')
      const manifestJson = await file.text()
      parseStoryManifest(manifestJson)
      const receipt = await stage({
        manifestJson,
        expectedBundleHash: await sha256HexOfText(manifestJson),
      })
      setSelected(receipt.importId)
      setMessage(
        receipt.reused
          ? 'Identical import reused.'
          : 'Research staged. It is not approved publication data.',
      )
    } catch (error) {
      setMessage(errorText(error))
    } finally {
      setPending(false)
    }
  }
  return (
    <main className="coverage-ops story-ops" id="resident-main">
      <OperationsHeader current="stories" title="Story intake and publication">
        Review sources, compare drafts and approve an exact version. Publishing
        a story does not expand parish coverage.
      </OperationsHeader>
      <SpendingPanel />
      <div className="story-intake-grid">
        <section>
          <h2>Stage a source manifest</h2>
          <p>Choose a version 1 JSON manifest, up to 250 KB.</p>
          <label>
            Source manifest{' '}
            <input
              type="file"
              accept="application/json,.json"
              disabled={pending}
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (file) void stageFile(file)
              }}
            />
          </label>
          {pending ? <p role="status">Staging manifest...</p> : null}
          {message ? (
            <p className="operations-notice" role="status">
              {message}
            </p>
          ) : null}
        </section>
        <section>
          <h2>Staged imports</h2>
          <p>Select a bundle to inspect its sources and build receipts.</p>
          {imports.status === 'LoadingFirstPage' ? (
            <PageLoading />
          ) : imports.results.length === 0 ? (
            <p className="operations-empty">
              No imports yet. Stage a source manifest to begin.
            </p>
          ) : null}
          <ul className="story-selection-list">
            {imports.results.map((item) => (
              <li key={item._id}>
                <button
                  className="story-selection"
                  type="button"
                  aria-pressed={selected === item._id}
                  onClick={() => setSelected(item._id)}
                >
                  <span>
                    {item.storyKey.replaceAll('-', ' ')}
                    <small>Bundle {item.bundleVersion}</small>
                  </span>
                  <code>{item.bundleHash.slice(0, 12)}</code>
                </button>
              </li>
            ))}
          </ul>
          {imports.status === 'CanLoadMore' ? (
            <Button variant="outline" onClick={() => imports.loadMore(10)}>
              Older imports
            </Button>
          ) : null}
        </section>
      </div>
      {selected && imported === undefined ? <PageLoading /> : null}
      {imported ? <ImportWork key={imported._id} imported={imported} /> : null}
    </main>
  )
}

function ImportWork({ imported }: { imported: Doc<'storyImports'> }) {
  const manifest = parseStoryManifest(imported.manifestJson)
  const sources = useSourceIntake(imported._id)
  const builds = useStoryBuilds(imported.storyKey)
  const register = useMutation(api.stories.intake.registerPublishers)
  const retrieve = useAction(api.stories.intake.retrieve)
  const uploadImage = useMutation(api.stories.operations.uploadImage)
  const start = useAction(api.stories.build.start)
  const [buildId, setBuildId] = useState<Id<'storyBuilds'> | null>(null)
  const [mediaKey, setMediaKey] = useState(manifest.media[0]?.mediaKey ?? '')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const uploadedImages = useRef(new Map<string, Id<'_storage'>>())
  const [intent, setIntent] = useState<'baseline' | 'update'>('baseline')
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState('')
  async function operate(task: () => Promise<string>) {
    setPending(true)
    setMessage('')
    try {
      setMessage(await task())
    } catch (error) {
      setMessage(errorText(error))
    } finally {
      setPending(false)
    }
  }
  const ready =
    sources?.length === manifest.sources.length &&
    sources.every((source) => source.status === 'ready' && source.snapshotId)
  return (
    <section className="story-import-work">
      {sources === undefined || builds === undefined ? <PageLoading /> : null}
      <h2>
        {manifest.story.storyKey}, bundle {manifest.bundleVersion}
      </h2>
      <p>
        Exact bundle hash <code>{imported.bundleHash}</code>
      </p>
      <details>
        <summary>Untrusted research and known gaps</summary>
        <pre>{JSON.stringify(manifest.research, null, 2)}</pre>
      </details>
      <h3>Official source intake</h3>
      <Button
        variant="outline"
        disabled={pending}
        onClick={() =>
          void operate(async () => {
            await register({
              importId: imported._id,
              bundleHash: imported.bundleHash,
            })
            return 'Checked publisher registrations are available. Coverage and monitoring remain unchanged.'
          })
        }
      >
        Register checked launch publishers
      </Button>
      <ul className="story-source-list">
        {sources?.map((source) => (
          <li key={source.sourceKey}>
            <strong>{source.bodyName}</strong> · {source.sourceKey}
            <p>
              <a href={source.url} target="_blank" rel="noreferrer">
                Official source
              </a>{' '}
              · {source.status.replaceAll('_', ' ')}
            </p>
            {source.normalizedUrl ? (
              <a href={source.normalizedUrl} target="_blank" rel="noreferrer">
                Inspect saved normalized document
              </a>
            ) : null}
            <p>
              Raw hash <code>{source.rawHash ?? 'Not retrieved'}</code>
              <br />
              Normalized hash{' '}
              <code>{source.normalizedHash ?? 'Not retrieved'}</code>
            </p>
            {source.status === 'normalization_changed' ? (
              <p>
                Create a new bundle version using these exact saved bytes and
                corrected spans. Do not repeat retrieval to force a hash match.
              </p>
            ) : null}
            {source.status === 'artifact_missing' ? (
              <p>
                A retained artifact is missing. Restore its exact saved bytes
                before preparing a candidate. New retrieval cannot repair a
                missing historical file.
              </p>
            ) : null}
            {source.status === 'missing' ? (
              <Button
                disabled={pending || !source.registered || source.attempts >= 2}
                onClick={() =>
                  void operate(() =>
                    retrieve({
                      importId: imported._id,
                      sourceKey: source.sourceKey,
                      bundleHash: imported.bundleHash,
                    }),
                  )
                }
              >
                Retrieve missing source, attempt {source.attempts + 1} of 2
              </Button>
            ) : null}
            {source.error ? <p role="alert">{source.error}</p> : null}
          </li>
        ))}
      </ul>
      <h3>Draft and independent review</h3>
      <p>
        New work spends the configured finite source allowance. Successful saved
        work is reused.
      </p>
      <label>
        Approved image candidate{' '}
        <select
          value={mediaKey}
          onChange={(event) => setMediaKey(event.target.value)}
        >
          {manifest.media.map((media) => (
            <option key={media.mediaKey} value={media.mediaKey}>
              {media.caption}
            </option>
          ))}
        </select>
      </label>
      <label>
        Exact image artifact{' '}
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(event) => setImageFile(event.target.files?.[0] ?? null)}
        />
      </label>
      <label>
        Notification intent{' '}
        <select
          value={intent}
          onChange={(event) =>
            setIntent(event.target.value as 'baseline' | 'update')
          }
        >
          <option value="baseline">Historical baseline, send no updates</option>
          <option value="update">Notify substantive approved changes</option>
        </select>
      </label>
      <Button
        disabled={pending || !ready || !imageFile}
        onClick={() =>
          void operate(async () => {
            if (!imageFile || !sources)
              throw new Error('Choose the reviewed image artifact.')
            const proposed = manifest.media.find(
              (media) => media.mediaKey === mediaKey,
            )
            if (!proposed || imageFile.size !== proposed.artifact.bytes)
              throw new Error('Image bytes do not match the manifest.')
            const digest = await crypto.subtle.digest(
              'SHA-256',
              await imageFile.arrayBuffer(),
            )
            const hash = [...new Uint8Array(digest)]
              .map((byte) => byte.toString(16).padStart(2, '0'))
              .join('')
            if (hash !== proposed.artifact.sha256)
              throw new Error('Image hash does not match the manifest.')
            let storageId = uploadedImages.current.get(hash)
            if (!storageId) {
              const upload = await fetch(await uploadImage({}), {
                method: 'POST',
                headers: { 'Content-Type': imageFile.type },
                body: imageFile,
              })
              if (!upload.ok) throw new Error('Image upload failed.')
              const result = (await upload.json()) as {
                storageId: Id<'_storage'>
              }
              storageId = result.storageId
              uploadedImages.current.set(hash, storageId)
            }
            const id = await start({
              importId: imported._id,
              bindings: sources.map((source) => ({
                sourceKey: source.sourceKey,
                snapshotId: source.snapshotId!,
              })),
              media: { mediaKey, storageId },
              notificationIntent: intent,
            })
            setBuildId(id)
            return 'Build receipt ready. Review the saved draft and independent findings below.'
          })
        }
      >
        Prepare exact candidate
      </Button>
      {message ? (
        <p className="operations-notice" role="status">
          {message}
        </p>
      ) : null}
      <h3>Build receipts</h3>
      {builds?.length === 0 ? (
        <p className="operations-empty">
          No builds yet. Prepare a candidate after all sources are ready and an
          image is selected.
        </p>
      ) : null}
      <ul className="story-selection-list">
        {builds?.map((build) => (
          <li key={build.id}>
            <button
              className="story-selection"
              type="button"
              aria-pressed={buildId === build.id}
              onClick={() => setBuildId(build.id)}
            >
              <span>
                {build.state.replaceAll('_', ' ')}
                <small>{new Date(build.createdAt).toLocaleString()}</small>
              </span>
            </button>
          </li>
        ))}
      </ul>
      {buildId ? (
        <BuildWork key={buildId} buildId={buildId} onSelect={setBuildId} />
      ) : null}
    </section>
  )
}

function BuildWork({
  buildId,
  onSelect,
}: {
  buildId: Id<'storyBuilds'>
  onSelect: (id: Id<'storyBuilds'>) => void
}) {
  const preview = useBuild(buildId)
  if (preview === undefined) return <PageLoading />
  return (
    <ReviewCandidate
      key={`${preview.build._id}:${preview.build.inputHash}:${preview.build.draftHash}:${preview.build.reviewHash}`}
      build={preview.build}
      previous={preview.previous}
      imageUrl={preview.imageUrl}
      onSelect={onSelect}
    />
  )
}

function ReviewCandidate({
  build,
  previous,
  imageUrl,
  onSelect,
}: {
  build: Doc<'storyBuilds'>
  previous: Doc<'storyVersions'> | null
  imageUrl: string | null
  onSelect: (id: Id<'storyBuilds'>) => void
}) {
  const identity = useStoryIdentity(build.storyId)
  const history = useStoryHistory(build.storyId)
  const approve = useMutation(api.stories.operations.approve)
  const retry = useMutation(api.stories.buildLedger.retry)
  const withdraw = useMutation(api.stories.operations.withdraw)
  const prepareCorrection = useMutation(api.stories.corrections.prepare)
  const [correction, setCorrection] = useState(
    build.draft ? JSON.stringify(build.draft, null, 2) : '',
  )
  const [checked, setChecked] = useState(false)
  const [reason, setReason] = useState('')
  const [message, setMessage] = useState('')
  const [pending, setPending] = useState(false)
  async function operate(task: () => Promise<string>) {
    setPending(true)
    try {
      setMessage(await task())
    } catch (error) {
      setMessage(errorText(error))
    } finally {
      setPending(false)
    }
  }
  return (
    <section className="story-candidate-review">
      <h3>Exact candidate review</h3>
      <p>
        State {build.state}. Notification intent{' '}
        {build.notificationIntent ?? 'update'}.
      </p>
      <p>
        Input <code>{build.inputHash}</code>
        <br />
        Draft <code>{build.draftHash ?? 'Pending'}</code>
        <br />
        Review <code>{build.reviewHash ?? 'Pending'}</code>
      </p>
      {build.draft ? (
        <>
          <p>
            Changed fields:{' '}
            {changedDraftFields(previous?.payload ?? null, build.draft).join(
              ', ',
            ) || 'None'}
          </p>
          <div className="story-review-columns">
            <section>
              <h4>Previous accepted version</h4>
              <pre>
                {previous
                  ? JSON.stringify(previous.payload, null, 2)
                  : 'No previous publication'}
              </pre>
            </section>
            <section>
              <h4>Candidate</h4>
              <pre>{JSON.stringify(build.draft, null, 2)}</pre>
            </section>
          </div>
        </>
      ) : (
        <p>Drafting has not completed.</p>
      )}
      {build.draftProvenance ? (
        <p>
          Owner-corrected draft based on immutable draft{' '}
          <code>{build.draftProvenance.parentDraftHash}</code>. It requires its
          own independent review and approval.
        </p>
      ) : null}
      {build.draft && build.state !== 'queued' && build.state !== 'drafted' ? (
        <details>
          <summary>Correct this draft</summary>
          <p>
            Use the existing evidence keys. This preserves the original
            candidate and spends only on a new independent review. It does not
            publish.
          </p>
          <label>
            Corrected draft JSON{' '}
            <textarea
              rows={16}
              value={correction}
              maxLength={250000}
              onChange={(event) => setCorrection(event.target.value)}
            />
          </label>
          <Button
            disabled={pending || !identity || !build.draftHash}
            onClick={() =>
              void operate(async () => {
                const id = await prepareCorrection({
                  parentBuildId: build._id,
                  parentDraftHash: build.draftHash!,
                  expectedGeneration: identity!.generation,
                  draft: JSON.parse(correction),
                })
                onSelect(id)
                return 'Corrected candidate prepared for independent review.'
              })
            }
          >
            Prepare corrected draft for review
          </Button>
        </details>
      ) : null}
      {build.media ? (
        <figure>
          {imageUrl ? (
            <img
              className="story-review-image"
              src={imageUrl}
              alt={build.media.alt}
              width={build.media.width}
              height={build.media.height}
            />
          ) : (
            <p>Image artifact unavailable.</p>
          )}
          <figcaption>
            {build.media.caption} · {build.media.credit} · {build.media.license}
            <p>Alt text: {build.media.alt}</p>
            {build.media.originalUrl ? (
              <a
                href={build.media.originalUrl}
                target="_blank"
                rel="noreferrer"
              >
                Original image
              </a>
            ) : (
              'Original source unverified'
            )}
            {' · '}
            {build.media.permissionEvidenceUrl ? (
              <a
                href={build.media.permissionEvidenceUrl}
                target="_blank"
                rel="noreferrer"
              >
                Permission evidence
              </a>
            ) : (
              'No rightsholder permission verified'
            )}
          </figcaption>
        </figure>
      ) : null}
      <h4>Exact evidence</h4>
      {build.spans.map((span) => (
        <details key={span.key}>
          <summary>
            {span.key}
            {span.page ? `, page ${span.page}` : ''}
          </summary>
          <blockquote>{span.excerpt}</blockquote>
          <a href={span.officialUrl} target="_blank" rel="noreferrer">
            Official source
          </a>
          <p>
            Artifact <code>{span.rawHash}</code>
            <br />
            Normalized <code>{span.normalizedHash}</code>
          </p>
        </details>
      ))}
      <h4>Independent review</h4>
      <pre>
        {build.review
          ? JSON.stringify(build.review, null, 2)
          : 'Review pending'}
      </pre>
      {build.error ? <p role="alert">{build.error}</p> : null}
      {build.state === 'failed' ? (
        <>
          <p>
            Owner retries used: {build.retryCount ?? 0} of{' '}
            {MAX_STORY_BUILD_RETRIES}. Each retry retains successful work and
            requires remaining paid allowance.
          </p>
          <Button
            disabled={
              pending || (build.retryCount ?? 0) >= MAX_STORY_BUILD_RETRIES
            }
            onClick={() =>
              void operate(async () => {
                await retry({ buildId: build._id, inputHash: build.inputHash })
                return 'Bounded retry started. Successful work is retained.'
              })
            }
          >
            Retry failed work
          </Button>
        </>
      ) : null}
      {build.state === 'reviewed' ? (
        <>
          <label className="story-approval">
            <input
              type="checkbox"
              checked={checked}
              onChange={(event) => setChecked(event.target.checked)}
            />
            I reviewed this exact draft, image provenance, evidence and
            independent findings.
          </label>
          <Button
            disabled={
              pending ||
              !checked ||
              identity?.generation !== build.expectedGeneration
            }
            onClick={() =>
              void operate(async () => {
                const id = await approve({
                  buildId: build._id,
                  inputHash: build.inputHash,
                  draftHash: build.draftHash!,
                  reviewHash: build.reviewHash!,
                  expectedGeneration: build.expectedGeneration,
                })
                return `Version ${id} recorded with the reviewed publication outcome.`
              })
            }
          >
            {build.review?.verdict === 'fail'
              ? 'Record withheld outcome'
              : 'Approve and publish exact version'}
          </Button>
        </>
      ) : null}
      {identity?.state === 'active' ? (
        <>
          <div className="story-withdrawal">
            <h4>Withdraw published story</h4>
            <p>This removes the current story from public reading.</p>
            <label>
              Public withdrawal reason{' '}
              <textarea
                value={reason}
                maxLength={600}
                onChange={(event) => setReason(event.target.value)}
              />
            </label>
            <Button
              disabled={pending || !reason.trim()}
              variant="destructive-outline"
              onClick={() =>
                void operate(async () => {
                  await withdraw({
                    storyId: build.storyId,
                    expectedGeneration: identity.generation,
                    reason,
                  })
                  return 'Story withdrawn. Its private history remains available.'
                })
              }
            >
              Withdraw current story
            </Button>
          </div>
        </>
      ) : null}
      {message ? (
        <p className="operations-notice" role="status">
          {message}
        </p>
      ) : null}
      <h4>Immutable publication history</h4>
      {history.results.map((version) => (
        <details key={version._id}>
          <summary>
            Version {version.version}, {version.mode},{' '}
            {new Date(version.approvedAt).toLocaleString()}
          </summary>
          <pre>{JSON.stringify(version, null, 2)}</pre>
        </details>
      ))}
      {history.status === 'CanLoadMore' ? (
        <Button onClick={() => history.loadMore(10)}>Older versions</Button>
      ) : null}
      <Link to="/">Inspect public Home</Link>
    </section>
  )
}

function errorText(error: unknown) {
  return error instanceof Error
    ? error.message
    : 'The operation did not complete.'
}
