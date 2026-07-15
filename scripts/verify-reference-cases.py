#!/usr/bin/env python3
"""Independent RF verifier using direct line transforms and bounded roots.

This script deliberately does not import application code and does not use the
production reflection-circle intersection or atan2 stub inverses.
"""

import argparse
import cmath
import json
import math
from pathlib import Path

SPEED_OF_LIGHT = 299_792_458.0
ROOT_SUBDIVISIONS = 65_536
ROOT_TOLERANCE = 1e-14

EQUATION_ASSERTIONS = {
    "RF-NORM-001": "normalized impedance and admittance",
    "RF-GAMMA-001": "impedance reflection conversion",
    "RF-ZFROMGAMMA-001": "reflection-to-impedance round trip",
    "RF-ADMITTANCE-001": "admittance reciprocal",
    "RF-LINE-001": "direct line transform versus reflection rotation",
    "RF-G1-001": "two unit-conductance intersections",
    "RF-STUB-OPEN-001": "open-stub direct admittance",
    "RF-STUB-SHORT-001": "short-stub direct admittance",
    "RF-WAVELENGTH-001": "medium wavelength",
}


def close(actual, expected, absolute, relative):
    return abs(actual - expected) <= absolute + relative * max(
        1.0, abs(actual), abs(expected)
    )


def direct_line_impedance(load_z, distance):
    theta = 2.0 * math.pi * distance
    cosine = math.cos(theta)
    sine = math.sin(theta)
    return (load_z * cosine + 1j * sine) / (cosine + 1j * load_z * sine)


def conductance_error(load_z, distance):
    return (1.0 / direct_line_impedance(load_z, distance)).real - 1.0


def bisect_root(function, lower, upper):
    lower_value = function(lower)
    upper_value = function(upper)
    if lower_value == 0.0:
        return lower
    if upper_value == 0.0:
        return upper
    if lower_value * upper_value > 0.0:
        raise ValueError("root is not bracketed")
    while upper - lower > ROOT_TOLERANCE:
        midpoint = (lower + upper) / 2.0
        midpoint_value = function(midpoint)
        if midpoint_value == 0.0:
            return midpoint
        if lower_value * midpoint_value <= 0.0:
            upper = midpoint
        else:
            lower = midpoint
            lower_value = midpoint_value
    return (lower + upper) / 2.0


def find_junction_distances(load_z):
    function = lambda distance: conductance_error(load_z, distance)
    step = 0.5 / ROOT_SUBDIVISIONS
    roots = []
    lower = 0.0
    lower_value = function(lower)
    if abs(lower_value) <= 1e-13:
        roots.append(0.0)
    for index in range(1, ROOT_SUBDIVISIONS + 1):
        upper = index * step
        if upper >= 0.5:
            upper = math.nextafter(0.5, 0.0)
        upper_value = function(upper)
        if upper_value == 0.0:
            if not roots or abs(upper - roots[-1]) > 1e-10:
                roots.append(upper)
        elif lower_value * upper_value < 0.0:
            root = bisect_root(function, lower, upper)
            if not roots or abs(root - roots[-1]) > 1e-10:
                roots.append(root)
        lower = upper
        lower_value = upper_value
    if len(roots) != 2:
        raise ValueError(f"expected two junction roots, found {len(roots)}: {roots}")
    return roots


def stub_susceptance(termination, theta):
    if termination == "open":
        return math.sin(theta) / math.cos(theta)
    return -math.cos(theta) / math.sin(theta)


def solve_stub_length(termination, required_b):
    if termination == "open" and required_b == 0.0:
        return 0.0
    if termination == "short" and required_b == 0.0:
        return 0.25

    half_pi = math.pi / 2.0
    if termination == "open":
        lower, upper = (0.0, math.nextafter(half_pi, 0.0)) if required_b > 0 else (
            math.nextafter(half_pi, math.pi),
            math.nextafter(math.pi, 0.0),
        )
    else:
        lower, upper = (
            (math.nextafter(0.0, 1.0), math.nextafter(half_pi, 0.0))
            if required_b < 0
            else (math.nextafter(half_pi, math.pi), math.nextafter(math.pi, 0.0))
        )

    function = lambda theta: stub_susceptance(termination, theta) - required_b
    theta = bisect_root(function, lower, upper)
    return theta / (2.0 * math.pi)


