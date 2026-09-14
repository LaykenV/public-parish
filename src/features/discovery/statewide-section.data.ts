import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { localDay } from './live-publications'

export function useStatewideDecisions() {
  const records = useQuery(api.resident.discovery.listPublishedDecisions, { statewide: true })
  const issues = useQuery(api.resident.evidence.listPublishedIssues, { statewide: true, today: localDay() })
  return { records, issues }
}
