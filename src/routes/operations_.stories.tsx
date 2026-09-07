import { createFileRoute } from '@tanstack/react-router'
import { StoryOperationsPage } from '../features/operations/story-operations-page'
import { ResidentShell } from '../features/resident-blueprint/resident-shell'

export const Route = createFileRoute('/operations_/stories')({ component: StoryOperationsRoute })
function StoryOperationsRoute() { return <ResidentShell><StoryOperationsPage /></ResidentShell> }
