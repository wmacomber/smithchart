import { describe, expect, it } from 'vitest';
import { complex, impedanceToReflection } from '../../rf';
import { chartPointToReflection, reflectionToChartPoint } from '../chartGeometry';
describe('chart geometry', () => {
  it.each([
    [0, 0, 200, 200],
    [1, 0, 384, 200],
    [-1, 0, 16, 200],
    [0, 1, 200, 16],
    [0, -1, 200, 384],
  ])('maps canonical gamma (%s,%s)', (re, im, x, y) =>
    expect(reflectionToChartPoint(complex(re, im))).toEqual({ x, y }),
  );
  it('round trips coordinates', () => {
    const value = complex(0.3, -0.4);
    const actual = chartPointToReflection(reflectionToChartPoint(value));
    expect(actual.re).toBeCloseTo(value.re, 12);
    expect(actual.im).toBeCloseTo(value.im, 12);
  });
  it('places positive reactance in mathematical and SVG upper halves', () => {
    const gamma = impedanceToReflection(complex(1, 1));
    expect(gamma.im).toBeGreaterThan(0);
    expect(reflectionToChartPoint(gamma).y).toBeLessThan(200);
  });
});