def complex_object(value):
    return {"re": value.real, "im": value.imag}


def solve_case(case):
    input_data = case["input"]
    z0 = input_data["characteristicImpedanceOhms"]
    load_z = complex(input_data["resistanceOhms"], input_data["reactanceOhms"]) / z0
    load_gamma = (load_z - 1.0) / (load_z + 1.0)
    wavelength = (
        SPEED_OF_LIGHT * input_data["velocityFactor"] / input_data["frequencyHz"]
    )
    solutions = []
    for distance in find_junction_distances(load_z):
        junction_z = direct_line_impedance(load_z, distance)
        junction_y = 1.0 / junction_z
        required_b = -junction_y.imag
        terminations = {}
        for termination in ("open", "short"):
            stub_length = solve_stub_length(termination, required_b)
            actual_b = stub_susceptance(termination, 2.0 * math.pi * stub_length)
            resulting_y = junction_y + 1j * actual_b
            resulting_gamma = (1.0 - resulting_y) / (1.0 + resulting_y)
            terminations[termination] = {
                "stubLengthWavelengths": stub_length,
                "stubLengthMeters": stub_length * wavelength,
                "resultingNormalizedAdmittance": complex_object(resulting_y),
                "resultingReflectionCoefficient": complex_object(resulting_gamma),
                "residualReflectionMagnitude": abs(resulting_gamma),
            }
        solutions.append(
            {
                "feedlineDistanceWavelengths": distance,
                "feedlineDistanceMeters": distance * wavelength,
                "junctionNormalizedImpedance": complex_object(junction_z),
                "junctionNormalizedAdmittance": complex_object(junction_y),
                "requiredStubNormalizedSusceptance": required_b,
                "terminations": terminations,
            }
        )
    return {
        "normalizedLoadImpedance": complex_object(load_z),
        "loadReflectionCoefficient": complex_object(load_gamma),
        "wavelengthMeters": wavelength,
        "solutions": solutions,
    }


def require(condition, message, failures):
    if not condition:
        failures.append(message)


def is_finite_number(value):
    return isinstance(value, (int, float)) and not isinstance(value, bool) and math.isfinite(value)


def validate_complex_shape(value, label, failures):
    require(isinstance(value, dict), f"{label}: complex value must be an object", failures)
    if not isinstance(value, dict):
        return
    require(set(value) == {"re", "im"}, f"{label}: complex keys must be re/im", failures)
    require(is_finite_number(value.get("re")), f"{label}.re: must be finite", failures)
    require(is_finite_number(value.get("im")), f"{label}.im: must be finite", failures)


def validate_schema_contract(schema, failures):
    require(
        schema.get("$schema") == "https://json-schema.org/draft/2020-12/schema",
        "schema: wrong JSON Schema draft",
        failures,
    )
    definitions = schema.get("$defs", {})
    require(
        {"case", "solution", "termination", "complex", "source", "tolerance"}.issubset(
            definitions
        ),
        "schema: required definitions missing",
        failures,
    )
    require(
        schema.get("properties", {}).get("cases", {}).get("minItems", 0) >= 10,
        "schema: cases minItems must be at least ten",
        failures,
    )


