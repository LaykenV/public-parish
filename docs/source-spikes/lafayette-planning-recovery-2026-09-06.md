# Lafayette planning document recovery, September 6, 2026

The event service returned 200 during the September 6 recheck after earlier
502 responses. Event pages linked agenda attachments with opaque identifiers.
Several agendas contained PDF hyperlinks to action summaries that the event
page did not list. These official links supplied the missing outcome samples.

The checked [v4 sample manifest](../coverage-gold-sets/launch-bodies.v4.json)
records the exact document URLs. Direct downloads and PDF inspection established
the research findings below. They do not establish Firecrawl retrieval,
validated publication, or production coverage certification.

| Body | Paired extraction sample | Historical documents | Outcome source |
| --- | --- | --- | --- |
| City Zoning Commission | August 17, case 2026-16-REZ | July 20 agenda and minutes | Event attachment records deferral to September 21 |
| Board of Zoning Adjustment | August 13, case 2026-29-BOZ | July 9 agenda and action summary | Scanned action summary records approval, 4 to 1 |
| City Planning Commission | July 20, case 2026-4-VAC | June 15 agenda and action summary | Scanned action summary records a carried motion |
| Parish Planning Commission | July 13, case 2026-37-PC | June 8 agenda and action summary | Action summary records the motion, conditions, and vote |
| Hearing Examiner | July 10 agenda, case 2026-57-HE, and July action summary | June 12 agenda and June action summary | Monthly report records preliminary and final action and approved waivers |

The City and Parish Planning and Hearing Examiner samples retain their latest
retrieved August agendas. The latest outcome samples recovered for these bodies
cover July. The Hearing Examiner reports name a month, not an individual hearing
date. Their manifest entries deliberately omit `meetingDate`; the printed case
number establishes the agenda/outcome match. The `minutes` source kind includes
these official records of actions taken, without representing them as verbatim
minutes or as a subsequent commission vote.

The July BOZA historical action summary appears to print 2025 case numbers where
the agenda uses 2026. It is a retrieval/history sample, not the extraction pair.
The August case pair uses the same printed identifier in both documents.

The previous combined planning body keeps its calendar-only samples. It must
not borrow the separate City or Parish commission decisions.

## Certification still required

Each body must pass the existing retrieval, immutable snapshot, citation,
independent review, negative-case, source-link, and coverage checks. No gate or
publication rule changes. The recovered links do not by themselves change a
body's supported status.

Future monitoring must discover both opaque event attachments and action-summary
links embedded in PDFs. Certification of this finite sample does not prove that
future-document discovery works. Inspect that path before declaring unattended
coverage complete.
