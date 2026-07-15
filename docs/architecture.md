# Architecture

Vite compiles React and TypeScript into static `dist/` assets. GitHub Pages serves those files from a configurable base path. Deployment contains no server runtime, backend, database, runtime API, or Bun-specific browser code.

Planned ownership:

- `src/rf`: deterministic RF domain logic; no React, browser, SVG, storage, URL, I/O, or third-party imports.
- `src/chart`: native SVG geometry and screen-coordinate inversion.
- `src/app`: reducer and workspace orchestration.
- `src/features`: user workflows.
- `src/persistence`: URL and browser preference adapters.

Phase 1 exposes only static `App`, build scripts, `BASE_PATH`, and `dist/` contracts. Later modules must preserve boundaries recorded in ADRs.
