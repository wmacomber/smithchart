import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import {
  admittanceToReflection,
  complex,
  divide,
  hertz,
  impedanceToAdmittance,
  impedanceToReflection,
  magnitude,
  meters,
  metersToFeet,
  ohms,
  reflectionToImpedance,
  rotateTowardGenerator,
  solveShuntStub,
  stubLengthForSusceptance,
  stubNormalizedSusceptance,
  wavelengthElectricalDegrees,
  wavelengths,
} from '..';

const finite = fc.double({ min: -1e3, max: 1e3, noNaN: true, noDefaultInfinity: true });
const passiveResistance = fc.double({ min: 0.05, max: 100, noNaN: true });
const reactance = fc.double({ min: -100, max: 100, noNaN: true });
const distance = fc.double({ min: 0, max: 0.5, noNaN: true });
const close = (actual: number, expected: number, tolerance = 1e-8) =>
  Math.abs(actual - expected) <= tolerance * Math.max(1, Math.abs(actual), Math.abs(expected));

describe('RF properties', () => {
  it('z → gamma → z round trips', () =>
    fc.assert(
      fc.property(passiveResistance, finite, (r, x) => {
        const z = complex(r, x);
        const actual = reflectionToImpedance(impedanceToReflection(z));
        expect(close(actual.re, r, 1e-7)).toBe(true);
        expect(close(actual.im, x, 1e-7)).toBe(true);
      }),
      { numRuns: 300 },
    ));

  it('reciprocal is involutive', () =>
    fc.assert(
      fc.property(passiveResistance, finite, (r, x) => {
        const z = complex(r, x);
        const actual = impedanceToAdmittance(impedanceToAdmittance(z));
        expect(close(actual.re, r, 1e-7)).toBe(true);
        expect(close(actual.im, x, 1e-7)).toBe(true);
      }),
      { numRuns: 300 },
    ));

  it('impedance and admittance reflection forms agree', () =>
    fc.assert(
      fc.property(passiveResistance, reactance, (r, x) => {
        const z = complex(r, x);
        const fromZ = impedanceToReflection(z);
        const fromY = admittanceToReflection(impedanceToAdmittance(z));
        expect(close(fromZ.re, fromY.re)).toBe(true);
        expect(close(fromZ.im, fromY.im)).toBe(true);
      }),
    ));

  it('lossless rotation preserves magnitude, composes, and repeats each half wavelength', () =>
    fc.assert(
      fc.property(
        fc.double({ min: 0, max: 0.999, noNaN: true }),
        finite,
        distance,
        distance,
        (rho, phase, first, second) => {
          const gamma = complex(rho * Math.cos(phase), rho * Math.sin(phase));
          const once = rotateTowardGenerator(gamma, wavelengths(first + second));
          const composed = rotateTowardGenerator(
            rotateTowardGenerator(gamma, wavelengths(first)),
            wavelengths(second),
          );
          const periodic = rotateTowardGenerator(gamma, wavelengths(first + 0.5));
          expect(close(magnitude(once), rho, 1e-12)).toBe(true);
          expect(close(once.re, composed.re, 1e-12)).toBe(true);
          expect(close(once.im, composed.im, 1e-12)).toBe(true);
          expect(
            close(periodic.re, rotateTowardGenerator(gamma, wavelengths(first)).re, 1e-12),
          ).toBe(true);
          expect(
            close(periodic.im, rotateTowardGenerator(gamma, wavelengths(first)).im, 1e-12),
          ).toBe(true);
        },
      ),
    ));

  it('reflection rotation agrees with direct lossless-line transformation', () =>
    fc.assert(
      fc.property(passiveResistance, reactance, distance, (r, x, length) => {
        const z = complex(r, x);
        const theta = 2 * Math.PI * length;
        const direct = divide(
          complex(r * Math.cos(theta), x * Math.cos(theta) + Math.sin(theta)),
          complex(Math.cos(theta) - x * Math.sin(theta), r * Math.sin(theta)),
        );
        const rotated = reflectionToImpedance(
          rotateTowardGenerator(impedanceToReflection(z), wavelengths(length)),
        );
        expect(close(rotated.re, direct.re, 1e-7)).toBe(true);
        expect(close(rotated.im, direct.im, 1e-7)).toBe(true);
      }),
      { numRuns: 200 },
    ));

  it('stub inverses reproduce susceptance and open/short lengths differ by a quarter wave', () =>
    fc.assert(
      fc.property(fc.double({ min: -100, max: 100, noNaN: true }), (susceptance) => {
        const open = stubLengthForSusceptance('open', susceptance);
        const short = stubLengthForSusceptance('short', susceptance);
        expect(close(stubNormalizedSusceptance('open', open), susceptance, 1e-8)).toBe(true);
        expect(close(stubNormalizedSusceptance('short', short), susceptance, 1e-8)).toBe(true);
        const difference = (((short - open) % 0.5) + 0.5) % 0.5;
        expect(close(difference, 0.25, 1e-10)).toBe(true);
      }),
      { numRuns: 300 },
    ));

  it('every solved result is ordered, canonical, and matched by recomputed admittance', () =>
    fc.assert(
      fc.property(
        passiveResistance,
        reactance,
        fc.constantFrom('open' as const, 'short' as const),
        (r, x, termination) => {
          fc.pre(Math.abs(r - 50) + Math.abs(x) > 1e-5);
          const result = solveShuntStub({
            load: { kind: 'finite', impedanceOhms: complex(r, x) },
            characteristicImpedanceOhms: ohms(50),
            frequencyHz: hertz(14_200_000),
            velocityFactor: 0.66,
            termination,
          });
          expect(result.status).toBe('solved');
          if (result.status !== 'solved') return;
          expect(result.solutions[0].feedlineDistanceWavelengths).toBeLessThan(
            result.solutions[1].feedlineDistanceWavelengths,
          );
          for (const solution of result.solutions) {
            expect(solution.feedlineDistanceWavelengths).toBeGreaterThanOrEqual(0);
            expect(solution.feedlineDistanceWavelengths).toBeLessThan(0.5);
            expect(solution.stubLengthWavelengths).toBeGreaterThanOrEqual(0);
            expect(solution.stubLengthWavelengths).toBeLessThan(0.5);
            expect(close(solution.junctionNormalizedAdmittance.re, 1, 1e-8)).toBe(true);
            expect(close(solution.resultingNormalizedAdmittance.im, 0, 1e-8)).toBe(true);
            expect(solution.diagnostics.resultReflectionMagnitude).toBeLessThanOrEqual(1e-8);
          }
        },
      ),
      { numRuns: 150 },
    ));

  it('common impedance scaling preserves normalized electrical solutions', () =>
    fc.assert(
      fc.property(
        fc.double({ min: 5, max: 95, noNaN: true }),
        fc.double({ min: -50, max: 50, noNaN: true }),
        fc.double({ min: 0.1, max: 10, noNaN: true }),
        (r, x, scale) => {
          const solve = (factor: number) =>
            solveShuntStub({
              load: { kind: 'finite', impedanceOhms: complex(r * factor, x * factor) },
              characteristicImpedanceOhms: ohms(50 * factor),
              frequencyHz: hertz(14_200_000),
              velocityFactor: 0.66,
              termination: 'open',
            });
          const first = solve(1);
          const scaled = solve(scale);
          expect(first.status).toBe('solved');
          expect(scaled.status).toBe('solved');
          if (first.status !== 'solved' || scaled.status !== 'solved') return;
          first.solutions.forEach((solution, index) => {
            expect(
              close(
                solution.feedlineDistanceWavelengths,
                scaled.solutions[index]!.feedlineDistanceWavelengths,
              ),
            ).toBe(true);
            expect(
              close(solution.stubLengthWavelengths, scaled.solutions[index]!.stubLengthWavelengths),
            ).toBe(true);
          });
        },
      ),
      { numRuns: 100 },
    ));

  it('frequency and velocity factor change physical lengths only', () => {
    const base = solveShuntStub({
      load: { kind: 'finite', impedanceOhms: complex(35, -22) },
      characteristicImpedanceOhms: ohms(50),
      frequencyHz: hertz(10_000_000),
      velocityFactor: 0.5,
      termination: 'short',
    });
    const changed = solveShuntStub({
      load: { kind: 'finite', impedanceOhms: complex(35, -22) },
      characteristicImpedanceOhms: ohms(50),
      frequencyHz: hertz(20_000_000),
      velocityFactor: 0.5,
      termination: 'short',
    });
    expect(base.status).toBe('solved');
    expect(changed.status).toBe('solved');
    if (base.status !== 'solved' || changed.status !== 'solved') return;
    base.solutions.forEach((solution, index) => {
      expect(solution.feedlineDistanceWavelengths).toBe(
        changed.solutions[index]!.feedlineDistanceWavelengths,
      );
      expect(solution.stubLengthWavelengths).toBe(changed.solutions[index]!.stubLengthWavelengths);
      expect(
        close(
          solution.feedlineDistanceMeters / 2,
          changed.solutions[index]!.feedlineDistanceMeters,
          1e-12,
        ),
      ).toBe(true);
    });
  });

  it('unit conversions preserve exact scale definitions', () => {
    expect(wavelengthElectricalDegrees(wavelengths(0.5))).toBe(180);
    expect(metersToFeet(meters(0.3048))).toBe(1);
  });
});
