#!/usr/bin/env python3
"""Independent standard-library verifier. Never imports application code."""
import argparse
import cmath
import json
import math
from pathlib import Path

def stub_length(termination, required_b):
    if termination == "open":
        theta = math.atan2(required_b, 1.0) % math.pi
    elif abs(required_b) <= 1e-12:
        theta = math.pi / 2
    else:
        theta = math.atan2(-1.0, required_b) % math.pi
    return theta / (2 * math.pi)

def solve(case, termination):
    z = complex(case["r"], case["x"]) / case["z0"]
    gamma = (z - 1) / (z + 1)
    rho = abs(gamma)
    bmag = 2 * rho / math.sqrt(1 - rho * rho)
    solutions = []
    for b in (bmag, -bmag):
        target = (-1j * b) / (2 + 1j * b)
        distance = ((cmath.phase(gamma) - cmath.phase(target)) % (2 * math.pi)) / (4 * math.pi)
        rotated = gamma * cmath.exp(-1j * 4 * math.pi * distance)
        junction_y = 1 / ((1 + rotated) / (1 - rotated))
        required = -junction_y.imag
        solutions.append([distance, junction_y.imag, stub_length(termination, required)])
    return sorted(solutions)

def close(actual, expected, tolerance):
    return abs(actual - expected) <= tolerance + tolerance * max(1, abs(expected))

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--fixtures", required=True)
    args = parser.parse_args()
    root = Path(args.fixtures)
    cases = json.loads((root / "cases.json").read_text())
    coverage = json.loads((root / "equation-coverage.json").read_text())
    failures = []
    for case in cases:
        for source_field in ("title", "provider", "convention"):
            if source_field not in case.get("source", {}):
                failures.append(f"{case['id']}: missing source {source_field}")
        tolerance = case.get("tolerance", 1e-9)
        for termination in ("open", "short"):
            actual = solve(case, termination)
            expected = case["expected"][termination]
            for index, (actual_solution, expected_solution) in enumerate(zip(actual, expected)):
                for field, a, e in zip(("distance", "junctionB", "stubLength"), actual_solution, expected_solution):
                    if not close(a, e, tolerance): failures.append(f"{case['id']} {termination} {index} {field}: {a} != {e}")
        if "expectedWavelengthMeters" in case:
            wavelength = 299_792_458 * case["velocityFactor"] / case["frequencyHz"]
            if not close(wavelength, case["expectedWavelengthMeters"], tolerance):
                failures.append(f"{case['id']} wavelength: {wavelength} != {case['expectedWavelengthMeters']}")
    equations = set(coverage["equations"])
    referenced = {equation for case in cases for equation in case["equations"]}
    failures.extend(f"uncovered equation: {item}" for item in sorted(equations - referenced))
    for equation in equations:
        if sum(equation in case["equations"] for case in cases) < 2:
            failures.append(f"equation has fewer than two cases: {equation}")
    if len(cases) < 10: failures.append("fewer than ten nondegenerate reference cases")
    if failures: raise SystemExit("\n".join(failures))
    print(f"Verified {len(cases)} cases, both terminations, {len(equations)} equations")

if __name__ == "__main__": main()
