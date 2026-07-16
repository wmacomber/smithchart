import type { Complex, Load, StubTermination } from '../rf';

export type LoadRepresentation = 'impedance' | 'admittance' | 'reflection';
export type DisplayMode = 'impedance' | 'admittance' | 'both';
export type LengthUnit = 'm' | 'cm' | 'ft' | 'in';
export type FrequencyUnit = 'Hz' | 'kHz' | 'MHz' | 'GHz';
export type Theme = 'system' | 'light' | 'dark';
export type SolutionId = 'A' | 'B';

export interface CalculationState {
  readonly load: Load;
  readonly characteristicImpedanceOhms: number;
  readonly frequencyHz: number;
  readonly velocityFactor: number;
  readonly termination: StubTermination;
  readonly selectedSolution: SolutionId;
}

export interface WorkspacePreferences {
  readonly loadRepresentation: LoadRepresentation;
  readonly displayMode: DisplayMode;
  readonly lengthUnit: LengthUnit;
  readonly frequencyUnit: FrequencyUnit;
  readonly theme: Theme;
  readonly animationEnabled: boolean;
  readonly gridSnapping: boolean;
}

export interface WorkspaceState {
  readonly calculation: CalculationState;
  readonly preferences: WorkspacePreferences;
  readonly previewLoad: Load | null;
}

export type WorkspaceAction =
  | { readonly type: 'commit-load'; readonly load: Load }
  | { readonly type: 'commit-characteristic-impedance'; readonly value: number }
  | { readonly type: 'commit-frequency'; readonly value: number }
  | { readonly type: 'commit-velocity-factor'; readonly value: number }
  | { readonly type: 'set-termination'; readonly value: StubTermination }
  | { readonly type: 'select-solution'; readonly value: SolutionId }
  | { readonly type: 'apply-example'; readonly example: ExamplePreset }
  | { readonly type: 'reset-calculation' }
  | { readonly type: 'replace-calculation'; readonly value: CalculationState }
  | { readonly type: 'set-load-representation'; readonly value: LoadRepresentation }
  | { readonly type: 'set-display-mode'; readonly value: DisplayMode }
  | { readonly type: 'set-length-unit'; readonly value: LengthUnit }
  | { readonly type: 'set-frequency-unit'; readonly value: FrequencyUnit }
  | { readonly type: 'set-theme'; readonly value: Theme }
  | { readonly type: 'set-animation-enabled'; readonly value: boolean }
  | { readonly type: 'set-grid-snapping'; readonly value: boolean }
  | { readonly type: 'preview-load'; readonly load: Load }
  | { readonly type: 'cancel-preview' };

export interface WorkspaceHistory {
  readonly past: readonly CalculationState[];
  readonly present: WorkspaceState;
  readonly future: readonly CalculationState[];
}

export interface ExamplePreset {
  readonly id: string;
  readonly name: string;
  readonly load: Load;
  readonly z0: number;
  readonly frequencyHz: number;
  readonly velocityFactor: number;
  readonly termination: StubTermination;
  readonly note: string;
}

export const finiteLoad = (re: number, im: number): Load => ({
  kind: 'finite',
  impedanceOhms: { re, im },
});
export const finiteComplexLoad = (value: Complex): Load => ({
  kind: 'finite',
  impedanceOhms: value,
});
