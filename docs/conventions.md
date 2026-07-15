# RF and Coordinate Conventions

## RF signs

Smith Match uses the (e^{+j\omega t}) phasor convention.

- Impedance: (Z=R+jX). Positive reactance is inductive; negative reactance is capacitive.
- Admittance: (Y=G+jB). Positive susceptance is capacitive; negative susceptance is inductive.
- Characteristic impedance (Z_0) is real, finite, and strictly positive.
- A finite passive load has (R>0). (R=0) is the lossless unit-circle boundary. (R<0) is active and outside the passive solver.

## Reflection and direction

Normalized impedance and admittance are (z=Z/Z_0) and (y=YZ_0=1/z). Reflection coefficient is

\[
\Gamma=\frac{z-1}{z+1}=\frac{1-y}{1+y}.
\]

Distance (d\) is measured from load toward generator. With (d_\lambda=d/\lambda),

\[
\Gamma(d_\lambda)=\Gamma_L e^{-j4\pi d_\lambda}.
\]

Therefore movement toward generator is clockwise in mathematical reflection-coefficient space. Electrical line length uses (\beta d): one wavelength is (360^\circ). Reflection phase changes twice as fast, rotating (720^\circ) over one wavelength and returning to its starting point after half wavelength.

## Coordinates

RF code uses mathematical complex coordinates: positive imaginary values occupy the upper half-plane. Positive impedance reactance therefore appears above the horizontal chart axis.

Only `src/chart` converts mathematical coordinates to SVG coordinates:

```text
screenX = centerX + Re(Γ) * radius
screenY = centerY - Im(Γ) * radius
```

No RF equation, fixture, or verifier may invert the imaginary axis.

## Canonical lengths and solution names

- Feed-line and stub lengths use the half-open interval `[0, 0.5λ)`.
- Values within `1e-12λ` below `0.5λ` wrap to zero.
- Solution A has smaller canonical feed-line distance. Solution B has larger distance.
- Open stub: (y_s=j\tan(\beta l)).
- Short stub: (y_s=-j\cot(\beta l)).
- Zero required susceptance uses open length zero or short length (0.25\lambda).
- An effective match returns `matched`; it does not fabricate duplicate A/B construction lengths.

## Units and constants

- Ohms, siemens, hertz, and meters are canonical dimensional units.
- Wavelength fractions are canonical electrical lengths.
- Internal trigonometric angles are radians; displayed electrical angles are degrees.
- Velocity factor is dimensionless and must satisfy (0<VF\le1).
- Speed of light is exactly `299792458 m/s`.
- One international foot is exactly `0.3048 m`; feet are display-boundary numbers, not RF-core state.

## Floating-point policy

Comparisons use

\[
|a-b|\le \epsilon_{abs}+\epsilon_{rel}\max(1,|a|,|b|).
\]

- Primitive tolerance: absolute `1e-12`, relative `1e-10`.
- Solver tolerance: absolute `1e-10`, relative `1e-9`.
- Returned solution limit: \(|\Gamma_f|\le10^{-8}\).
- Effective-match threshold: \(|\Gamma_L|\le10^{-12}\).

Effective-match tolerance never changes physical classification: positive resistance remains passive; exact zero resistance alone identifies the finite lossless boundary.
