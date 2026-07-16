import { describe, expect, it } from 'vitest';
import { complex } from '../../rf';
import {
  clientPointToChartPoint,
  clientPointToReflection,
  constrainReflection,
  moveReflection,
} from '../pointerMapping';

describe('pointer mapping', () => {
  it('maps offset client coordinates into chart coordinates', () => {
    const bounds = { left: 100, top: 50, width: 400, height: 400 };
    expect(clientPointToChartPoint({ x: 300, y: 250 }, bounds)).toEqual({ x: 200, y: 200 });
    expect(clientPointToReflection({ x: 484, y: 250 }, bounds)).toEqual(complex(1, 0));
    expect(clientPointToReflection({ x: 300, y: 66 }, bounds)).toEqual(complex(0, 1));
  });

  it('maps mobile CSS scaling', () => {
    const bounds = { left: 8, top: 12, width: 320, height: 320 };
    const reflection = clientPointToReflection({ x: 315.2, y: 172 }, bounds)!;
    expect(reflection.re).toBeCloseTo(1, 12);
    expect(reflection.im).toBe(0);
  });

  it('accounts for centered letterboxing in non-square bounds', () => {
    const bounds = { left: 10, top: 20, width: 800, height: 400 };
    expect(clientPointToChartPoint({ x: 410, y: 220 }, bounds)).toEqual({ x: 200, y: 200 });
    expect(clientPointToReflection({ x: 594, y: 220 }, bounds)).toEqual(complex(1, 0));
  });

  it('keeps outside coordinates available for radial clamping', () => {
    const bounds = { left: 0, top: 0, width: 400, height: 400 };
    const outside = clientPointToReflection({ x: 568, y: 200 }, bounds)!;
    expect(outside).toEqual(complex(2, 0));
    expect(constrainReflection(outside, false)).toEqual(complex(1, 0));
  });

  it('rejects invalid or empty bounds', () => {
    expect(
      clientPointToChartPoint({ x: 0, y: 0 }, { left: 0, top: 0, width: 0, height: 400 }),
    ).toBeNull();
    expect(
      clientPointToChartPoint(
        { x: Number.NaN, y: 0 },
        { left: 0, top: 0, width: 400, height: 400 },
      ),
    ).toBeNull();
  });

  it('snaps pointer coordinates before a final radial clamp', () => {
    expect(constrainReflection(complex(0.311, -0.409), true)).toEqual(complex(0.32, -0.4));
    const boundary = constrainReflection(complex(0.99, 0.99), true);
    expect(Math.hypot(boundary.re, boundary.im)).toBeCloseTo(1, 12);
  });

  it('moves keyboard coordinates with fine and coarse steps independent of snapping', () => {
    expect(moveReflection(complex(0, 0), 'right', 0.002)).toEqual(complex(0.002, 0));
    expect(moveReflection(complex(0, 0), 'up', 0.02)).toEqual(complex(0, 0.02));
    const boundary = moveReflection(complex(1, 0), 'up', 0.02);
    expect(Math.hypot(boundary.re, boundary.im)).toBeCloseTo(1, 12);
    expect(boundary.im).toBeGreaterThan(0);
  });
});
