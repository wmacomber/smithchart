# Architecture

`src/rf` owns deterministic RF domain logic and imports nothing outside itself. `src/chart` owns SVG geometry, pointer inversion, constraints, and the interaction transaction hook. `src/app` owns load/reflection mapping plus reducer/history orchestration. `src/features` owns user workflows. `src/persistence` alone touches URL, storage, clipboard, and service workers.

Committed reducer state feeds solver and renderer. Input fields preserve raw transient strings. Chart pointer/keyboard manipulation uses RAF-bounded preview state; release, Enter, or keyboard blur commits once; Escape and pointer cancellation restore the snapshot. Preview feeds fields, solver, chart prose, marker, tooltip, and matching geometry without entering URL or history. URL stores calculation and selected solution. Local storage stores preferences only, including selected-path versus two-path overlay view.

`src/chart/matchingGeometry.ts` converts solver-owned junctions and lengths into SVG points and paths. Renderer does not solve intersections or stub lengths. Shared result-text formatting feeds visible construction prose, clipboard output, and fallback text.

Phase 6 education is data-driven. `src/features/tutorial/topics.ts` owns typed topic copy and chart targets; Learn and onboarding components render that content without RF logic. Workspace owns transient dialog, tour, draft-validity, and chart-education state. Educational chart overlays never enter calculation history, URL state, or preferences. Only first-use dismissal persists, using preference schema v4 with v1-v3 migration.

Example definitions own calculation payload, category, learning goal, and expected solver status. Applying an example is one calculation-history transaction, resets selection to A, and preserves display preferences. Advanced result presentation reads solver output only; it does not recalculate junction or residual values.

Vite emits static assets. GitHub Pages serves `dist`. Service worker precaches same-origin application assets. No backend or runtime network API exists.
