import { expect, test } from 'vitest'
import { PDFDocument, PDFName, PDFString } from 'pdf-lib'
import { resolveRootManifest } from '../coverage/roots'
import { isDocumentUrl } from './discovery'
import { lafayetteCalendarUrls, matchesLafayetteBody, monitoringListingAllowed } from './lafayette'
import { pdfAnnotationLinks } from './pdfLinks'

const bodyKey = 'lafayette-city-planning-commission'
const now = Date.parse('2026-09-06T12:00:00Z')
const start = Date.parse('2026-08-06T12:00:00Z')
const event = 'https://events.lafayettela.gov/default/Detail/2026-08-17-1700-City-Planning-Commission-Meeting'
const attachment = `${event}/b0ddd7c8-bf46-4da8-9cd7-b4ba0152d7ed`

test('calendar discovery stays within the source window and separates the planning bodies', () => {
  const manifest = resolveRootManifest(bodyKey, 'v1')!
  expect(lafayetteCalendarUrls(bodyKey, start, now)).toHaveLength(3)
  expect(monitoringListingAllowed(manifest, 'https://events.lafayettela.gov/default/Month?StartDate=09/01/2026', start, now)).toBe(true)
  expect(monitoringListingAllowed(manifest, 'https://events.lafayettela.gov/default/Month?StartDate=01/01/2020', start, now)).toBe(false)
  expect(monitoringListingAllowed(manifest, 'https://events.lafayettela.gov/default/Month?StartDate=09/01/2026&other=true', start, now)).toBe(false)
  expect(isDocumentUrl(event)).toBe(false)
  expect(isDocumentUrl(attachment)).toBe(true)
  expect(matchesLafayetteBody(bodyKey, attachment)).toBe(true)
  expect(matchesLafayetteBody('lafayette-parish-planning-commission', attachment)).toBe(false)
  expect(matchesLafayetteBody(bodyKey, attachment.replace('City-Planning', 'City-Zoning'))).toBe(false)
  expect(isDocumentUrl(attachment.replace('events.lafayettela.gov', 'events.lafayettela.gov.evil.test'))).toBe(false)
  expect(lafayetteCalendarUrls('rapides-parish-police-jury', start, now)).toEqual([])
})

test('PDF discovery reads URI annotations without executing other actions', async () => {
  const pdf = await PDFDocument.create()
  const page = pdf.addPage()
  const url = 'https://www.lafayettela.gov/media/example/action_summary_cpc_july_20_2026.pdf'
  page.node.set(PDFName.of('Annots'), pdf.context.obj([
    { Type: 'Annot', Subtype: 'Link', Rect: [0, 0, 20, 20], A: { S: 'URI', URI: PDFString.of(url) } },
    { Type: 'Annot', Subtype: 'Link', Rect: [0, 0, 20, 20], A: { S: 'JavaScript', JS: PDFString.of('throw new Error("never execute")') } },
  ]))
  expect(await pdfAnnotationLinks(await pdf.save())).toEqual([url])
  expect(await pdfAnnotationLinks(new TextEncoder().encode('<html>listing</html>'))).toEqual([])
})
