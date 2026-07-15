# ADR 0009: Degenerate and active loads

Status: Accepted

## Decision

Matched gets dedicated state. Unit-circle loads get no-finite-passive-solution. Negative resistance is displayed and diagnosed but not solved.

## Consequences

Never fabricate duplicate or unstable construction lengths.

## Rejected

Duplicate A/B, silent rejection, arbitrary large open impedance.

## Verification

Tagged-result unit and browser tests.
