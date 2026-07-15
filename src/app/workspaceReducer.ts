import type { WorkspaceAction, WorkspaceState } from './workspaceTypes';

export const DEFAULT_WORKSPACE: WorkspaceState = {
  loadRepresentation: 'impedance',
  load: { kind: 'finite', impedanceOhms: { re: 35, im: -22 } },
  characteristicImpedanceOhms: 50,
  frequencyHz: 14_200_000,
  velocityFactor: 0.66,
  termination: 'short',
  selectedSolution: 'A',
  displayMode: 'both',
  lengthUnit: 'm',
  theme: 'system',
  animationEnabled: true,
  gridSnapping: false,
  previewLoad: null,
};

export function workspaceReducer(state: WorkspaceState, action: WorkspaceAction): WorkspaceState {
  switch (action.type) {
    case 'set-load':
      return { ...state, load: action.load, previewLoad: null };
    case 'preview-load':
      return { ...state, previewLoad: action.load };
    case 'cancel-preview':
      return { ...state, previewLoad: null };
    case 'set-z0':
      return { ...state, characteristicImpedanceOhms: action.value };
    case 'set-frequency':
      return { ...state, frequencyHz: action.value };
    case 'set-vf':
      return { ...state, velocityFactor: action.value };
    case 'set-termination':
      return { ...state, termination: action.value };
    case 'select-solution':
      return { ...state, selectedSolution: action.value };
    case 'set-representation':
      return { ...state, loadRepresentation: action.value };
    case 'set-display':
      return { ...state, displayMode: action.value };
    case 'set-theme':
      return { ...state, theme: action.value };
    case 'toggle-animation':
      return { ...state, animationEnabled: !state.animationEnabled };
    case 'toggle-snap':
      return { ...state, gridSnapping: !state.gridSnapping };
    case 'replace':
      return action.value;
  }
}
