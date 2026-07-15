# Interactive Smith Chart SPA

## Product and Technical Plan

## 1. Purpose

Build a browser-only single-page application that helps users calculate wire-stub lengths for impedance matching in antenna and transmission-line circuits.

The application should behave like an RF instrument rather than a generic calculator. Its defining feature is an interactive Smith chart that lets the user see and manipulate the complete matching process:

1. Place or enter a load impedance.
2. Rotate along a transmission line toward the generator.
3. Find the valid stub-placement points.
4. Calculate the susceptance required at each point.
5. Convert the electrical stub length into a physical length.
6. Show both valid matching solutions.
7. Explain the matching operation visually and numerically.

The project will be released publicly on GitHub under the MIT License and deployed as a static website. No backend, database, authentication system, or server runtime is required.

---

## 2. Product principles

### 2.1 Instrument first

The chart is the primary interface. Forms and result cards support the chart rather than replacing it.

### 2.2 Explain the solution

The application should not merely return a number. It should show how the load moves around the Smith chart and why the selected stub cancels the remaining susceptance.

### 2.3 Progressive disclosure

The default interface should remain approachable. Derived RF quantities and detailed diagnostics should be available without overwhelming a returning learner.

### 2.4 Both valid solutions

Single-stub matching generally produces two valid solutions within a half wavelength. The application must display both as Solution A and Solution B.

### 2.5 Transparent mathematics

All RF calculations should be implemented in a small, pure TypeScript library with explicit equations, documented conventions, and strong tests.

### 2.6 Static and shareable

A complete calculation should be representable in the URL so it can be bookmarked or shared without a server.

### 2.7 Accessible interaction

All important actions must work with mouse, touch, and keyboard. The application must provide textual descriptions of graphical results.

---

## 3. Initial release scope

The first stable release should support:

- Single-frequency calculations
- Lossless transmission lines
- Single shunt-stub matching
- Open-circuit stubs
- Short-circuit stubs
- Configurable characteristic impedance
- Configurable operating frequency
- Configurable velocity factor
- Electrical length in wavelengths and degrees
- Physical length in metric and customary units
- Two valid stub solutions
- Direct manipulation of load impedance on the chart
- Numeric load entry
- Impedance and admittance display modes
- Shareable URL state
- Responsive desktop, tablet, and mobile layouts
- Light and dark themes
- Offline-capable static deployment
- Exportable SVG chart
- Built-in examples and explanations

The first release should not attempt to provide:

- A general-purpose RF circuit simulator
- Full VNA functionality
- Multiport analysis
- Filter synthesis
- Distributed matching networks beyond one stub
- Touchstone import
- Frequency sweeps
- Lossy-line modeling
- Microstrip synthesis
- Component parasitic simulation

Those may be added later without being part of the initial critical path.

---

## 4. Recommended technology stack

### 4.1 Core stack

- React
- TypeScript
- Vite
- Bun
- Vitest
- Playwright
- ESLint
- Prettier
- fast-check

### 4.2 Responsibility split

| Concern | Tool |
|---|---|
| Package installation | Bun |
| Lockfile | `bun.lock` |
| Script execution | Bun |
| Development server | Vite |
| Production SPA build | Vite |
| Unit and integration tests | Vitest |
| Property-based tests | fast-check |
| Browser and accessibility tests | Playwright |
| Rendering | Native SVG |
| Optional interaction helpers | Selected D3 modules |
| UI behavior primitives | React Aria Components |
| Styling | Plain CSS with CSS custom properties |
| Icons | Lucide |
| Deployment | GitHub Pages through GitHub Actions |

### 4.3 Why Bun and Vite are used together

Bun should be the package manager and script runtime. Vite should remain the frontend development and build system.

This combination gives the project:

- Fast dependency installation
- A simple text lockfile
- Familiar Vite project structure
- React Fast Refresh
- Mature asset and CSS handling
- Conventional plugin compatibility
- Static production output
- Low contributor friction

The application should not depend on Bun-specific runtime APIs. The deployed result is static HTML, CSS, JavaScript, and assets.

### 4.4 Rendering approach

The Smith chart should be implemented as a custom SVG renderer.

Do not use a Smith-chart package as the primary implementation. Generic charting libraries do not provide sufficient control over:

