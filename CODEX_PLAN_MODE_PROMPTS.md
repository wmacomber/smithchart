# Codex Plan-Mode Prompts

These prompts are intended to be used sequentially in Codex plan mode.

Each prompt assumes the repository contains `SMITH_CHART_SPA_PLAN.md` at its root. Codex should treat that document as the implementation authority unless a later prompt explicitly amends it.

Before using the first prompt:

1. Create an empty Git repository.
2. Add `SMITH_CHART_SPA_PLAN.md`.
3. Add this file as `CODEX_PLAN_MODE_PROMPTS.md`.
4. Start Codex in the repository root.
5. Use one prompt at a time.
6. Review the plan before permitting implementation.
7. Commit after each completed phase.

---

# Prompt 0: Repository assessment and implementation bible

```text
You are planning the implementation of this repository.

Read `SMITH_CHART_SPA_PLAN.md` in full. Treat it as the product, architecture, UX, mathematical, testing, accessibility, and delivery authority for this project.

The repository may currently be empty except for planning documents.

Your task is planning only. Do not implement code yet.

Produce a repository-specific implementation plan that:

1. Restates the non-negotiable product and architecture decisions.
2. Identifies ambiguities, mathematical risks, UX risks, and dependency risks.
3. Creates a phase-by-phase work breakdown aligned with the phases in `SMITH_CHART_SPA_PLAN.md`.
4. Defines exact deliverables and verification commands for each phase.
5. Defines the expected repository tree after each phase.
6. Identifies which work can be done independently and which work has strict prerequisites.
7. Proposes an implementation checklist file at `docs/IMPLEMENTATION_CHECKLIST.md`.
8. Proposes architecture decision records that should exist before implementation.
9. Defines a strict policy for keeping the RF core independent of React and browser APIs.
10. Defines a strict policy for verifying all RF equations against independent reference cases.
11. Defines a release-readiness checklist.
12. Notes any plan changes you recommend, but do not silently change the product scope.

The plan must be detailed enough that another coding agent could execute each phase without inventing architecture.

Do not initialize the project and do not modify files. Return the plan for review.
```

---

# Prompt 1: Mathematical specification

```text
Plan Phase 0: mathematical specification.

Read:

- `SMITH_CHART_SPA_PLAN.md`
- `docs/IMPLEMENTATION_CHECKLIST.md`, if it exists
- Any existing ADRs or mathematical documentation

Your task is planning only. Do not implement code yet.

Create a detailed plan for completing the mathematical specification before UI work begins.

The plan must cover:

1. Complex-number conventions.
2. Impedance and admittance normalization.
3. Reflection-coefficient conversion.
4. Transmission-line rotation toward the generator.
5. SVG coordinate conventions and where vertical-axis inversion is allowed.
6. Shunt open-circuit stub equations.
7. Shunt short-circuit stub equations.
8. How to derive and identify both valid solutions within one half wavelength.
9. Analytical versus bounded numerical solution strategy.
10. Singularities and degenerate cases.
11. Floating-point tolerances.
12. Unit representation and conversion.
13. Exact data structures for solver input, output, and diagnostics.
14. At least ten independent reference cases, including edge cases.
15. An independent Python verification script.
16. Property-based invariants.
17. Required documentation in:
    - `docs/mathematics.md`
    - `docs/conventions.md`
    - `docs/testing.md`
18. Phase exit criteria and exact verification steps.

Explicitly identify any equation or sign convention that requires independent confirmation.

Do not write implementation code. Return the mathematical-specification plan for review.
```

---

# Prompt 2: Project foundation

