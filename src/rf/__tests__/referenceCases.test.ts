import { describe, expect, it } from 'vitest';
import referenceDocument from '../../../tests/reference-cases/cases.json';
import edgeDocument from '../../../tests/reference-cases/edge-cases.json';
import {
  complex,
  hertz,
  impedanceToReflection,
  normalizeImpedance,
  ohms,
  solveShuntStub,
} from '..';

type ExpectedComplex = { readonly re: number; readonly im: number };
type ExpectedTermination = {
  readonly stubLengthWavelengths: number;
  readonly stubLengthMeters: number;
  readonly resultingNormalizedAdmittance: ExpectedComplex;
  readonly resultingReflectionCoefficient: ExpectedComplex;
  readonly residualReflectionMagnitude: number;
};
type ExpectedSolution = {
  readonly feedlineDistanceWavelengths: number;
  readonly feedlineDistanceMeters: number;
  readonly junctionNormalizedImpedance: ExpectedComplex;
  readonly junctionNormalizedAdmittance: ExpectedComplex;
  readonly requiredStubNormalizedSusceptance: number;
  readonly terminations: {
    readonly open: ExpectedTermination;
    readonly short: ExpectedTermination;
  };
};
type ReferenceCase = (typeof referenceDocument.cases)[number] & {
  readonly expected: {
    readonly normalizedLoadImpedance: ExpectedComplex;
    readonly loadReflectionCoefficient: ExpectedComplex;
    readonly wavelengthMeters: number;
    readonly solutions: readonly [ExpectedSolution, ExpectedSolution];
  };
};

const expectNumber = (
  actual: number,
  expected: number,
  tolerance: { readonly absolute: number; readonly relative: number },
) => {
  const limit =
    tolerance.absolute + tolerance.relative * Math.max(1, Math.abs(actual), Math.abs(expected));
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(limit);
};

const expectComplex = (
  actual: ExpectedComplex,
  expected: ExpectedComplex,
  tolerance: { readonly absolute: number; readonly relative: number },
) => {
  expectNumber(actual.re, expected.re, tolerance);
  expectNumber(actual.im, expected.im, tolerance);
};

describe('independently computed RF reference fixtures', () => {
  for (const rawReference of referenceDocument.cases) {
    const reference = rawReference as ReferenceCase;
    for (const termination of ['open', 'short'] as const) {
      it(`${reference.id} ${termination}`, () => {
        const input = reference.input;
        const normalizedLoad = normalizeImpedance(
          complex(input.resistanceOhms, input.reactanceOhms),
          ohms(input.characteristicImpedanceOhms),
        );
        expectComplex(
          normalizedLoad,
          reference.expected.normalizedLoadImpedance,
          reference.tolerance,
        );
        expectComplex(
          impedanceToReflection(normalizedLoad),
          reference.expected.loadReflectionCoefficient,
          reference.tolerance,
        );

        const result = solveShuntStub({
          load: {
            kind: 'finite',
            impedanceOhms: complex(input.resistanceOhms, input.reactanceOhms),
          },
          characteristicImpedanceOhms: ohms(input.characteristicImpedanceOhms),
          frequencyHz: hertz(input.frequencyHz),
          velocityFactor: input.velocityFactor,
          termination,
        });
        expect(result.status).toBe('solved');
        if (result.status !== 'solved') return;

        result.solutions.forEach((solution, index) => {
          const expected = reference.expected.solutions[index]!;
          const expectedTermination = expected.terminations[termination];
          expectNumber(
            solution.feedlineDistanceWavelengths,
            expected.feedlineDistanceWavelengths,
            reference.tolerance,
          );
          expectNumber(
            solution.feedlineDistanceMeters,
            expected.feedlineDistanceMeters,
            reference.tolerance,
          );
          expectComplex(
            solution.junctionNormalizedImpedance,
            expected.junctionNormalizedImpedance,
            reference.tolerance,
          );
          expectComplex(
            solution.junctionNormalizedAdmittance,
            expected.junctionNormalizedAdmittance,
            reference.tolerance,
          );
          expectNumber(
            solution.requiredStubNormalizedSusceptance,
            expected.requiredStubNormalizedSusceptance,
            reference.tolerance,
          );
          expectNumber(
            solution.stubLengthWavelengths,
            expectedTermination.stubLengthWavelengths,
            reference.tolerance,
          );
          expectNumber(
            solution.stubLengthMeters,
            expectedTermination.stubLengthMeters,
            reference.tolerance,
          );
          expectComplex(
            solution.resultingNormalizedAdmittance,
            expectedTermination.resultingNormalizedAdmittance,
            reference.tolerance,
          );
          expectComplex(
            solution.resultingReflectionCoefficient,
            expectedTermination.resultingReflectionCoefficient,
            reference.tolerance,
          );
          expectNumber(
            solution.diagnostics.resultReflectionMagnitude,
            expectedTermination.residualReflectionMagnitude,
            reference.tolerance,
          );
          expect(solution.diagnostics.resultReflectionMagnitude).toBeLessThanOrEqual(1e-8);
        });
      });
    }
  }
});

const decodeNumber = (value: number | string | undefined, fallback: number): number => {
  if (value === undefined) return fallback;
  if (value === 'NaN') return Number.NaN;
  if (value === 'Infinity') return Number.POSITIVE_INFINITY;
  if (value === '-Infinity') return Number.NEGATIVE_INFINITY;
  return value as number;
};

describe('tagged edge fixtures', () => {
  for (const edge of edgeDocument.cases) {
    it(edge.id, () => {
      const input = edge.input;
      const load =
        input.load.kind === 'open'
          ? ({ kind: 'open' } as const)
          : {
              kind: 'finite' as const,
              impedanceOhms: complex(
                decodeNumber(input.load.resistanceOhms, 0),
                decodeNumber(input.load.reactanceOhms, 0),
              ),
            };
      const result = solveShuntStub({
        load,
        characteristicImpedanceOhms: ohms(decodeNumber(input.characteristicImpedanceOhms, 50)),
        frequencyHz: hertz(decodeNumber(input.frequencyHz, 14_200_000)),
        velocityFactor: decodeNumber(input.velocityFactor, 0.66),
        termination: 'open',
      });

      if (edge.id === 'passive-near-boundary') {
        expect(result.status).not.toBe('no-passive-solution');
        return;
      }
      const actualStatus = result.status === 'no-passive-solution' ? result.reason : result.status;
      expect(actualStatus).toBe(edge.expectedStatus);
    });
  }
});