def validate_fixture_shape(document, failures):
    require(document.get("schemaVersion") == 1, "cases: schemaVersion must be 1", failures)
    cases = document.get("cases")
    require(isinstance(cases, list), "cases: cases must be an array", failures)
    if not isinstance(cases, list):
        return []
    require(len(cases) >= 10, "cases: fewer than ten solved cases", failures)
    ids = [case.get("id") for case in cases if isinstance(case, dict)]
    require(len(ids) == len(set(ids)), "cases: duplicate case id", failures)
    for case in cases:
        case_id = case.get("id", "<missing>")
        for field in ("input", "tolerance", "source", "equations", "expected"):
            require(field in case, f"{case_id}: missing {field}", failures)
        source = case.get("source", {})
        for field in ("title", "provider", "method", "locator", "convention"):
            require(field in source, f"{case_id}: missing source {field}", failures)
        input_data = case.get("input", {})
        require(
            set(input_data)
            == {
                "resistanceOhms",
                "reactanceOhms",
                "characteristicImpedanceOhms",
                "frequencyHz",
                "velocityFactor",
            },
            f"{case_id}: invalid input fields",
            failures,
        )
        for field in input_data:
            require(
                is_finite_number(input_data[field]),
                f"{case_id}: input {field} must be finite",
                failures,
            )
        require(input_data.get("resistanceOhms", 0) > 0, f"{case_id}: resistance must be positive", failures)
        require(input_data.get("characteristicImpedanceOhms", 0) > 0, f"{case_id}: z0 must be positive", failures)
        require(input_data.get("frequencyHz", 0) > 0, f"{case_id}: frequency must be positive", failures)
        require(0 < input_data.get("velocityFactor", 0) <= 1, f"{case_id}: velocity factor out of range", failures)
        tolerance = case.get("tolerance", {})
        require(set(tolerance) == {"absolute", "relative"}, f"{case_id}: invalid tolerance", failures)
        require(tolerance.get("absolute", 0) > 0, f"{case_id}: absolute tolerance must be positive", failures)
        require(tolerance.get("relative", 0) > 0, f"{case_id}: relative tolerance must be positive", failures)
        equations = case.get("equations", [])
        require(isinstance(equations, list) and equations, f"{case_id}: equations must be nonempty", failures)
        require(len(equations) == len(set(equations)), f"{case_id}: duplicate equation id", failures)
        expected = case.get("expected", {})
        validate_complex_shape(expected.get("normalizedLoadImpedance"), f"{case_id}.normalizedLoadImpedance", failures)
        validate_complex_shape(expected.get("loadReflectionCoefficient"), f"{case_id}.loadReflectionCoefficient", failures)
        require(is_finite_number(expected.get("wavelengthMeters")) and expected.get("wavelengthMeters", 0) > 0, f"{case_id}: invalid wavelength", failures)
        require(len(expected.get("solutions", [])) == 2, f"{case_id}: expected two solutions", failures)
        distances = []
        for index, solution in enumerate(expected.get("solutions", [])):
            prefix = f"{case_id}.solution[{index}]"
            distance = solution.get("feedlineDistanceWavelengths")
            distances.append(distance)
            require(is_finite_number(distance) and 0 <= distance < 0.5, f"{prefix}: distance not canonical", failures)
            require(is_finite_number(solution.get("feedlineDistanceMeters")) and solution.get("feedlineDistanceMeters", -1) >= 0, f"{prefix}: invalid physical distance", failures)
            validate_complex_shape(solution.get("junctionNormalizedImpedance"), f"{prefix}.junctionZ", failures)
            validate_complex_shape(solution.get("junctionNormalizedAdmittance"), f"{prefix}.junctionY", failures)
            require(is_finite_number(solution.get("requiredStubNormalizedSusceptance")), f"{prefix}: invalid required susceptance", failures)
            terminations = solution.get("terminations", {})
            require(set(terminations) == {"open", "short"}, f"{case_id}: invalid terminations", failures)
            for termination, values in terminations.items():
                term_prefix = f"{prefix}.{termination}"
                stub_length = values.get("stubLengthWavelengths")
                require(is_finite_number(stub_length) and 0 <= stub_length < 0.5, f"{term_prefix}: stub length not canonical", failures)
                require(is_finite_number(values.get("stubLengthMeters")) and values.get("stubLengthMeters", -1) >= 0, f"{term_prefix}: invalid physical stub length", failures)
                validate_complex_shape(values.get("resultingNormalizedAdmittance"), f"{term_prefix}.resultingY", failures)
                validate_complex_shape(values.get("resultingReflectionCoefficient"), f"{term_prefix}.resultingGamma", failures)
                residual = values.get("residualReflectionMagnitude")
                require(is_finite_number(residual) and 0 <= residual <= 1e-8, f"{term_prefix}: invalid residual", failures)
        if len(distances) == 2 and all(is_finite_number(value) for value in distances):
            require(distances[0] < distances[1], f"{case_id}: solutions not distinct and ordered", failures)
    return cases