```text
Plan Phase 1: project foundation.

Read the complete planning documents and current repository state.

Your task is planning only. Do not implement code yet.

Plan the repository foundation using:

- Bun as package manager and script runtime
- React
- TypeScript
- Vite
- Vitest
- Playwright
- fast-check
- ESLint
- Prettier
- Plain CSS
- GitHub Actions
- GitHub Pages
- MIT License

The plan must specify:

1. Exact initialization approach.
2. Proposed `package.json` scripts.
3. TypeScript configuration structure.
4. Vite configuration.
5. Vitest configuration.
6. Playwright configuration.
7. ESLint and formatting configuration.
8. CSS entry structure.
9. Initial React application shell.
10. Test directory conventions.
11. GitHub Actions CI workflow.
12. GitHub Pages deployment workflow.
13. Dependency-review workflow.
14. Repository documentation skeleton.
15. Initial ADR files.
16. Bun version-pinning policy.
17. Dependency version policy.
18. Static-host base-path handling for GitHub Pages.
19. Verification commands.
20. Expected file tree after implementation.
21. Phase exit criteria.

The plan must avoid unnecessary dependencies and must not introduce a server runtime.

Do not modify files. Return the foundation plan for review.
```

---

# Prompt 3: RF core implementation

```text
Plan Phase 2: RF calculation core.

Read:

- `SMITH_CHART_SPA_PLAN.md`
- Mathematical documentation
- Conventions
- Existing tests and repository structure
- Implementation checklist

Your task is planning only. Do not implement code yet.

Plan the complete pure TypeScript RF core.

The plan must include:

1. Module boundaries under `src/rf`.
2. Complex arithmetic API.
3. Quantity and branded-type strategy.
4. Impedance normalization.
5. Admittance conversion.
6. Reflection-coefficient conversion.
7. Transmission-line transformation.
8. Open shunt-stub calculation.
9. Short shunt-stub calculation.
10. Two-solution solver.
11. Solver residual verification.
12. Error and result types.
13. Edge-case handling.
14. Numerical-tolerance policy.
15. Unit conversion.
16. Unit tests.
17. Property-based tests.
18. Reference fixture format.
19. Independent Python verification.
20. Public API exposed by the RF package.
21. Prohibited dependencies and imports.
22. Exact verification commands.
23. Phase exit criteria.

Require the RF core to remain independent of React, SVG, DOM APIs, local storage, URL APIs, and browser state.

Do not write code. Return the RF-core implementation plan for review.
```

---

# Prompt 4: Smith chart geometry and static renderer

```text
Plan Phase 3: Smith chart geometry and static SVG renderer.

Read all current planning, mathematical, architectural, and RF-core files.

Your task is planning only. Do not implement code yet.

Plan the chart geometry and static SVG renderer.

Cover:

1. Reflection-coefficient coordinate system.
2. SVG screen-coordinate mapping.
3. Resistance-circle generation.
4. Reactance-arc generation.
5. Admittance-grid rotation.
6. Grid clipping.
7. Responsive sizing.
8. Adaptive grid density.
9. Label placement.
10. Label collision avoidance.
11. Layer structure.
12. Theme tokens.
13. Print behavior.
14. SVG accessibility baseline.
15. Export-readiness.
16. Memoization and render-performance strategy.
17. Renderer unit tests.
18. Canonical-point tests.
19. Visual regression cases.
20. Exact component and module structure under `src/chart`.
21. Verification commands.
22. Phase exit criteria.

Do not implement interaction yet. The chart may render a fixed test load and fixed example paths only when useful for verification.

Do not modify files. Return the renderer plan for review.
```

---

# Prompt 5: Workspace state, inputs, and URL model

```text
Plan Phase 4A: workspace state, input handling, and URL persistence.

Read all project documents and implementation completed so far.

Your task is planning only. Do not implement code yet.

Plan:

1. Workspace state shape.
2. Reducer actions and invariants.
3. Raw, parsed, and committed numeric-input state.
4. Impedance input mode.
5. Admittance input mode.
6. Reflection-coefficient input mode.
7. Cross-representation synchronization.
8. Validation behavior.
9. Characteristic-impedance input.
10. Frequency input with units.
11. Velocity-factor input.
12. Stub termination selection.
13. Selected-solution state.
14. Display-mode state.
15. Unit preferences.
16. URL schema.
17. Canonical URL serialization.
18. URL parsing and error recovery.
19. Backward-compatible URL-version strategy.
20. `localStorage` preference policy.
21. Undo and redo scope.
22. Tests for reducer behavior.
23. Tests for numeric editing edge cases.
24. Tests for URL round trips.
25. Accessibility requirements for all input controls.
26. Exact component/module structure.
27. Verification commands.
28. Phase exit criteria.

Do not implement chart dragging in this phase plan.

Do not modify files. Return the state-and-input plan for review.
```

