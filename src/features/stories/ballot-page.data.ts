import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'

export function useBallotMeasures() {
  return useQuery(api.stories.resident.ballotMeasures, {})
}
