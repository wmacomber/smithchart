# RF and Coordinate Conventions

- (Z=R+jX); positive reactance inductive.
- (Y=G+jB); positive susceptance capacitive.
- Γ = `(z - 1) / (z + 1)`.
- Toward generator: Γ(d) = ΓL exp(−j4πdλ), clockwise.
- Positive imaginary values occupy mathematical upper half. Renderer alone inverts SVG Y.
- Electrical degrees mean βd: one wavelength equals 360°.
- Feed-line and stub lengths use `[0, 0.5λ)`.
- A means smaller canonical feed-line distance; B means larger.
- Open stub: `j tan(βl)`. Short stub: `−j cot(βl)`.
- Exact open uses tagged load, never Infinity. Exact foot is 0.3048 meter.

Primitive tolerance: absolute `1e-12`, relative `1e-10`. Final returned match requires `|Γ| <= 1e-8`.
