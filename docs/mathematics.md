# Mathematics

## Scope and definitions

Solver covers real positive $Z_0$, a lossless transmission line at one frequency, and one open- or
short-circuited shunt stub. Phasors use $e^{+j\omega t}$. Definitions and signs follow
[RF and coordinate conventions](conventions.md), with architecture fixed by
[ADR 0003](adr/0003-rf-conventions-and-analytical-solver.md).

For load $Z_L=R+jX$, characteristic impedance $Z_0>0$, frequency $f>0$, and velocity factor
$0<VF\le1$:

$$
z_L=\frac{Z_L}{Z_0},\qquad Y_0=\frac1{Z_0},\qquad
y_L=\frac{Y_L}{Y_0}=Y_LZ_0=\frac1{z_L}.
$$

Dimensional recovery is $Z=zZ_0$ and $Y=y/Z_0$.

## Equation register

| ID                | Equation                                         | Verified assertion                                 |
| ----------------- | ------------------------------------------------ | -------------------------------------------------- |
| RF-NORM-001       | $z=Z/Z_0$, $y=YZ_0$                              | Fixture normalized values and dimensional recovery |
| RF-GAMMA-001      | $\Gamma=(z-1)/(z+1)$                             | Fixture load reflection values                     |
| RF-ZFROMGAMMA-001 | $z=(1+\Gamma)/(1-\Gamma)$                        | Reflection round trip                              |
| RF-ADMITTANCE-001 | $y=1/z$                                          | Junction reciprocal identity                       |
| RF-LINE-001       | $\Gamma(d_\lambda)=\Gamma_Le^{-j4\pi d_\lambda}$ | Direct line transform comparison                   |
| RF-G1-001         | $b=\pm2\rho/\sqrt{1-\rho^2}$ at $g=1$            | Two bounded conductance roots                      |
| RF-STUB-OPEN-001  | $b_{open}=\tan(\beta l)$                         | Direct open-stub cancellation                      |
| RF-STUB-SHORT-001 | $b_{short}=-\cot(\beta l)$                       | Direct short-stub cancellation                     |
| RF-WAVELENGTH-001 | $\lambda=cVF/f$                                  | Fixture physical-length conversion                 |

`tests/reference-cases/equation-coverage.json` binds every ID to a named verifier assertion. Labels on fixtures alone do not establish coverage.

## Reflection conversion

Normalized impedance gives

$$
\Gamma=\frac{z-1}{z+1},\qquad z=\frac{1+\Gamma}{1-\Gamma}.
$$

Substituting $y=1/z$ gives admittance form

$$
\Gamma=\frac{1-y}{1+y}.
$$

Important singular points:

- $\Gamma=1$: exact open circuit. Input uses `{ kind: "open" }`; no infinite JavaScript impedance is fabricated.
- $\Gamma=-1$: exact short circuit, $z=0$.
- $z=0$: reciprocal admittance is singular; solver classifies the lossless boundary before taking that reciprocal.
- $z=-1$: reflection denominator is zero, but this negative-resistance point is rejected as active before conversion.
- General complex division uses denominator scaling. Exact zero denominator produces non-finite components and must be handled by caller policy.

## Lossless line transformation

With

$$
\beta=\frac{2\pi}{\lambda},\qquad \lambda=\frac{cVF}{f},
$$

distance $d$ from load toward generator changes reflection coefficient by

$$
\Gamma(d)=\Gamma_Le^{-j2\beta d}.
$$

For normalized distance $d_\lambda=d/\lambda$:

$$
\Gamma(d_\lambda)=\Gamma_Le^{-j4\pi d_\lambda}.
$$

Negative phase means clockwise movement. Independent verifier does not solve with this rotation. It uses direct impedance transformation

$$
z(d)=
\frac{z_L\cos\theta+j\sin\theta}
{\cos\theta+jz_L\sin\theta},\qquad
\theta=2\pi d_\lambda.
$$

Sine/cosine form avoids artificial tangent poles. Verifier then confirms direct result agrees with RF-LINE-001.

## Two shunt-stub solutions

At each valid shunt junction, normalized admittance must be

$$
y_j=1+jb_j.
$$

Its reflection coefficient is

$$
\Gamma_j=\frac{1-y_j}{1+y_j}=\frac{-jb_j}{2+jb_j}.
$$

Lossless rotation preserves $\rho=|\Gamma_L|$. Therefore

$$
\rho^2=\frac{b_j^2}{4+b_j^2}
$$

and, for $0<\rho<1$,

$$
b_j=\pm\frac{2\rho}{\sqrt{1-\rho^2}}
=\pm\frac{2\rho}{\sqrt{(1-\rho)(1+\rho)}}.
$$

