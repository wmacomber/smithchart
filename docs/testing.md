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
git diff --check
```

Any RF equation change must update equation register, independent assertion, fixtures, TypeScript deterministic/property tests, and relevant conventions together.
