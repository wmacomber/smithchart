import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { DEFAULT_CALCULATION } from '../app/workspaceReducer';
import { formatFrequency, parseFrequency, parseUrlState, serializeUrlState } from './urlState';

describe('URL state', () => {
  it('parses canonical units and round trips in stable order', () => {
    const parsed = parseUrlState(
      '?v=1&r=35&x=-22&z0=50&f=14.2MHz&vf=0.66&stub=shunt-short&solution=B',
    );
    expect(parsed.warnings).toEqual([]);
    expect(parsed.state.calculation.frequencyHz).toBe(14.2e6);
    expect(serializeUrlState(parsed.state.calculation)).toBe(
      '?v=1&r=35&x=-22&z0=50&f=14.2MHz&vf=0.66&stub=shunt-short&solution=B',
    );
  });

  it('represents exact open without infinity', () => {
    const parsed = parseUrlState('?load=open&r=4&x=5');
    expect(parsed.state.calculation.load).toEqual({ kind: 'open' });
    expect(serializeUrlState(parsed.state.calculation)).toContain('load=open');
  });

  it('accepts versionless legacy URLs and ignores unknown keys', () => {
    const parsed = parseUrlState('?r=25&x=0&campaign=test');
    expect(parsed.warnings).toEqual([]);
    expect(parsed.state.calculation.load).toEqual({
      kind: 'finite',
      impedanceOhms: { re: 25, im: 0 },
    });
  });

  it('recovers invalid and duplicate known values independently', () => {
    const parsed = parseUrlState('?r=nope&x=2&z0=0&f=1MHz&vf=.5&vf=.6&stub=bad&solution=C');
    expect(parsed.state.calculation.load).toEqual(DEFAULT_CALCULATION.load);
    expect(parsed.state.calculation.frequencyHz).toBe(1e6);
    expect(parsed.warnings).toHaveLength(5);
  });

  it('ignores calculation parameters for unsupported or duplicate versions', () => {
    expect(parseUrlState('?v=2&r=25').state.calculation).toEqual(DEFAULT_CALCULATION);
    expect(parseUrlState('?v=1&v=1&r=25').state.calculation).toEqual(DEFAULT_CALCULATION);
  });

  it('normalizes negative zero', () => {
    expect(
      serializeUrlState({
        ...DEFAULT_CALCULATION,
        load: { kind: 'finite', impedanceOhms: { re: -0, im: -0 } },
      }),
    ).toContain('r=0&x=0');
  });

  it('round trips positive finite frequencies exactly', () => {
    fc.assert(
      fc.property(fc.double({ min: Number.MIN_VALUE, max: 1e15, noNaN: true }), (frequency) => {
        fc.pre(frequency > 0 && Number.isFinite(frequency));
        expect(parseFrequency(formatFrequency(frequency))).toBe(frequency);
      }),
    );
  });

  it('round trips generated valid calculations', () => {
    const finite = fc
      .double({ min: -1e9, max: 1e9, noNaN: true, noDefaultInfinity: true })
      .filter((value) => !Object.is(value, -0));
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constant({ kind: 'open' } as const),
          fc.record({ re: finite, im: finite }).map((impedanceOhms) => ({
            kind: 'finite' as const,
            impedanceOhms,
          })),
        ),
        fc.double({ min: 1e-6, max: 1e6, noNaN: true }),
        fc.double({ min: 1e-6, max: 1e15, noNaN: true }),
        fc.double({ min: 1e-6, max: 1, noNaN: true }),
        fc.constantFrom('open' as const, 'short' as const),
        fc.constantFrom('A' as const, 'B' as const),
        (
          load,
          characteristicImpedanceOhms,
          frequencyHz,
          velocityFactor,
          termination,
          selectedSolution,
        ) => {
          const calculation = {
            load,
            characteristicImpedanceOhms,
            frequencyHz,
            velocityFactor,
            termination,
            selectedSolution,
          };
          expect(parseUrlState(serializeUrlState(calculation)).state.calculation).toEqual(
            calculation,
          );
        },
      ),
    );
  });
});
