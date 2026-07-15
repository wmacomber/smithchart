import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import {
  complex,
  impedanceToAdmittance,
  impedanceToReflection,
  magnitude,
  reflectionToImpedance,
  rotateTowardGenerator,
  wavelengths,
} from '..';
const finite = fc.double({ min: -1e3, max: 1e3, noNaN: true, noDefaultInfinity: true });
describe('RF properties', () => {
  it('z → gamma → z round trips', () =>
    fc.assert(
      fc.property(fc.double({ min: 0.001, max: 100, noNaN: true }), finite, (r, x) => {
        const z = complex(r, x);
        const actual = reflectionToImpedance(impedanceToReflection(z));
        expect(actual.re).toBeCloseTo(r, 7);
        expect(actual.im).toBeCloseTo(x, 7);
      }),
      { numRuns: 300 },
    ));
  it('reciprocal is involutive', () =>
    fc.assert(
      fc.property(fc.double({ min: 0.001, max: 100, noNaN: true }), finite, (r, x) => {
        const z = complex(r, x);
        const actual = impedanceToAdmittance(impedanceToAdmittance(z));
        expect(actual.re).toBeCloseTo(r, 7);
        expect(actual.im).toBeCloseTo(x, 7);
      }),
      { numRuns: 300 },
    ));
  it('lossless rotation preserves magnitude', () =>
    fc.assert(
      fc.property(
        fc.double({ min: 0, max: 0.999, noNaN: true }),
        finite,
        fc.double({ min: 0, max: 0.5, noNaN: true }),
        (rho, phase, distance) => {
          const gamma = complex(rho * Math.cos(phase), rho * Math.sin(phase));
          expect(magnitude(rotateTowardGenerator(gamma, wavelengths(distance)))).toBeCloseTo(
            rho,
            12,
          );
        },
      ),
    ));
});
