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
- Historical deviation: desktop browser automation cannot synthesize VoiceOver or TalkBack gestures.
  Phase 8A policy supersedes the earlier manual gate: those sessions are recommended exploratory
  evidence, while cross-browser accessibility-tree/ARIA checks remain release evidence.

## Phase 5 matching visualization evidence — 2026-07-16

- Owner: Codex implementation; commit: pending user workflow.
- Commands/results: independent reference verifier, RF boundary check, format, lint, typecheck, 191 Vitest tests, production build, 13 Chromium visual snapshots, full 102-pass browser matrix with 30 expected browser/visual skips, full `bun run ci`, and `git diff --check` pass.
- Geometry evidence: all 12 reference cases and both terminations verify common SWR radius, clockwise feed sweep, solver junction endpoints, `g=1` stub samples, exact center endpoint, electrical/physical annotations, and A/B ordering.
- UX evidence: selected and overlay modes, URL-invariant comparison preference, responsive cards, complete clipboard/fallback text, residual diagnostics, matched/failure suppression, staged/reduced motion, SVG export, print, forced colors, and textual equivalents pass.
- Historical deviation: VoiceOver/TalkBack assistive-touch checks were deferred here. Phase 8A makes
  them recommended exploratory evidence rather than release gates.

## Phase 6 education and UX evidence — 2026-07-16

- Owner: Codex implementation; commit: pending user workflow.
- Commands/results: format, lint, typecheck, RF boundary, 12-case independent reference verification, 198 Vitest tests, production build, 17 Chromium visual baselines, and full Playwright matrix pass. Browser result: 127 passed with 38 expected non-Chromium visual, browser-limited clipboard, and generated-touch skips.
- Education evidence: dismissible/restartable four-step guide; categorized Learn and Examples dialogs; eleven typed topics and ten chart targets; nine validated presets; preference v4 migration; contextual keyboard/touch help; temporary URL-invariant chart explanations; stale-draft gating; matched/active states; selected and alternate construction workflow; responsive advanced details; complete clipboard/fallback output; and construction assumptions/warnings pass.
- Responsive/accessibility evidence: mobile chart/selected/input/alternate/advanced/warning order, mobile More actions disclosure, desktop grouped actions, axe serious/critical audit, keyboard focus and Escape behavior, reduced motion, forced colors, textual chart equivalents, and Chromium/Firefox/WebKit workflows pass.
- Deviation: no runtime dependency, URL parameter, or RF-core change. Earlier manual assistive-touch
  release-gate language is superseded by the Phase 8A automated-evidence policy.

## Phase 7A export, print, and offline evidence — 2026-07-16

- Owner: Codex implementation; commit: pending user workflow.
- Commands/results: full `bun run ci`, 200 Vitest tests, six-entry offline precache audit, 18 Chromium visual baselines, GitHub Pages-path offline smoke, `git diff --check`, and full Playwright matrix pass. Browser result: 134 passed with 40 expected non-Chromium visual, browser-limited clipboard, and generated-touch skips.
- Export/print evidence: active SVG content and external references are removed; standalone CSS, accessible prose, versioned JSON metadata, both construction texts, stale gating, solved/stale/matched worksheets, monochrome output, and package-derived version pass.
- Offline evidence: root offline reload passes in Chromium, Firefox, and WebKit; `/smithchart/` browser smoke and browser-independent base/worker-scope/precache audits pass. Installable PWA remains deferred.
- Deviation: Playwright WebKit direct offline navigation throws an internal error, so WebKit uses an in-page scheduled reload with identical cached-document and failed-static-asset assertions.

## Release readiness

- [ ] Product, mathematical, architecture, accessibility, export, offline, and engineering gates in `docs/release-checklist.md` complete.
- [ ] Reviewer records final acceptance.

Phase 8 local artifacts and deterministic build pass. Git tag, GitHub release, live Pages deployment, HTTPS smoke, rollback test, and reviewer acceptance remain external release gates.

## Phase 8A public-readiness evidence — 2026-07-17

- Owner: Codex implementation; commit pending user workflow.
- Documentation: README, architecture, GitHub-rendered mathematics/sign conventions, testing,
  accessibility, contribution, security, SemVer/changelog, release checklist, ADR index, and sanitized
  SVG ADR implemented. Curated 1440×900 desktop and 390×844 mobile screenshots generated through an
  isolated Playwright capture project.
- Community/legal: bug/feature/config issue forms and PR template expanded; MIT distribution copy added;
  551 locked packages and 10 browser-distribution notices verify through deterministic generation.
- Repository: public description, homepage, thirteen topics, and private vulnerability reporting set;
  visibility, MIT detection, Issues, HTTPS Pages, default branch, pinned workflow actions, secret
  scanning/push protection, and Dependabot security updates verified.
- Commands/results: format, lint, typecheck, RF boundary, 12-case/9-equation reference verifier,
  runtime-network scan, 207 Vitest tests, production build, asset/offline/license gates, 206-pass full
  browser matrix with 47 expected skips, Pages-path offline test, final `bun run ci`, clean Bun audit,
  live HTTPS 200 smoke, and reproducible digest
  `80c487ce672761782575bc6bd469786531a7aaf78d0cef381e64caf15576fa63` pass.
- Governance deviation: no monitored private maintainer mailbox exists. Expanded conduct policy uses
  GitHub's private abuse-report channel for sensitive GitHub incidents, states that reports go to
  GitHub, and reserves public mentions for non-sensitive moderation. Contributor Covenant 2.1 supplies
  the standards/enforcement basis but is adapted rather than adopted verbatim.
- Repository protection: `main` requires pull requests, current `validate` and dependency `review`
  checks, and resolved conversations. Zero external approvals preserve solo-maintainer merges. Admin
  enforcement is enabled; force-push and deletion are disabled.
- Release boundary: no tag or GitHub Release created. First-release rollback and reviewer acceptance
  remain approval-controlled external gates.
