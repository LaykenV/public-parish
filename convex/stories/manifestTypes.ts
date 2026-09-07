// Contract 1.0.0. Runtime checks live in manifest.ts and the versioned JSON schema.
export type StoryManifest = {
  contractVersion: "1.0.0"
  bundleVersion: number
  bundleKey: string
  supersedesBundleSha256: string | null
  purpose: "research" | "fixture"
  story: {
    storyKey: "meta-richland" | "spacex-pecan-island" | "applied-digital-boyce"
    slug: string
    placement: "lead" | "secondary"
    rank: number
    geography: Array<{
      placeName: string
      parish: string
      state: "Louisiana"
      precisionNotes: string
    }>
    topics: Array<string>
  }
  sources: Array<{
    sourceKey: string
    bodyKey: string
    bodyName: string
    title: string
    url: string
    finalUrl: string
    documentType: "agenda" | "minutes" | "ordinance" | "resolution" | "notice" | "packet" | "permit" | "agreement" | "announcement" | "utility_proceeding" | "other_official_record"
    documentDate: string | null
    datePrecision: "day" | "month" | "year" | "unknown"
    rawArtifact: {
      uri: string
      sha256: string
      bytes: number
      contentType: string
    }
    normalizedArtifact: {
      uri: string
      sha256: string
      bytes: number
      contentType: string
    }
    retrieval: {
      method: "firecrawl" | "existing_snapshot" | "manual_file"
      retrievedAt: string
      providerReference: string | null
      redirectChain: Array<string>
      failureEvidence: Array<string>
      completeness: "complete" | "partial" | "unknown"
      completenessNotes: string
      pageMap: Array<{
        page: number
        start: number
        end: number
      }>
    }
    existingPublicationReferences: Array<{
      kind: "decision" | "issue" | "reviewed_fact"
      stableKey: string
      versionHash: string
      sourceHash: string
      citationKeys: Array<string>
      environmentHint: string | null
      idHint: string | null
    }>
  }>
  research: {
    proposedTitle: string
    proposedSummary: string
    claims: Array<{
      claimKey: string
      text: string
      supports: Array<{
        sourceKey: string
        normalizedSha256: string
        start: number
        end: number
        excerpt: string
        page: number | null
        section: string | null
      }>
    }>
    relationships: Array<{
      relationshipKey: string
      fromSourceKey: string
      toSourceKey: string
      kind: "announces" | "authorizes" | "supersedes" | "amends" | "related" | "contradicts"
      description: string
      supports: Array<{
        sourceKey: string
        normalizedSha256: string
        start: number
        end: number
        excerpt: string
        page: number | null
        section: string | null
      }>
    }>
    timeline: Array<{
      eventKey: string
      date: string | null
      datePrecision: "day" | "month" | "year" | "unknown"
      claimKeys: Array<string>
    }>
    knownUnknowns: Array<string>
    nextActionClaimKeys: Array<string>
    reviewedThrough: string
    nextReviewAt: string
    reviewResponsibility: string
    supportedQuestions: Array<{
      question: string
      claimKeys: Array<string>
    }>
    unsupportedQuestions: Array<{
      question: string
      reason: string
    }>
  }
  media: Array<{
    mediaKey: string
    artifact: {
      uri: string
      sha256: string
      bytes: number
      contentType: string
    }
    originalUrl: string
    credit: string
    permission: {
      status: "licensed" | "public_domain" | "owner_permission" | "unresolved"
      license: string | null
      evidenceUrl: string | null
      notes: string
    }
    kind: "photo" | "rendering" | "document_detail" | "diagram"
    caption: string
    alt: string
    width: number
    height: number
    captionClaimKeys: Array<string>
  }>
  additionalRetrieval: Array<{
    url: string
    reason: string
    requiredForClaimKeys: Array<string>
    estimatedUsd: number | null
    maxAttempts: number
    stopCondition: string
  }>
}
