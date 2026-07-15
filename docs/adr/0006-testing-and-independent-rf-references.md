# ADR 0006: Testing and independent RF references

Status: Accepted

## Context

Internal tests alone can repeat incorrect RF equations and conventions.

## Decision

Use Vitest for deterministic tests, fast-check for invariants, independent fixtures and verifier for RF evidence, and Playwright for browser workflows.

## Consequences

RF changes require production tests, independent calculations, provenance, and residual evidence. Browser tests do not count as mathematical proof.

## Rejected

Snapshots, properties, or a second copy of production equations alone: insufficient independent evidence.

## Verification

Phase-specific unit, property, reference, and browser commands gate delivery.