- Draggable impedance points
- Constant-SWR rotation paths
- Impedance and admittance overlays
- Stub-placement markers
- Susceptance paths
- Direction arrows
- Interactive labels
- Keyboard navigation
- SVG export
- Responsive grid density

D3 may be used selectively for drag handling, interpolation, and geometry helpers, but RF mathematics and chart coordinates must remain in project-owned TypeScript modules.

### 4.5 State management

Use React state and `useReducer` initially.

Do not add a global state library unless the application later develops multiple independently coordinated state domains.

Persist:

- Calculation state in the URL
- User display preferences in `localStorage`

---

## 5. RF mathematical model

## 5.1 Core quantities

The implementation should distinguish conceptually between:

- Ohms
- Siemens
- Hertz
- Meters
- Feet
- Radians
- Degrees
- Wavelengths
- Velocity factor
- Normalized impedance
- Normalized admittance
- Reflection coefficient

Branded TypeScript types may be used where they reduce ambiguity, especially for:

- Radians versus degrees
- Meters versus wavelengths
- Impedance versus normalized impedance

Example:

```ts
interface Complex {
  readonly re: number;
  readonly im: number;
}

interface Impedance {
  readonly resistanceOhms: number;
  readonly reactanceOhms: number;
}

interface NormalizedImpedance {
  readonly r: number;
  readonly x: number;
}

interface NormalizedAdmittance {
  readonly g: number;
  readonly b: number;
}
```

## 5.2 Core equations

Normalize the load impedance:

\[
z_L = \frac{Z_L}{Z_0}
\]

Calculate reflection coefficient:

\[
\Gamma = \frac{z_L - 1}{z_L + 1}
\]

Recover normalized impedance:

\[
z = \frac{1 + \Gamma}{1 - \Gamma}
\]

Convert normalized impedance to normalized admittance:

\[
y = \frac{1}{z}
\]

Calculate wavelength in the transmission medium:

\[
\lambda = \frac{c \cdot VF}{f}
\]

For a distance \(d\) toward the generator:

\[
\Gamma(d) = \Gamma_L e^{-j2\beta d}
\]

where:

\[
\beta = \frac{2\pi}{\lambda}
\]

The project must choose and document one sign convention for:

- Positive reactance
- Positive susceptance
- Clockwise versus counterclockwise movement
- Toward-load versus toward-generator rotation
- SVG vertical-axis inversion

The sign convention must be enforced with reference tests.

## 5.3 Shunt-stub solution

For shunt-stub matching, transform the load along the feed line until the normalized admittance reaches:

\[
y = 1 + jb
\]

The stub must contribute:

\[
y_{stub} = -jb
\]

The resulting normalized admittance is:

\[
y_{matched} = 1 + j0
\]

For a lossless short-circuited shunt stub:

\[
y_{stub} = -j\cot(\beta l)
\]

For a lossless open-circuited shunt stub:

\[
y_{stub} = j\tan(\beta l)
\]

Normalize the practical stub length to:

\[
0 \le l < \frac{\lambda}{2}
\]

Return both valid feed-line positions within a half wavelength.

## 5.4 Solver output

Each solution should retain enough intermediate information for explanation and debugging:

```ts
interface StubMatchSolution {
  readonly id: "A" | "B";

  readonly feedlineDistanceWavelengths: number;
  readonly feedlineDistanceDegrees: number;
  readonly feedlineDistanceMeters: number;

  readonly junctionImpedance: Complex;
  readonly junctionAdmittance: Complex;

  readonly requiredStubSusceptance: number;

  readonly stubLengthWavelengths: number;
  readonly stubElectricalDegrees: number;
  readonly stubLengthMeters: number;

  readonly resultingAdmittance: Complex;
  readonly resultingReflectionCoefficient: Complex;
  readonly residualVswr: number;
}
```

## 5.5 Numerical strategy

Prefer analytical equations or tightly bounded one-dimensional root solving.

Do not use a general optimization package for the primary solver.

The solver should:

1. Normalize the load.
2. Convert it to admittance or reflection coefficient.
3. Parameterize one half-wavelength rotation.
4. Find the two positions where transformed conductance equals one.
5. Calculate the junction susceptance at each position.
6. Calculate the required cancelling stub susceptance.
7. Convert susceptance to electrical stub length.
8. Convert electrical length to physical length.
9. Verify the resulting admittance and reflection coefficient.
10. Return residual diagnostics.

