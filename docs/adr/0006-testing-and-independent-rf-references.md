# ADR 0006: Test and RF reference strategy

Status: Accepted

## Decision

Vitest, fast-check, independent Python fixtures, Playwright. Equation coverage manifest gates release.

## Consequences

Equation changes require two implementations and checked values.

## Rejected

Snapshots or property tests alone: cannot establish RF correctness.

## Verification

`bun run ci` plus browser matrix.
