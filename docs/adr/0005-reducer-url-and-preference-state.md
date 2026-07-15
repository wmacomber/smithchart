# ADR 0005: Reducer, URL, preferences

Status: Accepted

## Context

Calculation state must be deterministic, shareable, and separate from display preferences.

## Decision

React reducer owns committed calculation state. Versioned readable URL parameters own shareable calculation. Local storage owns display preferences only.

## Consequences

Preview and commit interactions must avoid history flooding. Released URLs remain backward compatible.

## Rejected

Global state library and opaque serialized URL blobs: unnecessary complexity and poor durability.

## Verification

Reducer, URL round-trip, storage-denial, undo/redo, and interaction tests in Phase 4.
