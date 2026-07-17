# Testing

## RF evidence model

Passing production tests establishes internal consistency, not independent correctness. Phase 0 uses three distinct evidence layers:

1. Published RF references confirm sign conventions, line direction, Smith-chart orientation, and stub method.
2. Standard-library Python computes fixture values through direct transmission-line transformation and bounded roots.
3. TypeScript tests compare production analytical results with those checked-in values and assert properties over generated inputs.

Production and verifier must not share the analytical (g=1) intersection, phase-distance implementation, or `atan2` stub inverse.

## Reference fixtures

`tests/reference-cases/cases.json` contains twelve nondegenerate passive cases. Each records:

- Complete input and tolerance.
- Method, locator, convention, and external-confirmation metadata.
- Normalized load and load reflection coefficient.
- Two ordered junctions.
- Junction impedance/admittance and required stub susceptance.
- Open and short stub lengths.
- Physical lengths.
- Final admittance, reflection coefficient, and residual.

`schema.json` defines structural contract. Verifier also performs dependency-free structural validation, uniqueness checks, canonical interval checks, and provenance checks. `edge-cases.json` covers matched, open, short, pure-reactive, active, invalid, non-finite, and near-boundary classifications.

Fixture tolerance is

\[
|a-b|\le\epsilon_{abs}+\epsilon_{rel}\max(1,|a|,|b|).
\]

Default absolute/relative values are `1e-9`; named ill-conditioned cases use `1e-8`.

## Independent Python verifier

`scripts/verify-reference-cases.py`:

- Imports no application module or third-party package.
- Uses direct sine/cosine line impedance transformation.
- Finds (g=1) roots only inside `[0, 0.5λ)` using deterministic subdivision and bisection.
- Refines distance to `1e-14λ`.
- Numerically inverts open/short stub equations on bounded monotonic branches.
- Recomputes final admittance and reflection.
- Verifies edge classification independently.
- Binds every equation ID to code that executes an assertion.
- Rejects duplicate IDs, missing metadata, invalid terminations, duplicate/missing solutions, insufficient cases, or failed residuals.

Equation labels alone never count as coverage.

## TypeScript deterministic tests

Vitest covers:

- Scaled complex arithmetic and exact-zero division behavior.
- Normalization and dimensional conversion.
- Impedance/admittance reflection forms and singular points.
- Reflection rotation against direct line transformation.
- Stub equations and inverse branches.
- Solver ordering, residuals, physical classification, and numerical failure.
- Every reference intermediate and edge fixture.
- Mathematical-to-SVG coordinate inversion.
- Client-to-viewBox pointer mapping across offsets, responsive scaling, and letterboxing.
- Reflection constraints, pointer snapping, keyboard steps, and load/reflection interaction mapping.
- Matching renderer geometry: common SWR radius, clockwise feed sweep, solver junction endpoints, constant-conductance stub samples, exact center endpoint, label separation, and solver-owned annotation values.

## Property tests

fast-check asserts:

- Impedance/reflection and impedance/admittance round trips.
- Agreement of impedance and admittance reflection forms.
- Rotation magnitude, composition, zero identity, and half-wave periodicity.
- Agreement between reflection rotation and direct line transformation.
- Stub inverse identity and open/short quarter-wave equivalence.
- Unit-conductance junctions, susceptance cancellation, canonical lengths, A/B ordering, and final residual.
- Common impedance-scale invariance.
- Frequency/velocity-factor physical scaling.
- Degree/wavelength and meter/foot conversions.

Generators exclude declared singular domains explicitly. Deterministic cases cover excluded boundaries.

## Other verification

- `bun run test:chart`: canonical geometry and single SVG inversion.
- `bun run check:rf-boundary`: RF core remains DOM, React, SVG, URL, storage, and dependency free.
- Playwright covers application workflows but is not mathematical evidence.
- Playwright interaction coverage proves preview/commit/cancel transactions, pointer capture, live field and tooltip synchronization, keyboard fine/coarse movement, snapping, focus, and mobile target sizing across the configured browser matrix.
- Matching Playwright coverage proves A/B selection, comparison without URL drift, reduced-motion final state, textual equivalents, complete clipboard text, responsive card order, SVG export, print, and visual states for both terminations.
- Education unit coverage proves nine unique presets, expected matched/solved classifications, two-solution residuals, termination/system coverage, URL round trips, preference v4 migration, and complete typed Learn targets.
- Education Playwright coverage proves first-use persistence and restart, four-step navigation, explicit example application, every topic-to-chart mapping, URL-invariant highlights, accessible contextual help, stale-result gating, matched/active states, mobile action disclosure, clipboard fallback, and axe checks.
- Visual baselines cover first-use mobile layout, desktop Learn, chart education highlighting, open advanced results, matched state, and the existing chart/matching matrix.
- Accessibility Playwright coverage scans solved, invalid, matched, no-passive, dialog, dark-theme, mobile, and expanded-summary states against WCAG-tagged axe rules. ARIA-tree assertions replace manual screen-reader release requirements.
- Browser projects cover desktop Chromium, Firefox, and WebKit plus Pixel-class Chromium and iPhone-class WebKit. Runtime SVG tests reject interactive `foreignObject`, verify accessible title/description and unique definitions, and exercise pointer capture and responsive geometry.
- Performance budgets cap dense chart nodes below 100, main JavaScript at 100 KiB gzip, CSS at 8 KiB gzip, precache at 350 KiB, warm Chromium LCP at 2.5 seconds, CLS at 0.1, and marker interaction long tasks at 50 ms.
- Export unit coverage treats SVG as active content: scripts, handlers, external references, injected styles, media, links, and `foreignObject` are removed while geometry, clip paths, markers, trusted style, accessible prose, and versioned JSON metadata remain.
- Export Playwright coverage parses downloaded standalone SVG metadata, proves both complete construction texts, checks stale-draft gating, and verifies solved, stale, and matched print worksheets across Chromium, Firefox, and WebKit.
- Offline Playwright coverage waits for worker activation, disables network, and reloads the same query-backed calculation from precache in Chromium, Firefox, and WebKit. WebKit uses an in-page scheduled reload because direct Playwright offline navigation fails inside WebKit; static-asset failure assertions remain identical. Supplemental Chromium coverage exercises the GitHub Pages project base; artifact checks provide browser-independent base and worker-scope evidence.
- `scripts/verify-offline.mjs` binds document assets, favicon, navigation fallback, worker registration URL, and worker scope to one emitted base path.

## Commands

```bash
python3 scripts/verify-reference-cases.py --fixtures tests/reference-cases
bun run verify:references
bun run test:rf
bun run test:chart
bun run check:rf-boundary
bun run typecheck
bun run lint
bun run format:check
bun run ci
BASE_PATH=/smithchart/ bun run build
bun run verify:offline
bun run verify:assets
bun run test:e2e -- --project=chromium --grep-invert @visual
bun run test:e2e -- --project=firefox --grep-invert @visual
bun run test:e2e -- --project=webkit --grep-invert @visual
bun run test:e2e -- --project=mobile-chromium
bun run test:e2e -- --project=mobile-webkit
bun run test:e2e -- --workers=3 tests/e2e/export.spec.ts tests/e2e/copy.spec.ts tests/e2e/offline.spec.ts
bun run test:e2e:pages -- --project=chromium
git diff --check
```

Any RF equation change must update equation register, independent assertion, fixtures, TypeScript deterministic/property tests, and relevant conventions together.
