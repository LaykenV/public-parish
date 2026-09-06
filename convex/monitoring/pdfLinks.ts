import { MAX_RAW_ARTIFACT_BYTES } from '../sources/rawArtifact'
import { PDFArray, PDFDict, PDFDocument, PDFHexString, PDFName, PDFString } from 'pdf-lib'

/** Read URI annotations, never execute PDF actions or retrieve their targets. */
export async function pdfAnnotationLinks(bytes: Uint8Array): Promise<string[]> {
  if (bytes.byteLength > MAX_RAW_ARTIFACT_BYTES) throw new Error('monitoring_pdf_link_capacity')
  if (new TextDecoder().decode(bytes.slice(0, 5)) !== '%PDF-') return []
  const pdf = await PDFDocument.load(bytes, { updateMetadata: false })
  if (pdf.getPageCount() > 200) throw new Error('monitoring_pdf_link_capacity')
  const urls = new Set<string>()
  let count = 0
  for (const page of pdf.getPages()) {
    const annotations = page.node.lookupMaybe(PDFName.of('Annots'), PDFArray)
    if (!annotations) continue
    for (let index = 0; index < annotations.size(); index++) {
      if (++count > 2_000) throw new Error('monitoring_pdf_link_capacity')
      const annotation = annotations.lookup(index, PDFDict)
      const action = annotation.lookupMaybe(PDFName.of('A'), PDFDict)
      if (action?.lookupMaybe(PDFName.of('S'), PDFName)?.asString() !== '/URI') continue
      const uri = action.lookup(PDFName.of('URI'))
      if (uri instanceof PDFString || uri instanceof PDFHexString) urls.add(uri.decodeText())
      if (urls.size > 500) throw new Error('monitoring_pdf_link_capacity')
    }
  }
  return [...urls]
}
