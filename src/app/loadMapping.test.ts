import { describe, expect, it } from 'vitest';
import { complex } from '../rf';
import { formatLoadMarkerReadout, loadToReflection, reflectionToLoad } from './loadMapping';

describe('load reflection mapping', () => {
  it('maps chart center to matched load and left boundary to short', () => {
    expect(reflectionToLoad(complex(0, 0), 50)).toEqual({
      kind: 'finite',
      impedanceOhms: complex(50, 0),
    });
    expect(reflectionToLoad(complex(-1, 0), 50)).toEqual({
      kind: 'finite',
      impedanceOhms: complex(0, 0),
    });
  });

  it('uses tagged exact open for exact and tolerance-near open reflection', () => {
    expect(reflectionToLoad(complex(1, 0), 50)).toEqual({ kind: 'open' });
    expect(reflectionToLoad(complex(1 - 5e-11, 0), 50)).toEqual({ kind: 'open' });
    expect(formatLoadMarkerReadout({ kind: 'open' }, complex(1, 0)).impedanceText).toBe(
      'Exact open circuit',
    );
  });

  it('keeps other unit-circle points finite and lossless', () => {
    const load = reflectionToLoad(complex(0, 1), 50);
    expect(load.kind).toBe('finite');
    if (load.kind === 'finite') {
      expect(load.impedanceOhms.re).toBeCloseTo(0, 12);
      expect(load.impedanceOhms.im).toBeCloseTo(50, 12);
    }
  });

  it('round trips a known complex reflection and scales with Z0', () => {
    const reflection = complex(0.2, -0.3);
    const load50 = reflectionToLoad(reflection, 50);
    const load75 = reflectionToLoad(reflection, 75);
    expect(loadToReflection(load50, 50).re).toBeCloseTo(reflection.re, 12);
    expect(loadToReflection(load50, 50).im).toBeCloseTo(reflection.im, 12);
    expect(load50.kind).toBe('finite');
    expect(load75.kind).toBe('finite');
    if (load50.kind === 'finite' && load75.kind === 'finite') {
      expect(load75.impedanceOhms.re / load50.impedanceOhms.re).toBeCloseTo(1.5, 12);
      expect(load75.impedanceOhms.im / load50.impedanceOhms.im).toBeCloseTo(1.5, 12);
    }
  });
});