## 5.6 Edge cases

Handle explicitly:

- Already matched load
- Exact open circuit
- Exact short circuit
- Pure resistance
- Near-open and near-short loads
- Zero or invalid characteristic impedance
- Zero or invalid frequency
- Velocity factor outside \(0 < VF \le 1\)
- Negative resistance
- Non-finite inputs
- Solutions numerically close to zero or half wavelength
- Very large reactance
- Floating-point singularities

Negative resistance should not be silently rejected as ordinary user error. It should be identified as an active or unusual load outside the primary passive-load workflow.

---

## 6. User experience

## 6.1 Desktop layout

```text
┌──────────────────────────────────────────────────────────────┐
│ Title        Undo  Redo  Examples  Learn  Export  Share      │
├────────────────────────────────┬─────────────────────────────┤
│                                │ Load                        │
│                                │ R [ 35.0 ] Ω                │
│                                │ X [−22.0 ] Ω                │
│       Interactive              │ Z₀ [ 50.0 ] Ω               │
│       Smith chart              │                             │
│                                │ Transmission line           │
│                                │ Frequency [ 14.2 ] MHz      │
│                                │ Velocity factor [ 0.66 ]    │
│                                │                             │
│                                │ Stub                        │
│                                │ Shunt                       │
│                                │ Open / Short                │
├────────────────────────────────┴─────────────────────────────┤
│ Solution A         Solution B         Comparison             │
│ Place stub 1.42 m toward generator                           │
│ Stub length 0.83 m · 28.4° · 0.079 λ                         │
└──────────────────────────────────────────────────────────────┘
```

## 6.2 Mobile layout

Order the interface as:

1. Smith chart
2. Selected solution summary
3. Core inputs
4. Alternate solution
5. Detailed RF quantities
6. Explanation and warnings

The chart must remain the visually dominant element.

## 6.3 Load entry modes

Support synchronized entry in:

- Impedance: \(R + jX\)
- Admittance: \(G + jB\)
- Reflection coefficient: magnitude and phase

A later release may add VSWR plus reflection phase.

## 6.4 Direct chart manipulation

The load marker should be draggable.

During interaction:

- Update impedance continuously
- Show a compact live tooltip
- Avoid obscuring the chart
- Support optional grid snapping
- Allow precise keyboard adjustment
- Permit cancellation with Escape
- Commit with Enter
- Use large enough touch targets
- Respect reduced-motion preferences

Keyboard behavior:

- Arrow keys: fine movement
- Shift plus arrow: coarse movement
- Tab: navigate interactive chart elements
- Enter: select or commit
- Escape: cancel current manipulation

## 6.5 Visual matching sequence

Display the solution as a process:

1. Load point
2. Constant-SWR circle
3. Rotation toward the generator
4. Intersection with the \(g=1\) circle
5. Stub attachment point
6. Stub susceptance path
7. Matched center point

Draw:

- Load marker
- Constant-SWR circle
- Feed-line transformation arc
- Direction arrows
- Stub junction marker
- Susceptance cancellation path
- Center match marker
- Electrical-length labels

The user should be able to animate the sequence. Animation must be optional.

## 6.6 Results language

Use construction-oriented language:

> Move 1.42 m toward the transmitter from the load and connect a short-circuited shunt stub 0.83 m long.

Also display:

- Feed-line distance in wavelengths
- Feed-line distance in degrees
- Stub length in wavelengths
- Stub length in degrees
- Metric length
- Customary length
- Junction impedance
- Junction admittance
- Required susceptance
- Expected residual VSWR

Include a practical warning that calculated physical lengths are starting values affected by:

- Connector length
- Exposed conductor
- Dielectric variation
- Nearby objects
- Coupling
- Feed-line loss
- Stub construction
- Measurement calibration

## 6.7 Progressive disclosure

Default inputs:

- Resistance
- Reactance
- Characteristic impedance
- Frequency
- Velocity factor
- Stub termination

Advanced panel:

- Reflection coefficient
- Return loss
- VSWR
- Conductance
- Susceptance
- Electrical angle
- Distance in wavelengths
- Periodic equivalent lengths
- Residual solver diagnostics
- Coordinate values

