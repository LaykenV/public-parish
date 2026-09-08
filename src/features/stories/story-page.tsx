import { ArrowUpRightIcon } from 'lucide-react'
import { PageLoading } from '../resident-blueprint/resident-loading'
import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { ResidentSectionBoundary } from '../resident-blueprint/resident-recovery'
import { StoryOfficialSourceLink } from './story-source-link'
import { ShareButton } from '../discovery/share'
import { FollowAction } from '../following/follow-action'
import { ReportProblem } from '../evidence/evidence-blocks'
import { useStory, useFeaturedStories } from './story-page.data'
import type { PublicStory } from './story-page.data'
import './stories.css'

function StoryImage({
  media,
  compact = false,
}: {
  media: PublicStory['media']
  compact?: boolean
}) {
  const [failed, setFailed] = useState(false)
  if (!media || failed)
    return (
      <p className="pp-story-image-fallback">
        Image unavailable. The official evidence remains below.
      </p>
    )
  return (
    <figure className={compact ? 'pp-story-image compact' : 'pp-story-image'}>
      <img
        src={media.url}
        alt={media.alt}
        width={media.width}
        height={media.height}
        loading={compact ? 'lazy' : 'eager'}
        onError={() => setFailed(true)}
      />
    </figure>
  )
}

export function FeaturedStories() {
  return (
    <ResidentSectionBoundary
      label="Featured stories"
      resetKey="featured-stories"
    >
      <FeaturedStoriesContent />
    </ResidentSectionBoundary>
  )
}

