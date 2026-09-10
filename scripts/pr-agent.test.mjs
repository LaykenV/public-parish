// @vitest-environment node

import { readFileSync } from 'node:fs'
import { describe, expect, it, vi } from 'vitest'

// Execute the publisher embedded in the workflow so these tests cover the code
// GitHub runs without checking out PR code in the job that holds the token.
const workflow = readFileSync(
  new URL('../.github/workflows/pr-agent.yml', import.meta.url),
  'utf8',
)
const publisher = workflow
  .split("      - name: Publish the model's review\n")[1]
  .split('          script: |\n')[1]
  .split('\n  pr_agent_commands:')[0]
  .split('\n')
  .map((line) => line.replace(/^            /, ''))
  .join('\n')
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor
const publish = new AsyncFunction('github', 'context', 'process', publisher)
const sha = 'a'.repeat(40)
const finding = {
  relevant_file: 'src/example file.ts',
  issue_header: 'Lost update',
  issue_content: 'A second write replaces the first write.',
  start_line: 4,
  end_line: 7,
}

function fixture({
  reviewer = 'glm',
  comments = [],
  head = sha,
  state = 'open',
  review,
} = {}) {
  const issues = {
    listComments: vi.fn(),
    updateComment: vi.fn(),
    createComment: vi.fn(),
  }
  const github = {
    rest: {
      issues,
      pulls: {
        get: vi
          .fn()
          .mockResolvedValue({ data: { state, head: { sha: head } } }),
      },
    },
    paginate: vi.fn().mockResolvedValue(comments),
  }
  const context = {
    repo: { owner: 'owner', repo: 'repo' },
    serverUrl: 'https://github.com',
    payload: { pull_request: { number: 42 } },
  }
  const env = {
    REVIEW_JSON: JSON.stringify(
      review ?? {
        score: 90,
        key_issues_to_review: [finding],
        security_concerns: 'No',
      },
    ),
    REVIEWER: reviewer,
    REVIEWER_LABEL:
      reviewer === 'glm' ? 'GLM 5.3 Flash' : 'DeepSeek V4.1 Flash',
    REVIEW_MODEL: reviewer,
    REVIEW_SHA: sha,
  }
  return {
    github,
    context,
    env,
    issues,
    run: () => publish(github, context, { env }),
  }
}

const comment = (reviewer, id, login = 'github-actions[bot]') => ({
  id,
  user: { login },
  body: `<!-- public-parish-review:${reviewer} -->\nPrevious review`,
})

describe('parallel PR review publication', () => {
  it('keeps both models in separate comments when they finish together', async () => {
    const glm = fixture()
    const deepseek = fixture({ reviewer: 'deepseek' })
    await Promise.all([glm.run(), deepseek.run()])
    expect(glm.issues.createComment.mock.calls[0][0].body).toContain(
      'public-parish-review:glm',
    )
    expect(deepseek.issues.createComment.mock.calls[0][0].body).toContain(
      'public-parish-review:deepseek',
    )
  })

  it.each(['glm', 'deepseek'])(
    'updates only the existing %s bot comment',
    async (reviewer) => {
      const f = fixture({
        reviewer,
        comments: [comment('glm', 1), comment('deepseek', 2)],
      })
      await f.run()
      expect(f.issues.updateComment).toHaveBeenCalledWith(
        expect.objectContaining({ comment_id: reviewer === 'glm' ? 1 : 2 }),
      )
      expect(f.issues.createComment).not.toHaveBeenCalled()
    },
  )

  it('ignores a user comment with a copied marker and preserves commit-specific source links', async () => {
    const f = fixture({ comments: [comment('glm', 7, 'resident')] })
    await f.run()
    const { body } = f.issues.createComment.mock.calls[0][0]
    expect(body).toContain(`/blob/${sha}/src/example%20file.ts#L4-L7`)
    expect(f.issues.updateComment).not.toHaveBeenCalled()
  })

  it.each([{ head: 'b'.repeat(40) }, { state: 'closed' }])(
    'rejects stale or closed PRs',
    async (options) => {
      const f = fixture(options)
      await expect(f.run()).rejects.toThrow('Discarding stale output')
      expect(f.issues.createComment).not.toHaveBeenCalled()
      expect(f.issues.updateComment).not.toHaveBeenCalled()
    },
  )

  it.each(['', 'not json', '{}', '{"key_issues_to_review":null}'])(
    'fails on missing or invalid review output %s',
    async (value) => {
      const f = fixture()
      f.env.REVIEW_JSON = value
      await expect(f.run()).rejects.toThrow()
      expect(f.issues.createComment).not.toHaveBeenCalled()
    },
  )

  it('rejects malformed findings instead of claiming a clean review', async () => {
    const f = fixture({
      review: { key_issues_to_review: [{ ...finding, start_line: 0 }] },
    })
    await expect(f.run()).rejects.toThrow('malformed finding')
    expect(f.issues.createComment).not.toHaveBeenCalled()
  })

  it('publishes a valid empty review for a manual /review request', async () => {
    const f = fixture({
      review: { key_issues_to_review: [], security_concerns: 'No' },
    })
    f.context.payload = { issue: { number: 42 } }
    await f.run()
    expect(f.issues.createComment).toHaveBeenCalledWith(
      expect.objectContaining({
        issue_number: 42,
        body: expect.stringContaining('No key issues reported by this model.'),
      }),
    )
  })

  it('escapes raw structured output and keeps optional review fields', async () => {
    const f = fixture({
      review: {
        key_issues_to_review: [],
        extra: '</pre><script>test</script>',
      },
    })
    await f.run()
    expect(f.issues.createComment.mock.calls[0][0].body).toContain(
      '&lt;/pre&gt;&lt;script&gt;',
    )
  })

  it('fails rather than truncating an oversized review', async () => {
    const f = fixture({
      review: {
        key_issues_to_review: [
          { ...finding, issue_content: 'x'.repeat(61000) },
        ],
      },
    })
    await expect(f.run()).rejects.toThrow('comment limit')
    expect(f.issues.createComment).not.toHaveBeenCalled()
  })
})
