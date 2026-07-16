import { workspaceReducer } from './workspaceReducer';
import type { CalculationState, WorkspaceAction, WorkspaceHistory } from './workspaceTypes';

const HISTORY_LIMIT = 100;
const CALCULATION_ACTIONS = new Set<WorkspaceAction['type']>([
  'commit-load',
  'commit-characteristic-impedance',
  'commit-frequency',
  'commit-velocity-factor',
  'set-termination',
  'select-solution',
  'apply-example',
  'reset-calculation',
  'replace-calculation',
]);

export type HistoryAction = WorkspaceAction | { readonly type: 'undo' } | { readonly type: 'redo' };

function sameCalculation(left: CalculationState, right: CalculationState): boolean {
  if (
    left.characteristicImpedanceOhms !== right.characteristicImpedanceOhms ||
    left.frequencyHz !== right.frequencyHz ||
    left.velocityFactor !== right.velocityFactor ||
    left.termination !== right.termination ||
    left.selectedSolution !== right.selectedSolution ||
    left.load.kind !== right.load.kind
  )
    return false;
  return (
    left.load.kind === 'open' ||
    (right.load.kind === 'finite' &&
      left.load.impedanceOhms.re === right.load.impedanceOhms.re &&
      left.load.impedanceOhms.im === right.load.impedanceOhms.im)
  );
}

export function historyReducer(history: WorkspaceHistory, action: HistoryAction): WorkspaceHistory {
  if (action.type === 'undo') {
    const previous = history.past.at(-1);
    if (!previous) return history;
    return {
      past: history.past.slice(0, -1),
      present: { ...history.present, calculation: previous, previewLoad: null },
      future: [history.present.calculation, ...history.future],
    };
  }
  if (action.type === 'redo') {
    const next = history.future[0];
    if (!next) return history;
    return {
      past: [...history.past, history.present.calculation].slice(-HISTORY_LIMIT),
      present: { ...history.present, calculation: next, previewLoad: null },
      future: history.future.slice(1),
    };
  }

  const next = workspaceReducer(history.present, action);
  if (next === history.present) return history;
  if (!CALCULATION_ACTIONS.has(action.type)) return { ...history, present: next };
  if (sameCalculation(next.calculation, history.present.calculation))
    return { ...history, present: next };
  return {
    past: [...history.past, history.present.calculation].slice(-HISTORY_LIMIT),
    present: next,
    future: [],
  };
}