function FeaturedStoriesContent() {
  const stories = useFeaturedStories()
  return (
    <section
      id="stories"
      className="pp-stories"
      aria-labelledby="stories-title"
    >
      <header className="pp-stories-intro">
        <h2 id="stories-title">Across Louisiana</h2>
        <p>The projects making news, explained through official records.</p>
      </header>
      {stories === undefined ? (
        <PageLoading />
      ) : !stories.length ? (
        <p className="pp-empty">
          Featured stories are under review. Browse published local decisions
          below.
        </p>
      ) : (
        <div className="pp-story-grid">
          {stories.map((story) => (
            <article
              key={story.id}
              className={
                story.rank === 0 ? 'pp-story-card lead' : 'pp-story-card'
              }
            >
              <StoryImage key={story.media?.url} media={story.media} compact />
              <div className="pp-story-copy">
                <p className="pp-story-place">{story.geography.join(' · ')}</p>
                <h3>
                  <Link
                    to="/stories/$storySlug"
                    params={{ storySlug: story.slug }}
                  >
                    {story.payload.title.text}
                  </Link>
                </h3>
                <p className="pp-story-summary">{story.payload.summary.text}</p>
                <p className="pp-story-meta">
                  Reviewed through {story.reviewedThrough}
                </p>
                {story.mode === 'limited' ? (
                  <p className="pp-story-limit">
                    Some questions remain unanswered.
                  </p>
                ) : null}
                <Link
                  className="pp-story-read"
                  to="/stories/$storySlug"
                  params={{ storySlug: story.slug }}
                  aria-label={`Read story: ${story.payload.title.text}`}
                >
                  Read story <ArrowUpRightIcon aria-hidden="true" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

export function StoryPage({ slug }: { slug: string }) {
  const result = useStory(slug)
  if (result === undefined)
    return (
      <main className="pp-page" id="resident-main">
        <PageLoading />
      </main>
    )
  if (!result.story)
    return (
      <main className="pp-page" id="resident-main">
        <h1>
          {result.state === 'withdrawn'
            ? 'Story withdrawn'
            : 'Story unavailable'}
        </h1>
        <p>{result.reason}</p>
        <Link to="/">Return to Home</Link>
      </main>
    )
  const story = result.story
  return (
    <main className="pp-page pp-story-detail" id="resident-main">
      <Link to="/">All featured stories</Link>
      <header>
        <p>{story.geography.join(' · ')}</p>
        <h1>{story.payload.title.text}</h1>
        <Statement statement={story.payload.summary} story={story} />
        <p className="pp-story-meta">
          Reviewed through {story.reviewedThrough}. Next owner review planned{' '}
          {story.nextReviewAt}.{' '}
          {story.mode === 'limited' ? 'Some questions remain unanswered.' : ''}
        </p>
        <ShareButton
          path={`/stories/${story.slug}`}
          title={story.payload.title.text}
        />
        <FollowAction
          available
          live
          label="Follow this story"
          target={{
            kind: 'Story',
            key: story.slug,
            title: story.payload.title.text,
            detail: story.geography.join(' · '),
          }}
        />
        <Link
          to="/ask"
          search={{
            scope: 'story',
            story: story.slug,
            returnTo: `/stories/${story.slug}`,
          }}
        >
          Ask about this story
        </Link>
      </header>
      <StoryImage key={story.media?.url} media={story.media} />
      {story.payload.sections.map((section, i) => (
        <section key={i}>
          <h2>{section.heading}</h2>
          {section.statements.map((statement, j) => (
            <Statement key={j} statement={statement} story={story} />
          ))}
        </section>
      ))}
      <section>
        <h2>Timeline</h2>
        {story.payload.timeline.length ? (
          <ol>
            {story.payload.timeline.map((event, i) => (
              <li key={i}>
                <p>{event.date ?? 'Date not stated'}</p>
                <Statement statement={event.statement} story={story} />
              </li>
            ))}
          </ol>
        ) : (
          <p>The accepted evidence does not establish a dated sequence.</p>
        )}
      </section>
      <section>
        <h2>Next documented action</h2>
        {story.payload.nextAction ? (
          <Statement statement={story.payload.nextAction} story={story} />
        ) : (
          <p>
            No next public action or deadline is established by these sources.
          </p>
        )}
      </section>
      <section>
        <h2>What remains unknown</h2>
        {story.payload.limitations.length ? (
          <ul>
            {story.payload.limitations.map((gap, i) => (
              <li key={i}>{gap}</li>
            ))}
          </ul>
        ) : (
          <p>
            This story covers only the official evidence listed below. It is not
            complete coverage of every permit or government body.
          </p>
        )}
      </section>
      <section>
        <h2>Official evidence</h2>
        {story.evidence.map((source, i) => (
          <details
            key={source.key}
            id={`story-source-${i}`}
            className="pp-story-source"
          >
            <summary>
              Source {i + 1}
              {source.page ? `, page ${source.page}` : ''}
              {source.section ? `, ${source.section}` : ''}
            </summary>
            <blockquote>{source.excerpt}</blockquote>
            <StoryOfficialSourceLink url={source.officialUrl} />
            {source.snapshotUrl ? (
              <p>
                <a href={source.snapshotUrl} target="_blank" rel="noreferrer">
                  Inspect the saved source artifact
                </a>
              </p>
            ) : (
              <p>Saved artifact is unavailable.</p>
            )}
          </details>
        ))}
      </section>
      {story.relatedRecords.length ? (
        <section>
          <h2>Related local records</h2>
          <ul>
            {story.relatedRecords.map((record) => (
              <li key={record.key}>
                <Link
                  to="/decisions/$recordKey"
                  params={{ recordKey: record.key }}
                >
                  {record.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <ReportProblem available recordUrl={`/stories/${story.slug}`} />
    </main>
  )
}

function Statement({
  statement,
  story,
}: {
  statement: { text: string; evidenceKeys: string[] }
  story: PublicStory
}) {
  return (
    <p>
      {statement.text}{' '}
      {statement.evidenceKeys.map((key) => {
        const index = story.evidence.findIndex((source) => source.key === key)
        return index >= 0 ? (
          <a
            key={key}
            className="pp-story-citation"
            href={`#story-source-${index}`}
            onClick={() => {
              const target = document.getElementById(`story-source-${index}`)
              if (target instanceof HTMLDetailsElement) target.open = true
            }}
            aria-label={`Inspect source ${index + 1}`}
          >
            [{index + 1}]
          </a>
        ) : null
      })}
    </p>
  )
}