---

# Prompt 6: Interactive chart manipulation

```text
Plan Phase 4B: interactive Smith chart manipulation.

Read the current repository, chart geometry, workspace state, and accessibility plan.

Your task is planning only. Do not implement code yet.

Plan complete direct manipulation of the load marker.

Cover:

1. Pointer-event model.
2. Mouse interaction.
3. Touch interaction.
4. Pointer capture.
5. Conversion from screen position to reflection coefficient.
6. Conversion from reflection coefficient to load impedance.
7. Boundary clamping.
8. Optional snapping.
9. Fine and coarse keyboard movement.
10. Focus behavior.
11. Cancel and commit behavior.
12. Live tooltip behavior.
13. Synchronization with numeric fields.
14. Interaction performance.
15. Reduced-motion behavior.
16. Accessible names and live announcements.
17. Mobile touch-target sizing.
18. Unit tests for pointer mapping.
19. Playwright interaction tests.
20. Browser compatibility risks.
21. Exact files and hooks to add.
22. Verification commands.
23. Phase exit criteria.

Do not modify files. Return the interaction plan for review.
```

---

# Prompt 7: Matching visualization and result presentation

```text
Plan Phase 5: matching visualization and result presentation.

Read the RF solver, chart renderer, state model, and current UX documentation.

Your task is planning only. Do not implement code yet.

Plan the full visualization of both stub-matching solutions.

Cover:

1. Constant-SWR circle.
2. Feed-line transformation paths.
3. Direction toward the generator.
4. The two `g = 1` intersections.
5. Solution A and Solution B visual identities.
6. Stub-junction markers.
7. Stub-susceptance paths.
8. Center-match marker.
9. Electrical-angle labels.
10. Physical-length labels.
11. Solution selection.
12. Overlay comparison mode.
13. Construction-oriented result text.
14. Advanced diagnostics.
15. Already-matched behavior.
16. Degenerate-solution behavior.
17. Numerical residual display.
18. Optional step animation.
19. Reduced-motion alternative.
20. Copy-to-clipboard result text.
21. URL synchronization.
22. Responsive result cards.
23. Visual regression tests.
24. Solver-to-renderer consistency tests.
25. Accessibility and textual equivalents.
26. Exact components and modules.
27. Verification commands.
28. Phase exit criteria.

Do not modify files. Return the matching-visualization plan for review.
```

---

# Prompt 8: Educational UX and examples

```text
Plan Phase 6: educational UX, examples, and refinement.

Read the complete product plan and the implemented application state.

Your task is planning only. Do not implement code yet.

Plan:

1. First-use experience.
2. Learn panel structure.
3. Contextual explanations.
4. “Show this on the chart” behavior.
5. Example preset data model.
6. Required presets.
7. Tooltips.
8. Progressive disclosure.
9. Beginner versus advanced information hierarchy.
10. Practical construction warnings.
11. Empty, invalid, and already-matched states.
12. Mobile layout refinements.
13. Desktop layout refinements.
14. Responsive advanced panel.
15. Discoverability of both solutions.
16. Help for units and velocity factor.
17. Copyable instructions.
18. Accessibility of educational content.
19. Tests for presets.
20. Browser tests for onboarding.
21. Content files and component structure.
22. Verification commands.
23. Phase exit criteria.

The application should remain useful to an experienced operator while being understandable to someone returning to RF after a long absence.

Do not modify files. Return the educational-UX plan for review.
```

---

# Prompt 9: Export, print, and offline behavior