## 6.8 Learn panel

Include concise explanations for:

- What a Smith chart represents
- Normalized impedance
- Reflection coefficient
- Moving toward the generator
- Why shunt matching uses admittance
- Open versus short stubs
- Electrical versus physical length
- Velocity factor
- Why physical trimming is required
- Assumptions and limitations

Each explanation should offer a “show this on the chart” action.

## 6.9 Examples

Include presets for:

- Matched 50-ohm load
- Purely resistive mismatch
- Capacitive antenna load
- Inductive antenna load
- Near-open load
- Near-short load
- 75-ohm system
- 14.2 MHz antenna example
- 146 MHz mobile-radio example

---

## 7. Smith-chart renderer

## 7.1 SVG layer model

```text
<svg>
  <defs />
  <g data-layer="background" />
  <g data-layer="resistance-grid" />
  <g data-layer="reactance-grid" />
  <g data-layer="admittance-grid" />
  <g data-layer="labels" />
  <g data-layer="swr-circle" />
  <g data-layer="solution-paths" />
  <g data-layer="markers" />
  <g data-layer="interaction-overlay" />
</svg>
```

Keep static grid elements separate from frequently updated interaction elements.

## 7.2 Coordinate model

The RF engine should produce:

\[
\Gamma = u + jv
\]

The renderer maps this to SVG coordinates:

```ts
screenX = centerX + u * radius;
screenY = centerY - v * radius;
```

SVG vertical-axis inversion belongs only in rendering code.

## 7.3 Grid generation

Generate constant-resistance and constant-reactance arcs mathematically.

Do not use a raster background image.

Benefits:

- Infinite-resolution rendering
- Accurate hit testing
- Theme support
- Selective highlighting
- Responsive label density
- SVG export
- Print support

## 7.4 Impedance and admittance overlays

Support:

- Impedance grid
- Admittance grid
- Combined grid

When displaying both, the secondary grid should be visually subdued.

For shunt-stub matching, the UI may automatically emphasize admittance geometry while retaining impedance context.

---

## 8. Application architecture

```text
src/
├── app/
│   ├── App.tsx
│   ├── Workspace.tsx
│   ├── workspaceReducer.ts
│   └── workspaceTypes.ts
│
├── rf/
│   ├── complex.ts
│   ├── quantities.ts
│   ├── impedance.ts
│   ├── admittance.ts
│   ├── reflection.ts
│   ├── transmissionLine.ts
│   ├── stubMatch.ts
│   ├── validation.ts
│   └── conventions.ts
│
├── chart/
│   ├── SmithChart.tsx
│   ├── SmithGrid.tsx
│   ├── SmithLabels.tsx
│   ├── LoadMarker.tsx
│   ├── TransformationPath.tsx
│   ├── StubPath.tsx
│   ├── chartGeometry.ts
│   ├── pointerMapping.ts
│   └── useChartInteraction.ts
│
├── features/
│   ├── load-input/
│   ├── line-input/
│   ├── matching/
│   ├── results/
│   ├── examples/
│   ├── sharing/
│   ├── exporting/
│   └── tutorial/
│
├── components/
│   ├── NumberField.tsx
│   ├── UnitField.tsx
│   ├── SegmentedControl.tsx
│   ├── ResultCard.tsx
│   ├── Disclosure.tsx
│   └── Tooltip.tsx
│
├── persistence/
│   ├── urlState.ts
│   └── preferences.ts
│
├── styles/
│   ├── tokens.css
│   ├── global.css
│   ├── layout.css
│   └── print.css
│
└── test/
    ├── fixtures/
    └── referenceCases/
```

The `rf` directory must remain free of dependencies on:

- React
- SVG
- DOM APIs
- Browser storage
- URL state
- Component state

It should be independently reusable and testable.

---

## 9. State model

Example workspace state:

```ts
interface WorkspaceState {
  readonly loadRepresentation: "impedance" | "admittance" | "reflection";
  readonly loadImpedance: Complex;
  readonly characteristicImpedanceOhms: number;
  readonly frequencyHz: number;
  readonly velocityFactor: number;
  readonly topology: "shunt";
  readonly termination: "open" | "short";
  readonly selectedSolution: "A" | "B";
  readonly displayMode: "impedance" | "admittance" | "both";
  readonly lengthUnit: "m" | "cm" | "ft" | "in";
  readonly theme: "system" | "light" | "dark";
}
```

