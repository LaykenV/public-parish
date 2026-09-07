import { sha256HexOfText } from '../sources/hashing'

// Convex may reorder object keys while storing or validating values. Keep array
// order meaningful, but make object hashes independent of property insertion.
export function canonicalStoryJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalStoryJson).join(',')}]`
  if (value !== null && typeof value === 'object') {
    return `{${Object.entries(value).filter(([, item]) => item !== undefined).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).map(([key, item]) => `${JSON.stringify(key)}:${canonicalStoryJson(item)}`).join(',')}}`
  }
  const json = JSON.stringify(value)
  if (json === undefined) throw new Error('Unsupported story hash input')
  return json
}
export function hashStoryValue(value: unknown) { return sha256HexOfText(canonicalStoryJson(value)) }
