import { createFileRoute } from '@tanstack/react-router'
import { ResidentShell } from '../features/resident-blueprint/resident-shell'
import { BallotPage } from '../features/stories/ballot-page'

export const Route = createFileRoute('/ballot/')({ component: () => <ResidentShell><BallotPage /></ResidentShell> })
