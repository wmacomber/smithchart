import { denormalizeAdmittance, impedanceToAdmittance } from './admittance';
import type { Complex } from './complex';
import { add, complex, isFiniteComplex, magnitude, phase } from './complex';
import {
  MAX_RESULT_REFLECTION,
  PRIMITIVE_ABSOLUTE_TOLERANCE,
  SOLVER_ABSOLUTE_TOLERANCE,
  SOLVER_RELATIVE_TOLERANCE,
  canonicalHalfWavelength,
  positiveAngle,
  withinTolerance,
} from './conventions';
import { denormalizeImpedance, normalizeImpedance } from './impedance';
import type { Degrees, Hertz, Meters, Ohms, Siemens, Wavelengths } from './quantities';
import {
  mediumWavelengthMeters,
  siemens,
  wavelengthDistanceMeters,
  wavelengthElectricalDegrees,
  wavelengths,
} from './quantities';
import {
  admittanceToReflection,
  impedanceToReflection,
  reflectionToImpedance,
  reflectionToVswr,
} from './reflection';
import { rotateTowardGenerator } from './transmissionLine';
import type { ValidationIssue } from './validation';
import { validateStubMatchInput } from './validation';

export type Load =
  { readonly kind: 'finite'; readonly impedanceOhms: Complex } | { readonly kind: 'open' };
export type StubTermination = 'open' | 'short';

export interface StubMatchInput {
  readonly load: Load;
  readonly characteristicImpedanceOhms: Ohms;
  readonly frequencyHz: Hertz;
  readonly velocityFactor: number;
  readonly termination: StubTermination;
}

export interface MatchDiagnostics {
  readonly loadReflectionMagnitude: number;
  readonly resultReflectionMagnitude: number;
  readonly conductanceError: number;
  readonly susceptanceError: number;
}