```text
Plan Phase 7A: export, print, and offline behavior.

Read the current application and project plan.

Your task is planning only. Do not implement code yet.

Plan:

1. SVG export.
2. Export sanitization.
3. Embedded styles in exported SVG.
4. Exported chart metadata.
5. Copyable plain-text construction instructions.
6. Print stylesheet.
7. Printable calculation worksheet.
8. Application-version display.
9. Static-asset behavior.
10. Offline use after first load.
11. Whether a service worker is justified for v1.
12. PWA deferral or inclusion decision.
13. GitHub Pages path handling.
14. Export tests.
15. Print-oriented browser tests.
16. Offline smoke tests.
17. Security considerations for generated downloads.
18. Exact modules and files.
19. Verification commands.
20. Phase exit criteria.

Keep the architecture serverless and static.

Do not modify files. Return the export-and-offline plan for review.
```

---

# Prompt 10: Accessibility and cross-browser hardening

```text
Plan Phase 7B: accessibility and cross-browser hardening.

Read:

- `SMITH_CHART_SPA_PLAN.md`
- `docs/accessibility.md`
- Current components and tests
- Current Playwright configuration

Your task is planning only. Do not implement code yet.

Plan a complete accessibility and browser-hardening pass.

Cover:

1. Keyboard-only workflow.
2. Focus order.
3. Focus visibility.
4. Interactive SVG semantics.
5. Textual chart summary.
6. Live-region announcements.
7. Numeric input semantics.
8. Unit announcements.
9. Error-message association.
10. Color contrast.
11. Non-color visual distinctions.
12. Reduced motion.
13. High-contrast and forced-colors modes.
14. Touch target sizing.
15. Zoom and text scaling.
16. Screen-reader testing strategy.
17. axe-core automation.
18. Chromium coverage.
19. Firefox coverage.
20. WebKit coverage.
21. Mobile viewport coverage.
22. Visual regression scope.
23. Known SVG browser differences.
24. Performance checks.
25. Error-boundary behavior.
26. Exact verification commands.
27. Phase exit criteria.

Do not modify files. Return the hardening plan for review.
```

---

# Prompt 11: Documentation and public repository readiness

```text
Plan Phase 8A: documentation and public repository readiness.

Read all repository documents, source code, tests, workflows, and current implementation checklist.

Your task is planning only. Do not implement code yet.

Plan the final public documentation and repository polish.

Cover:

1. README structure.
2. Project screenshot strategy.
3. Live-demo link.
4. Quick-start instructions using Bun.
5. Development commands.
6. Architecture overview.
7. Mathematical documentation.
8. Sign conventions.
9. Testing documentation.
10. Accessibility documentation.
11. Contribution guide.
12. Security policy.
13. Code of conduct.
14. Issue templates.
15. Pull-request template.
16. ADR completeness.
17. Changelog strategy.
18. Versioning policy.
19. License notices.
20. Dependency-license review.
21. Attribution requirements.
22. Repository topics and description.
23. Release checklist.
24. Documentation verification.
25. Phase exit criteria.

Do not modify files. Return the public-readiness plan for review.
```

---

# Prompt 12: Full-system verification and release plan

```text
Plan Phase 8B: full-system verification and v1.0 release.

Read the entire repository and all planning documents.

Your task is planning only. Do not implement code yet.

Produce a complete release-verification plan.

The plan must include:

1. Clean-clone reproducibility.
2. Bun version verification.
3. Frozen-lockfile installation.
4. Linting.
5. Formatting.
6. Type checking.
7. Unit tests.
8. Property-based tests.
9. Reference-case verification.
10. Independent Python cross-check.
11. Production build.
12. Bundle inspection.
13. Static preview.
14. Playwright browser matrix.
15. Accessibility checks.
16. Mobile checks.
17. SVG export checks.
18. Print checks.
19. URL-sharing checks.
20. Offline checks.
21. GitHub Pages deployment validation.
22. License review.
23. Dependency review.
24. Documentation review.
25. Changelog and release notes.
26. Git tag and GitHub release.
27. Rollback plan.
28. Post-release smoke test.
29. Known-limitations section.
30. Exact pass/fail criteria for v1.0.

Do not modify files. Return the release plan for review.
```

---

# Prompt 13: Comprehensive implementation audit

Use this after all phases appear complete.

