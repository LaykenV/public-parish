import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import { ResidentRouteError } from './features/resident-blueprint/resident-recovery'
import { routeTree } from './routeTree.gen'

export function getRouter() {
  const router = createTanStackRouter({
    routeTree,
    defaultErrorComponent: ResidentRouteError,
    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
  })

  return router
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
