# ADR 0007: UI dependencies

Status: Accepted

## Decision

Plain CSS custom properties and native accessible HTML/SVG. React Aria may be wrapped where native behavior proves insufficient. D3 absent in v1.

## Consequences

Small runtime and one geometry owner.

## Rejected

Dashboard framework and D3-owned chart math.

## Verification

Dependency review, accessibility tests, source inspection.
