import { describe, expect, it } from 'vitest';
import {
  complex,
  hertz,
  ohms,
  solveShuntStub,
  stubLengthForSusceptance,
  stubNormalizedSusceptance,
} from '..';
const input = {
  load: { kind: 'finite' as const, impedanceOhms: complex(35, -22) },
  characteristicImpedanceOhms: ohms(50),
  frequencyHz: hertz(14.2e6),
  velocityFactor: 0.66,
  termination: 'short' as const,
};
describe('shunt solver', () => {
  it('returns two verified ordered solutions', () => {
    const result = solveShuntStub(input);
    expect(result.status).toBe('solved');
    if (result.status !== 'solved') return;
    expect(result.solutions[0].id).toBe('A');
    expect(result.solutions[0].feedlineDistanceWavelengths).toBeLessThan(
      result.solutions[1].feedlineDistanceWavelengths,
    );
    for (const solution of result.solutions) {
      expect(solution.diagnostics.resultReflectionMagnitude).toBeLessThanOrEqual(1e-8);
      expect(solution.feedlineDistanceWavelengths).toBeGreaterThanOrEqual(0);
      expect(solution.stubLengthWavelengths).toBeLessThan(0.5);
    }
  });
  it('handles matched, open, short, and active loads explicitly', () => {
    expect(
      solveShuntStub({ ...input, load: { kind: 'finite', impedanceOhms: complex(50, 0) } }).status,
    ).toBe('matched');
    expect(solveShuntStub({ ...input, load: { kind: 'open' } })).toMatchObject({
      status: 'no-passive-solution',
      reason: 'open-circuit',
    });
    expect(
      solveShuntStub({ ...input, load: { kind: 'finite', impedanceOhms: complex(0, 0) } }),
    ).toMatchObject({ status: 'no-passive-solution', reason: 'lossless-boundary' });
    expect(
      solveShuntStub({ ...input, load: { kind: 'finite', impedanceOhms: complex(-1, 2) } }),
    ).toMatchObject({ status: 'no-passive-solution', reason: 'active-load' });
  });
  it('inverts both stub equations across quadrants', () => {
    for (const termination of ['open', 'short'] as const)
      for (const b of [-10, -1, 0, 1, 10]) {
        const length = stubLengthForSusceptance(termination, b);
        expect(stubNormalizedSusceptance(termination, length)).toBeCloseTo(b, 9);
      }
  });
});
