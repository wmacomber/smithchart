# ADR 0005: Reducer, URL, preferences

Status: Accepted

## Decision

Reducer/history owns committed calculation. URL v1 owns shareable calculation. Local storage owns display preferences only.

## Consequences

Preview/commit transaction prevents history flooding.

## Rejected

Global state library and opaque serialized blobs.

## Verification

URL, undo/redo, storage-denial, drag tests.
