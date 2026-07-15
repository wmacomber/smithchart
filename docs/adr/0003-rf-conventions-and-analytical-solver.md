# ADR 0003: RF conventions and analytical solver

Status: Accepted

## Context

Rotation signs, stub inverses, singularities, and two valid solutions create correctness risk.

## Decision

Use conventions locked by Phase 0. Solve two unit-conductance intersections analytically or through tightly bounded one-dimensional roots, then reject results failing residual checks.

## Consequences

Equation changes require independent references, fixtures, edge cases, and property tests.

## Rejected

General optimization: opaque and unnecessary for one-dimensional lossless matching.

## Verification

Independent reference verification and RF tests added in Phase 2.