Use a reducer for deterministic state transitions.

Potential reducer actions:

- Set load resistance
- Set load reactance
- Set normalized impedance
- Set reflection coefficient
- Set characteristic impedance
- Set frequency
- Set velocity factor
- Set stub termination
- Select solution
- Set display mode
- Set length unit
- Apply example
- Restore URL state
- Reset workspace

---

## 10. Input handling

Numeric fields must maintain separate concepts:

```ts
interface NumericInputState {
  readonly raw: string;
  readonly parsed: number | null;
  readonly committed: number;
}
```

This prevents transient strings such as `-`, `.`, or `1e` from corrupting the workspace.

Validation should be:

- Immediate but non-destructive
- Specific
- Accessible
- Local to the field when possible
- Summarized when calculation cannot proceed

Do not silently coerce invalid values to zero.

---

## 11. URL state and persistence

A calculation should be shareable through a readable URL.

Example:

```text
/?r=35&x=-22&z0=50&f=14.2MHz&vf=0.66&stub=shunt-short&solution=A
```

Requirements:

- Parse human-readable units
- Serialize to a canonical form
- Preserve backward compatibility for released URL formats
- Reject invalid parameters safely
- Fall back to sensible defaults
- Avoid storing private data
- Update URL without full-page navigation

Store only preferences in `localStorage`:

- Theme
- Grid density
- Preferred units
- Last display mode
- Tutorial completion
- Animation preference

---

## 12. Testing strategy

## 12.1 Unit tests

Test independently:

- Complex addition
- Complex subtraction
- Complex multiplication
- Complex division
- Reciprocal
- Polar conversion
- Impedance normalization
- Impedance to admittance
- Impedance to reflection coefficient
- Reflection coefficient to impedance
- Feed-line rotation
- Stub susceptance
- Wavelength conversion
- Electrical length conversion
- Physical length conversion
- URL serialization
- URL parsing

## 12.2 Property-based tests

Use `fast-check`.

Important properties:

\[
z \rightarrow \Gamma \rightarrow z \approx z
\]

\[
z \rightarrow y \rightarrow z \approx z
\]

For a lossless line:

\[
|\Gamma(d)| = |\Gamma_L|
\]

For each valid solver result:

\[
y_{junction} + y_{stub} \approx 1 + j0
\]

Length invariants:

```text
0 ≤ feed-line distance < 0.5 λ
0 ≤ stub length < 0.5 λ
```

The two valid solutions should be distinct except in degenerate cases.

## 12.3 Reference cases

Check in independently verified fixtures.

Each fixture should include:

- Source
- Inputs
- Expected intermediate values
- Expected solutions
- Tolerances
- Notes about sign conventions

Reference sources may include:

- Textbook examples
- Hand calculations
- Trusted RF calculators
- An independent Python verification script

The independent verification script should not be part of the deployed application.

## 12.4 Renderer tests

Verify:

- Matched load maps to the chart center
- Open circuit maps to the right boundary
- Short circuit maps to the left boundary
- Pure resistance lies on the horizontal axis
- Positive and negative reactance map to the intended halves
- Admittance overlay is a 180-degree rotation
- Pointer coordinates round-trip through chart coordinates
- Chart labels remain within expected bounds

## 12.5 Browser tests

Use Playwright for:

- Desktop layout
- Tablet layout
- Mobile layout
- Mouse dragging
- Touch dragging
- Keyboard manipulation
- URL sharing
- Example loading
- Theme switching
- Solution switching
- SVG export
- Reduced motion
- High contrast
- Firefox
- Chromium
- WebKit

## 12.6 Accessibility tests

Use:

- axe-core
- Keyboard-only scenarios
- Focus-order checks
- Accessible names
- Live-region announcements
- Reduced-motion checks
- Color-contrast checks
- Textual chart summaries

The chart should expose a synchronized description such as:

> Load 35 minus j22 ohms, normalized to 0.70 minus j0.44. Solution A reaches normalized admittance 1 plus j1.18 after 0.135 wavelengths toward the generator.

---

## 13. Accessibility requirements

