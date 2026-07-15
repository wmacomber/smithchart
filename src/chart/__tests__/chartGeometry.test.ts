import { describe, expect, it } from 'vitest';
import { complex, impedanceToReflection } from '../../rf';
import {
  CHART_CENTER,
  CHART_RADIUS,
  chartPointToReflection,
  clampReflectionToUnitDisk,
  reactanceArc,
  reflectionToChartPoint,
  resistanceCircle,
  rotateChartPoint180,
  rotateReflection180,
} from '../chartGeometry';
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
  it('keeps inverse mapping unclamped and clamps only when requested', () => {
    const outside = chartPointToReflection({ x: CHART_CENTER + 2 * CHART_RADIUS, y: CHART_CENTER });
    expect(outside).toEqual(complex(2, 0));
    expect(clampReflectionToUnitDisk(outside)).toEqual(complex(1, 0));
    expect(clampReflectionToUnitDisk(complex(0.3, -0.4))).toEqual(complex(0.3, -0.4));
  });
  it('places positive reactance in mathematical and SVG upper halves', () => {
    const gamma = impedanceToReflection(complex(1, 1));
    expect(gamma.im).toBeGreaterThan(0);
    expect(reflectionToChartPoint(gamma).y).toBeLessThan(200);
  });

  it('maps canonical impedances to canonical reflection points', () => {
    expect(impedanceToReflection(complex(1, 0))).toEqual(complex(0, 0));
    expect(impedanceToReflection(complex(0, 0))).toEqual(complex(-1, 0));
    const positive = impedanceToReflection(complex(0, 1));
    const negative = impedanceToReflection(complex(0, -1));
    expect(positive.re).toBeCloseTo(0, 12);
    expect(positive.im).toBeCloseTo(1, 12);
    expect(negative.re).toBeCloseTo(0, 12);
    expect(negative.im).toBeCloseTo(-1, 12);
  });

  it('generates resistance circles including boundary and open-point limit', () => {
    expect(resistanceCircle(0)).toEqual({ cx: CHART_CENTER, cy: CHART_CENTER, r: CHART_RADIUS });
    expect(resistanceCircle(1)).toEqual({
      cx: CHART_CENTER + CHART_RADIUS / 2,
      cy: CHART_CENTER,
      r: CHART_RADIUS / 2,
    });
    expect(resistanceCircle(Number.POSITIVE_INFINITY)).toEqual({
      cx: CHART_CENTER + CHART_RADIUS,
      cy: CHART_CENTER,
      r: 0,
    });
  });

  it('generates signed reactance arcs through canonical points', () => {
    const positive = reactanceArc(1);
    expect(positive.start).toEqual({ x: CHART_CENTER, y: CHART_CENTER - CHART_RADIUS });
    expect(positive.end).toEqual({ x: CHART_CENTER + CHART_RADIUS, y: CHART_CENTER });
    expect(positive.center).toEqual({
      x: CHART_CENTER + CHART_RADIUS,
      y: CHART_CENTER - CHART_RADIUS,
    });
    expect(positive.radius).toBe(CHART_RADIUS);
    expect(positive.largeArc).toBe(0);
    expect(positive.sweep).toBe(0);
    expect(reactanceArc(-1).sweep).toBe(1);
    expect(reactanceArc(-1).start).toEqual({
      x: CHART_CENTER,
      y: CHART_CENTER + CHART_RADIUS,
    });
  });

  it('rotates reflection and screen points by 180 degrees', () => {
    expect(rotateReflection180(complex(0.25, -0.5))).toEqual(complex(-0.25, 0.5));
    const point = reflectionToChartPoint(complex(0.25, -0.5));
    expect(rotateChartPoint180(point)).toEqual(reflectionToChartPoint(complex(-0.25, 0.5)));
  });
});
