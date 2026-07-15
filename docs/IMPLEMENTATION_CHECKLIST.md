# Implementation Checklist

Record owner, PR/commit, command evidence, and deviations for each phase. Never mark exit while required command fails. Architecture deviations require accepted ADR.

## Phase gates

- [x] Phase 0 — corrective review complete: conventions, derivations, contracts, alternate-formulation references, edge policy, and scope documented.
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

## Phase 0 corrective evidence — 2026-07-15

- Owner: Codex corrective mathematical review; commit pending user workflow.
- Commands/results: `python3 scripts/check-doc-links.py`, `bun run format:check`, `bun run lint`, `bun run typecheck`, `bun run check:rf-boundary`, `bun run verify:references`, `bun run test:rf`, `bun run test:chart`, `bun run ci`, and `git diff --check` pass.
- Reference evidence: 12 solved cases, both terminations, 9 named equation assertions, tagged edge cases, full intermediate/residual fixtures, direct-transform bounded-root Python verifier.
- External evidence: Orfanidis single-stub treatment, Keysight toward-generator Smith-chart examples, NIST traveling-wave framework, and scikit-rf real-reference reflection convention. scikit-rf 2.0.1 independently cross-checked four required project cases to `3.6e-16` maximum junction-admittance difference and below `1.6e-14` residual.
- Deviation: no external source publishes every project-specific fixture decimal. Published sources and four external tool checks confirm conventions/method; alternate formulation verifies remaining numeric fixtures. No claim equates project-authored Python with external authority.

## Release readiness

- [ ] Product, mathematical, architecture, accessibility, export, offline, and engineering gates in `docs/release-checklist.md` complete.
- [ ] Reviewer records final acceptance.

Phase 8 local artifacts and deterministic build pass. Git tag, GitHub release, live Pages deployment, HTTPS smoke, rollback test, and reviewer acceptance remain external release gates.
