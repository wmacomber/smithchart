# Architecture

`src/rf` owns deterministic RF domain logic and imports nothing outside itself. `src/chart` owns SVG geometry and screen inversion. `src/app` owns reducer/history orchestration. `src/features` owns user workflows. `src/persistence` alone touches URL, storage, clipboard, and service workers.

Committed reducer state feeds solver and renderer. Input fields preserve raw transient strings. Chart drag uses preview state; release/Enter commits; Escape cancels. URL stores calculation and selected solution. Local storage stores preferences only.

Vite emits static assets. GitHub Pages serves `dist`. Service worker precaches same-origin application assets. No backend or runtime network API exists.
