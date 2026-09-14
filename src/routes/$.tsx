import { createFileRoute } from '@tanstack/react-router'

import { BlueprintNotFound } from '../features/resident-blueprint/blueprint-page'

// A matched child route keeps the SPA shell's hydration boundaries on bad URLs.
export const Route = createFileRoute('/$')({
  component: BlueprintNotFound,
})
