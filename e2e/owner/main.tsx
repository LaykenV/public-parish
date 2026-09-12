import { createRoot } from 'react-dom/client'
import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from '@tanstack/react-router'
import { CoverageOperationsPage } from '../../src/features/operations/coverage-operations-page'
import { StoryOperationsPage } from '../../src/features/operations/story-operations-page'
import { ResidentLoadingProvider } from '../../src/features/resident-blueprint/resident-loading'
import '../../src/styles.css'
import '../../src/features/resident-blueprint/resident-blueprint.css'

// This separate Vite entry uses synthetic hooks. Production routes never import it.
const root = createRootRoute({
  component: () => (
    <ResidentLoadingProvider>
      <div className="resident-blueprint">
        <Outlet />
      </div>
    </ResidentLoadingProvider>
  ),
})
const coverage = createRoute({
  getParentRoute: () => root,
  path: '/operations/coverage',
  component: CoverageOperationsPage,
})
const stories = createRoute({
  getParentRoute: () => root,
  path: '/operations/stories',
  component: StoryOperationsPage,
})
const router = createRouter({
  routeTree: root.addChildren([coverage, stories]),
})
createRoot(document.getElementById('root')!).render(
  <RouterProvider router={router} />,
)
