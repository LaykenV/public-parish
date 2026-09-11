import { createFileRoute } from '@tanstack/react-router'

import { parseFollowingSearch } from '../features/following/contracts'
import { RecentConversations } from '../features/ask/recent-conversations'
import { FollowingPage } from '../features/following/following-page'
import { loadFollowingPageData } from '../features/following/following-page.data'
import { ResidentShell } from '../features/resident-blueprint/resident-shell'

export const Route = createFileRoute('/following')({
  component: FollowingRoute,
  loaderDeps: ({ search }) => ({ fixture: search.fixture }),
  loader: ({ deps }) => loadFollowingPageData(deps.fixture),
  validateSearch: parseFollowingSearch,
})

function FollowingRoute() {
  const { returnTo } = Route.useSearch()
  const data = Route.useLoaderData()

  return (
    <ResidentShell>
      <FollowingPage
        data={data}
        returnTo={returnTo}
        view="following"
      />
      <RecentConversations fixture={data.mode === 'fixture'} />
    </ResidentShell>
  )
}
