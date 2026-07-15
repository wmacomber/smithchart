# Mathematics

## Equation register

| ID                | Equation                     |
| ----------------- | ---------------------------- |
| RF-NORM-001       | `z = Z / Z0`                 |
| RF-GAMMA-001      | `Γ = (z - 1) / (z + 1)`      |
| RF-ZFROMGAMMA-001 | `z = (1 + Γ) / (1 - Γ)`      |
| RF-ADMITTANCE-001 | `y = 1 / z`                  |
| RF-LINE-001       | `Γ(d) = ΓL exp(-j4πdλ)`      |
| RF-G1-001         | at `g=1`, `b=±2ρ/sqrt(1-ρ²)` |
| RF-STUB-OPEN-001  | `b=open = tan(βl)`           |
| RF-STUB-SHORT-001 | `b=short = -cot(βl)`         |
| RF-WAVELENGTH-001 | `λ=c·VF/f`                   |

Solver computes two `g=1` admittance intersections analytically, obtains clockwise phase distances, cancels junction susceptance, inverts stub equations with `atan2`, and recomputes final admittance/reflection. General optimization prohibited.

Matched load returns `matched`. Exact open, exact short, and other unit-circle loads return no finite passive solution. Negative resistance returns active-load diagnostic. Invalid inputs and residual failures use distinct tagged results.

Reference fixtures contain intermediate distance, junction susceptance, and stub length for both terminations. Independent Python implementation uses standard library only.
