# Conventions

## Engineering

- TypeScript strict mode; immutable domain values.
- LF, UTF-8, final newline, two-space indentation.
- Plain CSS with custom properties and ordered global entry files.
- Co-located unit tests; browser tests under `tests/e2e`.
- Direct dependencies pinned exactly; `bun.lock` committed.

## RF and coordinates

RF signs, units, rotations, and SVG-axis inversion follow `SMITH_CHART_SPA_PLAN.md`. RF code produces mathematical reflection coordinates. Only renderer code may invert the vertical axis for SVG. Phase 2 must make every convention executable through reference and property tests.
