# ADR 0004: Custom native SVG renderer

Status: Accepted

## Context

Chart requires project-owned geometry, interaction, accessibility, responsive density, and export.

## Decision

Generate Smith chart grid, paths, markers, and interactions mathematically with native SVG React components.

## Consequences

Project owns coordinate conversion, semantics, export, and performance.

## Rejected

Raster background and Smith-chart package: insufficient control. D3-owned RF or chart mathematics: duplicates ownership.

## Verification

Canonical coordinate tests, browser visual tests, and standalone SVG export in later phases.
