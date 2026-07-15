import { describe, expect, it } from 'vitest';
import {
  add,
  complex,
  conjugate,
  divide,
  fromPolar,
  isFiniteComplex,
  magnitude,
  multiply,
  phase,
  reciprocal,
  subtract,
} from '../complex';
describe('complex arithmetic', () => {
  it('applies basic operations', () => {
    expect(add(complex(1, 2), complex(3, -4))).toEqual(complex(4, -2));
    expect(subtract(complex(1, 2), complex(3, -4))).toEqual(complex(-2, 6));
    expect(multiply(complex(1, 2), complex(3, -4))).toEqual(complex(11, 2));
    expect(divide(complex(1, 2), complex(3, -4)).re).toBeCloseTo(-0.2, 12);
    expect(reciprocal(complex(2)).re).toBe(0.5);
  });
  it('converts polar values', () =>
    expect(magnitude(fromPolar(2, Math.PI / 3))).toBeCloseTo(2, 12));
  it('conjugates, measures phase, and detects finite components', () => {
    expect(conjugate(complex(2, -3))).toEqual(complex(2, 3));
    expect(phase(complex(0, 1))).toBeCloseTo(Math.PI / 2, 12);
    expect(isFiniteComplex(complex(2, -3))).toBe(true);
    expect(isFiniteComplex(complex(Number.POSITIVE_INFINITY, 0))).toBe(false);
  });
  it('divides without overflowing finite scale factors', () => {
    const large = divide(complex(1e308, 1e308), complex(1e308, -1e308));
    expect(large.re).toBeCloseTo(0, 12);
    expect(large.im).toBeCloseTo(1, 12);
    const small = divide(complex(1e-300, -1e-300), complex(1e-300, 1e-300));
    expect(small.re).toBeCloseTo(0, 12);
    expect(small.im).toBeCloseTo(-1, 12);
  });
  it('returns non-finite components for division by exact zero', () => {
    const result = divide(complex(1, 2), complex(0, 0));
    expect(Number.isFinite(result.re)).toBe(false);
    expect(Number.isFinite(result.im)).toBe(false);
  });
});