def compare_number(case_id, field, actual, expected, tolerance, failures):
    if not close(actual, expected, tolerance["absolute"], tolerance["relative"]):
        failures.append(f"{case_id} {field}: {actual!r} != {expected!r}")


def compare_complex(case_id, field, actual, expected, tolerance, failures):
    compare_number(case_id, f"{field}.re", actual["re"], expected["re"], tolerance, failures)
    compare_number(case_id, f"{field}.im", actual["im"], expected["im"], tolerance, failures)


def compare_case(case, actual, failures, exercised):
    case_id = case["id"]
    expected = case["expected"]
    tolerance = case["tolerance"]
    compare_complex(case_id, "normalizedLoadImpedance", actual["normalizedLoadImpedance"], expected["normalizedLoadImpedance"], tolerance, failures)
    exercised.add("RF-NORM-001")
    compare_complex(case_id, "loadReflectionCoefficient", actual["loadReflectionCoefficient"], expected["loadReflectionCoefficient"], tolerance, failures)
    exercised.add("RF-GAMMA-001")

    gamma = complex(actual["loadReflectionCoefficient"]["re"], actual["loadReflectionCoefficient"]["im"])
    recovered_z = (1.0 + gamma) / (1.0 - gamma)
    expected_z = complex(actual["normalizedLoadImpedance"]["re"], actual["normalizedLoadImpedance"]["im"])
    require(close(recovered_z.real, expected_z.real, tolerance["absolute"], tolerance["relative"]), f"{case_id}: reflection impedance round trip real", failures)
    require(close(recovered_z.imag, expected_z.imag, tolerance["absolute"], tolerance["relative"]), f"{case_id}: reflection impedance round trip imaginary", failures)
    exercised.add("RF-ZFROMGAMMA-001")

    compare_number(case_id, "wavelengthMeters", actual["wavelengthMeters"], expected["wavelengthMeters"], tolerance, failures)
    exercised.add("RF-WAVELENGTH-001")

    rho = abs(gamma)
    expected_b = 2.0 * rho / math.sqrt((1.0 - rho) * (1.0 + rho))
    for index, (actual_solution, expected_solution) in enumerate(zip(actual["solutions"], expected["solutions"])):
        prefix = f"solution[{index}]"
        for field in ("feedlineDistanceWavelengths", "feedlineDistanceMeters", "requiredStubNormalizedSusceptance"):
            compare_number(case_id, f"{prefix}.{field}", actual_solution[field], expected_solution[field], tolerance, failures)
        for field in ("junctionNormalizedImpedance", "junctionNormalizedAdmittance"):
            compare_complex(case_id, f"{prefix}.{field}", actual_solution[field], expected_solution[field], tolerance, failures)
        junction_z = complex(actual_solution["junctionNormalizedImpedance"]["re"], actual_solution["junctionNormalizedImpedance"]["im"])
        junction_y = complex(actual_solution["junctionNormalizedAdmittance"]["re"], actual_solution["junctionNormalizedAdmittance"]["im"])
        require(abs(junction_y - 1.0 / junction_z) <= 1e-9, f"{case_id} {prefix}: reciprocal mismatch", failures)
        exercised.add("RF-ADMITTANCE-001")
        require(abs(junction_y.real - 1.0) <= 1e-9, f"{case_id} {prefix}: conductance is not one", failures)
        require(close(abs(junction_y.imag), expected_b, 1e-8, 1e-8), f"{case_id} {prefix}: g=1 intersection mismatch", failures)
        exercised.add("RF-G1-001")

        distance = actual_solution["feedlineDistanceWavelengths"]
        rotated_gamma = gamma * cmath.exp(-1j * 4.0 * math.pi * distance)
        direct_gamma = (junction_z - 1.0) / (junction_z + 1.0)
        require(abs(rotated_gamma - direct_gamma) <= 1e-9, f"{case_id} {prefix}: line rotation mismatch", failures)
        exercised.add("RF-LINE-001")

        for termination in ("open", "short"):
            actual_termination = actual_solution["terminations"][termination]
            expected_termination = expected_solution["terminations"][termination]
            for field in ("stubLengthWavelengths", "stubLengthMeters", "residualReflectionMagnitude"):
                compare_number(case_id, f"{prefix}.{termination}.{field}", actual_termination[field], expected_termination[field], tolerance, failures)
            for field in ("resultingNormalizedAdmittance", "resultingReflectionCoefficient"):
                compare_complex(case_id, f"{prefix}.{termination}.{field}", actual_termination[field], expected_termination[field], tolerance, failures)
            require(actual_termination["residualReflectionMagnitude"] <= 1e-8, f"{case_id} {prefix} {termination}: residual exceeds limit", failures)
            exercised.add("RF-STUB-OPEN-001" if termination == "open" else "RF-STUB-SHORT-001")


