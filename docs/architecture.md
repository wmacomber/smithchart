# Architecture

Smith Match is a static React/TypeScript application. Bun installs dependencies and runs tools; Vite
emits browser assets. GitHub Pages serves `dist/`. No backend, database, account, analytics, or runtime
network API exists.

## Data flow

```text
URL calculation state ──► reducer/history ──► pure RF solver ──► chart + results
                                ▲                    │
localStorage preferences ───────┘                    └──► sanitized SVG/print output

static Vite build ──► GitHub Pages ──► service-worker application precache
```

Committed reducer state feeds solver and renderer. Input fields retain transient raw strings. Pointer
and keyboard manipulation creates RAF-bounded preview state; pointer release, Enter, or blur commits
once. Escape/cancellation restores the snapshot. Preview updates fields, solver, chart prose, marker,
tooltip, and matching geometry without entering URL or history.

Calculation state and selected solution use URL schema v1. Display preferences use versioned local
storage. Educational overlays are transient. Service-worker updates preserve the query string, so the
current calculation survives reload and offline navigation.

## Ownership boundaries

- `src/rf`: deterministic domain math, units, validation, and solver. Imports nothing outside itself;
  no I/O, DOM, state, clock, logging, or dependencies. Internal reusable code—not a published API.
- `src/chart`: SVG grid, geometry, coordinate inversion, label layout, and interaction transaction hook.
  It renders solver-owned junctions and lengths; it never solves them.
- `src/app`: calculation mapping, reducer, history, preview orchestration, and workspace composition.
- `src/features`: load/line input, results, examples, education, sharing, print, and export workflows.
- `src/persistence`: URL, local storage, clipboard/browser boundaries, and service-worker registration.
- `src/components` and `src/styles`: native accessible controls, layout, themes, print, and forced colors.

Shared construction formatting feeds visible results, clipboard output, fallback text, print, and
export metadata. Example/topic data owns content and expected status without duplicating RF math.

## Trust and distribution boundaries

The URL is untrusted input. Parsing validates each known field, rejects duplicate/unsupported versions,
and restores safe defaults with warnings. Local storage is optional and failures do not block calculation.

SVG is active content. Export clones and sanitizes the chart, strips executable/external content, adds
trusted static CSS, and escapes versioned metadata under [ADR 0010](adr/0010-sanitized-standalone-svg-export.md).

Vite generates same-origin hashed assets and a Workbox service worker. The worker precaches application
assets only; it has no runtime cache routes. First-ever offline loading and installable PWA behavior are
out of scope. See [ADR 0008](adr/0008-github-pages-and-offline-reload.md).

## Durable decisions

The [ADR index](adr/README.md) maps stack, RF, renderer, state, testing, UI, deployment, degenerate-load,
and export decisions to verification. Architecture changes require a superseding accepted ADR.
