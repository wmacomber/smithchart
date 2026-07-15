import { describe, expect, it } from 'vitest';
import cases from '../../../tests/reference-cases/cases.json';
import { complex, hertz, ohms, solveShuntStub } from '..';

describe('checked RF reference fixtures', () => {
  for (const reference of cases) {
    for (const termination of ['open', 'short'] as const) {
      it(`${reference.id} ${termination}`, () => {
        const result = solveShuntStub({
          load: { kind: 'finite', impedanceOhms: complex(reference.r, reference.x) },
          characteristicImpedanceOhms: ohms(reference.z0),
          frequencyHz: hertz(reference.frequencyHz ?? 14_200_000),
          velocityFactor: reference.velocityFactor ?? 0.66,
          termination,
        });
        expect(result.status).toBe('solved');
        if (result.status !== 'solved') return;
        const expected = reference.expected[termination];
        result.solutions.forEach((solution, index) => {
          expect(solution.feedlineDistanceWavelengths).toBeCloseTo(expected[index]![0]!, 8);
          expect(solution.junctionNormalizedAdmittance.im).toBeCloseTo(expected[index]![1]!, 8);
          expect(solution.stubLengthWavelengths).toBeCloseTo(expected[index]![2]!, 8);
          expect(solution.diagnostics.resultReflectionMagnitude).toBeLessThanOrEqual(1e-8);
        });
        if (reference.expectedWavelengthMeters) {
          expect(
            result.solutions[0].feedlineDistanceMeters /
              result.solutions[0].feedlineDistanceWavelengths,
          ).toBeCloseTo(reference.expectedWavelengthMeters, 8);
        }
      });
    }
  }
});
