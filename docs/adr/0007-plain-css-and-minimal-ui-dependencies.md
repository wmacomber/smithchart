# ADR 0007: Plain CSS and minimal UI dependencies

Status: Accepted

## Context

Instrument UI needs precise styling and accessible behavior without dashboard-framework weight.

## Decision

Use plain CSS custom properties and native accessible HTML and SVG. Add focused UI dependencies only after native behavior proves insufficient and architecture review accepts need.

## Consequences

Small runtime, explicit styling ownership, and no component-framework design constraints.

## Rejected

CSS-in-JS, preprocessors, broad UI frameworks, and D3-owned chart geometry.

## Verification

Dependency review, accessibility tests, source inspection, and production bundle inspection.
