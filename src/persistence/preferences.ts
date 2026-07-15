import type { WorkspaceState } from '../app/workspaceTypes';

const KEY = 'smith-match-preferences-v1';
type Preferences = Pick<
  WorkspaceState,
  'theme' | 'displayMode' | 'lengthUnit' | 'animationEnabled' | 'gridSnapping'
>;

export function loadPreferences(): Partial<Preferences> {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}') as Partial<Preferences>;
  } catch {
    return {};
  }
}
export function savePreferences(state: WorkspaceState): void {
  try {
    localStorage.setItem(
      KEY,
      JSON.stringify({
        theme: state.theme,
        displayMode: state.displayMode,
        lengthUnit: state.lengthUnit,
        animationEnabled: state.animationEnabled,
        gridSnapping: state.gridSnapping,
      } satisfies Preferences),
    );
  } catch {
    /* Storage may be unavailable; calculation remains functional. */
  }
}
