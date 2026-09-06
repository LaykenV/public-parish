# Pineville current document discovery

Production checks repeatedly rejected city document-center item links after
they redirected to the official Pineville MuniDocs collection. Examples include
city document IDs 2298, 2306, and 2309. Other item links redirected to newspaper
articles, which remain outside the approved evidence boundary.

The three official destinations supplied MuniDocs node IDs `966943aa7ac8b`,
`96d232734efff`, and `9734ade6364fa`. Direct checks of the existing approved
product 31105 download path returned HTTP 200 and PDF bytes for all three.
The files contain 221,009, 208,536, and 433,036 bytes respectively. This proves
the document route, not a published decision or complete meeting inventory.

Monitoring now treats Pineville document-center URLs as discovery listings.
It follows numeric item links with Firecrawl and maps only the exact Pineville
MuniDocs collection and a valid node ID to the already approved PDF endpoint.
Newspaper redirects contribute no evidence URLs. Missing destinations within
the official collection remain incomplete checks. Each discovered PDF still
passes immutable retrieval, inventory, extraction, and publication review.

The owner can reclassify prior wrapper rows in pages of at most fifty while
the policy is paused. The operation preserves snapshots, incomplete inventory
state, and prior errors. It refuses any wrapper with decision targets. A
discovery-only marker excludes those rows from evidence work and baseline
completion checks; it does not mark their inventories complete. Restarting
discovery finds the actual PDFs through the normal monitored workflow.
