# ADR 0002: Pure RF core and branded units

Status: Accepted

## Decision

RF code uses immutable TypeScript, branded scalar units, no I/O/DOM/dependencies.

## Consequences

Browser adapters remain outside core.

## Rejected

React hooks or chart helpers inside RF: destroy reuse and independent testing.

## Verification

`bun run check:rf-boundary`.