```text
Perform a comprehensive planning audit of the implemented repository.

Read:

- `SMITH_CHART_SPA_PLAN.md`
- `CODEX_PLAN_MODE_PROMPTS.md`
- `docs/IMPLEMENTATION_CHECKLIST.md`
- All ADRs
- All mathematical documentation
- All source code
- All tests
- All workflows
- All public documentation

Your task is planning and audit only. Do not modify files yet.

Compare the repository against every requirement in the product plan.

Produce:

1. A requirement-by-requirement compliance matrix.
2. Missing features.
3. Incomplete features.
4. Mathematical risks.
5. UX risks.
6. Accessibility gaps.
7. Browser compatibility gaps.
8. Test coverage gaps.
9. Documentation gaps.
10. Dependency and licensing concerns.
11. Performance concerns.
12. Security concerns.
13. Static-hosting concerns.
14. Release blockers.
15. Non-blocking follow-up work.
16. A prioritized remediation plan.
17. Exact verification steps after remediation.

Be skeptical. Do not infer completion merely because a file or test exists. Inspect implementation behavior and test quality.

Do not modify files. Return the audit for review.
```

---

# Prompt 14: Remediation implementation plan

Use this after reviewing the comprehensive audit.

```text
Plan remediation of all accepted findings from the latest comprehensive implementation audit.

Read the audit, current repository, implementation checklist, and product plan.

Your task is planning only. Do not modify files yet.

For each accepted finding:

1. Identify the root cause.
2. Identify affected files.
3. Define the smallest correct fix.
4. Define required tests.
5. Define regression risks.
6. Define verification commands.
7. Define whether documentation must change.
8. Define whether an ADR must change.
9. Assign a priority.
10. Group fixes into safe implementation batches.

Preserve the architecture and scope unless a finding demonstrates that a change is required for correctness, accessibility, or release readiness.

Return the remediation plan for review.
```

---

# Prompt 15: Post-v1 roadmap planning

Use this only after v1.0 is released.

```text
Plan the post-v1 roadmap for the interactive Smith chart application.

Read the product plan, current implementation, issue backlog, and v1.0 release notes.

Your task is planning only. Do not implement code.

Evaluate these possible additions:

- Series-stub matching
- Lumped-element L networks
- Frequency sweeps
- Touchstone `.s1p` import
- VNA trace visualization
- Lossy transmission-line modeling
- Component Q
- Stub loss
- Multiple frequency markers
- Microstrip calculators
- Printable cut-and-trim worksheets
- JSON import and export
- PWA installation
- Localization
- Saved local workspaces

For each candidate:

1. User value.
2. Mathematical complexity.
3. UX complexity.
4. Architecture impact.
5. Testing burden.
6. Dependency impact.
7. Whether it preserves the product’s clarity.
8. Recommended priority.
9. Prerequisites.
10. Suggested release grouping.

Recommend a restrained roadmap. Do not turn the application into a general RF simulator without explicit justification.

Return the roadmap plan for review.
```

---

# Execution discipline for Codex

For every implementation phase after its plan is approved, use an implementation instruction with this structure:

```text
Implement the approved plan for Phase <number/name>.

Before changing files:

1. Re-read `SMITH_CHART_SPA_PLAN.md`.
2. Re-read `docs/IMPLEMENTATION_CHECKLIST.md`.
3. Re-read the approved phase plan.
4. Inspect the current repository state.
5. Confirm that the planned changes do not violate existing architecture decisions.

During implementation:

- Keep the RF core independent of React and browser APIs.
- Do not add dependencies without documenting why they are needed.
- Do not silently change mathematical conventions.
- Add or update tests with every behavior change.
- Update documentation when behavior or architecture changes.
- Keep `docs/IMPLEMENTATION_CHECKLIST.md` current.
- Do not leave placeholder production code.
- Do not weaken tests merely to make them pass.
- Do not skip browser or accessibility verification when the phase requires it.

After implementation:

1. Run all phase-specific verification commands.
2. Run lint.
3. Run type checking.
4. Run unit tests.
5. Run the production build.
6. Run relevant browser tests.
7. Run `git diff --check`.
8. Summarize files changed.
9. Summarize tests added.
10. Report verification results.
11. Report any deviations from the approved plan.
12. Report remaining checklist items.
```

This separation keeps planning deliberate while making each implementation step auditable.
