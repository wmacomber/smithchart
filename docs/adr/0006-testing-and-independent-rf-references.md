# ADR 0006: Test and RF reference strategy

Status: Accepted

## Decision

Vitest, fast-check, alternate-formulation Python fixtures, published convention references, and Playwright. Equation assertion manifest gates release.

## Consequences

Equation changes require analytical production code, direct-transform/bounded-root verification, checked values, and published sign-convention provenance.

## Rejected

Snapshots, property tests, or a second copy of production equations alone: cannot establish RF correctness.

## Verification

`bun run ci` plus browser matrix.
