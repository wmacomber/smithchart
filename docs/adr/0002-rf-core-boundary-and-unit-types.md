# ADR 0002: Pure RF core and branded units

Status: Accepted

## Context

RF correctness and reuse require domain calculations independent from UI and browser state.

## Decision

Future `src/rf` code uses immutable TypeScript, branded scalar units where ambiguity warrants them, no I/O, DOM, React, SVG, storage, URL, or third-party dependencies.

## Consequences

Browser adapters and rendering remain outside RF core. Phase 2 adds automated boundary verification.

## Rejected

React hooks or chart helpers inside RF code: couple mathematics to presentation.

## Verification

Source-boundary check plus standalone RF TypeScript project in Phase 2.