Production uses the factored denominator for better conditioning. Each sign defines one target reflection coefficient. Clockwise angle and distance are

$$
\Delta\phi=\operatorname{wrap}_{[0,2\pi)}
(\arg\Gamma_L-\arg\Gamma_j),
\qquad
d_\lambda=\frac{\Delta\phi}{4\pi}.
$$

For every nondegenerate passive load these targets are distinct within $[0,0.5\lambda)$. Production
recomputes junction impedance and admittance after rotation, calculates $b_s=-\Im(y_j)$, verifies the
final residual, then sorts distances. Smaller distance is A; larger distance is B.

## Stub equations and inverse branches

Parallel normalized admittances add:

$$
y_f=y_j+y_s=(1+jb_j)+jb_s,\qquad b_s=-b_j.
$$

Let $\theta=\beta l$.

Open circuit:

$$
z_{oc}=-j\cot\theta,\qquad y_{oc}=j\tan\theta,\qquad
b_s=\tan\theta.
$$

Canonical inverse:

$$
\theta=\operatorname{mod}_{[0,\pi)}(\operatorname{atan2}(b_s,1)).
$$

An open stub has zero admittance at $l=0$ and a pole at $l=\lambda/4$.

Short circuit:

$$
z_{sc}=j\tan\theta,\qquad y_{sc}=-j\cot\theta,\qquad
b_s=-\cot\theta.
$$

Canonical inverse:

$$
\theta=\operatorname{mod}_{[0,\pi)}(\operatorname{atan2}(-1,b_s)).
$$

For $b_s=0$, short length is $\lambda/4$. Short-stub poles occur at zero and half-wavelength periodic
equivalents. For the same finite susceptance, canonical open and short lengths differ by $0.25\lambda$
modulo $0.5\lambda$.

## Analytical and numerical roles

Production solver remains analytical. It does not call a general optimizer or silently fall back to a numerical root. It returns `numerical-failure` when finite/residual gates fail.

Independent Python verifier uses a different path:

1. Direct sine/cosine line transformation.
2. Bounded search for roots of $\Re(1/z(d))-1=0$ on $[0,0.5\lambda)$.
3. Bisection to `1e-14λ`.
4. Numerical inversion of open/short stub susceptance on the correct monotonic branch.
5. Full recomputation of resulting admittance and reflection.

Thus agreement does not arise from copying production intersection or inverse-branch code.

## Degenerate and failure policy

| Condition                                                                                   | Result                                  |
| ------------------------------------------------------------------------------------------- | --------------------------------------- |
| Valid load with $                                                                           | \Gamma_L                                | \le10^{-12}$ | `matched` effective-match state |
| Tagged exact open                                                                           | `no-passive-solution/open-circuit`      |
| Finite exact $R=0$, including short and pure reactance                                      | `no-passive-solution/lossless-boundary` |
| Finite $R<0$                                                                                | `no-passive-solution/active-load`       |
| Invalid/non-finite input, $Z_0\le0$, $f\le0$, or $VF\notin(0,1]$                            | `invalid-input`                         |
| Positive-resistance calculation becomes non-finite, rounds to $\rho\ge1$, or fails residual | `numerical-failure`                     |

Positive resistance is never relabeled as an exact lossless boundary. Near-open, near-short, near-match, and large-reactance cases are fixtures.

## Floating-point acceptance

Shared comparison is

$$
|a-b|\le\epsilon_{abs}+\epsilon_{rel}\max(1,|a|,|b|).
$$

- Primitive: `1e-12` absolute, `1e-10` relative.
- Solver: `1e-10` absolute, `1e-9` relative.
- Returned match: $|\Gamma_f|\le10^{-8}$.
- Reference default: `1e-9` absolute and relative.
- Ill-conditioned near-boundary fixtures: `1e-8`, with fixture-local declaration.

UI formatting never defines solver equality.

## Units

$$
\lambda=\frac{299792458\,VF}{f}\ \mathrm{m},\qquad
l_m=l_\lambda\lambda,\qquad
l_{degrees}=360l_\lambda.
$$

One international foot is exactly `0.3048 m`. Scaling $R$, $X$, and $Z_0$ together leaves normalized
and electrical answers unchanged. Frequency and velocity factor affect physical lengths through $VF/f$,
not electrical solutions.

## Solver contract

Authoritative declarations live in `src/rf/stubMatch.ts`, `src/rf/quantities.ts`, and `src/rf/validation.ts`. Contract shape:

