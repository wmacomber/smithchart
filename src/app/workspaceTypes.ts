import type { Complex, Load, StubTermination } from '../rf';

export type LoadRepresentation = 'impedance' | 'admittance' | 'reflection';
export type DisplayMode = 'impedance' | 'admittance' | 'both';
export type LengthUnit = 'm' | 'cm' | 'ft' | 'in';

export interface WorkspaceState {
  readonly loadRepresentation: LoadRepresentation;
  readonly load: Load;
  readonly characteristicImpedanceOhms: number;
  readonly frequencyHz: number;
  readonly velocityFactor: number;
  readonly termination: StubTermination;
  readonly selectedSolution: 'A' | 'B';
  readonly displayMode: DisplayMode;
  readonly lengthUnit: LengthUnit;
  readonly theme: 'system' | 'light' | 'dark';
  readonly animationEnabled: boolean;
  readonly gridSnapping: boolean;
  readonly previewLoad: Load | null;
}

export type WorkspaceAction =
  | { readonly type: 'set-load'; readonly load: Load }
  | { readonly type: 'preview-load'; readonly load: Load }
  | { readonly type: 'cancel-preview' }
  | { readonly type: 'set-z0'; readonly value: number }
  | { readonly type: 'set-frequency'; readonly value: number }
  | { readonly type: 'set-vf'; readonly value: number }
  | { readonly type: 'set-termination'; readonly value: StubTermination }
  | { readonly type: 'select-solution'; readonly value: 'A' | 'B' }
  | { readonly type: 'set-representation'; readonly value: LoadRepresentation }
  | { readonly type: 'set-display'; readonly value: DisplayMode }
  | { readonly type: 'set-theme'; readonly value: WorkspaceState['theme'] }
  | { readonly type: 'toggle-animation' }
  | { readonly type: 'toggle-snap' }
  | { readonly type: 'replace'; readonly value: WorkspaceState };

export interface WorkspaceHistory {
  readonly past: readonly WorkspaceState[];
  readonly present: WorkspaceState;
  readonly future: readonly WorkspaceState[];
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
