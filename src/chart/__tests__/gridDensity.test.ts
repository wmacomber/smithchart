import { describe, expect, it } from 'vitest';
import { GRID_DEFINITIONS } from '../gridDefinitions';
import { gridDensityForWidth, lowerGridDensity, resolveGridDensity } from '../gridDensity';

describe('adaptive grid density', () => {
  it.each([
    [null, 'regular'],
    [359, 'compact'],
    [360, 'regular'],
    [559, 'regular'],
    [560, 'dense'],
  ] as const)('maps width %s to %s', (width, expected) => {
    expect(gridDensityForWidth(width)).toBe(expected);
  });

  it('honors fixed density and lowers secondary density', () => {
    expect(resolveGridDensity('compact', 900)).toBe('compact');
    expect(resolveGridDensity('dense', 200)).toBe('dense');
    expect(lowerGridDensity('dense')).toBe('regular');
    expect(lowerGridDensity('regular')).toBe('compact');
    expect(lowerGridDensity('compact')).toBe('compact');
  });

  it('defines exact profiles without duplicating the boundary', () => {
    expect(GRID_DEFINITIONS.compact.resistances).toEqual([0.5, 1, 2, 5]);
    expect(GRID_DEFINITIONS.regular.resistances).toEqual([0.2, 0.5, 1, 2, 5]);
    expect(GRID_DEFINITIONS.dense.resistances).toEqual([
      0.1, 0.2, 0.3, 0.5, 0.7, 1, 1.5, 2, 3, 5, 10,
    ]);
    for (const definition of Object.values(GRID_DEFINITIONS)) {
      expect(definition.resistances).not.toContain(0);
      expect(definition.reactances).not.toContain(0);
    }
  });
});