```ts
type Load =
  { readonly kind: 'finite'; readonly impedanceOhms: Complex } | { readonly kind: 'open' };

type StubTermination = 'open' | 'short';

interface StubMatchInput {
  readonly load: Load;
  readonly characteristicImpedanceOhms: Ohms;
  readonly frequencyHz: Hertz;
  readonly velocityFactor: number;
  readonly termination: StubTermination;
}

interface MatchDiagnostics {
  readonly loadReflectionMagnitude: number;
  readonly resultReflectionMagnitude: number;
  readonly conductanceError: number;
  readonly susceptanceError: number;
}

interface StubMatchSolution {
  readonly id: 'A' | 'B';
  readonly feedlineDistanceWavelengths: Wavelengths;
  readonly feedlineDistanceDegrees: Degrees;
  readonly feedlineDistanceMeters: Meters;
  readonly junctionNormalizedImpedance: Complex;
  readonly junctionImpedanceOhms: Complex;
  readonly junctionNormalizedAdmittance: Complex;
  readonly junctionAdmittanceSiemens: Complex;
  readonly requiredStubNormalizedSusceptance: number;
  readonly requiredStubSusceptanceSiemens: Siemens;
  readonly stubLengthWavelengths: Wavelengths;
  readonly stubElectricalDegrees: Degrees;
  readonly stubLengthMeters: Meters;
  readonly resultingNormalizedAdmittance: Complex;
  readonly resultingReflectionCoefficient: Complex;
  readonly residualVswr: number;
  readonly diagnostics: MatchDiagnostics;
}

type StubMatchResult =
  | {
      readonly status: 'solved';
      readonly solutions: readonly [StubMatchSolution, StubMatchSolution];
    }
  | { readonly status: 'matched'; readonly diagnostics: MatchDiagnostics }
  | {
      readonly status: 'no-passive-solution';
      readonly reason: 'active-load' | 'open-circuit' | 'lossless-boundary';
    }
  | { readonly status: 'invalid-input'; readonly issues: readonly ValidationIssue[] }
  | { readonly status: 'numerical-failure'; readonly diagnostics: MatchDiagnostics };
```

Every solved-result number is finite. Diagnostics mean:

- `conductanceError = Re(y_j) - 1`.
- `susceptanceError = Im(y_f)`.
- `resultReflectionMagnitude = |Γ_f|`.
- `residualVswr = (1+|Γ_f|)/(1-|Γ_f|)`.

`numerical-failure` may use `NaN` or `Infinity` only when no finite candidate diagnostic exists. Physical no-solution reasons never represent numerical failure.

## Reference evidence

Twelve solved fixtures store complete inputs, intermediate junctions, both terminations, both ordered solutions, physical lengths, final admittance/reflection, tolerances, and provenance. Existing ten distances were separately corroborated with direct bounded roots before fixture expansion; maximum difference was below `5e-13λ`.

External sources confirm conventions and method. Four required cases (`resistive-low`, `capacitive-hf`, `quadrant-cap`, and `quadrant-ind`) were also evaluated with scikit-rf 2.0.1 `DefinedGammaZ0` line and stub networks: maximum junction-admittance difference was `3.6e-16`, and maximum final reflection residual was below `1.6e-14`. Remaining project-specific decimals rely on the alternate-formulation verifier rather than a claim of publication.

- S. J. Orfanidis, [_Electromagnetic Waves and Antennas_](https://eceweb1.rutgers.edu/~orfanidi/ewa/ewa-2up.pdf), ch. 11 Smith chart and ch. 13.8 single-stub matching.
- Keysight Technologies, [_RF Design Software Learning Kit_](https://www.keysight.com/us/en/assets/7018-05596/application-notes/5992-2079.pdf), Smith-chart movement toward generator and wavelength-distance examples.
- Marks and Williams, NIST, [_A General Waveguide Circuit Theory_](https://nvlpubs.nist.gov/nistpubs/jres/097/jresv97n5p533_A1b.pdf), real-characteristic-impedance traveling-wave framework.
- scikit-rf, [real-reference Smith-chart reflection convention](https://scikit-rf.readthedocs.io/en/latest/examples/networktheory/Working%20with%20Complex%20Characteristic%20Impedances.html) and [single-stub matching example](https://scikit-rf.readthedocs.io/en/v1.11.0/examples/matching/Impedance%20Matching.html).

Sign-sensitive conventions requiring these confirmations are: phasor sign, positive reactance/susceptance,
toward-generator exponent, clockwise chart direction, admittance reflection sign, open/short stub signs,
two $g=1$ intersections, $4\pi$ distance factor, upper-half positive reactance, and inverse branch selection.