def decode_edge_number(value):
    if value == "NaN":
        return math.nan
    if value == "Infinity":
        return math.inf
    if value == "-Infinity":
        return -math.inf
    return value


def classify_edge(case):
    input_data = case["input"]
    z0 = decode_edge_number(input_data.get("characteristicImpedanceOhms", 50.0))
    frequency = decode_edge_number(input_data.get("frequencyHz", 14_200_000.0))
    velocity = decode_edge_number(input_data.get("velocityFactor", 0.66))
    if not math.isfinite(z0) or z0 <= 0 or not math.isfinite(frequency) or frequency <= 0 or not math.isfinite(velocity) or velocity <= 0 or velocity > 1:
        return "invalid-input"
    load = input_data["load"]
    if load["kind"] == "open":
        return "open-circuit"
    resistance = decode_edge_number(load["resistanceOhms"])
    reactance = decode_edge_number(load["reactanceOhms"])
    if not math.isfinite(resistance) or not math.isfinite(reactance):
        return "invalid-input"
    if resistance < 0:
        return "active-load"
    if resistance == 0:
        return "lossless-boundary"
    gamma = abs(((complex(resistance, reactance) / z0) - 1) / ((complex(resistance, reactance) / z0) + 1))
    return "matched" if gamma <= 1e-12 else "solved"


def verify_edges(root, failures):
    document = json.loads((root / "edge-cases.json").read_text())
    cases = document.get("cases", [])
    require(document.get("schemaVersion") == 1, "edges: schemaVersion must be 1", failures)
    require(bool(cases), "edges: no cases", failures)
    ids = [case.get("id") for case in cases]
    require(len(ids) == len(set(ids)), "edges: duplicate case id", failures)
    for case in cases:
        actual = classify_edge(case)
        require(actual == case["expectedStatus"], f"{case['id']}: {actual} != {case['expectedStatus']}", failures)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--fixtures", required=True)
    args = parser.parse_args()
    root = Path(args.fixtures)
    schema = json.loads((root / "schema.json").read_text())
    document = json.loads((root / "cases.json").read_text())
    coverage = json.loads((root / "equation-coverage.json").read_text())
    failures = []
    validate_schema_contract(schema, failures)
    cases = validate_fixture_shape(document, failures)
    exercised = set()
    for case in cases:
        try:
            compare_case(case, solve_case(case), failures, exercised)
        except (ArithmeticError, KeyError, TypeError, ValueError) as error:
            failures.append(f"{case.get('id', '<missing>')}: {error}")
    verify_edges(root, failures)

    declared = coverage.get("equations", {})
    require(set(declared) == set(EQUATION_ASSERTIONS), "coverage: equation register mismatch", failures)
    for equation_id, assertion_name in EQUATION_ASSERTIONS.items():
        require(declared.get(equation_id, {}).get("assertion") == assertion_name, f"coverage: wrong assertion for {equation_id}", failures)
        require(equation_id in exercised, f"coverage: assertion not exercised for {equation_id}", failures)
        count = sum(equation_id in case.get("equations", []) for case in cases)
        require(count >= declared.get(equation_id, {}).get("minimumCases", 2), f"coverage: too few fixture cases for {equation_id}", failures)

    required_external = {"resistive-low", "capacitive-hf", "quadrant-cap", "quadrant-ind"}
    for case in cases:
        if case["id"] in required_external:
            require(bool(case["source"].get("externalConfirmation")), f"{case['id']}: missing external confirmation", failures)

    if failures:
        raise SystemExit("\n".join(failures))
    print(f"Verified {len(cases)} solved cases, both terminations, {len(exercised)} equation assertions, and edge cases")


if __name__ == "__main__":
    main()
