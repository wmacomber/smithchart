# ADR 0003: RF conventions and analytical solver

Status: Accepted

## Decision

Use conventions in `docs/conventions.md`; solve two `g=1` intersections analytically and reject failed residuals.

## Consequences

Quadrant and degeneracy tests gate changes.

## Rejected

General optimizer: opaque and unnecessary.

## Verification

`bun run verify:references && bun run test:rf`.
