import { describe, expect, it } from 'vitest';
import { DEFAULT_CALCULATION, DEFAULT_WORKSPACE, workspaceReducer } from './workspaceReducer';

describe('workspaceReducer', () => {
  it('commits valid calculation values and clears preview', () => {
    const previewed = workspaceReducer(DEFAULT_WORKSPACE, {
      type: 'preview-load',
      load: { kind: 'finite', impedanceOhms: { re: 10, im: 2 } },
    });
    const next = workspaceReducer(previewed, {
      type: 'commit-characteristic-impedance',
      value: 75,
    });
    expect(next.calculation.characteristicImpedanceOhms).toBe(75);
    expect(next.previewLoad).toBeNull();
  });

  it('rejects invalid invariant values with same state reference', () => {
    expect(
      workspaceReducer(DEFAULT_WORKSPACE, {
        type: 'commit-load',
        load: { kind: 'finite', impedanceOhms: { re: Number.NaN, im: 0 } },
      }),
    ).toBe(DEFAULT_WORKSPACE);
    expect(
      workspaceReducer(DEFAULT_WORKSPACE, {
        type: 'commit-characteristic-impedance',
        value: 0,
      }),
    ).toBe(DEFAULT_WORKSPACE);
    expect(workspaceReducer(DEFAULT_WORKSPACE, { type: 'commit-frequency', value: Infinity })).toBe(
      DEFAULT_WORKSPACE,
    );
    expect(
      workspaceReducer(DEFAULT_WORKSPACE, { type: 'commit-velocity-factor', value: 1.01 }),
    ).toBe(DEFAULT_WORKSPACE);
  });

  it('allows negative resistance and exact open', () => {
    const active = workspaceReducer(DEFAULT_WORKSPACE, {
      type: 'commit-load',
      load: { kind: 'finite', impedanceOhms: { re: -10, im: 3 } },
    });
    expect(active.calculation.load).toEqual({
      kind: 'finite',
      impedanceOhms: { re: -10, im: 3 },
    });
    expect(
      workspaceReducer(active, { type: 'commit-load', load: { kind: 'open' } }).calculation.load,
    ).toEqual({ kind: 'open' });
  });

  it('applies examples atomically and selects solution A', () => {
    const next = workspaceReducer(DEFAULT_WORKSPACE, {
      type: 'apply-example',
      example: {
        id: 'test',
        name: 'Test',
        category: 'systems',
        description: 'Test preset',
        learningGoal: 'Test atomic application.',
        calculation: {
          load: { kind: 'open' },
          characteristicImpedanceOhms: 75,
          frequencyHz: 1e9,
          velocityFactor: 0.8,
          termination: 'open',
        },
        expectedStatus: 'solved',
      },
    });
    expect(next.calculation).toEqual({
      load: { kind: 'open' },
      characteristicImpedanceOhms: 75,
      frequencyHz: 1e9,
      velocityFactor: 0.8,
      termination: 'open',
      selectedSolution: 'A',
    });
  });

  it('resets calculation while preserving preferences', () => {
    const preferred = workspaceReducer(DEFAULT_WORKSPACE, {
      type: 'set-length-unit',
      value: 'ft',
    });
    const changed = workspaceReducer(preferred, { type: 'commit-frequency', value: 2e6 });
    const reset = workspaceReducer(changed, { type: 'reset-calculation' });
    expect(reset.calculation).toBe(DEFAULT_CALCULATION);
    expect(reset.preferences.lengthUnit).toBe('ft');
  });
});
