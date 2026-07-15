# Implementation Checklist

Record owner, PR/commit, command evidence, and deviations for each phase. Never mark exit while required command fails. Architecture deviations require accepted ADR.

## Phase gates

- [x] Phase 0 — conventions, equations, ADRs, references, scope documented.
- [x] Phase 1 — frozen install, lint, types, unit, build, Chromium smoke pass.
- [x] Phase 2 — RF boundary, references, properties, residuals pass.
- [x] Phase 3 — canonical chart geometry and responsive rendering pass.
- [x] Phase 4 — fields, drag, keyboard, history, URL, preferences pass.
- [x] Phase 5 — A/B paths and numerical/visual agreement pass.
- [x] Phase 6 — examples, education, mobile, copy workflow pass.
- [x] Phase 7 — export, print, offline, browser matrix, accessibility pass.
- [ ] Phase 8 — reproducible release build, docs, licensing, deployment pass.

## Cross-cutting invariants

- [x] RF boundary check passes.
- [x] Reference equation coverage remains complete.
- [x] Both nondegenerate solutions remain exposed.
- [x] No runtime network dependency exists.
- [x] Keyboard and textual workflows match pointer workflow.
- [x] URL round trip remains backward compatible.

## Evidence template

- Owner:
- PR/commit:
- Command/result:
- Notes/deviation:

## Release readiness

- [ ] Product, mathematical, architecture, accessibility, export, offline, and engineering gates in `docs/release-checklist.md` complete.
- [ ] Reviewer records final acceptance.

Phase 8 local artifacts and deterministic build pass. Git tag, GitHub release, live Pages deployment, HTTPS smoke, rollback test, and reviewer acceptance remain external release gates.
