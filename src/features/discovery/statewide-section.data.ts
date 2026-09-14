import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'

export function useStatewideDecisions() {
  const records = useQuery(api.resident.discovery.listPublishedDecisions, {
    statewide: true,
  })
  return records?.filter(
    (record) => record.bodyName === 'Louisiana Public Service Commission',
  )
}
