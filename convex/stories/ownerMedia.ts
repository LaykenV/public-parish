import type { Id } from '../_generated/dataModel'
import type { storyMedia } from './contracts'

// Owner-approved September 8, 2026 exception for these exact supplied files.
// This is editorial publication permission, not a copyright license.
export const OWNER_MEDIA = {
  'meta-richland': {
    sha256: '7399280fb27ec3fba0ff69426f9fa6ca40aab4ea1d7d0c606b37d358c360d4a6', bytes: 3911235, width: 2048, height: 1024,
    originalUrl: 'https://datacenters.atmeta.com/2024/12/hello-louisiana/', credit: 'Meta',
    caption: 'Illustrative data-center campus rendering, not a photograph of completed construction.',
    alt: 'Rendering of a multi-building data-center campus surrounded by roads, fields and retention ponds.',
  },
  'applied-digital-boyce': {
    sha256: '334120caa4e8ec9faa7c6bbd5140d8d80e551cbe64d65a37528f21da61d8f9cd', bytes: 528925, width: 739, height: 415,
    originalUrl: null, credit: 'Owner-supplied illustration; original creator unverified',
    caption: 'Illustrative data-center rendering. The depicted project is unverified; this is not a photograph of the Boyce site.',
    alt: 'Rendering of a data-center building with equipment yards and a landscaped access road.',
  },
  'spacex-pecan-island': {
    sha256: '80f66a5d57fcb9c042dc1dae8c6105eda572a31b434882dacc0bd563950a1b5e', bytes: 752132, width: 1200, height: 675,
    originalUrl: null, credit: 'Owner-supplied illustration; original creator unverified',
    caption: 'Illustrative spaceport rendering, not a photograph of completed facilities at Pecan Island. Original asset attribution is unverified.',
    alt: 'Rendering of rocket vehicles and launch towers extending across coastal terrain.',
  },
} as const

export function approvedOwnerMedia(storyKey: keyof typeof OWNER_MEDIA, storageId: Id<'_storage'>,
  metadata: { sha256: string; size: number; contentType?: string } | null): typeof storyMedia.type {
  const selected = OWNER_MEDIA[storyKey]
  // The system storage table uses base64; older metadata clients use hex.
  const base64 = btoa(String.fromCharCode(...selected.sha256.match(/../g)!.map(byte => parseInt(byte, 16))))
  if (!metadata || metadata.size !== selected.bytes || metadata.contentType !== 'image/png' ||
    (metadata.sha256 !== selected.sha256 && metadata.sha256 !== base64)) throw new Error('Image does not match the exact owner-approved file for this story')
  return { sha256: selected.sha256, originalUrl: selected.originalUrl, credit: selected.credit,
    caption: selected.caption, alt: selected.alt, width: selected.width, height: selected.height, storageId, kind: 'rendering', captionEvidenceKeys: [],
    rightsStatus: 'owner_selected_unverified', license: 'Reuse rights unverified. Published by owner exception.', permissionEvidenceUrl: null }
}
