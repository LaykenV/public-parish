import { describe, expect, it } from 'vitest'

import {
  clearGoogleFollowIntent,
  googleFollowIntentUrl,
  readGoogleFollowIntent,
} from './google-follow-intent'

describe('Google follow intent', () => {
  it('preserves story identity through Google sign-in', () => {
    const href = googleFollowIntentUrl('https://www.publicparish.com/stories/meta-richland', { kind: 'Story', key: 'meta-richland', title: 'Meta', detail: 'Richland Parish' }, 'both')
    expect(readGoogleFollowIntent(href)).toEqual({ targetKind: 'story', targetKey: 'meta-richland', cadence: 'both' })
    expect(clearGoogleFollowIntent(href)).toBe('/stories/meta-richland')
  })
  it('carries only target identity and cadence through sign-in', () => {
    const href = googleFollowIntentUrl(
      'https://www.publicparish.com/issues/drainage-fee-credit-cap?returnTo=%2Fexplore#sources',
      {
        detail: 'Lafayette Parish',
        key: 'drainage-fee-credit-cap',
        kind: 'Issue',
        title: 'Drainage fee credit cap',
      },
      'both',
    )
    const url = new URL(href)

    expect(readGoogleFollowIntent(href)).toEqual({
      cadence: 'both',
      targetKey: 'drainage-fee-credit-cap',
      targetKind: 'issue',
    })
    expect(url.searchParams.get('returnTo')).toBe('/explore')
    expect(href).not.toContain('Lafayette')
    expect(href).not.toContain('Drainage+fee')
  })

  it('removes the intent without disturbing the resident route', () => {
    expect(
      clearGoogleFollowIntent(
        'https://www.publicparish.com/issues/example?followKind=issue&followKey=example&followCadence=weekly&returnTo=%2Ffollowing#sources',
      ),
    ).toBe('/issues/example?returnTo=%2Ffollowing#sources')
  })

  it('rejects incomplete or malformed intent', () => {
    expect(
      readGoogleFollowIntent(
        'https://www.publicparish.com/issues/example?followKind=issue&followKey=../../private&followCadence=both',
      ),
    ).toBeNull()
    expect(
      readGoogleFollowIntent(
        'https://www.publicparish.com/issues/example?followKind=issue&followKey=example',
      ),
    ).toBeNull()
  })
})
