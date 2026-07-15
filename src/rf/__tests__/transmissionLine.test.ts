import { describe, expect, it } from 'vitest';
import {
  complex,
  impedanceToReflection,
  reflectionToImpedance,
  rotateTowardGenerator,
  wavelengths,
} from '..';
describe('transmission line convention', () => {
  it('rotates clockwise toward generator', () => {
    const actual = rotateTowardGenerator(complex(0.5, 0), wavelengths(0.125));
    expect(actual.re).toBeCloseTo(0, 12);
    expect(actual.im).toBeCloseTo(-0.5, 12);
  });
  it('agrees with the direct lossless-line impedance transform', () => {
    const load = complex(0.7, -0.44);
    const distance = 0.19801429754004;
    const theta = 2 * Math.PI * distance;
    const cosine = Math.cos(theta);
    const sine = Math.sin(theta);
    const numerator = complex(load.re * cosine, load.im * cosine + sine);
    const denominator = complex(cosine - load.im * sine, load.re * sine);
    const denominatorMagnitude = denominator.re ** 2 + denominator.im ** 2;
    const direct = complex(
      (numerator.re * denominator.re + numerator.im * denominator.im) / denominatorMagnitude,
      (numerator.im * denominator.re - numerator.re * denominator.im) / denominatorMagnitude,
    );
    const rotated = reflectionToImpedance(
      rotateTowardGenerator(impedanceToReflection(load), wavelengths(distance)),
    );
    expect(rotated.re).toBeCloseTo(direct.re, 11);
    expect(rotated.im).toBeCloseTo(direct.im, 11);
  });
});
