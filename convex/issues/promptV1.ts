import type { IssueCandidateV1 } from './contractV1'

type IssueEvidenceRecord = {
  recordId: string
  sourceRecordId: string
  publicationVersionId: string
  payloadJson: string
  citations: Array<{
    citationId: string
    fieldPath: string
    excerpt: string
    page: number | null
    section: string | null
  }>
}

export function buildIssueLinkPromptV1(input: {
  records: IssueEvidenceRecord[]
}) {
  const evidence = input.records.map((record) => ({
    recordId: record.recordId,
    sourceRecordId: record.sourceRecordId,
    publicationVersionId: record.publicationVersionId,
    payload: JSON.parse(record.payloadJson) as unknown,
    citations: record.citations,
  }))
  return {
    messages: [
      {
        role: 'system' as const,
        content: [
          'You link atomic local-government decisions into one neutral resident issue.',
          'Use only the supplied published payloads and citation excerpts.',
          'Write for a resident who has not read the agenda. Use the named project, service, or place in the title when the citations establish it. Prefer that recognizable subject to an ordinance, resolution, contract, or project number. Preserve identifiers in sharedSignals and citations; use one in prose when needed to distinguish the subject.',
          'Use familiar words with the same meaning, such as property tax for ad valorem property tax, up to for not to exceed, and seek bids for advertise to receive bids. Do not invent acronym expansions, technical definitions, or background facts.',
          'Write summary as a short news brief. Lead with the latest action whose order is established by the supplied evidence, then explain the earlier decision needed to understand it. If the order is unknown, describe the supported actions without calling one the latest. Avoid openings such as The records cover and avoid repeating the title without adding information.',
          'Separate the continuing issue from its individual updates. Receiving a monthly ambulance report records receipt of that report. It does not establish a new contract or changed ambulance service. State the report period when supported. Do not call a proposal approved, an authorization completed, or a received report proof of satisfactory performance.',
          'Never merge records based on similar titles alone.',
          'Return one to five sharedSignals. Each value must contain 8 to 180 characters copied from the evidence. Use a longer exact project or counterparty phrase if a short identifier cannot meet that bound. Never pad an identifier or fabricate a shared signal.',
          'A shared signal must quote the same concrete identifier, counterparty, project, location, or transaction from citations that span every record.',
          "The government's own body name or home jurisdiction does not establish a link.",
          'Keep every input decision as a separate link. Do not invent an outcome, amount, deadline, consequence, or relationship.',
          'For importance, return all seven factors. Use absent with a blank rationale when the evidence does not support a factor.',
          'Use low, moderate, or high only when cited evidence supports the rationale.',
          'A non-absent importance rationale must state the documented consequence of the approved or proposed action. Naming only the subject is not enough.',
          'Residents read importance rationales under Why this may matter. Explain the supported scope, use of money, affected service or place, or decision stage instead of restating the title. Give each supported factor its own relevant detail where the evidence allows. A money rationale can explain a spending cap while an assets rationale explains what may be acquired. Do not invent effects or change a supported factor level to make the writing more interesting.',
          'Keep minor actions brief. A service name alone does not establish improved safety, shorter response times, new capacity, savings, or who will benefit. If the supplied evidence contains no further context, keep the explanation narrow rather than adding generic importance claims. Do not treat silence in an excerpt as proof that an effect does not exist.',
          'For public assets, say what the decision authorizes the government to transfer, acquire, sell, lease, or otherwise do with the asset, using only cited facts.',
          'Each material output field needs exactly one fact. Each fact names existing citation IDs.',
          'Use exactly these fact paths and no others: /title, /summary, /lifecycleState; /nextKnownAction/description and /nextKnownAction/at when those values are non-null; /topics/<index>; /links/<index>/reason; /sharedSignals/<index>/value; and /importanceFactors/<factor>/rationale for each non-absent factor.',
          'Do not return facts for a link recordId or relationship, a shared-signal kind, an importance factor name or level, an absent rationale, a null field, or an empty array.',
          'Before returning, derive the expected fact-path set from the completed candidate and confirm that facts contain each expected path exactly once.',
          'Every fact value must copy its corresponding output field exactly, character for character. Never paraphrase a field in its fact.',
          'Each fact citation set must support every actor, action, outcome, descriptor, date, amount, place, and relationship stated in the exact fact value. Include every excerpt needed when support is split across citations.',
          'If a fact says a decision was approved, adopted, decided, or received a vote, cite both the action being considered and the cited outcome or vote.',
          'If a fact names a government body or jurisdiction as the actor, cite an excerpt that names that actor or remove the actor from the field.',
          'Do not add a service, project, or transaction description unless the named citation excerpts state that description.',
          'For each non-absent importance factor, use /importanceFactors/<factor>/rationale as the fact path and copy the rationale exactly into fact.value.',
          'Link-reason facts need citations from that record and at least one other record. Cite both the shared subject and the documented action or outcome for every decision described in the reason.',
          'Use plain, nonpartisan language. Describe consequence and process, not whether a decision is good or bad.',
        ].join('\n'),
      },
      {
        role: 'user' as const,
        content: `PUBLICATION EVIDENCE BEGIN\n${JSON.stringify(evidence)}\nPUBLICATION EVIDENCE END`,
      },
    ],
  }
}

export function buildIssueReviewPromptV1(input: {
  candidate: IssueCandidateV1
  facts: Array<{
    fieldPath: string
    value: string
    citations: Array<{
      citationId: string
      recordId: string
      sourceRecordId: string
      fieldPath: string
      excerpt: string
      page: number | null
      section: string | null
    }>
  }>
}) {
  return {
    messages: [
      {
        role: 'system' as const,
        content: [
          'You independently review a proposed local-government issue.',
          'Judge every fact against only its cited excerpts. You cannot repair or replace candidate fields.',
          'Mark supported only when the excerpts directly support the exact value and the neutral wording.',
          'Plain-language paraphrases can be supported without repeating official jargon. Check that the paraphrase preserves the actor, subject, amount qualifications, scope, and procedural stage. Report receipt does not prove service quality; permission to purchase does not prove delivery. Do not treat a request for clearer writing as permission to accept inferred benefits or unsupported background.',
          'A link reason must have evidence from the named decision and at least one other decision.',
          'A shared signal must appear concretely in citations spanning every input decision.',
          'Importance rationales must describe a documented consequence. Do not infer missing amounts, affected people, deadlines, or outcomes.',
          'Use fail for an unsupported title, summary, link, shared signal, or any global integrity problem.',
          'Use limited when only secondary fields or importance factors are unclear or unsupported.',
          'Return exactly one check per supplied fact, using its exact fieldPath, and a verdict consistent with the checks and findings. Do not review additional paths from candidate fields. Before returning, compare the complete checks fieldPath set with the supplied facts fieldPath set; they must match exactly with no duplicates or omissions.',
        ].join('\n'),
      },
      {
        role: 'user' as const,
        content: `ISSUE CANDIDATE AND CITATIONS BEGIN\n${JSON.stringify(input)}\nISSUE CANDIDATE AND CITATIONS END`,
      },
    ],
  }
}
