import { describe, expect, it } from 'vitest';
import {
  loadToRepresentation,
  normalizePhaseDegrees,
  representationToLoad,
} from './loadRepresentations';

describe('load representations', () => {
  it('round trips impedance and admittance', () => {
    const load = { kind: 'finite', impedanceOhms: { re: 35, im: -22 } } as const;
    for (const representation of ['impedance', 'admittance'] as const) {
      const values = loadToRepresentation(load, 50, representation)!;
      const roundTrip = representationToLoad(representation, values.first, values.second, 50);
      expect(roundTrip?.kind).toBe('finite');
      if (roundTrip?.kind === 'finite') {
        expect(roundTrip.impedanceOhms.re).toBeCloseTo(35, 12);
        expect(roundTrip.impedanceOhms.im).toBeCloseTo(-22, 12);
      }
    }
  });

  it('round trips reflection coefficient and permits active magnitudes', () => {
    const load = representationToLoad('reflection', 1.2, 40, 50);
    expect(load?.kind).toBe('finite');
    const values = loadToRepresentation(load!, 50, 'reflection')!;
    expect(values.first).toBeCloseTo(1.2, 12);
    expect(values.second).toBeCloseTo(40, 12);
  });

  it('maps zero admittance and gamma one to exact open', () => {
    expect(representationToLoad('admittance', 0, 0, 50)).toEqual({ kind: 'open' });
    expect(representationToLoad('reflection', 1, 360, 50)).toEqual({ kind: 'open' });
  });

  it('keeps exact short finite and normalizes phase', () => {
    expect(representationToLoad('impedance', 0, 0, 50)).toEqual({
      kind: 'finite',
      impedanceOhms: { re: 0, im: 0 },
    });
    expect(normalizePhaseDegrees(540)).toBe(-180);
    expect(normalizePhaseDegrees(-360)).toBe(0);
  });

  it('rejects negative magnitude and non-finite conversions', () => {
    expect(representationToLoad('reflection', -1, 0, 50)).toBeNull();
    expect(representationToLoad('impedance', Number.NaN, 0, 50)).toBeNull();
  });
});
