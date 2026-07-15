# RF reference cases

Checked-in values come from standard-library Python using direct sine/cosine transmission-line transformation, bounded conductance roots, and bounded numerical stub inversion. Production uses analytical reflection-circle intersections and `atan2` inverses.

This alternate formulation reduces common-mode implementation risk but is not external authority by itself. Fixture metadata names published sources used to confirm conventions. `docs/mathematics.md` states exact scope of each evidence layer.

Run:

```bash
python3 scripts/verify-reference-cases.py --fixtures tests/reference-cases
```

Verifier checks twelve solved cases, both terminations, edge classifications, provenance, residuals, and named equation assertions.