- Every form control has a visible label
- Every interactive SVG element has an accessible name
- The chart has a textual equivalent
- Focus indicators are always visible
- Color is never the only information channel
- Touch targets are appropriately sized
- Animation respects `prefers-reduced-motion`
- Theme respects system preference
- Error messages are programmatically associated with inputs
- Unit suffixes are announced appropriately
- Result changes are announced without excessive verbosity

---

## 14. Styling and visual design

Use plain CSS with custom properties.

Create tokens for:

- Backgrounds
- Panels
- Primary text
- Secondary text
- Grid lines
- Emphasized grid lines
- Impedance overlay
- Admittance overlay
- Solution A
- Solution B
- Warning
- Error
- Focus ring
- Spacing
- Typography
- Border radius
- Shadow
- Motion duration

The default visual style should resemble a clear technical instrument:

- High information density without clutter
- Strong hierarchy
- Restrained decoration
- Precise typography
- Comfortable dark mode
- Clear chart contrast
- Minimal reliance on color alone

Do not imitate a generic analytics dashboard.

---

## 15. Export and print

Support:

- SVG export
- Copyable text instructions
- Printable calculation worksheet
- Optional JSON export in a later release

The print view should include:

- Input parameters
- Selected solution
- Alternate solution
- Chart
- Physical construction instructions
- Assumptions and warnings
- Application version

---

## 16. Deployment and repository

Recommended repository structure:

```text
.
├── .github/
│   ├── workflows/
│   │   ├── ci.yml
│   │   ├── pages.yml
│   │   └── dependency-review.yml
│   ├── ISSUE_TEMPLATE/
│   └── pull_request_template.md
├── docs/
│   ├── architecture.md
│   ├── mathematics.md
│   ├── conventions.md
│   ├── testing.md
│   ├── accessibility.md
│   └── adr/
├── public/
├── scripts/
│   └── verify-reference-cases.py
├── src/
├── tests/
├── LICENSE
├── README.md
├── CONTRIBUTING.md
├── SECURITY.md
├── CODE_OF_CONDUCT.md
├── package.json
├── bun.lock
├── vite.config.ts
├── vitest.config.ts
└── playwright.config.ts
```

Recommended CI commands:

```bash
bun install --frozen-lockfile
bun run lint
bun run typecheck
bun run test
bun run build
bun run test:e2e
```

GitHub Pages should deploy the generated `dist` directory.

The project must build and run without a server-side runtime.

---

## 17. Documentation

Required project documentation:

### `README.md`

- Project purpose
- Screenshot
- Live demo link
- Feature summary
- Quick start
- Development commands
- Deployment notes
- Contribution link
- License

### `docs/mathematics.md`

- Definitions
- Equations
- Sign conventions
- Solver derivation
- Edge cases
- Tolerances
- Reference cases

### `docs/architecture.md`

- Module boundaries
- State flow
- Rendering architecture
- URL state
- Testing architecture
- Dependency policy

### `docs/conventions.md`

- RF conventions
- Units
- Coordinate systems
- Naming
- Formatting
- Error tolerances

### `docs/testing.md`

- Unit testing
- Property testing
- Reference fixtures
- Browser testing
- Visual regression
- Accessibility

### `docs/accessibility.md`

- Keyboard model
- Chart semantics
- Announcements
- Color and contrast
- Reduced motion

### Architecture decision records

At minimum:

1. Bun plus Vite
2. Custom SVG renderer
3. Pure TypeScript RF core
4. URL as calculation persistence
5. React reducer rather than a global state library
6. Vitest plus Playwright
7. Plain CSS rather than a large component framework

---

## 18. Delivery phases

## Phase 0: Mathematical specification

Deliver:

- Equation set
- Sign conventions
- Coordinate conventions
- Solver derivation
- Reference cases
- Numerical tolerances
- MVP scope

Exit criteria:

- At least ten independently verified examples
- Both-solution behavior verified
- Open and short stub formulas verified
- Edge cases documented
- No UI implementation required

## Phase 1: Project foundation

Deliver:

- Bun and Vite project
- React and TypeScript
- Formatting and linting
- Vitest
- Playwright
- fast-check
- CI
- GitHub Pages workflow
- MIT License
- Documentation skeleton

Exit criteria:

- Clean install
- Development server works
- Production build works
- CI passes
- Static deployment works

