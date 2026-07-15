import { describe, expect, it } from 'vitest';
import {
  add,
  complex,
  divide,
  fromPolar,
  magnitude,
  multiply,
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
});
