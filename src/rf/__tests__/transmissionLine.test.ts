import { describe, expect, it } from 'vitest';
import { complex, rotateTowardGenerator, wavelengths } from '..';
describe('transmission line convention', () => {
  it('rotates clockwise toward generator', () => {
    const actual = rotateTowardGenerator(complex(0.5, 0), wavelengths(0.125));
    expect(actual.re).toBeCloseTo(0, 12);
    expect(actual.im).toBeCloseTo(-0.5, 12);
  });
});
