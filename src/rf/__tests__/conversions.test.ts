import { describe, expect, it } from 'vitest';
import {
  admittanceToImpedance,
  admittanceToReflection,
  complex,
  denormalizeAdmittance,
  denormalizeImpedance,
  impedanceToAdmittance,
  impedanceToReflection,
  normalizeAdmittance,
  normalizeImpedance,
  ohms,
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
  it('normalizes and denormalizes impedance and admittance', () => {
    const z0 = ohms(50);
    const normalized = normalizeImpedance(complex(35, -22), z0);
    expect(normalized).toEqual(complex(0.7, -0.44));
    expect(denormalizeImpedance(normalized, z0)).toEqual(complex(35, -22));
    const normalizedY = impedanceToAdmittance(normalized);
    const dimensionalY = denormalizeAdmittance(normalizedY, z0);
    expect(dimensionalY.re).toBeCloseTo(normalizedY.re / 50, 12);
    expect(dimensionalY.im).toBeCloseTo(normalizedY.im / 50, 12);
    expect(normalizeAdmittance(dimensionalY, z0).re).toBeCloseTo(normalizedY.re, 12);
    expect(normalizeAdmittance(dimensionalY, z0).im).toBeCloseTo(normalizedY.im, 12);
  });
  it('agrees between impedance and admittance reflection forms', () => {
    const z = complex(0.7, -0.44);
    const fromZ = impedanceToReflection(z);
    const fromY = admittanceToReflection(impedanceToAdmittance(z));
    expect(fromY.re).toBeCloseTo(fromZ.re, 12);
    expect(fromY.im).toBeCloseTo(fromZ.im, 12);
  });
  it('maps exact short and match and leaves exact open inverse singular', () => {
    expect(impedanceToReflection(complex(0, 0))).toEqual(complex(-1, 0));
    expect(impedanceToReflection(complex(1, 0))).toEqual(complex(0, 0));
    const open = reflectionToImpedance(complex(1, 0));
    expect(Number.isFinite(open.re)).toBe(false);
    expect(Number.isFinite(open.im)).toBe(false);
  });
});
