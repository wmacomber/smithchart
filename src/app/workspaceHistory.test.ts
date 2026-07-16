import { describe, expect, it } from 'vitest';
import { historyReducer } from './workspaceHistory';
import { DEFAULT_WORKSPACE } from './workspaceReducer';
import type { WorkspaceHistory } from './workspaceTypes';
import { EXAMPLES } from '../features/examples/examples';

const initial = (): WorkspaceHistory => ({ past: [], present: DEFAULT_WORKSPACE, future: [] });

describe('historyReducer', () => {
  it('tracks calculation changes and restores them atomically', () => {
    let history = historyReducer(initial(), { type: 'commit-frequency', value: 2e6 });
    history = historyReducer(history, { type: 'select-solution', value: 'B' });
    expect(history.past).toHaveLength(2);
    history = historyReducer(history, { type: 'undo' });
    expect(history.present.calculation.frequencyHz).toBe(2e6);
    expect(history.present.calculation.selectedSolution).toBe('A');
    history = historyReducer(history, { type: 'redo' });
    expect(history.present.calculation.selectedSolution).toBe('B');
  });

  it('excludes preferences and preview while preserving history stacks', () => {
    let history = historyReducer(initial(), { type: 'commit-frequency', value: 2e6 });
    history = historyReducer(history, { type: 'set-length-unit', value: 'ft' });
    history = historyReducer(history, { type: 'set-solution-view', value: 'overlay' });
    history = historyReducer(history, {
      type: 'preview-load',
      load: { kind: 'finite', impedanceOhms: { re: 5, im: 1 } },
    });
    expect(history.past).toHaveLength(1);
    history = historyReducer(history, { type: 'undo' });
    expect(history.present.preferences.lengthUnit).toBe('ft');
    expect(history.present.preferences.solutionView).toBe('overlay');
    expect(history.present.previewLoad).toBeNull();
  });

  it('deduplicates no-op commits and clears redo after a new commit', () => {
    let history = historyReducer(initial(), { type: 'commit-frequency', value: 14_200_000 });
    expect(history.past).toHaveLength(0);
    history = historyReducer(history, { type: 'commit-frequency', value: 2e6 });
    history = historyReducer(history, { type: 'undo' });
    expect(history.future).toHaveLength(1);
    history = historyReducer(history, { type: 'commit-frequency', value: 3e6 });
    expect(history.future).toHaveLength(0);
  });

  it('limits past history to 100 calculations', () => {
    let history = initial();
    for (let value = 1; value <= 101; value += 1)
      history = historyReducer(history, { type: 'commit-frequency', value });
    expect(history.past).toHaveLength(100);
  });

  it('commits one preview transaction and undoes to its starting load', () => {
    let history = initial();
    const startingLoad = history.present.calculation.load;
    history = historyReducer(history, {
      type: 'preview-load',
      load: { kind: 'finite', impedanceOhms: { re: 40, im: 5 } },
    });
    history = historyReducer(history, {
      type: 'preview-load',
      load: { kind: 'finite', impedanceOhms: { re: 45, im: 10 } },
    });
    expect(history.past).toHaveLength(0);
    history = historyReducer(history, {
      type: 'commit-load',
      load: { kind: 'finite', impedanceOhms: { re: 45, im: 10 } },
    });
    expect(history.past).toHaveLength(1);
    history = historyReducer(history, { type: 'undo' });
    expect(history.present.calculation.load).toEqual(startingLoad);
  });

  it('applies an example as one undoable calculation while preserving preferences', () => {
    let history = historyReducer(initial(), { type: 'set-theme', value: 'dark' });
    history = historyReducer(history, {
      type: 'apply-example',
      example: EXAMPLES.find((item) => item.id === '75-ohm')!,
    });
    expect(history.past).toHaveLength(1);
    expect(history.present.calculation.characteristicImpedanceOhms).toBe(75);
    expect(history.present.calculation.selectedSolution).toBe('A');
    expect(history.present.preferences.theme).toBe('dark');
    history = historyReducer(history, { type: 'undo' });
    expect(history.present.calculation).toEqual(DEFAULT_WORKSPACE.calculation);
    expect(history.present.preferences.theme).toBe('dark');
  });
});
