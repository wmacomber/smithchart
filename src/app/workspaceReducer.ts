import type {
  CalculationState,
  WorkspaceAction,
  WorkspacePreferences,
  WorkspaceState,
} from './workspaceTypes';

export const DEFAULT_CALCULATION: CalculationState = {
  load: { kind: 'finite', impedanceOhms: { re: 35, im: -22 } },
  characteristicImpedanceOhms: 50,
  frequencyHz: 14_200_000,
  velocityFactor: 0.66,
  termination: 'short',
  selectedSolution: 'A',
};

export const DEFAULT_PREFERENCES: WorkspacePreferences = {
  loadRepresentation: 'impedance',
  displayMode: 'both',
  lengthUnit: 'm',
  frequencyUnit: 'MHz',
  theme: 'system',
  animationEnabled: true,
  gridSnapping: false,
  solutionView: 'selected',
  firstUseDismissed: false,
};

export const DEFAULT_WORKSPACE: WorkspaceState = {
  calculation: DEFAULT_CALCULATION,
  preferences: DEFAULT_PREFERENCES,
  previewLoad: null,
};

export function isValidLoad(load: CalculationState['load']): boolean {
  return (
    load.kind === 'open' ||
    (Number.isFinite(load.impedanceOhms.re) && Number.isFinite(load.impedanceOhms.im))
  );
}

export function isValidCalculation(value: CalculationState): boolean {
  return (
    isValidLoad(value.load) &&
    Number.isFinite(value.characteristicImpedanceOhms) &&
    value.characteristicImpedanceOhms > 0 &&
    Number.isFinite(value.frequencyHz) &&
    value.frequencyHz > 0 &&
    Number.isFinite(value.velocityFactor) &&
    value.velocityFactor > 0 &&
    value.velocityFactor <= 1 &&
    (value.termination === 'open' || value.termination === 'short') &&
    (value.selectedSolution === 'A' || value.selectedSolution === 'B')
  );
}

function updateCalculation(state: WorkspaceState, calculation: CalculationState): WorkspaceState {
  return isValidCalculation(calculation) ? { ...state, calculation, previewLoad: null } : state;
}

export function workspaceReducer(state: WorkspaceState, action: WorkspaceAction): WorkspaceState {
  switch (action.type) {
    case 'commit-load':
      return isValidLoad(action.load)
        ? updateCalculation(state, { ...state.calculation, load: action.load })
        : state;
    case 'commit-characteristic-impedance':
      return Number.isFinite(action.value) && action.value > 0
        ? updateCalculation(state, {
            ...state.calculation,
            characteristicImpedanceOhms: action.value,
          })
        : state;
    case 'commit-frequency':
      return Number.isFinite(action.value) && action.value > 0
        ? updateCalculation(state, { ...state.calculation, frequencyHz: action.value })
        : state;
    case 'commit-velocity-factor':
      return Number.isFinite(action.value) && action.value > 0 && action.value <= 1
        ? updateCalculation(state, { ...state.calculation, velocityFactor: action.value })
        : state;
    case 'set-termination':
      return updateCalculation(state, { ...state.calculation, termination: action.value });
    case 'select-solution':
      return updateCalculation(state, { ...state.calculation, selectedSolution: action.value });
    case 'apply-example':
      return updateCalculation(state, {
        ...action.example.calculation,
        selectedSolution: 'A',
      });
    case 'reset-calculation':
      return updateCalculation(state, DEFAULT_CALCULATION);
    case 'replace-calculation':
      return updateCalculation(state, action.value);
    case 'set-load-representation':
      return {
        ...state,
        preferences: { ...state.preferences, loadRepresentation: action.value },
      };
    case 'set-display-mode':
      return { ...state, preferences: { ...state.preferences, displayMode: action.value } };
    case 'set-length-unit':
      return { ...state, preferences: { ...state.preferences, lengthUnit: action.value } };
    case 'set-frequency-unit':
      return { ...state, preferences: { ...state.preferences, frequencyUnit: action.value } };
    case 'set-theme':
      return { ...state, preferences: { ...state.preferences, theme: action.value } };
    case 'set-animation-enabled':
      return {
        ...state,
        preferences: { ...state.preferences, animationEnabled: action.value },
      };
    case 'set-grid-snapping':
      return { ...state, preferences: { ...state.preferences, gridSnapping: action.value } };
    case 'set-solution-view':
      return { ...state, preferences: { ...state.preferences, solutionView: action.value } };
    case 'set-first-use-dismissed':
      return { ...state, preferences: { ...state.preferences, firstUseDismissed: action.value } };
    case 'preview-load':
      return isValidLoad(action.load) ? { ...state, previewLoad: action.load } : state;
    case 'cancel-preview':
      return state.previewLoad === null ? state : { ...state, previewLoad: null };
  }
}
