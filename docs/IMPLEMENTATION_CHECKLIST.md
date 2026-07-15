# Implementation Checklist

Record owner, PR or commit, command evidence, deployment URL, and deviations. Never mark a phase complete while required commands fail. Architecture deviations require an accepted ADR.

## Phase gates

- [x] Phase 0 — mathematical specification planned and documented.
- [ ] Phase 1 — frozen install, formatting, lint, types, unit, build, Chromium smoke, and Pages deployment pass.
- [ ] Phase 2 — RF core, references, properties, and residuals pass.
- [ ] Phase 3 — canonical chart geometry and responsive rendering pass.
- [ ] Phase 4 — workspace state, fields, interaction, URL, and preferences pass.
- [ ] Phase 5 — both matching solutions and visual/numerical agreement pass.
- [ ] Phase 6 — education, examples, mobile, and copy workflow pass.
- [ ] Phase 7 — export, print, offline policy, accessibility, and browser matrix pass.
- [ ] Phase 8 — reproducible release, documentation, licensing, deployment, and review pass.

## Phase 1 evidence

- Owner: Codex foundation implementation
- PR/commit: `phase-1-foundation` branch; commit and pull request pending user workflow
- Bun version: `1.3.14`
- Commands/results: frozen install, format check, lint, strict typecheck, Vitest, root build, `/smithchart/` build, Chromium smoke, and `git diff --check` pass locally
- Pages deployment URL: pending merge and Pages workflow
- Notes/deviations: host WSL advertises a missing Windows temporary directory, so local Vitest/Vite verification used `TMPDIR=/tmp`; CI scripts and application contracts remain as approved. GitHub CI, dependency review, Pages deployment, and hot-reload confirmation remain external gates.
