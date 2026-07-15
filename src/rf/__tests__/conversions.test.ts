import { describe, expect, it } from 'vitest';
import {
  admittanceToImpedance,
  complex,
  impedanceToAdmittance,
  impedanceToReflection,
  reflectionToImpedance,
} from '..';
describe('RF conversions', () => {
  it('round trips impedance through reflection', () => {
    const z = complex(0.7, -0.44);
    const actual = reflectionToImpedance(impedanceToReflection(z));
    expect(actual.re).toBeCloseTo(z.re, 12);
    expect(actual.im).toBeCloseTo(z.im, 12);
  });
  it('round trips admittance', () => {
    const z = complex(1.4, 0.3);
    const actual = admittanceToImpedance(impedanceToAdmittance(z));
    expect(actual.re).toBeCloseTo(z.re, 12);
    expect(actual.im).toBeCloseTo(z.im, 12);
  });
});