## Phase 2: RF calculation core

Deliver:

- Complex arithmetic
- Quantity helpers
- Impedance and admittance conversion
- Reflection coefficient conversion
- Transmission-line transformation
- Shunt-stub solver
- Unit tests
- Property tests
- Reference fixtures
- Independent verification script

Exit criteria:

- All reference cases pass
- Solver residuals meet tolerance
- RF core has no browser dependencies
- Edge cases are handled explicitly

## Phase 3: Static Smith chart

Deliver:

- SVG chart shell
- Resistance grid
- Reactance grid
- Admittance overlay
- Labels
- Responsive resizing
- Theme support
- Coordinate conversion
- Canonical rendering tests

Exit criteria:

- Canonical chart locations render correctly
- Desktop and mobile layouts remain legible
- Grid density adapts to chart size
- SVG export is technically possible

## Phase 4: Interactive workspace

Deliver:

- Draggable load marker
- Keyboard manipulation
- Numeric input panels
- Synchronized impedance, admittance, and reflection entry
- Workspace reducer
- Validation
- URL state
- Preference persistence

Exit criteria:

- Chart and fields remain synchronized
- Invalid intermediate input does not corrupt state
- Calculation can be reproduced from URL
- Core workflows work by keyboard

## Phase 5: Matching visualization

Deliver:

- Constant-SWR circle
- Feed-line rotation arcs
- \(g=1\) intersections
- Solution A and Solution B
- Stub susceptance paths
- Direction arrows
- Electrical-length annotations
- Result cards
- Construction instructions
- Optional animation

Exit criteria:

- Both solutions are clearly distinguishable
- Visual paths agree with numerical results
- Selected solution is reflected in URL
- Reduced-motion mode works

## Phase 6: Education and UX refinement

Deliver:

- Guided first-use experience
- Learn panel
- Presets
- Contextual explanations
- Tooltips
- Practical warnings
- Mobile refinements
- Responsive advanced panel
- Copyable results

Exit criteria:

- A returning learner can complete a match without external documentation
- A knowledgeable user can reach advanced details quickly
- Mobile workflow is complete
- No major accessibility failures remain

## Phase 7: Export, accessibility, and hardening

Deliver:

- SVG export
- Print layout
- Textual chart descriptions
- Live-region announcements
- Accessibility audit
- Browser matrix
- Touch testing
- Visual regression coverage
- Error-boundary handling
- Dependency review

Exit criteria:

- Chromium, Firefox, and WebKit pass
- Keyboard-only workflow passes
- Automated accessibility checks pass
- Exported SVG and print output are usable
- No runtime network dependency exists

## Phase 8: Release

Deliver:

- Final README
- Architecture documentation
- Mathematical documentation
- Contributor guide
- Security policy
- Code of conduct
- Release notes
- Versioned tag
- GitHub Pages deployment
- Public v1.0 release

Exit criteria:

- Reproducible release build
- MIT licensing confirmed
- Dependency licenses reviewed
- Public documentation complete
- GitHub release published

---

## 19. Future roadmap

Potential post-v1 features:

- Series-stub matching
- Lumped-element L networks
- Frequency sweeps
- Touchstone `.s1p` import
- VNA trace visualization
- Lossy transmission-line modeling
- Component Q
- Stub loss
- Multiple simultaneous frequency markers
- Microstrip calculators
- Printable cut-and-trim worksheets
- JSON import and export
- PWA installation
- Localization
- Saved local workspaces

These should be added only after preserving the simplicity and clarity of the single-frequency single-stub workflow.

---

## 20. Decisions locked for implementation

1. React, TypeScript, Vite, and Bun
2. Static SPA with no backend
3. Custom SVG Smith chart
4. Pure TypeScript RF engine
5. Shunt open and short single-stub matching for v1
6. Both valid solutions always exposed
7. URL-addressable calculations
8. Plain CSS with custom properties
9. React reducer before adding global state
10. Vitest, fast-check, and Playwright
11. Accessibility as a core requirement
12. Visual and textual explanation of every solution
13. MIT License
14. GitHub Pages deployment
15. RF correctness before UI sophistication

The project succeeds when it is simultaneously useful at the bench, intuitive to someone returning to RF, mathematically trustworthy, and clear enough to teach the matching process rather than conceal it.
