# Architecture

`src/rf` owns deterministic RF domain logic and imports nothing outside itself. `src/chart` owns SVG geometry, pointer inversion, constraints, and the interaction transaction hook. `src/app` owns load/reflection mapping plus reducer/history orchestration. `src/features` owns user workflows. `src/persistence` alone touches URL, storage, clipboard, and service workers.

Committed reducer state feeds solver and renderer. Input fields preserve raw transient strings. Chart pointer/keyboard manipulation uses RAF-bounded preview state; release, Enter, or keyboard blur commits once; Escape and pointer cancellation restore the snapshot. Preview feeds fields, solver, chart prose, marker, and tooltip without entering URL or history. URL stores calculation and selected solution. Local storage stores preferences only.

Vite emits static assets. GitHub Pages serves `dist`. Service worker precaches same-origin application assets. No backend or runtime network API exists.
