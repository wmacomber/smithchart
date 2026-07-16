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

## Phase 2 implementation evidence — 2026-07-15

- Owner: Codex implementation; commit: this change set.
- Commands/results: direct Python reference verification, `bun run verify:references`, `bun run test:rf`, `bun run check:rf-boundary`, `bun run typecheck`, `bun run lint`, `bun run format:check`, `bun run ci`, and `git diff --check` pass.
- RF evidence: 12 solved cases, both terminations, 9 equation assertions, 66 focused RF tests, finite-result residual gates, explicit canonical stub poles, and tagged edge classifications pass.
- Boundary evidence: standalone ES2022 compilation passes; package, React, JSX, DOM, storage, URL, network, timer, date, console, and browser-state access remain prohibited.
- Deviation: none.

## Phase 4B interaction evidence — 2026-07-16

- Owner: Codex implementation; commit: pending user workflow.
- Commands/results: `bun run test:chart` passes 40 chart tests; full `bun run test` passes 158 tests; targeted Playwright interaction, generated-touch, touch-target, keyboard, and accessibility matrix passes 34 tests with 2 expected CDP-only skips across Chromium, Firefox, and WebKit; `bun run build`, `bun run lint`, and `bun run typecheck` pass.
- Interaction evidence: offset/scaled/letterboxed pointer mapping, radial boundary clamp, optional pointer snapping, RAF previews, pointer capture outside chart, Escape cancellation, single history commit/undo, live fields/tooltip, fine/coarse keyboard movement, focus, accessible values, and 44 CSS-pixel mobile target pass.
- Deviation: desktop browser automation cannot validate VoiceOver or TalkBack gesture synthesis. iOS Safari plus VoiceOver and Android Chrome plus TalkBack remain documented manual release checks.

## Phase 5 matching visualization evidence — 2026-07-16

- Owner: Codex implementation; commit: pending user workflow.
- Commands/results: independent reference verifier, RF boundary check, format, lint, typecheck, 191 Vitest tests, production build, 13 Chromium visual snapshots, full 102-pass browser matrix with 30 expected browser/visual skips, full `bun run ci`, and `git diff --check` pass.
- Geometry evidence: all 12 reference cases and both terminations verify common SWR radius, clockwise feed sweep, solver junction endpoints, `g=1` stub samples, exact center endpoint, electrical/physical annotations, and A/B ordering.
- UX evidence: selected and overlay modes, URL-invariant comparison preference, responsive cards, complete clipboard/fallback text, residual diagnostics, matched/failure suppression, staged/reduced motion, SVG export, print, forced colors, and textual equivalents pass.
- Deviation: VoiceOver and TalkBack manual assistive-touch checks remain release-gate work per accessibility documentation.

## Phase 6 education and UX evidence — 2026-07-16

- Owner: Codex implementation; commit: pending user workflow.
- Commands/results: format, lint, typecheck, RF boundary, 12-case independent reference verification, 198 Vitest tests, production build, 17 Chromium visual baselines, and full Playwright matrix pass. Browser result: 127 passed with 38 expected non-Chromium visual, browser-limited clipboard, and generated-touch skips.
- Education evidence: dismissible/restartable four-step guide; categorized Learn and Examples dialogs; eleven typed topics and ten chart targets; nine validated presets; preference v4 migration; contextual keyboard/touch help; temporary URL-invariant chart explanations; stale-draft gating; matched/active states; selected and alternate construction workflow; responsive advanced details; complete clipboard/fallback output; and construction assumptions/warnings pass.
- Responsive/accessibility evidence: mobile chart/selected/input/alternate/advanced/warning order, mobile More actions disclosure, desktop grouped actions, axe serious/critical audit, keyboard focus and Escape behavior, reduced motion, forced colors, textual chart equivalents, and Chromium/Firefox/WebKit workflows pass.
- Deviation: no runtime dependency, URL parameter, or RF-core change. VoiceOver and TalkBack manual assistive-touch checks remain Phase 7/release-gate work.

## Release readiness

- [ ] Product, mathematical, architecture, accessibility, export, offline, and engineering gates in `docs/release-checklist.md` complete.
- [ ] Reviewer records final acceptance.

Phase 8 local artifacts and deterministic build pass. Git tag, GitHub release, live Pages deployment, HTTPS smoke, rollback test, and reviewer acceptance remain external release gates.