export interface StubMatchSolution {
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

export type StubMatchResult =
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

export const stubNormalizedSusceptance = (
  termination: StubTermination,
  length: Wavelengths,
): number => {
  const canonicalLength = canonicalHalfWavelength(length);
  if (termination === 'open' && canonicalLength === 0.25) {
    return Number.POSITIVE_INFINITY;
  }
  if (termination === 'short' && canonicalLength === 0) {
    return Number.NEGATIVE_INFINITY;
  }
  const theta = 2 * Math.PI * canonicalLength;
  return termination === 'open' ? Math.tan(theta) : -1 / Math.tan(theta);
};

export const stubLengthForSusceptance = (
  termination: StubTermination,
  susceptance: number,
): Wavelengths => {
  if (termination === 'open') {
    return wavelengths(
      canonicalHalfWavelength(positiveAngle(Math.atan2(susceptance, 1)) / (2 * Math.PI)),
    );
  }
  if (Math.abs(susceptance) <= PRIMITIVE_ABSOLUTE_TOLERANCE) return wavelengths(0.25);
  const theta = positiveAngle(Math.atan2(-1, susceptance));
  return wavelengths(canonicalHalfWavelength(theta / (2 * Math.PI)));
};

const makeSolution = (
  input: StubMatchInput,
  gammaLoad: Complex,
  distanceValue: number,
): StubMatchSolution | null => {
  const z0 = input.characteristicImpedanceOhms;
  const distance = wavelengths(canonicalHalfWavelength(distanceValue));
  const gammaJunction = rotateTowardGenerator(gammaLoad, distance);
  const junctionZ = reflectionToImpedance(gammaJunction);
  const junctionY = impedanceToAdmittance(junctionZ);
  const required = -junctionY.im;
  const stubLength = stubLengthForSusceptance(input.termination, required);
  const actualStubB = stubNormalizedSusceptance(input.termination, stubLength);
  const resultingY = add(junctionY, complex(0, actualStubB));
  const resultingGamma = admittanceToReflection(resultingY);
  const residualMagnitude = magnitude(resultingGamma);
  const wavelength = mediumWavelengthMeters(input.frequencyHz, input.velocityFactor);
  const feedlineDistanceDegrees = wavelengthElectricalDegrees(distance);
  const feedlineDistanceMeters = wavelengthDistanceMeters(distance, wavelength);
  const junctionImpedanceOhms = denormalizeImpedance(junctionZ, z0);
  const junctionAdmittanceSiemens = denormalizeAdmittance(junctionY, z0);
  const requiredStubSusceptanceSiemens = siemens(required / z0);
  const stubElectricalDegrees = wavelengthElectricalDegrees(stubLength);
  const stubLengthMeters = wavelengthDistanceMeters(stubLength, wavelength);
  const residualVswr = reflectionToVswr(resultingGamma);
  const diagnostics: MatchDiagnostics = {
    loadReflectionMagnitude: magnitude(gammaLoad),
    resultReflectionMagnitude: residualMagnitude,
    conductanceError: junctionY.re - 1,
    susceptanceError: resultingY.im,
  };
  if (
    !isFiniteComplex(junctionZ) ||
    !isFiniteComplex(junctionY) ||
    !isFiniteComplex(junctionImpedanceOhms) ||
    !isFiniteComplex(junctionAdmittanceSiemens) ||
    !Number.isFinite(actualStubB) ||
    !Number.isFinite(residualMagnitude) ||
    !Number.isFinite(wavelength) ||
    !Number.isFinite(feedlineDistanceDegrees) ||
    !Number.isFinite(feedlineDistanceMeters) ||
    !Number.isFinite(requiredStubSusceptanceSiemens) ||
    !Number.isFinite(stubElectricalDegrees) ||
    !Number.isFinite(stubLengthMeters) ||
    !Number.isFinite(residualVswr) ||
    !withinTolerance(junctionY.re, 1, SOLVER_ABSOLUTE_TOLERANCE, SOLVER_RELATIVE_TOLERANCE) ||
    !withinTolerance(resultingY.im, 0, SOLVER_ABSOLUTE_TOLERANCE, SOLVER_RELATIVE_TOLERANCE) ||
    residualMagnitude > MAX_RESULT_REFLECTION
  ) {
    return null;
  }
  return {
    id: 'A',
    feedlineDistanceWavelengths: distance,
    feedlineDistanceDegrees,
    feedlineDistanceMeters,
    junctionNormalizedImpedance: junctionZ,
    junctionImpedanceOhms,
    junctionNormalizedAdmittance: junctionY,
    junctionAdmittanceSiemens,
    requiredStubNormalizedSusceptance: required,
    requiredStubSusceptanceSiemens,
    stubLengthWavelengths: stubLength,
    stubElectricalDegrees,
    stubLengthMeters,
    resultingNormalizedAdmittance: resultingY,
    resultingReflectionCoefficient: resultingGamma,
    residualVswr,
    diagnostics,
  };
};

export const solveShuntStub = (input: StubMatchInput): StubMatchResult => {
  const issues = validateStubMatchInput(input);
  if (issues.length) return { status: 'invalid-input', issues };
  if (input.load.kind === 'open') return { status: 'no-passive-solution', reason: 'open-circuit' };
  if (input.load.impedanceOhms.re < 0)
    return { status: 'no-passive-solution', reason: 'active-load' };
  if (input.load.impedanceOhms.re === 0)
    return { status: 'no-passive-solution', reason: 'lossless-boundary' };

  const normalizedLoad = normalizeImpedance(
    input.load.impedanceOhms,
    input.characteristicImpedanceOhms,
  );
  const gammaLoad = impedanceToReflection(normalizedLoad);
  const rho = magnitude(gammaLoad);
  if (rho <= PRIMITIVE_ABSOLUTE_TOLERANCE) {
    return {
      status: 'matched',
      diagnostics: {
        loadReflectionMagnitude: rho,
        resultReflectionMagnitude: rho,
        conductanceError: 0,
        susceptanceError: 0,
      },
    };
  }
  if (!Number.isFinite(rho) || rho >= 1) {
    return {
      status: 'numerical-failure',
      diagnostics: {
        loadReflectionMagnitude: rho,
        resultReflectionMagnitude: Number.POSITIVE_INFINITY,
        conductanceError: Number.NaN,
        susceptanceError: Number.NaN,
      },
    };
  }

  const bMagnitude = (2 * rho) / Math.sqrt((1 - rho) * (1 + rho));
  const candidates = [bMagnitude, -bMagnitude].map((b) => {
    const targetGamma = admittanceToReflection(complex(1, b));
    const clockwiseAngle = positiveAngle(phase(gammaLoad) - phase(targetGamma));
    return makeSolution(input, gammaLoad, clockwiseAngle / (4 * Math.PI));
  });
  if (!candidates[0] || !candidates[1]) {
    return {
      status: 'numerical-failure',
      diagnostics: {
        loadReflectionMagnitude: rho,
        resultReflectionMagnitude: Number.POSITIVE_INFINITY,
        conductanceError: Number.NaN,
        susceptanceError: Number.NaN,
      },
    };
  }
  const ordered = [candidates[0], candidates[1]].sort(
    (a, b) => a.feedlineDistanceWavelengths - b.feedlineDistanceWavelengths,
  );
  if (
    Math.abs(ordered[1]!.feedlineDistanceWavelengths - ordered[0]!.feedlineDistanceWavelengths) <=
    PRIMITIVE_ABSOLUTE_TOLERANCE
  ) {
    return {
      status: 'numerical-failure',
      diagnostics: {
        loadReflectionMagnitude: rho,
        resultReflectionMagnitude: Number.POSITIVE_INFINITY,
        conductanceError: Number.NaN,
        susceptanceError: Number.NaN,
      },
    };
  }
  const first = { ...ordered[0]!, id: 'A' as const };
  const second = { ...ordered[1]!, id: 'B' as const };
  return { status: 'solved', solutions: [first, second] };
};
