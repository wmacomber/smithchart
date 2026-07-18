# ADR 0010: Sanitized standalone SVG export

Status: Accepted

## Context

SVG is active browser content. Cloning the live chart can retain scripts, event handlers, links,
external resources, embedded HTML/media, animation, unsafe URL values, and source styles. A downloaded
calculation also exposes user-entered RF values through visible prose and metadata.

## Decision

Export from a cloned SVG through an allowlist-oriented sanitizer. Remove active elements, external
references, event attributes, links, media, `foreignObject`, animation, and untrusted styles. Retain
project-owned geometry and internal fragment references. Add fixed project CSS, escaped versioned JSON
metadata, title, description, and complete text construction instructions. Fix filename and MIME type.

Treat export metadata schema changes as a documented compatibility boundary. Never serialize the live
DOM directly or trust user-controlled markup/CSS.

## Consequences

Export remains standalone and accessible without network resources. Sanitizer changes require hostile
fixtures and browser download parsing. Calculation values are intentionally present and must be called
out in privacy documentation.

## Rejected

- Raw `outerHTML`: retains active content and implementation-only state.
- Raster-only export: loses accessible text, scalable geometry, and machine-readable evidence.
- External styles or fonts: violates standalone and no-runtime-network guarantees.

## Verification

`bun run test -- src/features/exporting/serializeChart.test.ts` and Playwright export coverage must
reject active content while retaining trusted geometry, prose, internal definitions, and versioned
metadata. `bun run verify:no-runtime-network` remains clean.
