# Youngsville accessible meeting document type

Production retrieval rejected three official accessible meeting URLs with
`missing_content_type` on September 6. A separate Firecrawl retrieval reproduced
the result for the meeting with identifier `127667a1e3ba43a3abf3a382ea29357a`.
It returned HTTP 200, Markdown, and raw HTML without metadata.contentType.
A direct GET to the same official URL also returned HTTP 200 without a
Content-Type header. This is an origin behavior, not a reason to repeat extraction.

The raw artifact begins with an HTML doctype, an HTML element, and a head that
declares `text/html; charset=UTF-8` in its Content-Type meta element. The adapter
accepts that explicit declaration only for HTTPS `meetings.municode.com`, the
`/adaHtmlDocument/index` path, and `cc=YOUNGSVILA`. Both requested and retrieved
URLs must match. It requires one declaration in the first 4,096 characters of
the actual head and refuses conflicting declarations. Existing HTTP types take
precedence. Other missing types retain the existing failure.

Snapshots retain `contentTypeEvidence=municode_html_meta_v1` when this adapter
supplies the type. Firecrawl still retrieves the evidence. Immutable raw HTML,
status, approved-host checks, truncation checks, extraction, and independent
review still apply.
