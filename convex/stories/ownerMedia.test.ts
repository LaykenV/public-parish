import { expect, test } from 'vitest'
import { approvedOwnerMedia, OWNER_MEDIA } from './ownerMedia'
import type { Id } from '../_generated/dataModel'

const storageId = 'synthetic-storage' as Id<'_storage'>
test('the owner exception is bound to each story and exact image bytes', () => {
  for (const storyKey of Object.keys(OWNER_MEDIA) as Array<keyof typeof OWNER_MEDIA>) {
    const selected = OWNER_MEDIA[storyKey]
    const metadata = { sha256: selected.sha256, size: selected.bytes, contentType: 'image/png' }
    expect(approvedOwnerMedia(storyKey, storageId, metadata)).toMatchObject({ sha256: selected.sha256, rightsStatus: 'owner_selected_unverified', permissionEvidenceUrl: null, captionEvidenceKeys: [] })
    for (const other of Object.keys(OWNER_MEDIA) as Array<keyof typeof OWNER_MEDIA>) {
      if (other !== storyKey) expect(() => approvedOwnerMedia(other, storageId, metadata)).toThrow('exact owner-approved file')
    }
    expect(() => approvedOwnerMedia(storyKey, storageId, { ...metadata, size: metadata.size + 1 })).toThrow()
    expect(() => approvedOwnerMedia(storyKey, storageId, { ...metadata, sha256: '0'.repeat(64) })).toThrow()
    expect(() => approvedOwnerMedia(storyKey, storageId, { ...metadata, contentType: 'text/html' })).toThrow()
    expect(() => approvedOwnerMedia(storyKey, storageId, null)).toThrow()
    const base64 = btoa(String.fromCharCode(...selected.sha256.match(/../g)!.map(byte => parseInt(byte, 16))))
    expect(approvedOwnerMedia(storyKey, storageId, { ...metadata, sha256: base64 }).sha256).toBe(selected.sha256)
  }
})
